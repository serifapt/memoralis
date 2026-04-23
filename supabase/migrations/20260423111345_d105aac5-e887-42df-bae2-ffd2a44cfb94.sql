UPDATE auth.users
SET encrypted_password = crypt('TempSJoao2026!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'funerária.s.joao@gmail.com';