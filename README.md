# VigIA Grotas | UDA UNIMA Afya — Hackathon Acelera Periferia

Sistema Docente-Assistencial de **Prontuário Eletrônico Comunitário**, **Inteligência para Políticas Públicas** e **Marketplace Ético de Dados Anonimizados (RWE)** focado inicialmente nos moradores atendidos pelas UDAs da **UNIMA | Afya (Maceió - AL)** provenientes da **Grota do Rafael** e da **Grota do Arroz**.

---

## Como Colocar no Ar (Supabase Free + Vercel Free) em 2 Minutos

### Passo 1 — Banco de Dados no Supabase (Free Tier)
1. Crie uma conta gratuita em [supabase.com](https://supabase.com) e clique em **New Project**.
2. No menu lateral esquerdo do Supabase, abra o **SQL Editor** &rarr; **New Query**.
3. Copie todo o conteúdo do arquivo [`supabase/schema.sql`](file:///e:/Programming/hacka-periferias/supabase/schema.sql), cole no editor e clique em **Run**.
   - Isso criará automaticamente as tabelas `institutions`, `patients`, `consultations` e a View SQL de anonimização LGPD `v_anonymized_rwe`.
4. Vá em **Project Settings** &rarr; **API** e copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **Project API Keys &rarr; `anon` `public`**
5. Você pode:
   - Colar essas duas chaves diretamente no arquivo [`supabase-config.js`](file:///e:/Programming/hacka-periferias/supabase-config.js) (`window.SUPABASE_DEFAULTS`), **OU**
   - Clicar no botão **"Supabase: Modo Híbrido"** no topo direito do próprio site, colar a URL e a Anon Key e clicar em **"Popular Banco Supabase (Seed 1-Click)"**!

### Passo 2 — Hospedagem Gratuita na Vercel (Free Tier)
**Opção A (Pelo Terminal — Mais Rápido):**
```powershell
npx vercel
```
Siga as instruções na tela (login gratuito na Vercel e confirme com `Enter`). Em segundos você receberá um link público `https://vigia-grotas-unima-afya.vercel.app` para abrir no celular dos jurados ou no telão do Hackathon!

**Opção B (Via GitHub):**
1. Suba esta pasta para um repositório no seu GitHub.
2. Acesse [vercel.com/new](https://vercel.com/new), importe o repositório e clique em **Deploy** (o arquivo [`vercel.json`](file:///e:/Programming/hacka-periferias/vercel.json) já está configurado).

---

## Arquitetura Resiliente para Apresentação (Cloud + Fallback Local)
- **Zero risco de falhar no palco:** Caso a internet do evento oscile ou ainda não tenha configurado as chaves do Supabase, o sistema opera automaticamente em **Modo Híbrido** (`localStorage` + dados iniciais da Grota do Rafael e Grota do Arroz).
- Assim que conectado ao **Supabase**, cada novo morador cadastrado, atendimento clínico do acadêmico de medicina ou nova faculdade integrada é gravado em tempo real no PostgreSQL na nuvem.
