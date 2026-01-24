-- 1. Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the Admin User if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@theberman.eu') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@theberman.eu',
      crypt('admin@4321', gen_salt('bf')),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- 3. Ensure the user is confirmed
UPDATE auth.users
SET email_confirmed_at = now(),
    encrypted_password = crypt('admin@4321', gen_salt('bf'))
WHERE email = 'admin@theberman.eu';
