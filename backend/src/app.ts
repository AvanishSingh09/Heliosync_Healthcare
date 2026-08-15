import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import patientRoutes from './routes/patient.routes';
import doctorRoutes from './routes/doctor.routes';
import hospitalRoutes from './routes/hospital.routes';
import appointmentRoutes from './routes/appointment.routes';
import encounterRoutes from './routes/encounter.routes';
import vitalsRoutes from './routes/vitals.routes';
import prescriptionRoutes from './routes/prescription.routes';
import documentRoutes from './routes/document.routes';
import consentRoutes from './routes/consent.routes';
import auditRoutes from './routes/audit.routes';

const app = express();

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Heliosync Healthcare Platform API Server',
    health: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Heliosync Healthcare Platform API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/encounters', encounterRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/audits', auditRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
