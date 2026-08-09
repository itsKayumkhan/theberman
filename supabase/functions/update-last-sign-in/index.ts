import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Call the Postgres function that directly reads auth.users and syncs profiles.last_login
    // This bypasses the auth admin API which was failing with "Database error finding users"
    const { data, error } = await supabase.rpc("sync_last_sign_in_bulk");

    if (error) throw error;

    return new Response(
      JSON.stringify(data || { success: true, updated: 0, skipped: 0 }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in update-last-sign-in:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
