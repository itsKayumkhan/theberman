-- Allow all users to read app_settings so authenticated assessors/homeowners can fetch platform/hidden fees
DROP POLICY IF EXISTS "Allow public read on app_settings" ON public.app_settings;
CREATE POLICY "Allow public read on app_settings"
ON public.app_settings
FOR SELECT
TO public
USING (true);
