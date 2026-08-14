import React, { useEffect, useState } from 'react';
import { appointmentService } from '../../services/appointments';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { Clock, User, CheckCircle2 } from 'lucide-react';

export const HospitalQueue: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await appointmentService.getAppointments({ date: todayStr });
      if (res.data) setAppointments(res.data);
    } catch (err) {
      console.error('Failed to load queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCheckIn = async (id: string) => {
    try {
      await appointmentService.checkIn(id);
      fetchQueue();
    } catch (err) {
      console.error('Check in failed', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Hospital Token Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Live token issuance and status management for outpatient departments.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Loading live queue..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {appointments.map((appt, idx) => (
            <Card key={appt.id} className="border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-slate-900 px-3 py-1 bg-brand-50 text-brand-700 rounded-xl">
                  Token #{101 + idx}
                </span>
                <Badge
                  variant={
                    appt.status === 'COMPLETED'
                      ? 'success'
                      : appt.status === 'IN_QUEUE'
                      ? 'warning'
                      : 'brand'
                  }
                >
                  {appt.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">{appt.patient?.user?.name}</h4>
                <p className="text-xs text-slate-500">
                  Doctor: <strong className="text-slate-700">{appt.doctor?.user?.name}</strong> (
                  {appt.doctor?.specialization})
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Slot: {appt.appointmentTime}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                {appt.status === 'CONFIRMED' && (
                  <Button variant="primary" size="sm" onClick={() => handleCheckIn(appt.id)}>
                    Check-In Patient
                  </Button>
                )}
                {appt.status === 'IN_QUEUE' && (
                  <span className="text-xs font-bold text-amber-600">Waiting for Doctor</span>
                )}
                {appt.status === 'COMPLETED' && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Discharged
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
