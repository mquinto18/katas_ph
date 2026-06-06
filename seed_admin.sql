-- Katas PH Admin User
-- Run in: Supabase Dashboard → SQL Editor
-- Email:    admin@katas.ph
-- Password: KatasPH@2024

DO $$
DECLARE
  new_id uuid := gen_random_uuid();
BEGIN
  -- Remove existing user with this email if any
  DELETE FROM auth.identities WHERE provider_id = 'admin@katas.ph';
  DELETE FROM auth.users     WHERE email        = 'admin@katas.ph';

  -- Create user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_id,
    'authenticated',
    'authenticated',
    'admin@katas.ph',
    crypt('KatasPH@2024', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Katas PH Admin","name":"Admin"}',
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  -- Link identity
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_id,
    'admin@katas.ph',
    json_build_object(
      'sub',            new_id::text,
      'email',          'admin@katas.ph',
      'email_verified', true
    ),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

END $$;
