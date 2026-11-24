-- Target schema for a future PostgreSQL/Supabase adapter.
-- This is a design artifact only; it is not a generated Supabase migration.
create schema if not exists internal;

create table if not exists public.aids (
  id text primary key,
  slug text not null unique,
  name text not null,
  category text not null,
  responsible_organization text not null,
  short_description text not null,
  official_url text not null,
  publication_status text not null default 'pending'
    check (publication_status in ('pending', 'published', 'archived')),
  verified_at date,
  valid_from date,
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.aid_territories (
  id bigint generated always as identity primary key,
  aid_id text not null references public.aids(id) on delete cascade,
  level text not null check (level in ('national', 'regional', 'department', 'commune', 'intercommunal')),
  region_code text,
  department_code text,
  commune_code text,
  inclusion_note text,
  exclusion_note text
);

create table if not exists public.aid_sources (
  id bigint generated always as identity primary key,
  aid_id text not null references public.aids(id) on delete cascade,
  label text not null,
  url text not null,
  source_kind text not null check (source_kind in ('official-guidance', 'legal-text', 'dataset')),
  publisher text not null,
  consulted_at date not null,
  source_updated_at date,
  valid_from date,
  valid_until date,
  reuse_license text,
  notes text
);

-- Each displayed fact points to one or more evidence sources.
create table if not exists public.aid_facts (
  id bigint generated always as identity primary key,
  aid_id text not null references public.aids(id) on delete cascade,
  section text not null check (section in ('condition', 'document', 'step', 'territory-note')),
  position integer not null,
  content text not null,
  evidence_state text not null default 'pending'
    check (evidence_state in ('pending', 'sourced', 'approved')),
  unique (aid_id, section, position)
);

create table if not exists public.aid_fact_sources (
  fact_id bigint not null references public.aid_facts(id) on delete cascade,
  source_id bigint not null references public.aid_sources(id) on delete cascade,
  primary key (fact_id, source_id)
);

-- Immutable import lineage. Raw source rows stay separate from reviewed aid facts.
create table if not exists internal.source_import_runs (
  id bigint generated always as identity primary key,
  source_id text not null,
  source_url text not null,
  source_version text,
  retrieved_at timestamptz not null,
  license text,
  status text not null check (status in ('succeeded', 'partial', 'failed')),
  retrieved_count integer not null default 0 check (retrieved_count >= 0),
  normalized_count integer not null default 0 check (normalized_count >= 0),
  unique_aids integer not null default 0 check (unique_aids >= 0),
  duplicate_count integer not null default 0 check (duplicate_count >= 0),
  content_sha256 text,
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists internal.external_source_records (
  id bigint generated always as identity primary key,
  import_run_id bigint not null references internal.source_import_runs(id) on delete restrict,
  external_id text not null,
  raw_record jsonb not null,
  normalized_record jsonb,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected', 'duplicate')),
  duplicate_of_external_id text,
  linked_aid_id text references public.aids(id) on delete set null,
  unique (import_run_id, external_id)
);

create table if not exists internal.territorial_units (
  unit_code text primary key,
  name text not null,
  unit_level text not null check (unit_level in ('commune', 'department', 'region', 'epci')),
  parent_code text,
  region_code text,
  department_code text,
  epci_code text,
  source_import_run_id bigint references internal.source_import_runs(id) on delete restrict,
  retrieved_at timestamptz not null
);

create table if not exists internal.postal_code_communes (
  postal_code text not null,
  insee_code text not null references internal.territorial_units(unit_code) on delete cascade,
  source_import_run_id bigint not null references internal.source_import_runs(id) on delete restrict,
  source_updated_at date,
  primary key (postal_code, insee_code, source_import_run_id)
);

create table if not exists internal.aid_reviews (
  id bigint generated always as identity primary key,
  aid_id text not null references public.aids(id) on delete cascade,
  reviewed_at date not null,
  reviewer text,
  review_status text not null check (review_status in ('pending', 'approved', 'rejected')),
  notes text not null,
  created_at timestamptz not null default now()
);

create table if not exists internal.eligibility_rule_versions (
  id bigint generated always as identity primary key,
  aid_id text not null references public.aids(id) on delete cascade,
  engine text not null check (engine in ('openfisca-france', 'publicodes', 'aides-simplifiees', 'custom')),
  engine_version text not null,
  rule_version text not null,
  period_start date not null,
  period_end date,
  source_ids bigint[] not null default '{}',
  review_status text not null check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  check (period_end is null or period_end >= period_start)
);

-- Only synthetic test profiles belong here. Never store users' answers or PII.
create table if not exists internal.eligibility_test_cases (
  id text primary key,
  rule_version_id bigint not null references internal.eligibility_rule_versions(id) on delete cascade,
  period date not null,
  synthetic_profile jsonb not null,
  expected_result jsonb not null,
  case_source text not null,
  validated_by text,
  created_at timestamptz not null default now()
);

create index if not exists aids_publication_slug_idx on public.aids(publication_status, slug);
create index if not exists aid_territories_codes_idx on public.aid_territories(department_code, commune_code);
create index if not exists aid_sources_aid_idx on public.aid_sources(aid_id, consulted_at desc);
create index if not exists aid_facts_aid_section_idx on public.aid_facts(aid_id, section, position);

-- Public catalogue is read-only. Internal review and synthetic test profiles are not exposed.
alter table public.aids enable row level security;
alter table public.aid_territories enable row level security;
alter table public.aid_sources enable row level security;
alter table public.aid_facts enable row level security;
alter table public.aid_fact_sources enable row level security;
alter table internal.aid_reviews enable row level security;
alter table internal.eligibility_rule_versions enable row level security;
alter table internal.eligibility_test_cases enable row level security;
alter table internal.source_import_runs enable row level security;
alter table internal.external_source_records enable row level security;
alter table internal.territorial_units enable row level security;
alter table internal.postal_code_communes enable row level security;

grant select on public.aids, public.aid_territories, public.aid_sources,
  public.aid_facts, public.aid_fact_sources to anon, authenticated;

create policy "Published aids are readable" on public.aids
  for select to anon, authenticated using (publication_status = 'published');
create policy "Published aid territories are readable" on public.aid_territories
  for select to anon, authenticated using (
    exists (select 1 from public.aids a where a.id = aid_id and a.publication_status = 'published')
  );
create policy "Published aid sources are readable" on public.aid_sources
  for select to anon, authenticated using (
    exists (select 1 from public.aids a where a.id = aid_id and a.publication_status = 'published')
  );
create policy "Published aid facts are readable" on public.aid_facts
  for select to anon, authenticated using (
    exists (select 1 from public.aids a where a.id = aid_id and a.publication_status = 'published')
  );
create policy "Published fact provenance is readable" on public.aid_fact_sources
  for select to anon, authenticated using (
    exists (
      select 1 from public.aid_facts f join public.aids a on a.id = f.aid_id
      where f.id = fact_id and a.publication_status = 'published'
    )
  );
