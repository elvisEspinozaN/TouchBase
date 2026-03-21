create extension if not exists pgcrypto;

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  role text not null default '',
  event text not null default '',
  met_on date not null,
  last_contacted_on date not null,
  topics text[] not null default '{}'::text[],
  notes text not null default '',
  email text not null default '',
  follow_up_days integer not null default 3 check (follow_up_days > 0),
  follow_up_status text not null default 'pending' check (follow_up_status in ('pending', 'drafted', 'sent')),
  reminded_once boolean not null default false,
  snoozed_until date,
  draft_subject text,
  draft_body text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index contacts_user_last_contacted_idx
  on public.contacts (user_id, last_contacted_on desc);

create index contacts_user_follow_up_status_idx
  on public.contacts (user_id, follow_up_status);

create index contacts_user_snoozed_until_idx
  on public.contacts (user_id, snoozed_until);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_contacts_updated_at
before update on public.contacts
for each row
execute function public.set_updated_at();

alter table public.contacts enable row level security;

create policy "Users can view their own contacts"
on public.contacts
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own contacts"
on public.contacts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own contacts"
on public.contacts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own contacts"
on public.contacts
for delete
to authenticated
using (auth.uid() = user_id);
