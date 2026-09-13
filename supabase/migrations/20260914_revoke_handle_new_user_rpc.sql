-- This function is invoked only by auth.users triggers. It must not be exposed
-- as a public SECURITY DEFINER RPC endpoint.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
