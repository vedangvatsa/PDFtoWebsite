-- PUBLIC grants apply to anon and authenticated roles. This trigger function
-- must only run from auth.users triggers, never through the REST RPC surface.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
