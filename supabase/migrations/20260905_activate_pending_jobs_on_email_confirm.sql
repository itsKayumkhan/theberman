-- Jobs posted by a brand-new (unconfirmed) account are held in status 'submitted'
-- and only go live (and notify assessors) once the user confirms their email.
CREATE OR REPLACE FUNCTION public.activate_pending_jobs_on_email_confirm()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  job RECORD;
BEGIN
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    FOR job IN
      UPDATE public.assessments
         SET status = 'live'
       WHERE user_id = NEW.id
         AND status = 'submitted'
         AND deleted_at IS NULL
      RETURNING id, contact_email, contact_name, county, town, job_type, contact_phone, tenant
    LOOP
      PERFORM net.http_post(
        url := 'https://srvcwpnqjyhnhyeflraj.supabase.co/functions/v1/send-job-live-email',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', 'sb_publishable_47HR02XIlX_hwtiXwJ2SvA_1xt9btYM'
        ),
        body := jsonb_build_object(
          'assessmentId', job.id,
          'email', job.contact_email,
          'customerName', job.contact_name,
          'county', job.county,
          'town', job.town,
          'jobType', job.job_type,
          'customerPhone', job.contact_phone,
          'tenant', job.tenant
        )
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_email_confirmed_activate_jobs ON auth.users;
CREATE TRIGGER on_email_confirmed_activate_jobs
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_pending_jobs_on_email_confirm();
