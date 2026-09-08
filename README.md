# PropIA

SaaS multi-tenant para imobiliárias, com um agente de IA que qualifica leads e transfere a conversa para um corretor humano via WhatsApp quando o lead está pronto.

> **EN**: Multi-tenant real-estate SaaS with an AI agent that qualifies leads and hands off to a human broker over WhatsApp once the lead is ready.

## O problema

Corretores perdem tempo respondendo perguntas repetitivas (preço, localização, disponibilidade) em vez de focar em fechar negócio. O PropIA filtra e qualifica antes de acionar um humano.

## Como funciona

- Cada imobiliária é um tenant isolado (`org_id` + Row Level Security no Postgres/Supabase)
- Visitantes acessam o catálogo de imóveis da imobiliária por uma URL própria (`/visit/[org_slug]`)
- Um widget de chat (`ChatWidget`) conversa com o lead, entende o que ele procura e responde dúvidas
- Quando o lead está qualificado, a conversa é encaminhada para o corretor via WhatsApp
- Painel administrativo completo: dashboard, CRUD de imóveis com upload de imagens, autenticação e áreas protegidas por papel de usuário

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind
- **Supabase** — banco de dados, autenticação e Row Level Security para isolamento multi-tenant
- **API de IA** — integração construída sobre a API da OpenAI. A arquitetura do agente é agnóstica de provedor por design: a troca para a API da Claude (Anthropic) está planejada assim que o produto começar a gerar receita própria, priorizando custo operacional baixo enquanto valida o mercado
- Deploy: Vercel

## Status

MVP completo — todas as 5 camadas do produto implementadas (autenticação, painel admin, catálogo público, agente de IA, schema multi-tenant). Ainda não está em operação com clientes reais; próximo passo é a validação com a primeira imobiliária piloto.

## Decisões técnicas

- Isolamento multi-tenant via `org_id` + RLS em vez de um banco por cliente — mais barato de operar e mais simples de escalar no início
- Escolha da OpenAI para o agente na fase de validação por custo, com a integração desenhada para trocar de provedor de IA sem reescrever a lógica do produto
