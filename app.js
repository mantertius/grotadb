// VigIA — Workspace Clínico & Inteligência Territorial (UNIMA Afya)

(function () {
  const STORAGE_KEY = "vigia_grotas_unima_state_v1";

  let state = loadState();
  let selectedPatientId = state.patients[0]?.id || null;
  let currentTerritoryFilter = "Todas";
  let currentPathologyFilter = "ALL";
  let searchQuery = "";
  let selectedFormCids = new Set(["I10"]);

  let chartPathologiesInstance = null;
  let chartSanitationInstance = null;

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.patients) && parsed.patients.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn(e);
    }
    return JSON.parse(JSON.stringify(window.INITIAL_DATA));
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn(e);
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast-notification");
    const msgEl = document.getElementById("toast-message");
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 3200);
  }

  function getCidMeta(cidCode) {
    return (
      state.pathologyCatalog.find((p) => p.cid === cidCode) || {
        cid: cidCode,
        name: cidCode,
        category: "Clínica",
        color: "#0f172a"
      }
    );
  }

  function getInitials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }

  function pseudoSha256(inputStr) {
    let h1 = 0xdeadbeef ^ inputStr.length;
    let h2 = 0x41c6ce57 ^ inputStr.length;
    for (let i = 0, ch; i < inputStr.length; i++) {
      ch = inputStr.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    const hex1 = (h1 >>> 0).toString(16).padStart(8, "0");
    const hex2 = (h2 >>> 0).toString(16).padStart(8, "0");
    return `sha256:${hex1}${hex2}`;
  }

  function getAgeBracket(age) {
    if (age < 12) return "00–11 anos";
    if (age < 18) return "12–17 anos";
    if (age < 30) return "18–29 anos";
    if (age < 45) return "30–44 anos";
    if (age < 60) return "45–59 anos";
    return "60+ anos";
  }

  function getFilteredPatients() {
    return state.patients.filter((p) => {
      const matchesTerritory =
        currentTerritoryFilter === "Todas" || p.community === currentTerritoryFilter;
      const matchesPathology =
        currentPathologyFilter === "ALL" || p.chronicConditions.includes(currentPathologyFilter);
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.cns.toLowerCase().includes(q) ||
        p.community.toLowerCase().includes(q) ||
        p.chronicConditions.some((cid) => {
          const meta = getCidMeta(cid);
          return cid.toLowerCase().includes(q) || meta.name.toLowerCase().includes(q);
        });

      return matchesTerritory && matchesPathology && matchesQuery;
    });
  }

  // Atualiza contadores e KPIs epidemiológicos
  function renderMetrics() {
    const territoryPatients = state.patients.filter(
      (p) => currentTerritoryFilter === "Todas" || p.community === currentTerritoryFilter
    );
    const total = territoryPatients.length;
    const badgeCount = document.getElementById("badge-patients-count");
    if (badgeCount) badgeCount.textContent = total;

    const epiTotal = document.getElementById("epi-kpi-total");
    if (epiTotal) epiTotal.textContent = total;

    const chronicCount = territoryPatients.filter(
      (p) => p.chronicConditions.includes("I10") || p.chronicConditions.includes("E11")
    ).length;
    const epiChronic = document.getElementById("epi-kpi-chronic");
    if (epiChronic) {
      epiChronic.textContent = total ? `${Math.round((chronicCount / total) * 100)}%` : "0%";
    }

    const critSan = territoryPatients.filter(
      (p) =>
        p.sanitation.toLowerCase().includes("esgoto") ||
        p.sanitation.toLowerCase().includes("vala")
    ).length;
    const epiSan = document.getElementById("epi-kpi-sanitation");
    if (epiSan) {
      epiSan.textContent = total ? `${Math.round((critSan / total) * 100)}%` : "0%";
    }
  }

  // Renderiza a fila lateral de pacientes (Minimalista)
  function renderPatientList() {
    const container = document.getElementById("patient-list-container");
    const counter = document.getElementById("patient-list-counter");
    const filtered = getFilteredPatients();

    if (counter) counter.textContent = `${filtered.length} pacientes`;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          Nenhum paciente encontrado.
        </div>
      `;
      return;
    }

    if (!filtered.some((p) => p.id === selectedPatientId)) {
      selectedPatientId = filtered[0].id;
    }

    container.innerHTML = filtered
      .map((p) => {
        const isSelected = p.id === selectedPatientId;
        const shortComm = p.community === "Grota do Rafael" ? "G. Rafael" : "G. Arroz";
        const riskDot =
          p.riskLevel === "Alto"
            ? `<span class="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Risco Alto"></span>`
            : `<span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Estável"></span>`;

        const cids = p.chronicConditions
          .slice(0, 3)
          .map(
            (cid) =>
              `<span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono-code text-[10px] font-medium">${cid}</span>`
          )
          .join("");

        return `
          <button
            type="button"
            data-patient-id="${p.id}"
            class="patient-item w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-50 ${
              isSelected ? "active" : ""
            }"
          >
            <div class="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
              ${getInitials(p.name)}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <p class="text-xs font-semibold text-slate-900 truncate">${p.name}</p>
                ${riskDot}
              </div>
              <div class="flex items-center justify-between gap-2 mt-1">
                <span class="text-[11px] text-slate-400">${p.age}a • ${shortComm}</span>
                <div class="flex items-center gap-1">${cids}</div>
              </div>
            </div>
          </button>
        `;
      })
      .join("");

    container.querySelectorAll(".patient-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedPatientId = btn.getAttribute("data-patient-id");
        renderPatientList();
        renderSelectedPatientCard();
        renderAnonymizationPreview();
      });
    });
  }

  // Renderiza o Prontuário Limpo (Regra dos 90 Segundos)
  function renderSelectedPatientCard() {
    const container = document.getElementById("selected-patient-card");
    const patient = state.patients.find((p) => p.id === selectedPatientId);

    if (!patient) {
      container.innerHTML = `<div class="p-8 text-xs text-slate-400">Selecione um paciente na fila lateral.</div>`;
      return;
    }

    selectedFormCids = new Set(patient.chronicConditions.slice(0, 2));
    renderCidSelectorChips();

    const latest = patient.consultations[0] || {
      bp: "120/80",
      glycemia: 95,
      weight: 70,
      height: 1.65,
      temp: 36.5,
      heartRate: 78
    };
    const bmi =
      latest.weight && latest.height
        ? (latest.weight / (latest.height * latest.height)).toFixed(1)
        : "25.7";

    const sys = parseInt((latest.bp || "120/80").split("/")[0], 10) || 120;
    const isHighBp = sys >= 140;
    const isHighGly = (latest.glycemia || 90) >= 180;

    const cidTags = patient.chronicConditions
      .map((cid) => {
        const meta = getCidMeta(cid);
        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium">
            <span class="font-mono-code font-bold text-slate-900">${cid}</span>
            <span class="text-slate-600">${meta.name.split("(")[0].trim()}</span>
          </span>
        `;
      })
      .join("");

    const medsTags = (patient.medicationsInUse || [])
      .map(
        (m) =>
          `<span class="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium">${m}</span>`
      )
      .join("");

    const timelineHtml = (patient.consultations || [])
      .map(
        (c) => `
        <div class="relative pl-5 pb-5 last:pb-0 border-l border-slate-200">
          <span class="w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-white absolute -left-[5px] top-1"></span>
          <div class="bg-white rounded-xl border border-slate-200/90 p-4 space-y-2">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-mono-code text-xs font-semibold text-slate-900">${c.date}</span>
                <span class="text-xs text-slate-400">•</span>
                <span class="text-xs font-medium text-slate-700">${c.studentName}</span>
                <span class="font-mono-code text-[11px] text-slate-400">(${c.studentMatricula})</span>
              </div>
              <div class="flex items-center gap-1.5 font-mono-code text-[11px] text-slate-500">
                <span class="px-2 py-0.5 rounded bg-slate-100">PA ${c.bp}</span>
                <span class="px-2 py-0.5 rounded bg-slate-100">Glic ${c.glycemia}</span>
                <span class="px-2 py-0.5 rounded bg-slate-100">${c.temp}°C</span>
              </div>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed"><strong class="text-slate-900">Avaliação:</strong> ${c.chiefComplaint}</p>
            <p class="text-xs text-slate-600 leading-relaxed"><strong class="text-slate-900">Conduta:</strong> ${c.conduct}</p>
          </div>
        </div>
      `
      )
      .join("");

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Cabeçalho do Paciente -->
        <div class="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
              ${getInitials(patient.name)}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-bold text-slate-900">${patient.name}</h2>
                <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  patient.riskLevel === "Alto"
                    ? "bg-rose-50 text-rose-600 border border-rose-200"
                    : "bg-slate-100 text-slate-600"
                }">
                  Risco ${patient.riskLevel}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">
                ${patient.age} anos • Sexo ${patient.sex} • CNS <span class="font-mono-code text-slate-700">${patient.cns}</span> • <strong>${patient.community}</strong> (${patient.microarea.split("-")[0].trim()})
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-open-consultation-drawer"
            class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition"
          >
            <i data-lucide="Stethoscope" class="w-3.5 h-3.5"></i>
            Iniciar Atendimento
          </button>
        </div>

        <!-- 4 Cards de Sinais Vitais & Contexto -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-white p-4 rounded-2xl border ${
            isHighBp ? "border-rose-200 bg-rose-50/20" : "border-slate-200/90"
          }">
            <span class="text-[11px] font-medium text-slate-400">Pressão Arterial</span>
            <p class="text-lg font-bold font-mono-code ${
              isHighBp ? "text-rose-600" : "text-slate-900"
            } mt-0.5">${latest.bp} <span class="text-xs font-normal text-slate-400">mmHg</span></p>
          </div>

          <div class="bg-white p-4 rounded-2xl border ${
            isHighGly ? "border-amber-200 bg-amber-50/20" : "border-slate-200/90"
          }">
            <span class="text-[11px] font-medium text-slate-400">Glicemia Capilar</span>
            <p class="text-lg font-bold font-mono-code ${
              isHighGly ? "text-amber-600" : "text-slate-900"
            } mt-0.5">${latest.glycemia} <span class="text-xs font-normal text-slate-400">mg/dL</span></p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-slate-200/90">
            <span class="text-[11px] font-medium text-slate-400">Peso / IMC</span>
            <p class="text-lg font-bold font-mono-code text-slate-900 mt-0.5">${latest.weight}kg <span class="text-xs font-normal text-slate-400">(${bmi})</span></p>
          </div>

          <div class="bg-white p-4 rounded-2xl border border-slate-200/90">
            <span class="text-[11px] font-medium text-slate-400">Saneamento</span>
            <p class="text-xs font-semibold text-slate-800 mt-1.5 truncate" title="${patient.sanitation}">${patient.sanitation}</p>
          </div>
        </div>

        <!-- Condições Crônicas + Prescrição Ativa -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-2.5">
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Patologias Ativas (CID-10)</span>
            <div class="flex flex-wrap gap-1.5">${cidTags}</div>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200/90 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Medicação Contínua</span>
              <span class="text-[11px] text-slate-400">Adesão: <strong class="text-slate-700">${patient.medicationAdherence.split("(")[0]}</strong></span>
            </div>
            <div class="flex flex-wrap gap-1.5">${medsTags}</div>
          </div>
        </div>

        <!-- Linha do Tempo de Evoluções -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Histórico de Evoluções (${patient.consultations.length})</h3>
            <span class="text-[11px] text-slate-400">UDA UNIMA Afya</span>
          </div>
          <div>
            ${timelineHtml}
          </div>
        </div>

      </div>
    `;

    const btnOpenDrawer = document.getElementById("btn-open-consultation-drawer");
    if (btnOpenDrawer) {
      btnOpenDrawer.addEventListener("click", () => openConsultationDrawer(patient));
    }
    if (typeof lucide !== "undefined") lucide.createIcons();
  }

  function openConsultationDrawer(patient) {
    const drawer = document.getElementById("drawer-consultation");
    const subtitle = document.getElementById("drawer-patient-subtitle");
    if (subtitle && patient) {
      subtitle.textContent = `${patient.name} • ${patient.community}`;
    }
    drawer.classList.remove("hidden");
  }

  function closeConsultationDrawer() {
    document.getElementById("drawer-consultation").classList.add("hidden");
  }

  function renderCidSelectorChips() {
    const grid = document.getElementById("cid-selector-grid");
    if (!grid) return;

    grid.innerHTML = state.pathologyCatalog
      .map((item) => {
        const isSelected = selectedFormCids.has(item.cid);
        const shortName = item.name.split("(")[0].split("/")[0].trim();
        return `
          <button
            type="button"
            data-cid="${item.cid}"
            class="cid-chip text-left px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between ${
              isSelected
                ? "selected border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }"
          >
            <span class="truncate"><strong class="font-mono-code">${item.cid}</strong> ${shortName}</span>
            <span class="text-[10px] opacity-70">${isSelected ? "✓" : "+"}</span>
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll(".cid-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const cid = btn.getAttribute("data-cid");
        if (selectedFormCids.has(cid)) {
          if (selectedFormCids.size > 1) selectedFormCids.delete(cid);
        } else {
          selectedFormCids.add(cid);
        }
        renderCidSelectorChips();
      });
    });
  }

  function evaluateVitalSignsAlert() {
    const bpVal = document.getElementById("att-bp")?.value || "";
    const glycemia = parseFloat(document.getElementById("att-glycemia")?.value || "0");
    const temp = parseFloat(document.getElementById("att-temp")?.value || "36.5");
    const badge = document.getElementById("vital-clinical-alert");
    if (!badge) return;

    const parts = bpVal.split("/");
    const sys = parseInt(parts[0], 10) || 120;
    const dia = parseInt(parts[1], 10) || 80;

    const alerts = [];
    if (sys >= 140 || dia >= 90) alerts.push(`PA ${sys}/${dia}`);
    if (glycemia >= 180) alerts.push(`Glicemia ${glycemia}`);
    if (temp >= 37.8) alerts.push(`Febre ${temp}°C`);

    if (alerts.length > 0) {
      badge.className = "text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md";
      badge.textContent = `Alerta: ${alerts.join(" • ")}`;
    } else {
      badge.className = "text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md";
      badge.textContent = "Sinais vitais normais";
    }
  }

  function renderEpidemiologyCharts() {
    const ctxPathologies = document.getElementById("chart-pathologies");
    const ctxSanitation = document.getElementById("chart-sanitation");
    if (!ctxPathologies || !ctxSanitation || typeof Chart === "undefined") return;

    const rafelPatients = state.patients.filter((p) => p.community === "Grota do Rafael");
    const arrozPatients = state.patients.filter((p) => p.community === "Grota do Arroz");

    const topCatalog = state.pathologyCatalog.slice(0, 7);
    const labels = topCatalog.map((c) => c.cid);
    const rafaelCounts = topCatalog.map(
      (c) => rafelPatients.filter((p) => p.chronicConditions.includes(c.cid)).length
    );
    const arrozCounts = topCatalog.map(
      (c) => arrozPatients.filter((p) => p.chronicConditions.includes(c.cid)).length
    );

    if (chartPathologiesInstance) chartPathologiesInstance.destroy();
    chartPathologiesInstance = new Chart(ctxPathologies, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Grota do Rafael",
            data: rafaelCounts,
            backgroundColor: "#0f172a",
            borderRadius: 4
          },
          {
            label: "Grota do Arroz",
            data: arrozCounts,
            backgroundColor: "#0d9488",
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { boxWidth: 10, font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });

    const sanitationCategories = [
      "Esgoto a céu aberto próximo",
      "Vala aberta / Alagamento em dias de chuva",
      "Fossa rudimentar",
      "Rede coletora regular"
    ];
    const sanitationCounts = sanitationCategories.map(
      (cat) => state.patients.filter((p) => p.sanitation === cat).length
    );

    if (chartSanitationInstance) chartSanitationInstance.destroy();
    chartSanitationInstance = new Chart(ctxSanitation, {
      type: "doughnut",
      data: {
        labels: ["Esgoto aberto", "Vala / Alagamento", "Fossa", "Rede regular"],
        datasets: [
          {
            data: sanitationCounts,
            backgroundColor: ["#f43f5e", "#f59e0b", "#64748b", "#10b981"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 11 } } } }
      }
    });
  }

  function buildAnonymizedRecord(patient) {
    const latest = patient.consultations[0] || {};
    return {
      anonymized_cohort_hash: pseudoSha256(`${patient.id}-${patient.cns}`),
      institution_tenant: "UNIMA_AFYA_MACEIO",
      territory_cluster: patient.community,
      age_bracket: getAgeBracket(patient.age),
      biological_sex: patient.sex,
      sanitation_determinant: patient.sanitation,
      water_access: patient.waterAccess,
      icd10_codes: patient.chronicConditions,
      therapeutic_classes_in_use: patient.medicationsInUse,
      adherence_profile: patient.medicationAdherence,
      latest_biomarkers: {
        bp_mmHg: latest.bp || "120/80",
        glycemia_mg_dL: latest.glycemia || 95,
        temperature_c: latest.temp || 36.5
      }
    };
  }

  // Pipeline Visual Limpo (Substitui o bloco gigante de JSON por 3 cards visuais claros)
  function renderAnonymizationPreview() {
    const visualContainer = document.getElementById("visual-anonymizer-table");
    if (!visualContainer) return;

    const patient = state.patients.find((p) => p.id === selectedPatientId) || state.patients[0];
    if (!patient) return;

    const anon = buildAnonymizedRecord(patient);

    visualContainer.innerHTML = `
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500">1. Dado Interno UDA</span>
          <span class="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-semibold">Restrito</span>
        </div>
        <div class="space-y-1 text-slate-700">
          <p><span class="text-slate-400">Nome:</span> <strong>${patient.name}</strong></p>
          <p><span class="text-slate-400">CNS:</span> <span class="font-mono-code">${patient.cns}</span></p>
          <p><span class="text-slate-400">Idade/Local:</span> ${patient.age} anos • ${patient.microarea.split("-")[0]}</p>
        </div>
      </div>

      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-slate-500">2. Motor LGPD (Art. 12)</span>
          <span class="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono-code">SHA-256</span>
        </div>
        <p class="text-slate-500 leading-relaxed">
          Suprime nome, CNS e endereço exato; converte idade em faixa etária e agrupa por microterritório ($k \\ge 15$).
        </p>
      </div>

      <div class="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-semibold text-emerald-900">3. Registro Comercial B2B</span>
          <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">Vendável</span>
        </div>
        <div class="space-y-1 text-slate-700">
          <p><span class="text-slate-400">ID Coorte:</span> <span class="font-mono-code text-emerald-800 font-semibold">${anon.anonymized_cohort_hash}</span></p>
          <p><span class="text-slate-400">Perfil:</span> ${anon.age_bracket} • Sexo ${anon.biological_sex} • ${anon.territory_cluster}</p>
          <p><span class="text-slate-400">Clínico:</span> CIDs <span class="font-mono-code font-semibold">${anon.icd10_codes.join(", ")}</span> • PA ${anon.latest_biomarkers.bp_mmHg}</p>
        </div>
      </div>
    `;
  }

  function renderB2BMarketplaceAndScale() {
    renderAnonymizationPreview();

    const pkgGrid = document.getElementById("b2b-packages-grid");
    if (pkgGrid) {
      pkgGrid.innerHTML = state.b2bPackages
        .map(
          (pkg) => `
          <div class="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between space-y-4">
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                  ${pkg.badge}
                </span>
                <span class="font-mono-code text-[11px] text-slate-400">${pkg.id}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm leading-snug">${pkg.title}</h4>
              <p class="text-xs text-slate-500">${pkg.targetBuyer}</p>
              <div class="pt-1 flex flex-wrap gap-1">
                ${pkg.variables
                  .map(
                    (v) =>
                      `<span class="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70 text-[11px] text-slate-600">${v}</span>`
                  )
                  .join("")}
              </div>
            </div>

            <div class="pt-3 border-t border-slate-100 space-y-2.5">
              <div class="flex items-baseline justify-between">
                <span class="text-[11px] text-slate-400">${pkg.kAnonymity.split("(")[0]}</span>
                <strong class="text-sm font-bold text-slate-900">${pkg.priceMonthly}</strong>
              </div>
              <button
                type="button"
                data-pkg-id="${pkg.id}"
                class="btn-simulate-license w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
              >
                Licenciar Dataset
              </button>
            </div>
          </div>
        `
        )
        .join("");

      pkgGrid.querySelectorAll(".btn-simulate-license").forEach((btn) => {
        btn.addEventListener("click", () => {
          const pkgId = btn.getAttribute("data-pkg-id");
          const pkg = state.b2bPackages.find((p) => p.id === pkgId);
          if (!pkg) return;
          openGenericModal(
            `Licenciamento B2B — ${pkg.id}`,
            `
              <div class="space-y-3">
                <p class="font-semibold text-slate-900 text-sm">${pkg.title}</p>
                <p><strong>Comprador:</strong> ${pkg.targetBuyer}</p>
                <p><strong>Volume:</strong> ${pkg.recordsCount} (${pkg.kAnonymity})</p>
                <p><strong>Assinatura:</strong> <span class="font-bold text-slate-900">${pkg.priceMonthly}</span></p>
                <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <strong>Cashback Social:</strong> ${pkg.socialCashback}
                </div>
                <div class="pt-2 flex justify-end">
                  <button type="button" onclick="document.getElementById('btn-export-anonymized-csv').click()" class="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl">
                    Baixar Amostra CSV
                  </button>
                </div>
              </div>
            `
          );
        });
      });
    }

    const tbody = document.getElementById("saas-institutions-tbody");
    if (tbody) {
      tbody.innerHTML = state.scalableInstitutions
        .map(
          (inst) => `
          <tr class="hover:bg-slate-50/80">
            <td class="py-3 px-5 font-semibold text-slate-900">${inst.name}</td>
            <td class="py-3 px-5 text-slate-600">${inst.communities.join(", ")}</td>
            <td class="py-3 px-5 font-mono-code">${inst.studentsActive}</td>
            <td class="py-3 px-5 font-mono-code">${inst.recordsCaptured.toLocaleString("pt-BR")}</td>
            <td class="py-3 px-5 font-semibold text-slate-900">${inst.mrrSaas}</td>
            <td class="py-3 px-5">
              <span class="px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                inst.status.includes("Ativo")
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600"
              }">${inst.status}</span>
            </td>
          </tr>
        `
        )
        .join("");
    }
  }

  function openGenericModal(title, htmlContent) {
    const modal = document.getElementById("modal-generic");
    document.getElementById("modal-generic-title").textContent = title;
    document.getElementById("modal-generic-body").innerHTML = htmlContent;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeGenericModal() {
    const modal = document.getElementById("modal-generic");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  function exportAnonymizedJson() {
    const dataset = {
      platform: "GrotaDB - UDA UNIMA Afya",
      exportedAt: new Date().toISOString(),
      lgpdCompliance: "Art. 12 - Dados Anonimizados",
      records: state.patients.map(buildAnonymizedRecord)
    };
    const blob = new Blob([JSON.stringify(dataset, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rwe_anonimizado_unima_afya.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON anonimizado exportado");
  }

  function exportAnonymizedCsv() {
    const rows = state.patients.map(buildAnonymizedRecord);
    const headers = [
      "cohort_hash",
      "tenant",
      "territorio",
      "faixa_etaria",
      "sexo",
      "saneamento",
      "cids",
      "adesao",
      "pa",
      "glicemia"
    ];
    const csvLines = [
      headers.join(";"),
      ...rows.map((r) =>
        [
          r.anonymized_cohort_hash,
          r.institution_tenant,
          r.territory_cluster,
          r.age_bracket,
          r.biological_sex,
          r.sanitation_determinant,
          r.icd10_codes.join("|"),
          r.adherence_profile,
          r.latest_biomarkers.bp_mmHg,
          r.latest_biomarkers.glycemia_mg_dL
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(";")
      )
    ];

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rwe_anonimizado_b2b.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV comercial exportado");
  }

  function refreshAllViews() {
    renderMetrics();
    renderPatientList();
    renderSelectedPatientCard();
    renderEpidemiologyCharts();
    renderB2BMarketplaceAndScale();
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  function initEvents() {
    const loginForm = document.getElementById("login-form");
    const loginScreen = document.getElementById("login-screen");

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inst = document.getElementById("login-institution").value;
      const matricula = document.getElementById("login-matricula").value.trim();
      const name = document.getElementById("login-name").value.trim();
      const period = document.getElementById("login-period").value;
      const territory = document.getElementById("login-territory").value;

      state.institution.name = inst;
      state.institution.activeAcademic = {
        name,
        matricula,
        period,
        preceptor: document.getElementById("login-preceptor").value
      };

      document.getElementById("header-student-name").textContent = name;
      document.getElementById("header-student-matricula").textContent = `RA ${matricula}`;
      document.getElementById("form-student-stamp").textContent = `RA ${matricula}`;
      document.getElementById("header-institution-badge").textContent = inst.split("—")[0].trim();

      currentTerritoryFilter = territory;
      updateTerritoryFilterButtons();

      loginScreen.classList.add("hidden");
      saveState();
      refreshAllViews();
      showToast(`Sessão iniciada • ${name}`);
    });

    const demoStudents = [
      { name: "Gabriel Cavalcante", matricula: "202310845" },
      { name: "Letícia Mendonça", matricula: "202410112" },
      { name: "Pedro Alencar", matricula: "202320519" }
    ];
    let demoIdx = 0;
    document.getElementById("btn-quick-demo").addEventListener("click", () => {
      demoIdx = (demoIdx + 1) % demoStudents.length;
      document.getElementById("login-name").value = demoStudents[demoIdx].name;
      document.getElementById("login-matricula").value = demoStudents[demoIdx].matricula;
    });

    document.getElementById("btn-switch-user").addEventListener("click", () => {
      loginScreen.classList.remove("hidden");
    });

    // Navegação Sidebar
    document.querySelectorAll(".nav-tab").forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const targetId = tabBtn.getAttribute("data-tab");
        document.querySelectorAll(".nav-tab").forEach((b) => b.classList.remove("active"));
        tabBtn.classList.add("active");

        document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));
        document.getElementById(targetId).classList.remove("hidden");

        if (targetId === "tab-public-policy") {
          renderEpidemiologyCharts();
        } else if (targetId === "tab-b2b-scale" || targetId === "tab-scale") {
          renderB2BMarketplaceAndScale();
        }
      });
    });

    // Filtro de Território na Sidebar
    function updateTerritoryFilterButtons() {
      document.querySelectorAll(".territory-filter-btn").forEach((btn) => {
        const terr = btn.getAttribute("data-territory");
        if (terr === currentTerritoryFilter) {
          btn.className =
            "territory-filter-btn py-1.5 rounded-lg font-semibold bg-white text-slate-900 shadow-sm";
        } else {
          btn.className =
            "territory-filter-btn py-1.5 rounded-lg font-medium text-slate-500 hover:text-slate-900";
        }
      });
    }

    document.querySelectorAll(".territory-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentTerritoryFilter = btn.getAttribute("data-territory");
        updateTerritoryFilterButtons();
        refreshAllViews();
      });
    });

    // Busca e Filtro de Patologia
    document.getElementById("search-patient-input").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderPatientList();
      renderSelectedPatientCard();
    });

    document.querySelectorAll(".pat-filter-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        currentPathologyFilter = chip.getAttribute("data-pathology-filter");
        document.querySelectorAll(".pat-filter-chip").forEach((c) => {
          c.className =
            "pat-filter-chip px-2 py-1 rounded-md font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 whitespace-nowrap";
        });
        chip.className =
          "pat-filter-chip px-2 py-1 rounded-md font-semibold bg-slate-900 text-white whitespace-nowrap";
        renderPatientList();
        renderSelectedPatientCard();
      });
    });

    // Drawer de Atendimento e Templates 1-Clique
    document.getElementById("btn-close-drawer").addEventListener("click", closeConsultationDrawer);
    document.getElementById("btn-cancel-drawer").addEventListener("click", closeConsultationDrawer);
    document.getElementById("drawer-backdrop").addEventListener("click", closeConsultationDrawer);

    const udaTemplates = {
      has: {
        bp: "156/94",
        glycemia: "192",
        hr: "84",
        temp: "36.5",
        cids: ["I10", "E11"],
        complaint: "Cefaleia occipital leve e dificuldade de buscar anti-hipertensivo por escadaria íngreme na Grota.",
        conduct: "Ajuste de Losartana 50mg 12/12h + Metformina 850mg, solicitação de HbA1c/Creatinina na UDA UNIMA Afya e inclusão na entrega domiciliar."
      },
      dengue: {
        bp: "110/70",
        glycemia: "94",
        hr: "98",
        temp: "38.5",
        cids: ["A90"],
        complaint: "Febre de início súbito (38.5°C) há 48h, mialgia intensa e dor retro-orbitária. Foco de água parada próximo à residência.",
        conduct: "Notificação SINAN realizada, prova do laço negativa, hidratação oral vigorosa (60mL/kg/dia), Dipirona 1g SOS e retorno em 48h para hemograma."
      },
      parasitose: {
        bp: "105/68",
        glycemia: "88",
        hr: "86",
        temp: "37.1",
        cids: ["B82", "A09"],
        complaint: "Dor abdominal periumbilical em cólica, hiporexia e diarreia intermitente. Consumo de água de caixa sem filtro.",
        conduct: "Prescrição de Albendazol 400mg + Sais de Reidratação Oral, solicitação de EPF e orientação de hipoclorito de sódio."
      },
      asma: {
        bp: "118/76",
        glycemia: "92",
        hr: "96",
        temp: "36.7",
        cids: ["J45"],
        complaint: "Dispneia aos médios esforços, tosse seca noturna e sibilância difusa. Residência com infiltração e mofo acentuado.",
        conduct: "Salbutamol spray 100mcg (resgate) + Budesonida inalatória contínua, revisão da técnica inalatória e orientação de ventilação domiciliar."
      },
      prenatal: {
        bp: "116/74",
        glycemia: "84",
        hr: "88",
        temp: "36.5",
        cids: ["Z34"],
        complaint: "Consulta de rotina Pré-Natal (2º trimestre). Movimentação fetal presente, sem perdas vaginais ou queixas urinárias.",
        conduct: "BCF 144 bpm, AU compatível. Mantido Sulfato Ferroso + Ácido Fólico, solicitado TOTG-75g e sorologias de 2º trimestre na UDA."
      },
      mental: {
        bp: "132/84",
        glycemia: "96",
        hr: "92",
        temp: "36.4",
        cids: ["F41"],
        complaint: "Insônia inicial, palpitações, choro fácil e sobrecarga emocional associada à vulnerabilidade financeira familiar.",
        conduct: "Escuta qualificada na UDA, manejo não farmacológico do sono, início de ISRS (Fluoxetina 20mg/dia) e encaminhamento para roda interprofissional com Psicologia UNIMA."
      },
      dermato: {
        bp: "120/78",
        glycemia: "91",
        hr: "78",
        temp: "36.6",
        cids: ["B35"],
        complaint: "Lesões papulovesiculares intensamente pruriginosas em espaços interdigitais e abdome, com piora noturna (coabitantes com sintomas semelhantes).",
        conduct: "Permetrina loção 5% tópica (aplicar no paciente e contactantes domiciliares, repetir em 7 dias), anti-histamínico oral e higienização de roupas de cama."
      },
      pediabetico: {
        bp: "148/90",
        glycemia: "226",
        hr: "82",
        temp: "36.5",
        cids: ["E11", "E66", "I10"],
        complaint: "Retorno para rastreio de pé diabético e controle metabólico. Relata parestesia em bota em membros inferiores.",
        conduct: "Teste com monofilamento 10g Semmes-Weinstein, pulsos pediosos presentes, orientação de calçado fechado e ajuste de Gliclazida 60mg + encaminhamento à Nutrição UDA."
      },
      puericultura: {
        bp: "96/60",
        glycemia: "85",
        hr: "104",
        temp: "36.6",
        cids: ["B82", "J45"],
        complaint: "Avaliação de crescimento e desenvolvimento infantil na UDA. Caderneta vacinal verificada; mãe relata apetite seletivo e tosse ocasional.",
        conduct: "Curvas de peso e estatura adequadas na caderneta da criança, suplementação profilática de micronutrientes, vermifugação e atualização vacinal."
      },
      visita: {
        bp: "152/92",
        glycemia: "168",
        hr: "76",
        temp: "36.3",
        cids: ["I10", "E11"],
        complaint: "Visita domiciliar realizada pela equipe de acadêmicos na encosta/escadaria. Paciente idoso restrito ao domicílio por limitação osteoarticular.",
        conduct: "Reconciliação medicamentosa em domicílio, organização de caixa organizadora semanal por turnos para a família e agendamento de coleta laboratorial domiciliar."
      }
    };

    document.querySelectorAll(".tpl-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tplKey = btn.getAttribute("data-tpl");
        const tpl = udaTemplates[tplKey];
        if (!tpl) return;
        document.getElementById("att-bp").value = tpl.bp;
        document.getElementById("att-glycemia").value = tpl.glycemia;
        document.getElementById("att-hr").value = tpl.hr;
        document.getElementById("att-temp").value = tpl.temp;
        selectedFormCids = new Set(tpl.cids);
        document.getElementById("att-complaint").value = tpl.complaint;
        document.getElementById("att-conduct").value = tpl.conduct;
        renderCidSelectorChips();
        evaluateVitalSignsAlert();
      });
    });

    ["att-bp", "att-glycemia", "att-temp"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", evaluateVitalSignsAlert);
    });

    document.getElementById("consultation-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const patient = state.patients.find((p) => p.id === selectedPatientId);
      if (!patient) return;

      const bp = document.getElementById("att-bp").value.trim();
      const glycemia = parseInt(document.getElementById("att-glycemia").value, 10) || 100;
      const heartRate = parseInt(document.getElementById("att-hr").value, 10) || 80;
      const temp = parseFloat(document.getElementById("att-temp").value) || 36.5;
      const weight = parseFloat(document.getElementById("att-weight").value) || 70.0;
      const chiefComplaint = document.getElementById("att-complaint").value.trim();
      const conduct = document.getElementById("att-conduct").value.trim();
      const cids = Array.from(selectedFormCids);

      const todayStr = new Date().toISOString().slice(0, 10);
      const newConsultation = {
        id: `ATD-${Date.now().toString().slice(-5)}`,
        date: todayStr,
        studentName: state.institution.activeAcademic.name,
        studentMatricula: state.institution.activeAcademic.matricula,
        bp,
        glycemia,
        heartRate,
        temp,
        weight,
        height: 1.64,
        cids,
        chiefComplaint,
        conduct
      };

      patient.consultations.unshift(newConsultation);
      patient.lastVisit = todayStr;

      cids.forEach((cid) => {
        if (!patient.chronicConditions.includes(cid)) {
          patient.chronicConditions.push(cid);
        }
      });

      document.getElementById("att-complaint").value = "";
      document.getElementById("att-conduct").value = "";

      closeConsultationDrawer();
      saveState();
      refreshAllViews();

      if (window.SupabaseService && window.SupabaseService.isActive()) {
        window.SupabaseService.insertConsultationInCloud(patient, newConsultation)
          .then(() => showToast("Atendimento salvo na nuvem"))
          .catch(() => showToast("Atendimento salvo localmente"));
      } else {
        showToast("Atendimento registrado com sucesso");
      }
    });

    // Modal Novo Paciente
    const modalNewPatient = document.getElementById("modal-new-patient");
    const openNewPatientModal = () => {
      modalNewPatient.classList.remove("hidden");
      modalNewPatient.classList.add("flex");
    };
    const closeNewPatientModal = () => {
      modalNewPatient.classList.add("hidden");
      modalNewPatient.classList.remove("flex");
    };

    document.getElementById("btn-open-new-patient").addEventListener("click", openNewPatientModal);
    document.getElementById("btn-close-new-patient").addEventListener("click", closeNewPatientModal);
    document.getElementById("btn-cancel-new-patient").addEventListener("click", closeNewPatientModal);

    document.getElementById("new-patient-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("np-name").value.trim();
      const cns = document.getElementById("np-cns").value.trim();
      const age = parseInt(document.getElementById("np-age").value, 10) || 40;
      const sex = document.getElementById("np-sex").value;
      const riskLevel = document.getElementById("np-risk").value;
      const community = document.getElementById("np-community").value;
      const microarea = document.getElementById("np-microarea").value.trim();
      const sanitation = document.getElementById("np-sanitation").value;
      const waterAccess = document.getElementById("np-water").value;
      const medsRaw = document.getElementById("np-meds").value.trim();

      const newId = `PAC-${Date.now().toString().slice(-4)}`;
      const todayStr = new Date().toISOString().slice(0, 10);

      const newPatient = {
        id: newId,
        name,
        age,
        sex,
        cns,
        community,
        microarea,
        sanitation,
        waterAccess,
        housingRisk: "Mapeado na UDA",
        incomeBracket: "Até 1 salário mínimo",
        medicationsInUse: medsRaw
          ? medsRaw.split(",").map((s) => s.trim()).filter(Boolean)
          : ["Avaliação inicial"],
        medicationAdherence: "Regular",
        chronicConditions: ["I10"],
        lastVisit: todayStr,
        riskLevel,
        consultations: [
          {
            id: `ATD-${Date.now().toString().slice(-5)}`,
            date: todayStr,
            studentName: state.institution.activeAcademic.name,
            studentMatricula: state.institution.activeAcademic.matricula,
            bp: "130/85",
            glycemia: 98,
            heartRate: 78,
            temp: 36.5,
            weight: 70,
            height: 1.65,
            cids: ["I10"],
            chiefComplaint: "Triagem inicial realizada na UDA UNIMA Afya.",
            conduct: "Estratificação de risco e solicitação de exames de rotina."
          }
        ]
      };

      state.patients.unshift(newPatient);
      selectedPatientId = newPatient.id;
      saveState();
      closeNewPatientModal();
      e.target.reset();
      refreshAllViews();

      if (window.SupabaseService && window.SupabaseService.isActive()) {
        window.SupabaseService.insertPatientInCloud(newPatient).catch(console.warn);
      }
      showToast(`Paciente ${name} cadastrado`);
    });

    // Relatório de Políticas Públicas
    document.getElementById("btn-generate-policy-brief").addEventListener("click", () => {
      const total = state.patients.length;
      const rafaelCount = state.patients.filter((p) => p.community === "Grota do Rafael").length;
      const arrozCount = state.patients.filter((p) => p.community === "Grota do Arroz").length;
      const hasCount = state.patients.filter((p) => p.chronicConditions.includes("I10")).length;

      openGenericModal(
        "Nota Técnica Epidemiológica — UDA UNIMA Afya",
        `
          <div class="space-y-4">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p><strong>Unidade:</strong> UDA UNIMA | Afya (Maceió - AL)</p>
              <p><strong>Relator:</strong> ${state.institution.activeAcademic.name} (RA ${state.institution.activeAcademic.matricula})</p>
              <p><strong>Amostra:</strong> Grota do Rafael (${rafaelCount}) • Grota do Arroz (${arrozCount})</p>
            </div>
            <p class="leading-relaxed">
              Prevalência de <strong>Hipertensão (${Math.round((hasCount / total) * 100)}%)</strong> associada a barreiras de mobilidade em escadarias e foco de arboviroses/doenças hídricas em áreas sem cobertura de esgoto.
            </p>
            <div class="pt-2 flex justify-end">
              <button type="button" onclick="window.print()" class="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl">
                Imprimir / PDF
              </button>
            </div>
          </div>
        `
      );
    });

    // Onboarding SaaS
    document.getElementById("btn-open-onboard-modal").addEventListener("click", () => {
      openGenericModal(
        "Adicionar Nova Faculdade (Tenant SaaS)",
        `
          <form id="form-onboard-ies" class="space-y-3">
            <div>
              <label class="block font-medium text-slate-600 mb-1">Instituição de Ensino</label>
              <input type="text" id="ob-name" required value="FITS | Afya — Recife/PE" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div>
              <label class="block font-medium text-slate-600 mb-1">Comunidades Atendidas</label>
              <input type="text" id="ob-comm" required value="Cajueiro Seco, Ibura" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-medium text-slate-600 mb-1">Acadêmicos</label>
                <input type="number" id="ob-students" required value="340" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
              </div>
              <div>
                <label class="block font-medium text-slate-600 mb-1">Mensalidade SaaS</label>
                <input type="text" id="ob-mrr" required value="R$ 9.900/mês" class="w-full rounded-lg border border-slate-200 px-3 py-2 font-semibold" />
              </div>
            </div>
            <div class="pt-2 flex justify-end">
              <button type="submit" class="bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl">
                Ativar Unidade
              </button>
            </div>
          </form>
        `
      );

      document.getElementById("form-onboard-ies").addEventListener("submit", (ev) => {
        ev.preventDefault();
        const name = document.getElementById("ob-name").value.trim();
        const communities = document
          .getElementById("ob-comm")
          .value.split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const studentsActive = parseInt(document.getElementById("ob-students").value, 10) || 200;
        const mrrSaas = document.getElementById("ob-mrr").value.trim();

        const newInst = {
          id: `ies-${Date.now()}`,
          name,
          status: "Ativo",
          communities,
          studentsActive,
          recordsCaptured: 120,
          mrrSaas
        };

        state.scalableInstitutions.unshift(newInst);
        saveState();
        closeGenericModal();
        renderB2BMarketplaceAndScale();

        if (window.SupabaseService && window.SupabaseService.isActive()) {
          window.SupabaseService.insertInstitutionInCloud(newInst).catch(console.warn);
        }
        showToast(`${name} adicionada`);
      });
    });

    // Recolher / Expandir Sidebar (Botões + Atalho Ctrl+B)
    const sidebar = document.getElementById("app-sidebar");
    const btnCollapse = document.getElementById("btn-collapse-sidebar");
    const btnExpand = document.getElementById("btn-expand-sidebar");

    function setSidebarCollapsed(collapsed) {
      if (!sidebar || !btnExpand) return;
      if (collapsed) {
        sidebar.classList.add("hidden");
        btnExpand.classList.remove("hidden");
      } else {
        sidebar.classList.remove("hidden");
        btnExpand.classList.add("hidden");
      }
    }

    if (btnCollapse) {
      btnCollapse.addEventListener("click", () => setSidebarCollapsed(true));
    }
    if (btnExpand) {
      btnExpand.addEventListener("click", () => setSidebarCollapsed(false));
    }
    document.addEventListener("keydown", (ev) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "b") {
        ev.preventDefault();
        const isHidden = sidebar && sidebar.classList.contains("hidden");
        setSidebarCollapsed(!isHidden);
      }
    });

    document.getElementById("btn-close-generic-modal").addEventListener("click", closeGenericModal);
    document.getElementById("btn-export-anonymized-json").addEventListener("click", exportAnonymizedJson);
    document.getElementById("btn-export-anonymized-csv").addEventListener("click", exportAnonymizedCsv);

    document.getElementById("btn-reset-data").addEventListener("click", () => {
      syncFromCloudIfAvailable();
      showToast("Sincronizado com a nuvem");
    });
  }

  async function syncFromCloudIfAvailable() {
    if (!window.SupabaseService || !window.SupabaseService.isActive()) return;
    try {
      const cloudData = await window.SupabaseService.fetchFullStateFromCloud();
      if (!cloudData) return;
      if (cloudData.empty) {
        await window.SupabaseService.seedInitialDataToCloud(state);
        return;
      }
      const prevCount = state.patients.reduce((acc, p) => acc + p.consultations.length, 0);
      const newCount = cloudData.patients.reduce((acc, p) => acc + p.consultations.length, 0);
      const changed =
        cloudData.patients.length !== state.patients.length || newCount !== prevCount;

      state.patients = cloudData.patients;
      if (cloudData.scalableInstitutions) {
        state.scalableInstitutions = cloudData.scalableInstitutions;
      }
      if (!state.patients.some((p) => p.id === selectedPatientId)) {
        selectedPatientId = state.patients[0]?.id || null;
      }
      saveState();
      if (changed) {
        refreshAllViews();
      }
    } catch (err) {
      console.warn(err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (window.SupabaseService) window.SupabaseService.initClient();
    initEvents();
    refreshAllViews();
    evaluateVitalSignsAlert();
    syncFromCloudIfAvailable();
    setInterval(syncFromCloudIfAvailable, 6000);
    window.addEventListener("focus", syncFromCloudIfAvailable);
  });
})();
