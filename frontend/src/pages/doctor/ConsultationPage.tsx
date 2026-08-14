import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointments';
import { doctorService } from '../../services/doctors';
import { Appointment } from '../../types';
import { ConsultationWorkspace } from '../../components/medical/ConsultationWorkspace';
import { LoadingState } from '../../components/ui/LoadingState';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';

export const DoctorConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [authorizedData, setAuthorizedData] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const loadWorkspace = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const apptRes = await appointmentService.getAppointmentById(appointmentId);
        if (apptRes.data) {
          setAppointment(apptRes.data);
          // Query patient records under consent
          try {
            const authRes = await doctorService.getAuthorizedPatientRecords(apptRes.data.patientId);
            if (authRes.data) {
              setAuthorizedData(authRes.data);
            }
          } catch (consentErr) {
            console.warn('Consent restricted or filtered', consentErr);
          }
        }
      } catch (err: any) {
        console.error('Failed to load consultation workspace', err);
        setError(err.response?.data?.message || 'Failed to load consultation workspace');
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
  }, [appointmentId]);

  const handleConsultationSuccess = () => {
    setIsCompleted(true);
  };

  if (isLoading) {
    return <LoadingState message="Setting up clinical workspace & verifying consent..." />;
  }

  if (error || !appointment) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-semibold">
          {error || 'Appointment record not found'}
        </div>
        <Button variant="outline" size="md" onClick={() => navigate('/doctor/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-5 fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Consultation Completed!</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Clinical encounter finalized, vitals recorded, and digital prescription issued to{' '}
            <strong className="text-slate-800">{appointment.patient?.user?.name}</strong>.
            The patient’s longitudinal medical timeline has been updated.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => navigate('/doctor/dashboard')}>
            Back to Doctor Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/doctor/dashboard')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Exit Workspace
        </Button>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Patient Consent Session</span>
        </div>
      </div>

      <ConsultationWorkspace
        appointment={appointment}
        authorizedData={authorizedData}
        activeConsent={authorizedData?.activeConsent}
        onCompleted={handleConsultationSuccess}
      />
    </div>
  );
};
