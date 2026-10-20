-- GHETTO APP core schema foundation.
-- This migration has not been applied to a Supabase project. It expects Supabase Auth.
-- Message rows intentionally contain ciphertext fields only; this migration does not implement E2EE.

create schema if not exists private;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  display_name text not null check (char_length(trim(display_name)) between 1 and 48),
  bio text not null default '' check (char_length(bio) <= 160),
  affiliation_type text check (affiliation_type in ('student', 'graduate', 'prospective', 'community')),
  affiliation_label text check (affiliation_label is null or char_length(affiliation_label) <= 80),
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create index if not exists profiles_affiliation_idx on public.profiles (affiliation_type, affiliation_label);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('friend_request', 'friend', 'follow', 'block', 'mute')),
  state text not null default 'active' check (state in ('pending', 'active', 'ignored')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (actor_id, subject_id, kind),
  check (actor_id <> subject_id)
);
create index if not exists relationships_subject_idx on public.relationships (subject_id, kind, state);

create or replace function public.respond_to_friend_request(target_request uuid, accept_request boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  requester uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  update public.relationships r
  set state = case when accept_request then 'active' else 'ignored' end,
      updated_at = now()
  where r.id = target_request
    and r.subject_id = (select auth.uid())
    and r.kind = 'friend_request'
    and r.state = 'pending'
  returning r.actor_id into requester;

  if requester is null then
    raise exception 'Friend request not found or no longer pending';
  end if;

  if accept_request then
    insert into public.relationships (actor_id, subject_id, kind, state)
    values (requester, (select auth.uid()), 'friend', 'active'),
           ((select auth.uid()), requester, 'friend', 'active')
    on conflict (actor_id, subject_id, kind) do update
      set state = 'active', updated_at = now();
  end if;
end;
$$;
revoke all on function public.respond_to_friend_request(uuid, boolean) from public, anon;
grant execute on function public.respond_to_friend_request(uuid, boolean) to authenticated;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct', 'group')),
  created_by uuid not null references auth.users (id),
  title text check (title is null or char_length(title) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (conversation_id, user_id)
);
create index if not exists conversation_members_user_idx on public.conversation_members (user_id, conversation_id) where left_at is null;

create or replace function private.is_conversation_member(target_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_members cm
    where cm.conversation_id = target_conversation
      and cm.user_id = (select auth.uid())
      and cm.left_at is null
  );
$$;
revoke all on function private.is_conversation_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_conversation_member(uuid) to authenticated;

create or replace function private.is_conversation_creator(target_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = target_conversation and c.created_by = (select auth.uid())
  );
$$;
revoke all on function private.is_conversation_creator(uuid) from public;
grant execute on function private.is_conversation_creator(uuid) to authenticated;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  client_message_id uuid not null,
  ciphertext bytea not null check (octet_length(ciphertext) between 1 and 65536),
  nonce bytea not null check (octet_length(nonce) between 12 and 32),
  protocol_version smallint not null check (protocol_version > 0),
  created_at timestamptz not null default now(),
  unique (sender_id, client_message_id)
);
create index if not exists messages_conversation_created_idx on public.messages (conversation_id, created_at desc);

create table if not exists public.street_views_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null default '' check (char_length(body) <= 5000),
  media_path text,
  campus_label text check (campus_label is null or char_length(campus_label) <= 80),
  audience text not null default 'public' check (audience in ('public', 'followers')),
  state text not null default 'published' check (state in ('draft', 'published', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(body)) > 0 or media_path is not null)
);
create index if not exists street_views_posts_feed_idx on public.street_views_posts (created_at desc) where state = 'published';

create table if not exists public.street_views_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.street_views_posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists street_views_comments_post_idx on public.street_views_comments (post_id, created_at);

create table if not exists public.street_views_reactions (
  post_id uuid not null references public.street_views_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, reaction)
);

create table if not exists public.campus_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 80),
  room_type text not null check (room_type in ('lecture_hall', 'classroom', 'gist', 'debate', 'workshop')),
  visibility text not null default 'public' check (visibility in ('public', 'invite_only')),
  capacity smallint not null default 30 check (capacity between 2 and 200),
  state text not null default 'open' check (state in ('open', 'live', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists campus_rooms_discovery_idx on public.campus_rooms (room_type, created_at desc) where visibility = 'public' and state <> 'closed';

create table if not exists public.campus_room_members (
  room_id uuid not null references public.campus_rooms (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'participant' check (role in ('host', 'moderator', 'participant')),
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  primary key (room_id, user_id)
);

create or replace function public.join_public_campus_room(target_room uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  room_row public.campus_rooms%rowtype;
  active_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select * into room_row
  from public.campus_rooms r
  where r.id = target_room and r.visibility = 'public' and r.state <> 'closed'
  for update;

  if not found then
    raise exception 'Public campus room not found or closed';
  end if;

  if room_row.host_id = (select auth.uid()) then
    return;
  end if;

  if exists (
    select 1 from public.campus_room_members rm
    where rm.room_id = target_room and rm.user_id = (select auth.uid()) and rm.left_at is null
  ) then
    return;
  end if;

  select count(*) into active_count
  from public.campus_room_members rm
  where rm.room_id = target_room and rm.left_at is null and rm.role <> 'host';

  if active_count + 1 >= room_row.capacity then
    raise exception 'Campus room is full';
  end if;

  insert into public.campus_room_members (room_id, user_id, role, joined_at, left_at)
  values (target_room, (select auth.uid()), 'participant', now(), null)
  on conflict (room_id, user_id) do update
    set joined_at = excluded.joined_at, left_at = null
    where public.campus_room_members.role = 'participant';

  if not found then
    raise exception 'This campus room membership cannot be reactivated';
  end if;
end;
$$;
revoke all on function public.join_public_campus_room(uuid) from public, anon;
grant execute on function public.join_public_campus_room(uuid) to authenticated;

create or replace function private.is_room_member(target_room uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.campus_room_members rm
    where rm.room_id = target_room
      and rm.user_id = (select auth.uid())
      and rm.left_at is null
  ) or exists (
    select 1 from public.campus_rooms r
    where r.id = target_room and r.host_id = (select auth.uid())
  );
$$;
revoke all on function private.is_room_member(uuid) from public;
grant execute on function private.is_room_member(uuid) to authenticated;

create table if not exists public.lecture_resources (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.campus_rooms (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  object_path text not null,
  media_type text not null check (media_type in ('document', 'image', 'video', 'link')),
  created_at timestamptz not null default now()
);

create table if not exists public.safety_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_user_id uuid references auth.users (id) on delete set null,
  target_post_id uuid references public.street_views_posts (id) on delete set null,
  target_room_id uuid references public.campus_rooms (id) on delete set null,
  category text not null check (category in ('spam', 'harassment', 'impersonation', 'unsafe_content', 'privacy', 'other')),
  details text check (details is null or char_length(details) <= 2000),
  state text not null default 'open' check (state in ('open', 'reviewing', 'actioned', 'closed')),
  created_at timestamptz not null default now(),
  check (num_nonnulls(target_user_id, target_post_id, target_room_id) = 1)
);

-- RLS is authorization; SQL privileges are a separate gate. Start from no
-- client table privileges and grant only the operations used by these policies.
alter table public.profiles enable row level security;
alter table public.relationships enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.street_views_posts enable row level security;
alter table public.street_views_comments enable row level security;
alter table public.street_views_reactions enable row level security;
alter table public.campus_rooms enable row level security;
alter table public.campus_room_members enable row level security;
alter table public.lecture_resources enable row level security;
alter table public.safety_reports enable row level security;

revoke all on table public.profiles, public.relationships, public.conversations,
  public.conversation_members, public.messages, public.street_views_posts,
  public.street_views_comments, public.street_views_reactions, public.campus_rooms,
  public.campus_room_members, public.lecture_resources, public.safety_reports
  from public, anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select, insert, delete on public.relationships to authenticated;
grant select, insert on public.conversations to authenticated;
grant select, insert, delete on public.conversation_members to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.street_views_posts to anon, authenticated;
grant insert, update, delete on public.street_views_posts to authenticated;
grant select on public.street_views_comments, public.street_views_reactions to anon, authenticated;
grant insert, delete on public.street_views_comments, public.street_views_reactions to authenticated;
grant select, insert, update, delete on public.campus_rooms to authenticated;
grant select, delete on public.campus_room_members to authenticated;
grant select, insert, delete on public.lecture_resources to authenticated;
grant insert on public.safety_reports to authenticated;

create policy "profiles_public_or_self_read" on public.profiles for select to anon, authenticated
  using (visibility = 'public' or id = (select auth.uid()));
create policy "profiles_self_insert" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "profiles_self_update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "relationships_participant_read" on public.relationships for select to authenticated
  using (actor_id = (select auth.uid()) or subject_id = (select auth.uid()));
create policy "relationships_actor_create" on public.relationships for insert to authenticated
  with check (actor_id = (select auth.uid()) and (
    (kind = 'friend_request' and state = 'pending') or
    (kind in ('follow', 'block', 'mute') and state = 'active')
  ));
create policy "relationships_actor_delete" on public.relationships for delete to authenticated
  using (actor_id = (select auth.uid()));

create policy "conversations_member_read" on public.conversations for select to authenticated
  using (private.is_conversation_member(id));
create policy "conversations_creator_insert" on public.conversations for insert to authenticated
  with check (created_by = (select auth.uid()));
create policy "conversation_members_member_read" on public.conversation_members for select to authenticated
  using (private.is_conversation_member(conversation_id));
create policy "conversation_members_self_join" on public.conversation_members for insert to authenticated
  with check (user_id = (select auth.uid()) and private.is_conversation_creator(conversation_id));
create policy "conversation_members_self_leave" on public.conversation_members for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "messages_member_read" on public.messages for select to authenticated
  using (private.is_conversation_member(conversation_id));
create policy "messages_member_send_ciphertext" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and private.is_conversation_member(conversation_id));

create policy "posts_published_read" on public.street_views_posts for select to anon, authenticated
  using (state = 'published' and audience = 'public' or author_id = (select auth.uid()));
create policy "posts_author_create" on public.street_views_posts for insert to authenticated
  with check (author_id = (select auth.uid()));
create policy "posts_author_update" on public.street_views_posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "posts_author_delete" on public.street_views_posts for delete to authenticated
  using (author_id = (select auth.uid()));

create policy "comments_public_post_read" on public.street_views_comments for select to anon, authenticated
  using (exists (select 1 from public.street_views_posts p where p.id = post_id and p.state = 'published' and p.audience = 'public'));
create policy "comments_authenticated_create" on public.street_views_comments for insert to authenticated
  with check (author_id = (select auth.uid()) and exists (
    select 1 from public.street_views_posts p where p.id = post_id and p.state = 'published' and p.audience = 'public'
  ));
create policy "comments_author_delete" on public.street_views_comments for delete to authenticated
  using (author_id = (select auth.uid()));

create policy "reactions_public_post_read" on public.street_views_reactions for select to anon, authenticated
  using (exists (select 1 from public.street_views_posts p where p.id = post_id and p.state = 'published' and p.audience = 'public'));
create policy "reactions_self_create" on public.street_views_reactions for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (
    select 1 from public.street_views_posts p where p.id = post_id and p.state = 'published' and p.audience = 'public'
  ));
create policy "reactions_self_delete" on public.street_views_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "rooms_public_or_member_read" on public.campus_rooms for select to authenticated
  using (visibility = 'public' or host_id = (select auth.uid()) or private.is_room_member(id));
create policy "rooms_host_create" on public.campus_rooms for insert to authenticated
  with check (host_id = (select auth.uid()));
create policy "rooms_host_update" on public.campus_rooms for update to authenticated
  using (host_id = (select auth.uid())) with check (host_id = (select auth.uid()));
create policy "rooms_host_delete" on public.campus_rooms for delete to authenticated
  using (host_id = (select auth.uid()));
create policy "room_members_self_or_member_read" on public.campus_room_members for select to authenticated
  using (user_id = (select auth.uid()) or private.is_room_member(room_id));
create policy "room_members_self_leave" on public.campus_room_members for delete to authenticated
  using (user_id = (select auth.uid()) and role = 'participant');
create policy "resources_room_member_read" on public.lecture_resources for select to authenticated
  using (private.is_room_member(room_id));
create policy "resources_room_host_create" on public.lecture_resources for insert to authenticated
  with check (owner_id = (select auth.uid()) and exists (
    select 1 from public.campus_rooms r where r.id = room_id and r.host_id = (select auth.uid())
  ));
create policy "resources_owner_delete" on public.lecture_resources for delete to authenticated
  using (owner_id = (select auth.uid()));

create policy "reports_submit_as_self" on public.safety_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
-- No user-facing select/update policy is defined for reports. Moderation access requires a future audited role system.

comment on column public.messages.ciphertext is 'Encrypted payload field only. A reviewed E2EE protocol and client key lifecycle are not implemented by this schema.';
comment on column public.profiles.id is 'References the authenticated account. Phone numbers are intentionally absent from this public profile table.';
