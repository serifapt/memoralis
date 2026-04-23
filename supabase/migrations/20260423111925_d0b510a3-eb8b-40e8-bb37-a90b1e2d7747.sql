-- Update auth.users email and password
UPDATE auth.users
SET email = 'funeraria.s.joao@gmail.com',
    encrypted_password = crypt('TempSJoao2026!', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now(),
    raw_user_meta_data = raw_user_meta_data || '{"email_verified": true}'::jsonb
WHERE id = 'f74bb832-5a4c-4c68-82d4-00755d47d513';

-- Update auth.identities to match new email
UPDATE auth.identities
SET identity_data = identity_data || '{"email": "funeraria.s.joao@gmail.com", "email_verified": true}'::jsonb,
    updated_at = now()
WHERE user_id = 'f74bb832-5a4c-4c68-82d4-00755d47d513' AND provider = 'email';