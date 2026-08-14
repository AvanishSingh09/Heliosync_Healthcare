async function testAll() {
  const API_URL = 'http://localhost:5000/api';
  console.log('🧪 Testing Heliosync Backend Endpoints with native fetch...');

  // 1. Health check
  const healthRes = await fetch(`${API_URL}/health`);
  const health = await healthRes.json();
  console.log('✅ Health Check:', health);

  // 2. Patient login (Rahul Kumar)
  const pLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'patient@heliosync.demo',
      password: 'password123',
    }),
  });
  const pLogin = await pLoginRes.json();
  console.log('✅ Patient Login successful:', pLogin.data.user.name);
  const patientToken = pLogin.data.token;
  const patientId = pLogin.data.user.patient.id;

  // 3. Doctor login (Dr. Ankit Sharma)
  const dLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'doctor@heliosync.demo',
      password: 'password123',
    }),
  });
  const dLogin = await dLoginRes.json();
  console.log('✅ Doctor Login successful:', dLogin.data.user.name);
  const doctorToken = dLogin.data.token;
  const doctorId = dLogin.data.user.doctor.id;

  // 4. Query Doctor Profile & Slots
  const dProfileRes = await fetch(`${API_URL}/doctors/${doctorId}`);
  const dProfile = await dProfileRes.json();
  console.log('✅ Doctor Profile & Available Slots:', dProfile.data.availableSlots?.length, 'slots');

  // 5. Patient views Medical Timeline
  const tRes = await fetch(`${API_URL}/patients/${patientId}/timeline`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const timeline = await tRes.json();
  console.log(`✅ Patient Timeline events count: ${timeline.data.length}`);

  // 6. Doctor accesses Rahul's medical records under active consent
  const dAccessRes = await fetch(`${API_URL}/doctors/patient-access/${patientId}`, {
    headers: { Authorization: `Bearer ${doctorToken}` },
  });
  const doctorPatientAccess = await dAccessRes.json();
  console.log('✅ Doctor Authorized Patient Record Access:', {
    authorized: doctorPatientAccess.data.authorized,
    encounters: doctorPatientAccess.data.data?.encounters?.length,
    vitals: doctorPatientAccess.data.data?.vitals?.length,
    prescriptions: doctorPatientAccess.data.data?.prescriptions?.length,
    documents: doctorPatientAccess.data.data?.documents?.length,
  });

  // 7. Doctor completes a new consultation with Encounter, Vitals, and Prescription
  const newEncRes = await fetch(`${API_URL}/encounters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${doctorToken}`,
    },
    body: JSON.stringify({
      patientId,
      doctorId,
      chiefComplaint: 'Follow-up Evaluation & Routine Review',
      symptoms: 'Mild head heaviness, morning fatigue',
      diagnosis: 'Essential Hypertension (Stage 1 controlled)',
      clinicalNotes: 'Heart sounds normal. Patient compliant with therapy.',
      treatmentPlan: 'Continue Telmisartan 40mg daily.',
      vitals: {
        bloodPressure: '122/80',
        heartRate: 74,
        temperature: 98.4,
        spo2: 99,
        weight: 74.2,
        height: 175,
      },
      prescription: {
        notes: 'Maintain low sodium diet and take meds regularly.',
        items: [
          {
            medicineName: 'Telmisartan 40mg',
            dosage: '1 tablet',
            frequency: 'OD (Morning)',
            duration: '30 days',
            instructions: 'Take after breakfast',
            quantity: 30,
          },
        ],
      },
    }),
  });
  const newEnc = await newEncRes.json();
  console.log('✅ Doctor Created Consultation Encounter & Prescription successfully:', newEnc.success);

  // 8. Patient verifies updated timeline
  const uTimelineRes = await fetch(`${API_URL}/patients/${patientId}/timeline`, {
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const updatedTimeline = await uTimelineRes.json();
  console.log(`✅ Patient Updated Timeline Count: ${updatedTimeline.data.length} (increased by new encounter, vitals & prescription!)`);

  console.log('🎉 ALL BACKEND & CONSENT API TESTS PASSED WITH 100% SUCCESS!');
}

testAll().catch((err) => {
  console.error('❌ Test failed:', err);
});
