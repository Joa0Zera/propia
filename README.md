# PropIA

SaaS multi-tenant para imobiliárias, com um agente de IA que qualifica leads e transfere a conversa para um corretor humano via WhatsApp quando o lead está pronto.

> **EN**: Multi-tenant real-estate SaaS with an AI agent that qualifies leads and hands off to a human broker over WhatsApp once the lead is ready.

## O problema

Corretores perdem tempo respondendo perguntas repetitivas (preço, localização, disponibilidade) em vez de focar em fechar negócio. O PropIA filtra e qualifica antes de acionar um humano.

## Como funciona

- Cada imobiliária é um tenant isolado (`org_id` + Row Level Security no Postgres/Supabase)
- Visitantes acessam o catálogo de imóveis da imobiliária por uma URL própria (`/visit/[org_slug]`)
- Um widget de chat (`ChatWidget`) conversa com o lead sobre os imóveis cadastrados
- Painel administrativo completo: dashboard, CRUD de imóveis com upload de imagens, autenticação e áreas protegidas por papel de usuário

## Decisões de engenharia de IA

**Respostas fundamentadas em dados estruturados, não geração livre.** Cada imóvel tem informações fixas (preço, condições, diferenciais) cadastradas no banco. O agente consulta esses dados antes de responder, em vez de deixar o modelo "lembrar" ou inferir informação sobre o imóvel. Isso elimina a classe de erro mais perigosa num agente comercial: inventar preço, condição ou detalhe que não existe.

**Tratamento de falha da API de IA.** Chamadas para a API de IA têm try/catch com mensagem de fallback para o usuário — se a API falhar (timeout, rate limit), o widget não quebra silenciosamente nem trava a conversa.

**Arquitetura agnóstica de provedor.** A integração de IA está desenhada para trocar de provedor sem reescrever a lógica do produto — hoje usa a API da OpenAI (mais barata, adequada à fase de validação), com migração para a API da Claude (Anthropic) planejada assim que o produto gerar receita própria.

## Em andamento

- **Regra de handoff para corretor**: lógica híbrida (regra determinística + IA) já desenhada — o handoff é decidido em código a partir de sinais explícitos (pedido de visita, pergunta sobre financiamento, pedido direto de contato, 3+ perguntas sobre o mesmo imóvel, ou conversa longa sem sinal claro), em vez de depender do julgamento do modelo. Implementação em `lib/handoff.ts`, ainda sendo integrada ao fluxo de chat.
- **Testes automatizados**: suíte cobrindo os cenários de handoff (Vitest), em processo de instalação.
- **Testes adversariais**: checklist de 10 cenários (pergunta fora de escopo, tentativa de prompt injection, lead hostil, negociação de preço, etc.) definido, execução manual ainda pendente.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** — banco de dados, autenticação e Row Level Security para isolamento multi-tenant
- **OpenAI API** para o agente (ver decisão de arquitetura acima)
- Deploy: Vercel

## Status

MVP completo — todas as 5 camadas do produto implementadas (autenticação, painel admin, catálogo público, agente de IA, schema multi-tenant). Ainda não está em operação com clientes reais; próximo passo é fechar os itens "Em andamento" acima antes da validação com a primeira imobiliária piloto.

## Decisões técnicas

- Isolamento multi-tenant via `org_id` + RLS em vez de um banco por cliente — mais barato de operar e mais simples de escalar no início
- Handoff decidido por regra determinística em código, não pelo modelo de IA — mais confiável, mais barato (não gasta chamada extra de IA) e auditável
