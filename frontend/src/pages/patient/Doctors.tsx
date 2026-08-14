import React, { useEffect, useState } from 'react';
import { doctorService } from '../../services/doctors';
import { Doctor } from '../../types';
import { DoctorCard } from '../../components/appointments/DoctorCard';
import { BookingModal } from '../../components/appointments/BookingModal';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Filter, Stethoscope, CheckCircle } from 'lucide-react';

export const PatientDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('ALL');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const specialties = [
    'ALL',
    'Cardiology',
    'Neurology',
    'General Medicine',
    'Dermatology',
  ];

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const res = await doctorService.getDoctors({
        search: search || undefined,
        specialization: specialty === 'ALL' ? undefined : specialty,
      });
      if (res.data) setDoctors(res.data);
    } catch (err) {
      console.error('Failed to load doctors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    setSuccessToast(
      `Appointment booked successfully with ${selectedDoctor?.user?.name}! Consent has been granted.`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-elevated flex items-center gap-3 fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Search */}
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Find Healthcare Specialists
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search qualified doctors, choose consultation slots, and configure your health record access consent.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-subtle"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {specialties.map((spec) => {
            const isActive = specialty === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => setSpecialty(spec)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      {isLoading ? (
        <LoadingState message="Discovering clinical doctors..." />
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} onBook={handleOpenBooking} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Stethoscope className="w-8 h-8" />}
          title="No doctors found"
          description="Try changing your search query or specialty filter."
        />
      )}

      {/* Booking & Consent Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctor={selectedDoctor}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
};
