-- READ-ONLY Supabase/PostgreSQL schema report.
-- Run each SELECT block separately in the Supabase SQL Editor.
-- These queries inspect metadata only: they do not read application rows or
-- change database objects. Do not add credentials or customer data to this file.

-- 1. Application schemas, tables, columns, and row-level security flags.
select
  c.table_schema,
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.column_default,
  c.is_nullable,
  c.is_identity,
  c.identity_generation,
  c.is_generated,
  c.generation_expression,
  coalesce(t.relrowsecurity, false) as rls_enabled,
  coalesce(t.relforcerowsecurity, false) as rls_forced
from information_schema.columns c
left join pg_namespace n
  on n.nspname = c.table_schema
left join pg_class t
  on t.relnamespace = n.oid
  and t.relname = c.table_name
  and t.relkind in ('r', 'p', 'v', 'm', 'f')
where c.table_schema not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and c.table_schema not like 'pg_%'
order by c.table_schema, c.table_name, c.ordinal_position;

-- 2. Primary keys, foreign keys, unique/check/exclusion constraints.
select
  ns.nspname as schema_name,
  tbl.relname as table_name,
  con.conname as constraint_name,
  case con.contype
    when 'p' then 'PRIMARY KEY'
    when 'f' then 'FOREIGN KEY'
    when 'u' then 'UNIQUE'
    when 'c' then 'CHECK'
    when 'x' then 'EXCLUSION'
    else con.contype::text
  end as constraint_type,
  pg_get_constraintdef(con.oid, true) as definition,
  con.convalidated as validated
from pg_constraint con
join pg_class tbl on tbl.oid = con.conrelid
join pg_namespace ns on ns.oid = tbl.relnamespace
where ns.nspname not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and ns.nspname not like 'pg_%'
order by ns.nspname, tbl.relname, con.contype, con.conname;

-- 3. Index definitions.
select
  schemaname as schema_name,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
from pg_indexes
where schemaname not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and schemaname not like 'pg_%'
order by schemaname, tablename, indexname;

-- 4. Function/procedure names and signatures only; no function source.
select
  ns.nspname as schema_name,
  p.proname as routine_name,
  case p.prokind when 'p' then 'PROCEDURE' else 'FUNCTION' end as routine_type,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  lang.lanname as language,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace ns on ns.oid = p.pronamespace
join pg_language lang on lang.oid = p.prolang
where p.prokind in ('f', 'p')
and ns.nspname not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and ns.nspname not like 'pg_%'
order by ns.nspname, p.proname;

-- 5. User-defined triggers and their target function names.
select
  ns.nspname as schema_name,
  tbl.relname as table_name,
  trg.tgname as trigger_name,
  pg_get_triggerdef(trg.oid, true) as definition,
  proc_ns.nspname as function_schema,
  proc.proname as function_name,
  pg_get_function_identity_arguments(proc.oid) as function_arguments
from pg_trigger trg
join pg_class tbl on tbl.oid = trg.tgrelid
join pg_namespace ns on ns.oid = tbl.relnamespace
join pg_proc proc on proc.oid = trg.tgfoid
join pg_namespace proc_ns on proc_ns.oid = proc.pronamespace
where not trg.tgisinternal
and ns.nspname not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and ns.nspname not like 'pg_%'
order by ns.nspname, tbl.relname, trg.tgname;

-- 6. Row-level security policies and their expressions.
select
  schemaname as schema_name,
  tablename as table_name,
  policyname as policy_name,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as check_expression
from pg_policies
where schemaname not in (
  'pg_catalog', 'information_schema', 'auth', 'storage', 'extensions',
  'graphql', 'graphql_public', 'realtime', 'supabase_functions',
  'supabase_migrations', 'vault'
)
and schemaname not like 'pg_%'
order by schemaname, tablename, policyname;
