create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 100),
  relation text not null check (char_length(btrim(relation)) between 1 and 40),
  birth_date date,
  facts jsonb not null default '{}' check (jsonb_typeof(facts) = 'object'),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  member_id uuid,
  scheme_id text not null check (char_length(scheme_id) between 1 and 80),
  applicant text not null check (char_length(btrim(applicant)) between 1 and 100),
  status text not null default 'planned' check (status in ('planned', 'submitted', 'under_review', 'approved', 'rejected')),
  reference text not null default '' check (char_length(reference) <= 120),
  updated_at timestamptz not null default now(),
  foreign key (user_id, member_id) references public.family_members(user_id, id) on delete set null (member_id)
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  member_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  scheme_id text check (char_length(scheme_id) between 1 and 80),
  due_date date not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  foreign key (user_id, member_id) references public.family_members(user_id, id) on delete set null (member_id)
);

create table public.application_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scheme_id text not null check (char_length(scheme_id) between 1 and 80),
  applicant text not null check (char_length(btrim(applicant)) between 1 and 100),
  birth_date date,
  postal_code text not null default '' check (postal_code = '' or postal_code ~ '^[1-9][0-9]{5}$'),
  updated_at timestamptz not null default now(),
  unique (user_id, scheme_id, applicant)
);

create index applications_user_updated_idx on public.applications(user_id, updated_at desc);
create index applications_member_idx on public.applications(user_id, member_id) where member_id is not null;
create index reminders_user_due_idx on public.reminders(user_id, due_date);
create index reminders_member_idx on public.reminders(user_id, member_id) where member_id is not null;

do $policies$
declare
  table_name text;
begin
  foreach table_name in array array['family_members', 'applications', 'reminders', 'application_drafts']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to authenticated', table_name);
    execute format($policy$
      create policy owner_access on public.%I for all to authenticated
        using ((select auth.uid()) = user_id and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false))
        with check ((select auth.uid()) = user_id and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false))
    $policy$, table_name);
  end loop;
end
$policies$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('citizen-documents', 'citizen-documents', false, 8388608, array['image/jpeg', 'image/png', 'image/webp']);

create policy citizen_documents_owner on storage.objects for all to authenticated
  using (
    bucket_id = 'citizen-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false)
  )
  with check (
    bucket_id = 'citizen-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false)
  );
