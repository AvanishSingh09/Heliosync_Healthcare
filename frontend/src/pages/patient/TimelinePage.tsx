import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { TimelineEvent } from '../../types';
import { Timeline } from '../../components/medical/Timeline';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Layers, ShieldCheck, Filter } from 'lucide-react';

export const PatientTimelinePage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const patientId = user?.patient?.id;

  useEffect(() => {
    if (!patientId) return;

    const fetchTimeline = async () => {
      setIsLoading(true);
      try {
        const res = await patientService.getTimeline(patientId);
        if (res.data) setEvents(res.data);
      } catch (err) {
        console.error('Failed to load timeline', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeline();
  }, [patientId]);

  const filteredEvents =
    filterType === 'ALL' ? events : events.filter((e) => e.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Longitudinal Medical Timeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Chronological aggregated health ledger containing consultations, vitals, prescriptions, and lab reports.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Patient-Controlled Record</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Records' },
          { id: 'ENCOUNTER', label: 'Consultations' },
          { id: 'PRESCRIPTION', label: 'Prescriptions' },
          { id: 'VITALS', label: 'Vitals & Biomarkers' },
          { id: 'DOCUMENT', label: 'Lab Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filterType === tab.id
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      {isLoading ? (
        <LoadingState message="Aggregating your chronological medical timeline..." />
      ) : filteredEvents.length > 0 ? (
        <Timeline events={filteredEvents} />
      ) : (
        <EmptyState
          icon={<Layers className="w-8 h-8" />}
          title="No timeline events found"
          description="Your medical encounters and prescriptions will be aggregated here in real time."
        />
      )}
    </div>
  );
};
