import React, { useEffect, useState } from 'react';
import { hospitalService, HospitalStats } from '../../services/hospitals';
import { appointmentService } from '../../services/appointments';
import { Appointment, Hospital } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Stethoscope,
  ArrowRight,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export const HospitalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHospitalOverview = async () => {
      setIsLoading(true);
      try {
        const hospListRes = await hospitalService.getHospitals();
        if (hospListRes.data && hospListRes.data.length > 0) {
          const mainHosp = hospListRes.data[0];
          setHospital(mainHosp);

          const [statsRes, apptsRes] = await Promise.all([
            hospitalService.getHospitalStats(mainHosp.id),
            appointmentService.getAppointments({
              hospitalId: mainHosp.id,
              date: new Date().toISOString().split('T')[0],
            }),
          ]);

          if (statsRes.data) setStats(statsRes.data);
          if (apptsRes.data) setTodayAppointments(apptsRes.data);
        }
      } catch (err) {
        console.error('Failed to load hospital dashboard', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHospitalOverview();
  }, []);

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await appointmentService.checkIn(appointmentId);
      // Reload
      if (hospital) {
        const apptsRes = await appointmentService.getAppointments({
          hospitalId: hospital.id,
          date: new Date().toISOString().split('T')[0],
        });
        if (apptsRes.data) setTodayAppointments(apptsRes.data);
      }
    } catch (err) {
      console.error('Check-in failed', err);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading hospital administrative overview..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              {hospital?.name || 'ABC Multispeciality Hospital'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {hospital?.address}, {hospital?.city} • Reg: {hospital?.registrationNumber}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/hospital/queue">
            <Button variant="primary" size="md" leftIcon={<Clock className="w-4 h-4" />}>
              Live Token Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Hospital Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">Today's Visits</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {stats?.todayAppointments || todayAppointments.length}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Scheduled</span>
        </Card>

        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">Active Doctors</span>
          <p className="text-xl font-black text-sky-600 mt-1">{stats?.activeDoctors || 4}</p>
          <span className="text-[10px] text-slate-400 font-medium">On duty</span>
        </Card>

        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">In Waiting Queue</span>
          <p className="text-xl font-black text-amber-600 mt-1">
            {stats?.waitingPatients ||
              todayAppointments.filter((a) => a.status === 'IN_QUEUE').length}
          </p>
          <span className="text-[10px] text-amber-700 font-medium">Token active</span>
        </Card>

        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">Completed Consults</span>
          <p className="text-xl font-black text-emerald-600 mt-1">
            {stats?.completedConsultations ||
              todayAppointments.filter((a) => a.status === 'COMPLETED').length}
          </p>
          <span className="text-[10px] text-emerald-700 font-medium">Discharged</span>
        </Card>

        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">Total Patients</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {stats?.totalRegisteredPatients || 3}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Registered</span>
        </Card>

        <Card className="border border-slate-200/80 p-3.5">
          <span className="text-[11px] font-semibold text-slate-500">Est. Revenue</span>
          <p className="text-xl font-black text-indigo-600 mt-1">
            ₹{(stats?.estimatedRevenue || 1600).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 font-medium">OPD fees</span>
        </Card>
      </div>

      {/* Today's Queue Table */}
      <Card className="border border-slate-200/80 p-0 overflow-hidden shadow-subtle">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's OPD Patient Queue</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Reception check-in desk and patient token tracking
            </p>
          </div>
          <Badge variant="brand" size="sm">
            Live Updates
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100 tracking-wider">
              <tr>
                <th className="py-3 px-4">Token #</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Consulting Doctor</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {todayAppointments.map((appt, idx) => {
                const isConfirmed = appt.status === 'CONFIRMED';
                const isWaiting = appt.status === 'IN_QUEUE';
                const isCompleted = appt.status === 'COMPLETED';

                return (
                  <tr key={appt.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-slate-700">
                        #{101 + idx}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {appt.patient?.user?.name}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {appt.patient?.patientNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {appt.doctor?.user?.name}
                      <span className="block text-[10px] text-brand-700 font-semibold">
                        {appt.doctor?.specialization}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{appt.appointmentTime}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600">{appt.reason}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          isCompleted ? 'success' : isWaiting ? 'warning' : isConfirmed ? 'brand' : 'neutral'
                        }
                        size="sm"
                      >
                        {appt.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isConfirmed && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCheckIn(appt.id)}
                        >
                          Check-In Patient
                        </Button>
                      )}
                      {isWaiting && (
                        <span className="text-[11px] font-bold text-amber-600">In Queue</span>
                      )}
                      {isCompleted && (
                        <span className="text-[11px] font-bold text-emerald-600">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
