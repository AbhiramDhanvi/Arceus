do $policies$
declare
  table_name text;
begin
  foreach table_name in array array['family_members', 'applications', 'reminders', 'application_drafts']
  loop
    execute format($policy$
      alter policy owner_access on public.%I
        using ((select auth.uid()) = user_id and not coalesce((((select auth.jwt())->>'is_anonymous')::boolean), false))
        with check ((select auth.uid()) = user_id and not coalesce((((select auth.jwt())->>'is_anonymous')::boolean), false))
    $policy$, table_name);
  end loop;
end
$policies$;
alter policy citizen_documents_owner on storage.objects
  using (
    bucket_id = 'citizen-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false)
  )
  with check (
    bucket_id = 'citizen-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean, false)
  );
