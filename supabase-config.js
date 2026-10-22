// ============================================================================
// INTEGRAÇÃO SUPABASE CLOUD + FALLBACK HÍBRIDO (VIGIA GROTAS - UNIMA AFYA)
// ============================================================================
// Você pode colar sua URL e ANON KEY do Supabase diretamente abaixo OU
// configurar pelo botão "Supabase Cloud" direto na interface do site!

window.SUPABASE_DEFAULTS = {
  url: "https://irvaudlytilookjjuzuy.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlydmF1ZGx5dGlsb29ramp1enV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2Mjk4MzIsImV4cCI6MjEwODIwNTgzMn0.Ca8tIq1hjvGyVGThE-c6gS-79VSO0M8NiaSIJwMIjU8"
};

window.SupabaseService = (function () {
  const CREDENTIALS_KEY = "vigia_grotas_supabase_creds_v1";
  let client = null;
  let isConnected = false;

  function getCredentials() {
    try {
      const saved = localStorage.getItem(CREDENTIALS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.url && parsed.anonKey) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return {
      url: window.SUPABASE_DEFAULTS.url || "",
      anonKey: window.SUPABASE_DEFAULTS.anonKey || ""
    };
  }

  function saveCredentials(url, anonKey) {
    localStorage.setItem(
      CREDENTIALS_KEY,
      JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() })
    );
    return initClient();
  }

  function clearCredentials() {
    localStorage.removeItem(CREDENTIALS_KEY);
    client = null;
    isConnected = false;
  }

  function initClient() {
    const { url, anonKey } = getCredentials();
    if (!url || !anonKey || typeof window.supabase === "undefined") {
      client = null;
      isConnected = false;
      return false;
    }
    try {
      client = window.supabase.createClient(url, anonKey);
      isConnected = true;
      return true;
    } catch (err) {
      console.error("Erro ao inicializar cliente Supabase:", err);
      client = null;
      isConnected = false;
      return false;
    }
  }

  // Busca todos os pacientes e suas consultas do Supabase
  async function fetchFullStateFromCloud() {
    if (!client) return null;
    try {
      const [patRes, consRes, instRes] = await Promise.all([
        client.from("patients").select("*").order("created_at", { ascending: false }),
        client.from("consultations").select("*").order("consultation_date", { ascending: false }),
        client.from("institutions").select("*").order("created_at", { ascending: true })
      ]);

      if (patRes.error) throw patRes.error;
      if (consRes.error) throw consRes.error;

      // Se o banco estiver conectado mas ainda vazio, retorna { empty: true }
      if (!patRes.data || patRes.data.length === 0) {
        return { empty: true };
      }

      const consultationsByPatient = {};
      (consRes.data || []).forEach((c) => {
        if (!consultationsByPatient[c.patient_id]) {
          consultationsByPatient[c.patient_id] = [];
        }
        consultationsByPatient[c.patient_id].push({
          id: c.id,
          date: c.consultation_date,
          studentName: c.student_name,
          studentMatricula: c.student_matricula,
          bp: c.bp,
          glycemia: c.glycemia,
          heartRate: c.heart_rate,
          temp: Number(c.temp),
          weight: Number(c.weight),
          height: Number(c.height),
          cids: c.cids || [],
          chiefComplaint: c.chief_complaint,
          conduct: c.conduct
        });
      });

      const patients = patRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        sex: p.sex,
        cns: p.cns,
        community: p.community,
        microarea: p.microarea,
        sanitation: p.sanitation,
        waterAccess: p.water_access,
        housingRisk: p.housing_risk,
        incomeBracket: p.income_bracket,
        medicationsInUse: p.medications_in_use || [],
        medicationAdherence: p.medication_adherence,
        chronicConditions: p.chronic_conditions || [],
        lastVisit: p.last_visit,
        riskLevel: p.risk_level,
        consultations: consultationsByPatient[p.id] || []
      }));

      const scalableInstitutions =
        instRes.data && instRes.data.length > 0
          ? instRes.data.map((i) => ({
              id: i.id,
              name: i.name,
              status: i.status,
              communities: i.communities || [],
              studentsActive: i.students_active,
              recordsCaptured: i.records_captured,
              mrrSaas: i.mrr_saas
            }))
          : null;

      return { empty: false, patients, scalableInstitutions };
    } catch (err) {
      console.error("Erro ao sincronizar do Supabase:", err);
      throw err;
    }
  }

  // Faz o Seed (popula o banco Supabase com os dados iniciais das Grotas em 1 clique)
  async function seedInitialDataToCloud(initialData) {
    if (!client) throw new Error("Cliente Supabase não configurado.");

    // 1. Upsert Institutions
    const instRows = (initialData.scalableInstitutions || []).map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      communities: i.communities,
      students_active: i.studentsActive,
      records_captured: i.recordsCaptured,
      mrr_saas: i.mrrSaas
    }));
    if (instRows.length > 0) {
      const { error: errInst } = await client.from("institutions").upsert(instRows);
      if (errInst) throw errInst;
    }

    // 2. Upsert Patients
    const patRows = (initialData.patients || []).map((p) => ({
      id: p.id,
      institution_id: "unima-afya-mcz",
      name: p.name,
      age: p.age,
      sex: p.sex,
      cns: p.cns,
      community: p.community,
      microarea: p.microarea,
      sanitation: p.sanitation,
      water_access: p.waterAccess,
      housing_risk: p.housingRisk,
      income_bracket: p.incomeBracket,
      medications_in_use: p.medicationsInUse,
      medication_adherence: p.medicationAdherence,
      chronic_conditions: p.chronicConditions,
      last_visit: p.lastVisit,
      risk_level: p.riskLevel
    }));
    const { error: errPat } = await client.from("patients").upsert(patRows);
    if (errPat) throw errPat;

    // 3. Upsert Consultations
    const consRows = [];
    (initialData.patients || []).forEach((p) => {
      (p.consultations || []).forEach((c) => {
        consRows.push({
          id: c.id,
          patient_id: p.id,
          consultation_date: c.date,
          student_name: c.studentName,
          student_matricula: c.studentMatricula,
          bp: c.bp,
          glycemia: c.glycemia,
          heart_rate: c.heartRate,
          temp: c.temp,
          weight: c.weight,
          height: c.height || 1.64,
          cids: c.cids,
          chief_complaint: c.chiefComplaint,
          conduct: c.conduct
        });
      });
    });

    if (consRows.length > 0) {
      const { error: errCons } = await client.from("consultations").upsert(consRows);
      if (errCons) throw errCons;
    }

    return true;
  }

  // Salva um novo paciente e sua primeira consulta no Supabase
  async function insertPatientInCloud(patient) {
    if (!client) return false;
    const { error: patErr } = await client.from("patients").upsert({
      id: patient.id,
      institution_id: "unima-afya-mcz",
      name: patient.name,
      age: patient.age,
      sex: patient.sex,
      cns: patient.cns,
      community: patient.community,
      microarea: patient.microarea,
      sanitation: patient.sanitation,
      water_access: patient.waterAccess,
      housing_risk: patient.housingRisk,
      income_bracket: patient.incomeBracket,
      medications_in_use: patient.medicationsInUse,
      medication_adherence: patient.medicationAdherence,
      chronic_conditions: patient.chronicConditions,
      last_visit: patient.lastVisit,
      risk_level: patient.riskLevel
    });
    if (patErr) throw patErr;

    if (patient.consultations && patient.consultations[0]) {
      const c = patient.consultations[0];
      const { error: consErr } = await client.from("consultations").upsert({
        id: c.id,
        patient_id: patient.id,
        consultation_date: c.date,
        student_name: c.studentName,
        student_matricula: c.studentMatricula,
        bp: c.bp,
        glycemia: c.glycemia,
        heart_rate: c.heartRate,
        temp: c.temp,
        weight: c.weight,
        height: c.height || 1.64,
        cids: c.cids,
        chief_complaint: c.chiefComplaint,
        conduct: c.conduct
      });
      if (consErr) throw consErr;
    }
    return true;
  }

  // Salva uma nova evolução clínica no Supabase e atualiza CIDs/última visita do paciente
  async function insertConsultationInCloud(patient, consultation) {
    if (!client) return false;
    const { error: consErr } = await client.from("consultations").insert({
      id: consultation.id,
      patient_id: patient.id,
      consultation_date: consultation.date,
      student_name: consultation.studentName,
      student_matricula: consultation.studentMatricula,
      bp: consultation.bp,
      glycemia: consultation.glycemia,
      heart_rate: consultation.heartRate,
      temp: consultation.temp,
      weight: consultation.weight,
      height: consultation.height || 1.64,
      cids: consultation.cids,
      chief_complaint: consultation.chiefComplaint,
      conduct: consultation.conduct
    });
    if (consErr) throw consErr;

    const { error: patErr } = await client
      .from("patients")
      .update({
        chronic_conditions: patient.chronicConditions,
        last_visit: patient.lastVisit
      })
      .eq("id", patient.id);
    if (patErr) throw patErr;
    return true;
  }

  // Salva nova faculdade (Tenant SaaS) no Supabase
  async function insertInstitutionInCloud(inst) {
    if (!client) return false;
    const { error } = await client.from("institutions").upsert({
      id: inst.id,
      name: inst.name,
      status: inst.status,
      communities: inst.communities,
      students_active: inst.studentsActive,
      records_captured: inst.recordsCaptured,
      mrr_saas: inst.mrrSaas
    });
    if (error) throw error;
    return true;
  }

  return {
    initClient,
    getCredentials,
    saveCredentials,
    clearCredentials,
    isActive: () => isConnected && client !== null,
    fetchFullStateFromCloud,
    seedInitialDataToCloud,
    insertPatientInCloud,
    insertConsultationInCloud,
    insertInstitutionInCloud
  };
})();
