import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import { PatientLayout } from './layouts/PatientLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { HospitalLayout } from './layouts/HospitalLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Patient Pages
import { PatientDashboard } from './pages/patient/Dashboard';
import { PatientDoctors } from './pages/patient/Doctors';
import { PatientAppointments } from './pages/patient/Appointments';
import { PatientTimelinePage } from './pages/patient/TimelinePage';
import { PatientPrescriptionsPage } from './pages/patient/PrescriptionsPage';
import { PatientVitalsPage } from './pages/patient/VitalsPage';
import { PatientDocumentsPage } from './pages/patient/DocumentsPage';
import { PatientConsentsPage } from './pages/patient/ConsentsPage';
import { PatientProfilePage } from './pages/patient/ProfilePage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorAppointmentsPage } from './pages/doctor/Appointments';
import { DoctorPatientQueue } from './pages/doctor/PatientQueue';
import { DoctorPatientDetail } from './pages/doctor/PatientDetail';
import { DoctorConsultationPage } from './pages/doctor/ConsultationPage';
import { DoctorPrescriptionsList } from './pages/doctor/PrescriptionsList';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/Dashboard';
import { HospitalQueue } from './pages/hospital/Queue';
import { HospitalDoctorsList } from './pages/hospital/DoctorsList';
import { HospitalPatientsList } from './pages/hospital/PatientsList';
import { HospitalAppointmentsList } from './pages/hospital/AppointmentsList';

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  if (user?.role === 'HOSPITAL_ADMIN') return <Navigate to="/hospital/dashboard" replace />;

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Patient Portal */}
          <Route path="/patient" element={<PatientLayout />}>
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="doctors" element={<PatientDoctors />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="timeline" element={<PatientTimelinePage />} />
            <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
            <Route path="vitals" element={<PatientVitalsPage />} />
            <Route path="documents" element={<PatientDocumentsPage />} />
            <Route path="consents" element={<PatientConsentsPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
            <Route index element={<Navigate to="/patient/dashboard" replace />} />
          </Route>

          {/* Doctor Portal */}
          <Route path="/doctor" element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route path="queue" element={<DoctorPatientQueue />} />
            <Route path="patients" element={<DoctorPatientQueue />} />
            <Route path="patients/:id" element={<DoctorPatientDetail />} />
            <Route path="consultation/:appointmentId" element={<DoctorConsultationPage />} />
            <Route path="prescriptions" element={<DoctorPrescriptionsList />} />
            <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          </Route>

          {/* Hospital Admin Portal */}
          <Route path="/hospital" element={<HospitalLayout />}>
            <Route path="dashboard" element={<HospitalDashboard />} />
            <Route path="queue" element={<HospitalQueue />} />
            <Route path="doctors" element={<HospitalDoctorsList />} />
            <Route path="patients" element={<HospitalPatientsList />} />
            <Route path="appointments" element={<HospitalAppointmentsList />} />
            <Route index element={<Navigate to="/hospital/dashboard" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
