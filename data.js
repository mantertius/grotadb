// Dados iniciais realistas para o Hackathon Acelera Periferia
// Foco: UDA UNIMA Afya (Maceió - AL) | Territórios: Grota do Rafael e Grota do Arroz

window.INITIAL_DATA = {
  institution: {
    id: "unima-afya-mcz",
    name: "UNIMA | Afya - Centro Universitário de Maceió",
    udaName: "UDA UNIMA Afya (Unidade Docente Assistencial)",
    city: "Maceió - AL",
    activeAcademic: {
      name: "Acad. Gabriel Cavalcante",
      matricula: "202310845",
      period: "9º Período (Internato em Saúde Coletiva / MFC)",
      preceptor: "Dra. Helena Vasconcelos (CRM-AL 6842)"
    }
  },

  scalableInstitutions: [
    {
      id: "unima-afya-mcz",
      name: "UNIMA | Afya (Maceió - AL)",
      status: "Ativo • Piloto Oficial",
      communities: ["Grota do Rafael", "Grota do Arroz"],
      studentsActive: 312,
      recordsCaptured: 4820,
      mrrSaas: "R$ 8.900/mês"
    },
    {
      id: "unipac-afya-mg",
      name: "UNIPTAN / Afya (Minas Gerais)",
      status: "Em Onboarding (Fase 2)",
      communities: ["Comunidade São José", "Alto das Mercês"],
      studentsActive: 240,
      recordsCaptured: 1950,
      mrrSaas: "R$ 8.900/mês"
    },
    {
      id: "unigranrio-afya-rj",
      name: "UNIGRANRIO | Afya (Duque de Caxias - RJ)",
      status: "Pipeline Expansão",
      communities: ["Jardim Gramacho", "Vila Ideal"],
      studentsActive: 480,
      recordsCaptured: 0,
      mrrSaas: "R$ 12.500/mês"
    },
    {
      id: "ufal-uncisal-al",
      name: "UFAL / UNCISAL (Rede Pública Parceira)",
      status: "Convênio Público",
      communities: ["Grota do Pau d'Arco", "Vergel do Lago"],
      studentsActive: 195,
      recordsCaptured: 2140,
      mrrSaas: "Subsidiado (Licença Social)"
    }
  ],

  pathologyCatalog: [
    { cid: "I10", name: "Hipertensão Arterial Sistêmica (HAS)", category: "Crônicas Não Transmissíveis", color: "#ef4444" },
    { cid: "E11", name: "Diabetes Mellitus Tipo 2 (DM2)", category: "Crônicas Não Transmissíveis", color: "#f97316" },
    { cid: "A90", name: "Dengue / Arboviroses Urbanas", category: "Infectocontagiosas e Vetoriais", color: "#eab308" },
    { cid: "A09", name: "Gastroenterite / Doença Diarreica Aguda", category: "Associadas ao Saneamento", color: "#06b6d4" },
    { cid: "B82", name: "Parasitose Intestinal / Geo-helmintíase", category: "Associadas ao Saneamento", color: "#14b8a6" },
    { cid: "J45", name: "Asma / Bronquite Crônica (Mofo/Umidade)", category: "Respiratórias", color: "#3b82f6" },
    { cid: "F41", name: "Transtorno de Ansiedade / Sofrimento Mental", category: "Saúde Mental", color: "#8b5cf6" },
    { cid: "B35", name: "Dermatofitose / Escabiose / Dermatoses", category: "Dermatológicas", color: "#ec4899" },
    { cid: "Z34", name: "Gestação de Risco Habitual / Alto Risco", category: "Saúde Materno-Infantil", color: "#10b981" },
    { cid: "E66", name: "Obesidade / Síndrome Metabólica", category: "Nutricionais e Metabólicas", color: "#f59e0b" }
  ],

  patients: [
    {
      id: "PAC-001",
      name: "Maria José Ferreira da Silva",
      age: 58,
      sex: "F",
      cns: "704.8012.9941.3210",
      community: "Grota do Rafael",
      microarea: "Microárea 02 - Escadaria São Sebastião (Encosta)",
      sanitation: "Esgoto a céu aberto próximo",
      waterAccess: "Intermitente (Caixa d'água sem filtro)",
      housingRisk: "Alto (Umidade severa + difícil acesso por escadaria)",
      incomeBracket: "Até 1 salário mínimo (Bolsa Família)",
      medicationsInUse: ["Losartana 50mg 12/12h", "Metformina 850mg 2x/dia", "Hidroclorotiazida 25mg"],
      medicationAdherence: "Irregular (falta na farmácia básica)",
      chronicConditions: ["I10", "E11", "E66"],
      lastVisit: "2026-10-19",
      riskLevel: "Alto",
      consultations: [
        {
          id: "ATD-901",
          date: "2026-10-19",
          studentName: "Acad. Gabriel Cavalcante",
          studentMatricula: "202310845",
          bp: "162/98",
          glycemia: 214,
          heartRate: 84,
          temp: 36.6,
          weight: 82.5,
          height: 1.56,
          cids: ["I10", "E11"],
          chiefComplaint: "Cefaleia occipital há 3 dias e tontura ao subir a escadaria da Grota do Rafael.",
          conduct: "Ajuste posológico supervisionado pelo preceptor, orientação sobre restrição sódica acessível, solicitação de HbA1c e creatinina na UDA UNIMA Afya."
        }
      ]
    },
    {
      id: "PAC-002",
      name: "José Cícero dos Santos",
      age: 34,
      sex: "M",
      cns: "898.0014.5521.1109",
      community: "Grota do Arroz",
      microarea: "Microárea 01 - Vale do Reginaldo / Baixada",
      sanitation: "Vala aberta / Alagamento em dias de chuva",
      waterAccess: "Água encanada irregular",
      housingRisk: "Crítico (Área de alagamento + focos de vetor)",
      incomeBracket: "Trabalhador informal (Entregador)",
      medicationsInUse: ["Dipirona 1g SOS", "Sais de Reidratação Oral"],
      medicationAdherence: "Regular",
      chronicConditions: ["A90", "A09"],
      lastVisit: "2026-10-20",
      riskLevel: "Moderado",
      consultations: [
        {
          id: "ATD-902",
          date: "2026-10-20",
          studentName: "Acad. Letícia Mendonça",
          studentMatricula: "202410112",
          bp: "110/70",
          glycemia: 92,
          heartRate: 98,
          temp: 38.4,
          weight: 71.0,
          height: 1.73,
          cids: ["A90"],
          chiefComplaint: "Febre alta (38.4°C) há 48h, mialgia intensa, dor retro-orbitária. Relata acúmulo de água parada na viela da Grota do Arroz.",
          conduct: "Notificação SINAN realizada na UDA, hidratação vigorosa calculada por peso, prova do laço negativa, retorno em 48h para hemograma de controle."
        }
      ]
    },
    {
      id: "PAC-003",
      name: "Ana Beatriz Oliveira Rocha",
      age: 22,
      sex: "F",
      cns: "702.4419.8320.9942",
      community: "Grota do Arroz",
      microarea: "Microárea 03 - Travessa Boa Esperança",
      sanitation: "Fossa rudimentar",
      waterAccess: "Água encanada regular",
      housingRisk: "Moderado (Casa com pouca ventilação)",
      incomeBracket: "Até 1 salário mínimo",
      medicationsInUse: ["Sulfato Ferroso 40mg", "Ácido Fólico 5mg"],
      medicationAdherence: "Regular",
      chronicConditions: ["Z34", "F41"],
      lastVisit: "2026-10-18",
      riskLevel: "Moderado",
      consultations: [
        {
          id: "ATD-903",
          date: "2026-10-18",
          studentName: "Acad. Gabriel Cavalcante",
          studentMatricula: "202310845",
          bp: "128/82",
          glycemia: 88,
          heartRate: 88,
          temp: 36.5,
          weight: 64.0,
          height: 1.61,
          cids: ["Z34", "F41"],
          chiefComplaint: "Consulta pré-natal (24 semanas). Queixa de insônia e ansiedade por insegurança financeira.",
          conduct: "BCF 144 bpm, altura uterina compatível. Encaminhada para roda de gestantes interprofissional (Medicina + Psicologia UNIMA Afya)."
        }
      ]
    },
    {
      id: "PAC-004",
      name: "Davi Lucas Pereira",
      age: 7,
      sex: "M",
      cns: "709.3120.7741.0028",
      community: "Grota do Rafael",
      microarea: "Microárea 01 - Beco da Mata",
      sanitation: "Esgoto a céu aberto próximo",
      waterAccess: "Intermitente (Caixa d'água sem filtro)",
      housingRisk: "Alto (Paredes com infiltração e mofo)",
      incomeBracket: "Até 1 salário mínimo (Bolsa Família)",
      medicationsInUse: ["Salbutamol Spray 100mcg", "Albendazol 400mg (dose única)"],
      medicationAdherence: "Regular",
      chronicConditions: ["J45", "B82", "B35"],
      lastVisit: "2026-10-21",
      riskLevel: "Moderado",
      consultations: [
        {
          id: "ATD-904",
          date: "2026-10-21",
          studentName: "Acad. Pedro Henrique Alencar",
          studentMatricula: "202320519",
          bp: "96/62",
          glycemia: 84,
          heartRate: 102,
          temp: 36.8,
          weight: 23.5,
          height: 1.21,
          cids: ["J45", "B82"],
          chiefComplaint: "Tosse seca noturna recorrente, sibilância leve e dor abdominal periumbilical.",
          conduct: "Nebulização na UDA, prescrição de antiparasitário e orientação ambiental para manejo de mofo domiciliar."
        }
      ]
    },
    {
      id: "PAC-005",
      name: "Severino Ramos de Lima",
      age: 67,
      sex: "M",
      cns: "701.5592.3310.4481",
      community: "Grota do Rafael",
      microarea: "Microárea 02 - Escadaria São Sebastião (Encosta)",
      sanitation: "Fossa rudimentar",
      waterAccess: "Água encanada regular",
      housingRisk: "Alto (Mobilidade reduzida em área de escadaria)",
      incomeBracket: "Aposentado / BPC (1 salário mínimo)",
      medicationsInUse: ["Enalapril 20mg 12/12h", "Anlodipino 5mg", "AAS 100mg", "Sinvastatina 40mg"],
      medicationAdherence: "Irregular (dificuldade de locomoção até a unidade)",
      chronicConditions: ["I10", "E11"],
      lastVisit: "2026-10-17",
      riskLevel: "Alto",
      consultations: [
        {
          id: "ATD-905",
          date: "2026-10-17",
          studentName: "Acad. Gabriel Cavalcante",
          studentMatricula: "202310845",
          bp: "154/94",
          glycemia: 178,
          heartRate: 76,
          temp: 36.4,
          weight: 74.0,
          height: 1.66,
          cids: ["I10", "E11"],
          chiefComplaint: "Visita domiciliar / Atendimento de rotina. Dificuldade para buscar medicamentos devido aos 140 degraus da escadaria.",
          conduct: "Incluído no programa de Busca Ativa e Entrega Domiciliar pelos acadêmicos extensionistas da UNIMA Afya."
        }
      ]
    },
    {
      id: "PAC-006",
      name: "Edna Maria Conceição",
      age: 45,
      sex: "F",
      cns: "706.1128.4902.7715",
      community: "Grota do Arroz",
      microarea: "Microárea 01 - Vale do Reginaldo / Baixada",
      sanitation: "Esgoto a céu aberto próximo",
      waterAccess: "Intermitente (Caixa d'água sem filtro)",
      housingRisk: "Alto (Umidade severa + alagamento)",
      incomeBracket: "Até 1 salário mínimo (Diarista)",
      medicationsInUse: ["Fluoxetina 20mg", "Losartana 50mg", "Omeprazol 20mg"],
      medicationAdherence: "Irregular (interrompe por custo quando falta no posto)",
      chronicConditions: ["I10", "F41", "B35"],
      lastVisit: "2026-10-21",
      riskLevel: "Moderado",
      consultations: [
        {
          id: "ATD-906",
          date: "2026-10-21",
          studentName: "Acad. Letícia Mendonça",
          studentMatricula: "202410112",
          bp: "146/90",
          glycemia: 104,
          heartRate: 82,
          temp: 36.5,
          weight: 76.2,
          height: 1.59,
          cids: ["I10", "F41", "B35"],
          chiefComplaint: "Lesões pruriginosas em membros inferiores após chuva forte na Grota do Arroz e piora da pressão arterial.",
          conduct: "Tratamento tópico dermatológico, renovação de receita de anti-hipertensivo e acolhimento em saúde mental."
        }
      ]
    },
    {
      id: "PAC-007",
      name: "kauã Victor da Silva",
      age: 11,
      sex: "M",
      cns: "708.9023.1184.6620",
      community: "Grota do Arroz",
      microarea: "Microárea 02 - Ladeira do Sol",
      sanitation: "Vala aberta / Alagamento em dias de chuva",
      waterAccess: "Intermitente (Caixa d'água sem filtro)",
      housingRisk: "Alto (Infiltração e esgoto próximo)",
      incomeBracket: "Até 1 salário mínimo (Bolsa Família)",
      medicationsInUse: ["Nitazoxanida 500mg", "Sais de Reidratação Oral"],
      medicationAdherence: "Regular",
      chronicConditions: ["A09", "B82"],
      lastVisit: "2026-10-16",
      riskLevel: "Moderado",
      consultations: [
        {
          id: "ATD-907",
          date: "2026-10-16",
          studentName: "Acad. Pedro Henrique Alencar",
          studentMatricula: "202320519",
          bp: "102/65",
          glycemia: 89,
          heartRate: 90,
          temp: 37.3,
          weight: 34.0,
          height: 1.42,
          cids: ["A09", "B82"],
          chiefComplaint: "Episódios recorrentes de diarreia e perda de peso leve no último trimestre.",
          conduct: "Prescrição antiparasitária, solicitação de EPF (Exame Parasitológico de Fezes) e orientação de hipoclorito de sódio."
        }
      ]
    },
    {
      id: "PAC-008",
      name: "Francisca das Chagas Moura",
      age: 62,
      sex: "F",
      cns: "705.3318.9042.5123",
      community: "Grota do Rafael",
      microarea: "Microárea 03 - Mirante / Platô Superior",
      sanitation: "Fossa rudimentar",
      waterAccess: "Água encanada regular",
      housingRisk: "Moderado",
      incomeBracket: "Até 1 salário mínimo",
      medicationsInUse: ["Gliclazida 60mg", "Metformina 850mg", "Losartana 50mg", "Budesonida Inalatória"],
      medicationAdherence: "Regular",
      chronicConditions: ["I10", "E11", "J45", "E66"],
      lastVisit: "2026-10-20",
      riskLevel: "Alto",
      consultations: [
        {
          id: "ATD-908",
          date: "2026-10-20",
          studentName: "Acad. Gabriel Cavalcante",
          studentMatricula: "202310845",
          bp: "148/92",
          glycemia: 186,
          heartRate: 79,
          temp: 36.5,
          weight: 84.0,
          height: 1.54,
          cids: ["I10", "E11", "E66"],
          chiefComplaint: "Retorno para avaliação de exames laboratoriais e exame do pé diabético na UDA UNIMA.",
          conduct: "Sensibilidade protetora plantar preservada (monofilamento Semmes-Weinstein OK). Ajuste de dieta com nutricionista da UDA."
        }
      ]
    }
  ],

  b2bPackages: [
    {
      id: "DS-RWE-01",
      title: "Coorte Real-World Evidence (RWE): Adesão Terapêutica em HAS e DM2 em Periferias Urbanas",
      targetBuyer: "Indústria Farmacêutica & CROs (Pesquisa Clínica)",
      recordsCount: "3.420 jornadas longitudinais anonimizadas",
      kAnonymity: "k ≥ 15 (LGPD Art. 12 Compliant)",
      variables: ["Curva pressórica e glicêmica", "Taxa de abandono medicamentoso por falta no SUS", "Comorbidades associadas", "Faixa etária quinquenal"],
      priceMonthly: "R$ 14.500 / mês",
      socialCashback: "20% revertido em tiras de glicemia e esfigmomanômetros para as UDAs",
      badge: "Alta Demanda Farma"
    },
    {
      id: "DS-ESG-02",
      title: "Índice Preditivo de Arboviroses, Saneamento e Doenças de Veiculação Hídrica",
      targetBuyer: "Concessionárias de Saneamento (BRK), Seguradoras e Fundos ESG",
      recordsCount: "4.820 registros georreferenciados por setor censitário (sem PII)",
      kAnonymity: "k ≥ 25 (Agregação por Microárea)",
      variables: ["Incidência semanal de Dengue/DDA/Parasitoses", "Correlação com intermitência hídrica e esgoto a céu aberto", "Custo evitado em internações (AIH/SUS)"],
      priceMonthly: "R$ 18.000 / mês",
      socialCashback: "25% revertido em mutirões de saúde e filtros comunitários nas Grotas",
      badge: "Impacto ESG & GovTech"
    },
    {
      id: "DS-RET-03",
      title: "Mapa de Desertos Farmacêuticos e Demanda Reprimida de Medicamentos Contínuos",
      targetBuyer: "Redes de Farmácias Populares, Distribuidoras e Healthtechs",
      recordsCount: "6.190 prescrições anonimizadas nos últimos 6 meses",
      kAnonymity: "k ≥ 20 (Cluster Territorial)",
      variables: ["Classes terapêuticas mais prescritas nas UDAs", "Medicamentos em ruptura nas UBS/UDAs locais", "Ticket médio acessível por microterritório"],
      priceMonthly: "R$ 9.800 / mês",
      socialCashback: "15% revertido em vouchers de medicamentos gratuitos para moradores de alta vulnerabilidade",
      badge: "Varejo Farma & Acesso"
    }
  ]
};
