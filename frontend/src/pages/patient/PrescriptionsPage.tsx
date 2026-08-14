import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { Prescription } from '../../types';
import { PrescriptionCard } from '../../components/medical/PrescriptionCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { FileText, Pill } from 'lucide-react';

export const PatientPrescriptionsPage: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const patientId = user?.patient?.id;

  useEffect(() => {
    if (!patientId) return;

    const fetchPrescriptions = async () => {
      setIsLoading(true);
      try {
        const res = await patientService.getPrescriptions(patientId);
        if (res.data) setPrescriptions(res.data);
      } catch (err) {
        console.error('Failed to load prescriptions', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Prescriptions & Medications
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed medication histories, prescribed dosages, frequencies, and doctor clinical instructions.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your digital prescriptions..." />
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} prescription={rx} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No prescriptions found"
          description="Your doctor's issued prescriptions will be stored and organized here."
        />
      )}
    </div>
  );
};
