-- Criação da tabela de perfis de usuário
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  nome text,
  email text,
  salario_desejado numeric,
  dias_trabalhados integer,
  horas_trabalhadas integer,
  custos_fixos numeric,
  consent_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ativar RLS (Row Level Security) e criar política de acesso
alter table public.profiles enable row level security;
create policy "Usuários podem ver seus próprios perfis" on public.profiles for select using ( auth.uid() = id );
create policy "Usuários podem inserir seus próprios perfis" on public.profiles for insert with check ( auth.uid() = id );
create policy "Usuários podem atualizar seus próprios perfis" on public.profiles for update using ( auth.uid() = id );

-- Criação da tabela de insumos
create table if not exists public.insumos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  preco_pago numeric not null,
  quantidade_embalagem numeric not null,
  unidade text not null,
  tipo text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.insumos enable row level security;
create policy "Usuários gerenciam apenas seus próprios insumos" on public.insumos for all using ( auth.uid() = user_id );

-- Criação da tabela de histórico de preços
create table if not exists public.historico_precos (
  id uuid default gen_random_uuid() primary key,
  insumo_id uuid references public.insumos on delete cascade not null,
  preco_pago numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.historico_precos enable row level security;
-- Como histórico depende do insumo, precisamos de um join ou apenas liberar all se a query for validada pela app. 
-- Para facilitar, vamos permitir baseado na tabela insumos, mas a abordagem mais simples é ignorar RLS ou fazer uma subquery:
create policy "Histórico atrelado aos insumos do usuário" on public.historico_precos for all using ( 
  exists (select 1 from public.insumos where id = historico_precos.insumo_id and user_id = auth.uid())
);

-- Criação da tabela de itens de custo fixo
create table if not exists public.custos_fixos_itens (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  valor numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.custos_fixos_itens enable row level security;
create policy "Usuários gerenciam apenas seus próprios custos" on public.custos_fixos_itens for all using ( auth.uid() = user_id );

-- Criação da tabela de receitas
create table if not exists public.receitas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  nome text not null,
  rendimento numeric not null,
  rendimento_peso numeric,
  ingredientes jsonb not null default '[]'::jsonb,
  tempo_preparo numeric not null,
  margem_alvo numeric not null,
  preco_venda_praticado numeric not null,
  fator_perda numeric,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.receitas enable row level security;
create policy "Usuários gerenciam apenas suas próprias receitas" on public.receitas for all using ( auth.uid() = user_id );

-- Configuração do trigger para criar o profile automaticamente ao criar usuário no auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Segurança: revoga o direito de executar diretamente a função de trigger
revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
