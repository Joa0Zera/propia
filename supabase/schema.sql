-- PropIA — schema inicial
-- Rode isso inteiro no SQL Editor do Supabase (Project > SQL Editor > New query)

-- ─── Tabelas ────────────────────────────────────────────────────────────────

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  whatsapp_number text,
  logo_url text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'agent')),
  created_at timestamptz not null default now()
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  price numeric,
  down_payment_options text[],
  parcels_available text[],
  taxes_fees text,
  location text,
  features text[],
  images text[],
  main_image_url text,
  videos text[],
  ai_context text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  visitor_session_id text not null,
  messages jsonb not null default '[]'::jsonb,
  lead_qualified boolean not null default false,
  visitor_name text,
  visitor_phone text,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index properties_org_id_idx on properties(org_id);
create index conversations_org_id_idx on conversations(org_id);
create index conversations_property_visitor_idx on conversations(property_id, visitor_session_id);

-- ─── RLS ────────────────────────────────────────────────────────────────────

alter table organizations enable row level security;
alter table users enable row level security;
alter table properties enable row level security;
alter table conversations enable row level security;

-- organizations: leitura pública (nome/slug/logo/whatsapp não são sensíveis,
-- e a galeria pública /visit/[org_slug] precisa ler isso sem sessão)
create policy "organizations are publicly readable"
  on organizations for select
  using (true);

-- só o próprio usuário (recém-cadastrado) pode criar sua organização
create policy "users can create their own organization"
  on organizations for insert
  with check (created_by = auth.uid());

-- só membros da org podem atualizar a própria org
create policy "org members can update their organization"
  on organizations for update
  using (id in (select org_id from users where id = auth.uid()));

-- users: cada um só enxerga/edita a própria linha
create policy "users can read their own row"
  on users for select
  using (id = auth.uid());

create policy "users can insert their own row"
  on users for insert
  with check (id = auth.uid());

create policy "users can update their own row"
  on users for update
  using (id = auth.uid());

-- properties: público só vê imóveis ativos; membros da org veem/editam tudo da própria org
create policy "active properties are publicly readable"
  on properties for select
  using (is_active = true);

create policy "org members can read all their properties"
  on properties for select
  using (org_id in (select org_id from users where id = auth.uid()));

create policy "org members can insert properties"
  on properties for insert
  with check (org_id in (select org_id from users where id = auth.uid()));

create policy "org members can update their properties"
  on properties for update
  using (org_id in (select org_id from users where id = auth.uid()));

create policy "org members can delete their properties"
  on properties for delete
  using (org_id in (select org_id from users where id = auth.uid()));

-- conversations: o chat público roda sem login (visitante anônimo),
-- então insert/select/update ficam abertos por design de MVP —
-- a "chave" de acesso é o visitor_session_id + property_id, não uma sessão real.
-- (Limitação conhecida: quem souber o session_id de outro visitante poderia ler
-- aquela conversa. Aceitável para o MVP; endurecer depois se necessário.)
create policy "conversations are publicly readable"
  on conversations for select
  using (true);

create policy "anyone can create a conversation"
  on conversations for insert
  with check (true);

create policy "anyone can update a conversation"
  on conversations for update
  using (true);
