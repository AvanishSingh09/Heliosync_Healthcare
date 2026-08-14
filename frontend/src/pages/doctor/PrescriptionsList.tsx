import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { doctorService } from '../../services/doctors';
import { Prescription } from '../../types';
import { PrescriptionCard } from '../../components/medical/PrescriptionCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText } from 'lucide-react';

export const DoctorPrescriptionsList: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For doctor, let's load prescriptions from today's / recent appointments
  const doctorId = user?.doctor?.id;

  useEffect(() => {
    if (!doctorId) return;

    const fetchPrescriptions = async () => {
      setIsLoading(true);
      try {
        const apptsRes = await doctorService.getDoctorAppointments(doctorId);
        if (apptsRes.data) {
          const rxList: Prescription[] = [];
          apptsRes.data.forEach((a) => {
            if (a.encounter?.prescriptions) {
              rxList.push(...a.encounter.prescriptions);
            }
          });
          setPrescriptions(rxList);
        }
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [doctorId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Prescription Orders
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review digital prescriptions and clinical medication regimens issued to your patients.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading issued prescriptions..." />
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} prescription={rx} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No recent prescriptions"
          description="Issued prescriptions during your consultations will be recorded here."
        />
      )}
    </div>
  );
};
