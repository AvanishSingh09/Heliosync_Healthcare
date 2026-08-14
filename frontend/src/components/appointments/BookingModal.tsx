import React, { useState } from 'react';
import { Doctor } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Check,
  Lock,
  Layers,
  Activity,
  FileText,
  FolderOpen,
} from 'lucide-react';
import { appointmentService } from '../../services/appointments';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
  onSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('10:30 AM');
  const [reason, setReason] = useState<string>('Hypertension and routine checkup follow-up');
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Slot & Reason, Step 2: Consent
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [scopes, setScopes] = useState({
    canViewHistory: true,
    canViewVitals: true,
    canViewPrescriptions: true,
    canViewReports: true,
    durationDays: 30,
  });

  const slots = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
  ];

  const handleNextToConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedDate) {
      setError('Please choose a date and slot');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (!doctor) return;
    setIsLoading(true);
    setError(null);

    try {
      await appointmentService.createAppointment({
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        reason,
        consentScopes: scopes,
      });

      onSuccess();
      onClose();
      // Reset
      setStep(1);
    } catch (err: any) {
      console.error('Booking failed', err);
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  if (!doctor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(1);
        onClose();
      }}
      title={step === 1 ? 'Book Doctor Appointment' : 'Configure Health Record Access'}
      description={
        step === 1
          ? `Schedule consultation with ${doctor.user.name}`
          : 'Choose which historical records Dr. Sharma can access during consultation'
      }
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNextToConsent} className="space-y-4">
          {/* Doctor Brief */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
              {doctor.profilePhoto ? (
                <img src={doctor.profilePhoto} alt={doctor.user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                  {doctor.user.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{doctor.user.name}</h4>
              <p className="text-[11px] text-brand-700 font-semibold">{doctor.specialization}</p>
              <p className="text-[11px] text-slate-500">
                {doctor.hospital?.name} • Fee: ₹{doctor.consultationFee}
              </p>
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Consultation Date
            </label>
            <div className="relative">
              <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="block w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Available Slots */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Select Available Slot
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for visit */}
          <div>
            <Input
              label="Reason for Visit / Chief Symptoms"
              placeholder="e.g. Blood pressure review, palpitations, routine checkup"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Proceed to Consent Access →
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Consent Step */}
          <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900">
            <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
            <span>
              Your health data is private. Select which parts of your medical history you want to share with Dr. Sharma for this consultation.
            </span>
          </div>

          <div className="space-y-2">
            {/* History */}
            <div
              onClick={() => setScopes((s) => ({ ...s, canViewHistory: !s.canViewHistory }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewHistory
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Previous Consultations</p>
                  <p className="text-[11px] text-slate-500">Past doctor visits, diagnoses, and encounter notes</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  scopes.canViewHistory ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {scopes.canViewHistory && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Vitals */}
            <div
              onClick={() => setScopes((s) => ({ ...s, canViewVitals: !s.canViewVitals }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewVitals
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-sky-700" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Vitals & Biomarkers</p>
                  <p className="text-[11px] text-slate-500">Blood pressure, heart rate, oxygen & temperature history</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  scopes.canViewVitals ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {scopes.canViewVitals && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Prescriptions */}
            <div
              onClick={() =>
                setScopes((s) => ({ ...s, canViewPrescriptions: !s.canViewPrescriptions }))
              }
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewPrescriptions
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-indigo-700" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Prescriptions & Active Meds</p>
                  <p className="text-[11px] text-slate-500">Prescription histories, dosages, and instructions</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  scopes.canViewPrescriptions ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {scopes.canViewPrescriptions && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Reports */}
            <div
              onClick={() => setScopes((s) => ({ ...s, canViewReports: !s.canViewReports }))}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                scopes.canViewReports
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-white border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-4 h-4 text-amber-700" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Lab Reports & Scans</p>
                  <p className="text-[11px] text-slate-500">CBC blood panel, ECG recordings, and uploaded PDFs</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  scopes.canViewReports ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                }`}
              >
                {scopes.canViewReports && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <Button variant="outline" size="md" onClick={() => setStep(1)} disabled={isLoading}>
              ← Back to Details
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmBooking}
              isLoading={isLoading}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Confirm Appointment & Grant Consent
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
