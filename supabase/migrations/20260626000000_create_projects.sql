create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
  project_url text not null,
  countries text[] not null default '{}',
  participant_name text not null,
  video_url text not null,
  description_markdown text not null,
  owner_user_id text not null,
  spam_score numeric,
  spam_reason text,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists status text not null default 'published';
alter table public.projects add column if not exists published_at timestamptz default now();
alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check check (status in ('draft', 'published', 'hidden'));
update public.projects set published_at = created_at where published_at is null and status = 'published';

create table if not exists public.project_votes (
  project_id uuid not null references public.projects(id) on delete cascade,
  voter_id text not null,
  created_at timestamptz not null default now(),
  primary key (project_id, voter_id)
);

create table if not exists public.project_publication_events (
  id bigserial primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  event_type text not null check (event_type in ('published', 'updated')),
  slug text not null,
  name text not null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists projects_slug_idx on public.projects(slug);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists projects_published_at_idx on public.projects(published_at desc) where status = 'published';
create index if not exists projects_owner_user_id_idx on public.projects(owner_user_id);
create index if not exists project_votes_project_id_idx on public.project_votes(project_id);
create index if not exists project_publication_events_created_at_idx on public.project_publication_events(created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row
  execute function public.touch_updated_at();

create or replace function public.ensure_project_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists projects_ensure_published_at on public.projects;
create trigger projects_ensure_published_at
  before insert or update on public.projects
  for each row
  execute function public.ensure_project_published_at();

create or replace function public.enqueue_project_publication_event()
returns trigger
language plpgsql
as $$
declare
  changed boolean := false;
  publication_event_type text := 'updated';
begin
  if tg_op = 'INSERT' then
    changed := true;
    publication_event_type := 'published';
  elsif old.status is distinct from new.status then
    changed := true;
    publication_event_type := 'published';
  elsif old.slug is distinct from new.slug or old.name is distinct from new.name then
    changed := true;
  end if;

  if new.status = 'published' and changed then
    insert into public.project_publication_events (
      project_id,
      event_type,
      slug,
      name,
      published_at
    ) values (
      new.id,
      publication_event_type,
      new.slug,
      new.name,
      new.published_at
    );
  end if;

  return new;
end;
$$;

drop trigger if exists projects_enqueue_publication_event on public.projects;
create trigger projects_enqueue_publication_event
  after insert or update on public.projects
  for each row
  execute function public.enqueue_project_publication_event();

alter table public.projects enable row level security;
alter table public.project_votes enable row level security;
alter table public.project_publication_events enable row level security;

create policy "Project votes are readable"
  on public.project_votes for select
  using (true);

drop policy if exists "Project publication events are readable" on public.project_publication_events;
create policy "Project publication events are readable"
  on public.project_publication_events for select
  using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_votes'
  ) then
    alter publication supabase_realtime add table public.project_votes;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'project_publication_events'
  ) then
    alter publication supabase_realtime add table public.project_publication_events;
  end if;
end $$;
