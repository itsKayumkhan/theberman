import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Fetch all users from auth.admin with their last_sign_in_at
    const { data: usersData, error: usersError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) throw usersError;

    let updated = 0;
    let skipped = 0;

    for (const authUser of usersData.users) {
      if (!authUser.last_sign_in_at) {
        skipped++;
        continue;
      }

      // Update the profile's last_login to match auth.users.last_sign_in_at
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ last_login: authUser.last_sign_in_at })
        .eq("id", authUser.id)
        .neq("last_login", authUser.last_sign_in_at);

      if (updateError) {
        console.error(`Failed to update profile ${authUser.id}:`, updateError.message);
      } else {
        updated++;
      }
    }

    // Paginate if more than 1000 users
    let page = 2;
    while (usersData.users.length === 1000) {
      const { data: moreData, error: moreError } =
        await supabase.auth.admin.listUsers({ page, perPage: 1000 });
      if (moreError) break;
      for (const authUser of moreData.users) {
        if (!authUser.last_sign_in_at) { skipped++; continue; }
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ last_login: authUser.last_sign_in_at })
          .eq("id", authUser.id)
          .neq("last_login", authUser.last_sign_in_at);
        if (updateError) {
          console.error(`Failed to update profile ${authUser.id}:`, updateError.message);
        } else {
          updated++;
        }
      }
      page++;
      if (moreData.users.length < 1000) break;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Last sign-in timestamps synced successfully",
        updated,
        skipped,
        total: usersData.users.length,
      }),
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
