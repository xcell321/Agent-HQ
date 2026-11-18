# Supabase setup

1. Create a Supabase project.
2. Run `migrations/0001_init.sql` in the SQL editor (or via the CLI).
3. Copy `.env.example` to `.env.local` and fill in the project URL + keys.

Security model: Row Level Security is enabled on every table; a signed-in
user can only touch rows where `user_id = auth.uid()`. Anonymous requests
return zero rows. Users' API keys are stored only as ciphertext
(`providers.api_key_ciphertext`).
