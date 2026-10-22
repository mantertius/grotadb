# Lean Canvas — GrotaDB (Hackathon Acelera Periferia)

**Produto:** GrotaDB — Prontuário Docente-Assistencial & Inteligência Epidemiológica Periférica  
**Unidade Piloto (Early Adopter):** UNIMA | Afya (Maceió - AL) • Territórios: Grota do Rafael e Grota do Arroz

---

## 1. Problema (Problem)
1. **Invisibilidade de dados nas periferias/grotas:** Atendimentos realizados por acadêmicos de medicina em Unidades Docentes Assistenciais (UDAs) e mutirões comunitários perdem-se em fichas de papel ou sistemas fragmentados, sem cruzar patologias (CID-10) com Determinantes Sociais da Saúde (esgoto, falta de água, escadarias).
2. **Políticas públicas às cegas:** Secretarias de Saúde e concessionárias demoram meses para identificar surtos (ex: Dengue, parasitoses) ou barreiras de adesão medicamentosa (ex: hipertensos idosos em encostas).
3. **Escassez de Real-World Evidence (RWE) diverso:** Indústrias farmacêuticas, CROs e redes de varejo farma não possuem dados reais anonimizados sobre o perfil epidemiológico e a demanda reprimida de medicamentos em populações periféricas brasileiras.

**Alternativas Existentes:**
- Fichas em papel nas ações de extensão universitária;
- Planilhas soltas no Excel/Google Forms preenchidas por alunos;
- e-SUS APS (focado na burocracia de faturamento do SUS, pouco ágil para o ensino médico em UDA e sem motor de inteligência B2B).

---

## 2. Segmentos de Clientes (Customer Segments)
- **Usuários Principais (Operadores diários):** Acadêmicos de Medicina (acesso via Matrícula/RA) e Preceptores Médicos das UDAs.
- **Clientes Pagantes B2B (SaaS Educacional):** Faculdades de Medicina privadas (Redes como **Afya**, Inspirali, Yduqs) que precisam gerir e comprovar o impacto de suas UDAs junto ao MEC.
- **Clientes Pagantes B2B (Data-as-a-Service):** Indústria Farmacêutica, CROs (pesquisa clínica), Redes de Farmácias Populares, Operadoras e Concessionárias de Saneamento (ESG).
- **Clientes B2G / Parceiros de Impacto:** Secretarias Municipais/Estaduais de Saúde.

**Early Adopters (Adoção Imediata):**
- **UNIMA | Afya (Maceió - AL)** — Internato de Saúde Coletiva/MFC atuando diretamente na **Grota do Rafael** e **Grota do Arroz**.

---

## 3. Proposta Única de Valor (Unique Value Proposition - UVP)
> **"Transformamos o atendimento acadêmico nas UDAs em inteligência epidemiológica em tempo real para salvar vidas nas periferias e gerar dados anonimizados de alto valor para o ecossistema de saúde."**

- **Conceito de Alto Nível (High-Level Pitch):** O *"iClinic + IQVIA"* das periferias brasileiras, impulsionado pela força de trabalho dos acadêmicos de medicina.

---

## 4. Solução (Solution)
1. **Prontuário UDA Ultrarrápido (Regra dos 90s):** Acesso por matrícula do acadêmico, templates clínicos de 1 clique para as principais patologias das grotas (HAS, Diabetes, Arboviroses, Parasitoses, Saúde Mental) e registro de Determinantes Sociais (saneamento, água, mobilidade).
2. **Observatório de Políticas Públicas:** Dashboard georreferenciado por microárea/escadaria e emissor automático de Notas Técnicas para gestores públicos.
3. **Motor Nativo de Anonimização (LGPD Art. 12) + Marketplace B2B:** Pipeline que remove 100% dos dados pessoais (`SHA-256` + $k$-anonimato) e empacota coortes de *Real-World Evidence (RWE)* para venda empresarial com **Cashback Social** para a comunidade.

---

## 5. Canais (Channels)
- **Expansão Intra-Grupo (Land & Expand):** Entrada via **UNIMA | Afya (Maceió)** e expansão direta para as **+30 faculdades de medicina do grupo Afya** no Brasil (e demais +350 escolas médicas do país).
- **Ligas Acadêmicas, Centros Acadêmicos (CAs) e Coordenações de Internato:** Adoção orgânica pelos próprios alunos e preceptores pela praticidade no atendimento.
- **Vendas Diretas B2B / Parcerias ESG:** Licenciamento de relatórios e datasets para farmacêuticas, concessionárias de saneamento (ex: BRK) e secretarias municipais.

---

## 6. Fontes de Receita (Revenue Streams)
1. **Assinatura SaaS B2B para Faculdades de Medicina:** Mensalidade por campus/UDA (R$ 8.900 a R$ 12.500/mês por instituição) para gestão clínica-acadêmica e relatórios de extensão MEC.
2. **Licenciamento de Dados Anonimizados (Data-as-a-Service B2B):** Assinatura ou venda de pacotes de dados RWE anonimizados (R$ 9.800 a R$ 18.000/mês por coorte) para farmacêuticas, varejo farma e fundos ESG.
3. **Contratos B2G / Editais de Inovação Pública:** Licenciamento do painel de vigilância epidemiológica para prefeituras e consórcios de saúde.
- *Diferencial de Impacto:* **15% a 25% da receita B2B vai para o Fundo de Cashback Social** (compra de tiras de glicemia, aparelhos de PA e insumos para os moradores das Grotas).

---

## 7. Estrutura de Custos (Cost Structure)
- **Infraestrutura Cloud enxuta e escalável:** Banco de dados PostgreSQL + Autenticação (Supabase) e hospedagem Edge (Vercel) — custo próximo de zero no MVP e altamente escalável.
- **Compliance Jurídico e Segurança de Dados (DPO / LGPD):** Auditoria contínua dos algoritmos de anonimização e termos de governança ética.
- **Desenvolvimento, Suporte às UDAs e Comercial B2B:** Equipe enxuta de produto e relacionamento com coordenações de medicina e indústria.

---

## 8. Métricas-Chave (Key Metrics)
- **Nº de Acadêmicos Ativos por Matrícula (MAU)** e taxa de retenção nos turnos de UDA;
- **Tempo Médio de Registro de Atendimento** (Meta: `< 90 segundos` com templates de 1 clique);
- **Volume de Prontuários e Jornadas Longitudinais Capturadas** por comunidade (Grota do Rafael, Grota do Arroz e novas comunidades);
- **MRR (Receita Recorrente Mensal)** somando SaaS Faculdades + Licenças de Datasets B2B;
- **Valor de Cashback Social Revertido** em insumos/exames para as comunidades periféricas.

---

## 9. Vantagem Injusta (Unfair Advantage)
- **Capilaridade e Força de Trabalho Acadêmica Recorrente:** Enquanto healthtechs comuns gastam milhões para coletar dados em campo, as faculdades de medicina possuem **centenas de acadêmicos obrigatoriamente inseridos nas comunidades todos os semestres** (Internato e Extensão Curricularizada pelo MEC).
- **Base Exclusiva de Populações Sub-representadas:** Dados longitudinais reais que cruzam clínica + saneamento + adesão medicamentosa em grotas e periferias — uma base que nenhum hospital privado ou laboratório possui.
- **Alinhamento Direto com o Ecossistema Afya:** Começar dentro da **UNIMA | Afya** abre a porta para escalar imediatamente na maior rede de educação médica e software médico do Brasil.
