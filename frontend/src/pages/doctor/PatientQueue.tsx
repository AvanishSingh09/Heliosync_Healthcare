import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctors';
import { Appointment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Clock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorPatientQueue: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const doctorId = user?.doctor?.id;

  const fetchQueue = async () => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await doctorService.getDoctorAppointments(doctorId, todayStr);
      if (res.data) {
        setAppointments(
          res.data.filter((a) => a.status === 'CONFIRMED' || a.status === 'IN_QUEUE')
        );
      }
    } catch (err) {
      console.error('Failed to load queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [doctorId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Active Patient Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time waiting queue for today's OPD consultation.
        </p>
      </div>

      {isLoading ? (
        <LoadingState message="Checking waiting queue..." />
      ) : appointments.length > 0 ? (
        <div className="space-y-3">
          {appointments.map((appt, idx) => (
            <Card
              key={appt.id}
              className="border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-sm flex items-center justify-center border border-amber-200">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{appt.patient?.user?.name}</h4>
                    <Badge variant="warning" size="sm">
                      Waiting
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {appt.patient?.gender} • Blood Group: {appt.patient?.bloodGroup} • Reason:{' '}
                    {appt.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {appt.appointmentTime}
                </span>
                <Button
                  variant="teal"
                  size="sm"
                  onClick={() => navigate(`/doctor/consultation/${appt.id}`)}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Call Patient
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No waiting patients in queue"
          description="All patients for today have either been consulted or are yet to check in."
        />
      )}
    </div>
  );
};
