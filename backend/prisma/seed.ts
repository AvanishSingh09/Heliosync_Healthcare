import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
};

const AppointmentStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_QUEUE: 'IN_QUEUE',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
};

const DocumentType = {
  LAB_REPORT: 'LAB_REPORT',
  IMAGING: 'IMAGING',
  PRESCRIPTION: 'PRESCRIPTION',
  MEDICAL_HISTORY: 'MEDICAL_HISTORY',
  OTHER: 'OTHER',
};

const ConsentStatus = {
  PENDING: 'PENDING',
  GRANTED: 'GRANTED',
  REJECTED: 'REJECTED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
};

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Heliosync Healthcare Platform on MongoDB...');

  // Clean existing tables in reverse order
  await prisma.auditLog.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.medicalDocument.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.vitals.deleteMany();
  await prisma.encounter.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 1. Create Hospital
  const hospital = await prisma.hospital.create({
    data: {
      name: 'ABC Multispeciality Hospital',
      registrationNumber: 'HOSP-DEL-2024-001',
      address: 'Plot 14, Health City, Sector 62',
      city: 'New Delhi',
      state: 'Delhi',
      phone: '+91 11 4982 3000',
      email: 'contact@abchospital.in',
      logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=300',
    },
  });

  // 2. Create Hospital Admin User
  await prisma.user.create({
    data: {
      name: 'Rajesh Malhotra (Admin)',
      email: 'hospital@heliosync.demo',
      phone: '+91 98100 11223',
      passwordHash: defaultPasswordHash,
      role: Role.HOSPITAL_ADMIN,
    },
  });

  // 3. Create Doctors
  const doctorData = [
    {
      name: 'Dr. Ankit Sharma',
      email: 'doctor@heliosync.demo', // Primary demo doctor login
      phone: '+91 98111 22334',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
      registrationNumber: 'DMC-84920',
      experience: 12,
      consultationFee: 800,
      bio: 'Senior Consultant Cardiologist specializing in interventional cardiology, preventive heart care, and hypertension management.',
      profilePhoto: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Dr. Priya Mehta',
      email: 'priya.mehta@heliosync.demo',
      phone: '+91 98222 33445',
      specialization: 'Neurology',
      qualification: 'MBBS, MD, DM (Neurology)',
      registrationNumber: 'DMC-73918',
      experience: 9,
      consultationFee: 1000,
      bio: 'Neurology specialist with deep expertise in stroke prevention, headache disorders, and neurological rehabilitation.',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813620-72f10b7f8c0e?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Dr. Rohan Gupta',
      email: 'rohan.gupta@heliosync.demo',
      phone: '+91 98333 44556',
      specialization: 'General Medicine',
      qualification: 'MBBS, MD (Internal Medicine)',
      registrationNumber: 'DMC-62114',
      experience: 15,
      consultationFee: 500,
      bio: 'Comprehensive internal medicine specialist focusing on chronic disease management, metabolic disorders, and primary care.',
      profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    },
    {
      name: 'Dr. Neha Kapoor',
      email: 'neha.kapoor@heliosync.demo',
      phone: '+91 98444 55667',
      specialization: 'Dermatology',
      qualification: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      registrationNumber: 'DMC-91023',
      experience: 7,
      consultationFee: 600,
      bio: 'Consultant Dermatologist and Trichologist specializing in clinical dermatology, allergy testing, and skin wellness.',
      profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const doctors = [];
  for (const doc of doctorData) {
    const user = await prisma.user.create({
      data: {
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        passwordHash: defaultPasswordHash,
        role: Role.DOCTOR,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        hospitalId: hospital.id,
        specialization: doc.specialization,
        qualification: doc.qualification,
        registrationNumber: doc.registrationNumber,
        experience: doc.experience,
        consultationFee: doc.consultationFee,
        bio: doc.bio,
        profilePhoto: doc.profilePhoto,
      },
    });
    doctors.push(doctor);
  }

  const [drSharma, drMehta, drGupta, drKapoor] = doctors;

  // 4. Create Patients
  const patientUsers = [
    {
      name: 'Rahul Kumar',
      email: 'patient@heliosync.demo', // Primary demo patient login
      phone: '+91 98765 43210',
      patientNumber: 'P-10023',
      dob: new Date('1997-04-12'),
      gender: 'Male',
      bloodGroup: 'B+',
      address: 'Flat 402, Green Park Residency, New Delhi',
      emergencyContact: 'Sunita Kumar (Mother)',
      emergencyContactPhone: '+91 98765 43219',
      allergies: 'Penicillin',
    },
    {
      name: 'Aarav Singh',
      email: 'aarav@heliosync.demo',
      phone: '+91 98123 45678',
      patientNumber: 'P-10024',
      dob: new Date('1992-08-20'),
      gender: 'Male',
      bloodGroup: 'O+',
      address: 'B-12, Lajpat Nagar, New Delhi',
      emergencyContact: 'Meera Singh (Spouse)',
      emergencyContactPhone: '+91 98123 45679',
      allergies: 'None',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@heliosync.demo',
      phone: '+91 98987 65432',
      patientNumber: 'P-10025',
      dob: new Date('1999-11-05'),
      gender: 'Female',
      bloodGroup: 'A+',
      address: 'House 88, Vasant Vihar, New Delhi',
      emergencyContact: 'Amit Sharma (Brother)',
      emergencyContactPhone: '+91 98987 65430',
      allergies: 'Sulfa drugs',
    },
  ];

  const patients = [];
  for (const p of patientUsers) {
    const user = await prisma.user.create({
      data: {
        name: p.name,
        email: p.email,
        phone: p.phone,
        passwordHash: defaultPasswordHash,
        role: Role.PATIENT,
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        patientNumber: p.patientNumber,
        dateOfBirth: p.dob,
        gender: p.gender,
        bloodGroup: p.bloodGroup,
        phone: p.phone,
        address: p.address,
        emergencyContact: p.emergencyContact,
        emergencyContactPhone: p.emergencyContactPhone,
        allergies: p.allergies,
      },
    });
    patients.push(patient);
  }

  const [rahul, aarav, priyaPatient] = patients;

  // 5. Preload Rahul Kumar's Historical Healthcare Data
  // Encounter 1: Annual Health Checkup (Dr. Rohan Gupta)
  const pastDate1 = new Date('2026-03-10T10:30:00Z');
  const pastAppt1 = await prisma.appointment.create({
    data: {
      patientId: rahul.id,
      doctorId: drGupta.id,
      hospitalId: hospital.id,
      appointmentDate: pastDate1,
      appointmentTime: '10:30 AM',
      reason: 'Routine Executive Health Checkup',
      status: AppointmentStatus.COMPLETED,
    },
  });

  const enc1 = await prisma.encounter.create({
    data: {
      appointmentId: pastAppt1.id,
      patientId: rahul.id,
      doctorId: drGupta.id,
      hospitalId: hospital.id,
      chiefComplaint: 'Routine Executive Health Checkup',
      symptoms: 'Asymptomatic. Occasional work-related fatigue.',
      diagnosis: 'Normal Clinical Evaluation. Mild Vitamin D deficiency.',
      clinicalNotes: 'Cardiovascular and respiratory systems normal. Advised regular exercise and morning sun exposure.',
      treatmentPlan: 'Vitamin D3 60,000 IU weekly for 8 weeks. Repeat evaluation in 6 months.',
      followUpDate: new Date('2026-09-10T10:00:00Z'),
      createdAt: pastDate1,
    },
  });

  await prisma.vitals.create({
    data: {
      encounterId: enc1.id,
      patientId: rahul.id,
      bloodPressure: '120/80',
      heartRate: 72,
      temperature: 98.4,
      spo2: 99,
      respiratoryRate: 16,
      weight: 74.0,
      height: 175.0,
      recordedAt: pastDate1,
    },
  });

  // Encounter 2: Acute Upper Respiratory Tract Infection (Dr. Rohan Gupta)
  const pastDate2 = new Date('2026-05-18T14:15:00Z');
  const pastAppt2 = await prisma.appointment.create({
    data: {
      patientId: rahul.id,
      doctorId: drGupta.id,
      hospitalId: hospital.id,
      appointmentDate: pastDate2,
      appointmentTime: '02:15 PM',
      reason: 'High grade fever with sore throat and dry cough for 3 days',
      status: AppointmentStatus.COMPLETED,
    },
  });

  const enc2 = await prisma.encounter.create({
    data: {
      appointmentId: pastAppt2.id,
      patientId: rahul.id,
      doctorId: drGupta.id,
      hospitalId: hospital.id,
      chiefComplaint: 'High grade fever with sore throat and dry cough for 3 days',
      symptoms: 'Fever (101°F), throat pain on swallowing, nasal congestion, body aches.',
      diagnosis: 'Acute Viral Pharyngitis with Upper Respiratory Infection',
      clinicalNotes: 'Pharyngeal erythema noted. No tonsillar exudates. Chest clear on auscultation.',
      treatmentPlan: 'Rest, warm salt water gargles, antipyretics, and symptomatic medications.',
      followUpDate: new Date('2026-05-25T14:00:00Z'),
      createdAt: pastDate2,
    },
  });

  await prisma.vitals.create({
    data: {
      encounterId: enc2.id,
      patientId: rahul.id,
      bloodPressure: '118/78',
      heartRate: 88,
      temperature: 101.2,
      spo2: 98,
      respiratoryRate: 18,
      weight: 73.5,
      height: 175.0,
      recordedAt: pastDate2,
    },
  });

  const rx2 = await prisma.prescription.create({
    data: {
      encounterId: enc2.id,
      patientId: rahul.id,
      doctorId: drGupta.id,
      notes: 'Drink plenty of warm fluids. Avoid cold beverages.',
      createdAt: pastDate2,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx2.id,
        medicineName: 'Paracetamol 650mg',
        dosage: '1 tablet',
        frequency: 'TID (3 times daily)',
        duration: '5 days',
        instructions: 'Take after meals for fever or body aches',
        quantity: 15,
      },
      {
        prescriptionId: rx2.id,
        medicineName: 'Azithromycin 500mg',
        dosage: '1 tablet',
        frequency: 'OD (Once daily)',
        duration: '3 days',
        instructions: 'Take 1 hour before meal in the morning',
        quantity: 3,
      },
      {
        prescriptionId: rx2.id,
        medicineName: 'Cetirizine 10mg',
        dosage: '1 tablet',
        frequency: 'HS (At bedtime)',
        duration: '5 days',
        instructions: 'Take after dinner',
        quantity: 5,
      },
    ],
  });

  // Follow-up vitals check for URTI
  await prisma.vitals.create({
    data: {
      patientId: rahul.id,
      bloodPressure: '120/80',
      heartRate: 74,
      temperature: 98.6,
      spo2: 99,
      respiratoryRate: 16,
      weight: 73.8,
      height: 175.0,
      recordedAt: new Date('2026-05-25T11:00:00Z'),
    },
  });

  // Encounter 3: Palpitations & Elevated BP (Dr. Ankit Sharma)
  const pastDate3 = new Date('2026-07-02T16:00:00Z');
  const pastAppt3 = await prisma.appointment.create({
    data: {
      patientId: rahul.id,
      doctorId: drSharma.id,
      hospitalId: hospital.id,
      appointmentDate: pastDate3,
      appointmentTime: '04:00 PM',
      reason: 'Occasional chest fluttering, stress-related palpitations, and mild head heaviness',
      status: AppointmentStatus.COMPLETED,
    },
  });

  const enc3 = await prisma.encounter.create({
    data: {
      appointmentId: pastAppt3.id,
      patientId: rahul.id,
      doctorId: drSharma.id,
      hospitalId: hospital.id,
      chiefComplaint: 'Occasional chest fluttering, stress-related palpitations, and mild head heaviness',
      symptoms: 'Resting palpitations after coffee, elevated home BP readings (135/88).',
      diagnosis: 'Early Stage 1 Essential Hypertension with Stress-Induced Sinus Tachycardia',
      clinicalNotes: 'S1/S2 heard. No murmurs. Peripheral pulses good. ECG shows sinus rhythm, no ischemic changes. Advised lipid profile and sodium restriction.',
      treatmentPlan: 'Low sodium diet (DASH diet), reduce caffeine, daily 30 min brisk walk, initiate low dose beta blocker.',
      followUpDate: new Date('2026-08-14T11:00:00Z'),
      createdAt: pastDate3,
    },
  });

  await prisma.vitals.create({
    data: {
      encounterId: enc3.id,
      patientId: rahul.id,
      bloodPressure: '132/86',
      heartRate: 82,
      temperature: 98.6,
      spo2: 98,
      respiratoryRate: 16,
      weight: 75.0,
      height: 175.0,
      recordedAt: pastDate3,
    },
  });

  const rx3 = await prisma.prescription.create({
    data: {
      encounterId: enc3.id,
      patientId: rahul.id,
      doctorId: drSharma.id,
      notes: 'Monitor BP weekly. Limit salt intake to < 5g/day.',
      createdAt: pastDate3,
    },
  });

  await prisma.prescriptionItem.createMany({
    data: [
      {
        prescriptionId: rx3.id,
        medicineName: 'Metoprolol Succinate ER 25mg',
        dosage: '1 tablet',
        frequency: 'OD (Morning)',
        duration: '30 days',
        instructions: 'Take after breakfast',
        quantity: 30,
      },
      {
        prescriptionId: rx3.id,
        medicineName: 'Aspirin 75mg',
        dosage: '1 tablet',
        frequency: 'OD (After lunch)',
        duration: '30 days',
        instructions: 'Take with food',
        quantity: 30,
      },
    ],
  });

  // Recent Home BP Vitals
  await prisma.vitals.create({
    data: {
      patientId: rahul.id,
      bloodPressure: '128/84',
      heartRate: 78,
      temperature: 98.5,
      spo2: 99,
      respiratoryRate: 16,
      weight: 74.8,
      height: 175.0,
      recordedAt: new Date('2026-08-01T08:30:00Z'),
    },
  });

  // 6. Preload Lab Reports for Rahul Kumar
  await prisma.medicalDocument.createMany({
    data: [
      {
        patientId: rahul.id,
        uploadedBy: 'ABC Hospital Pathology Lab',
        documentType: DocumentType.LAB_REPORT,
        fileName: 'Comprehensive_Metabolic_CBC_Lipid_Panel.pdf',
        filePath: 'uploads/sample-cbc-report.pdf',
        description: 'Routine blood panel showing normal Hb (15.2 g/dL), total cholesterol 195 mg/dL, and Vitamin D3 (18 ng/mL).',
        createdAt: new Date('2026-05-19T09:00:00Z'),
      },
      {
        patientId: rahul.id,
        uploadedBy: 'Dr. Ankit Sharma (Cardiology Dept)',
        documentType: DocumentType.IMAGING,
        fileName: '12_Lead_ECG_Echocardiogram_Report.pdf',
        filePath: 'uploads/sample-ecg-report.pdf',
        description: 'Normal sinus rhythm, HR 78 bpm, normal axis. 2D Echo EF 62%, normal LV diastolic function.',
        createdAt: new Date('2026-07-03T11:30:00Z'),
      },
    ],
  });

  // 7. Create Today's Demo Appointment for Rahul Kumar with Dr. Ankit Sharma (With Active Consent)
  const today = new Date();
  const demoAppointment = await prisma.appointment.create({
    data: {
      patientId: rahul.id,
      doctorId: drSharma.id,
      hospitalId: hospital.id,
      appointmentDate: today,
      appointmentTime: '10:30 AM',
      reason: 'Hypertension and medication review follow-up',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // Active Consent for this appointment granting comprehensive access
  await prisma.consent.create({
    data: {
      patientId: rahul.id,
      doctorId: drSharma.id,
      hospitalId: hospital.id,
      appointmentId: demoAppointment.id,
      purpose: 'Cardiology Consultation & Record Evaluation',
      status: ConsentStatus.GRANTED,
      canViewHistory: true,
      canViewVitals: true,
      canViewPrescriptions: true,
      canViewReports: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      grantedAt: new Date(),
    },
  });

  // Also create appointments for Aarav and Priya
  await prisma.appointment.create({
    data: {
      patientId: aarav.id,
      doctorId: drSharma.id,
      hospitalId: hospital.id,
      appointmentDate: today,
      appointmentTime: '11:15 AM',
      reason: 'General Cardiac Assessment',
      status: AppointmentStatus.IN_QUEUE,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: priyaPatient.id,
      doctorId: drMehta.id,
      hospitalId: hospital.id,
      appointmentDate: today,
      appointmentTime: '11:45 AM',
      reason: 'Migraine and chronic headache evaluation',
      status: AppointmentStatus.CONFIRMED,
    },
  });

  // 8. Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: rahul.userId,
      patientId: rahul.id,
      action: 'CONSENT_GRANTED',
      resourceType: 'Consent',
      resourceId: demoAppointment.id,
      metadata: JSON.stringify({
        doctorName: 'Dr. Ankit Sharma',
        canViewHistory: true,
        canViewVitals: true,
        canViewPrescriptions: true,
        canViewReports: true,
      }),
      timestamp: new Date(),
    },
  });

  console.log('✅ Seed completed successfully on MongoDB!');
  console.log('----------------------------------------------------');
  console.log('Demo Credentials (Password for all: password123):');
  console.log('  Hospital Admin: hospital@heliosync.demo');
  console.log('  Doctor:         doctor@heliosync.demo');
  console.log('  Patient:        patient@heliosync.demo');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
