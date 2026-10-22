-- ============================================================================
-- VIGIA GROTAS | UDA UNIMA AFYA — HACKATHON ACELERA PERIFERIA
-- Script SQL para colar no "SQL Editor" do Supabase (Free Tier)
-- ============================================================================

-- 1. Tabela de Instituições de Ensino Superior (Multi-Tenant SaaS)
create table if not exists public.institutions (
  id text primary key,
  name text not null,
  status text not null default 'Ativo',
  communities text[] not null default '{}',
  students_active integer not null default 0,
  records_captured integer not null default 0,
  mrr_saas text not null default 'R$ 8.900/mês',
  created_at timestamptz not null default now()
);

-- 2. Tabela de Pacientes / Moradores Atendidos na UDA (Grota do Rafael e Grota do Arroz)
create table if not exists public.patients (
  id text primary key,
  institution_id text references public.institutions(id) on delete set null default 'unima-afya-mcz',
  name text not null,
  age integer not null,
  sex text not null,
  cns text not null,
  community text not null, -- 'Grota do Rafael' ou 'Grota do Arroz'
  microarea text not null,
  sanitation text not null,
  water_access text not null,
  housing_risk text not null default 'Moderado',
  income_bracket text not null default 'Até 1 salário mínimo',
  medications_in_use text[] not null default '{}',
  medication_adherence text not null default 'Regular',
  chronic_conditions text[] not null default '{}', -- Códigos CID-10 (ex: I10, E11, A90)
  last_visit text not null,
  risk_level text not null default 'Moderado',
  created_at timestamptz not null default now()
);

-- 3. Tabela de Atendimentos / Evoluções Clínicas (Rastreadas pela Matrícula do Acadêmico)
create table if not exists public.consultations (
  id text primary key,
  patient_id text not null references public.patients(id) on delete cascade,
  consultation_date text not null,
  student_name text not null,
  student_matricula text not null,
  bp text not null,
  glycemia integer not null,
  heart_rate integer not null default 80,
  temp numeric(4,1) not null default 36.5,
  weight numeric(5,1) not null default 70.0,
  height numeric(3,2) not null default 1.65,
  cids text[] not null default '{}',
  chief_complaint text not null,
  conduct text not null,
  created_at timestamptz not null default now()
);

-- 4. View Nativa de Anonimização LGPD (Art. 12) para o Marketplace B2B e Políticas Públicas
-- Remove Nome, CNS e Microárea exata, gerando hash irreversível e faixa etária agregada
create or replace view public.v_anonymized_rwe as
select
  encode(digest(p.id || '-' || p.cns, 'sha256'), 'hex') as anonymized_cohort_hash,
  p.institution_id as institution_tenant,
  p.community as territory_cluster,
  case
    when p.age < 12 then '00-11 (Pediátrico)'
    when p.age < 18 then '12-17 (Adolescente)'
    when p.age < 30 then '18-29 (Adulto Jovem)'
    when p.age < 45 then '30-44 (Adulto)'
    when p.age < 60 then '45-59 (Meia-idade)'
    else '60+ (Idoso)'
  end as age_bracket,
  p.sex as biological_sex,
  p.sanitation as sanitation_determinant,
  p.water_access,
  p.chronic_conditions as icd10_codes,
  p.medications_in_use as therapeutic_classes,
  p.medication_adherence as adherence_profile,
  p.risk_level,
  p.last_visit
from public.patients p;

-- 5. Habilitar Row Level Security (RLS) com políticas abertas para o MVP do Hackathon
alter table public.institutions enable row level security;
alter table public.patients enable row level security;
alter table public.consultations enable row level security;

drop policy if exists "Permitir leitura e escrita publica MVP institutions" on public.institutions;
create policy "Permitir leitura e escrita publica MVP institutions"
  on public.institutions for all
  using (true)
  with check (true);

drop policy if exists "Permitir leitura e escrita publica MVP patients" on public.patients;
create policy "Permitir leitura e escrita publica MVP patients"
  on public.patients for all
  using (true)
  with check (true);

drop policy if exists "Permitir leitura e escrita publica MVP consultations" on public.consultations;
create policy "Permitir leitura e escrita publica MVP consultations"
  on public.consultations for all
  using (true)
  with check (true);
