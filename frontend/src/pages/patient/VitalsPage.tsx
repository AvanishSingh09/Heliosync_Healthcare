import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { Vitals } from '../../types';
import { VitalsCard } from '../../components/medical/VitalsCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { Activity, Heart, Thermometer, Wind, Weight } from 'lucide-react';

export const PatientVitalsPage: React.FC = () => {
  const { user } = useAuth();
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const patientId = user?.patient?.id;

  useEffect(() => {
    if (!patientId) return;

    const fetchVitals = async () => {
      setIsLoading(true);
      try {
        const res = await patientService.getVitals(patientId);
        if (res.data) setVitals(res.data);
      } catch (err) {
        console.error('Failed to load vitals', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVitals();
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Vitals & Biomarkers
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of your blood pressure, heart rate, temperature, oxygen saturation, and body weight.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading your biomarker records..." />
      ) : vitals.length > 0 ? (
        <div className="space-y-4">
          {vitals.map((v) => (
            <VitalsCard key={v.id} vitals={v} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Activity className="w-8 h-8" />}
          title="No vitals recorded"
          description="Vitals recorded during your consultations or at home will be logged here."
        />
      )}
    </div>
  );
};
