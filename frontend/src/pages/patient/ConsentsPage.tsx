import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consentService } from '../../services/consent';
import { Consent } from '../../types';
import { ConsentStatusCard } from '../../components/consent/ConsentStatusCard';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ShieldCheck, ShieldAlert, CheckCircle } from 'lucide-react';

export const PatientConsentsPage: React.FC = () => {
  const { user } = useAuth();
  const [consents, setConsents] = useState<Consent[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'GRANTED' | 'REVOKED' | 'EXPIRED'>('ALL');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const patientId = user?.patient?.id;

  const fetchConsents = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const res = await consentService.getConsents({ patientId });
      if (res.data) setConsents(res.data);
    } catch (err) {
      console.error('Failed to load consents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [patientId]);

  const handleRevoke = async (consentId: string) => {
    if (!window.confirm('Are you sure you want to revoke this doctor’s access to your medical records?')) {
      return;
    }

    setRevokingId(consentId);
    try {
      await consentService.revokeConsent(consentId);
      setToastMessage('Access consent successfully revoked. Doctor can no longer access these records.');
      setTimeout(() => setToastMessage(null), 5000);
      fetchConsents();
    } catch (err) {
      console.error('Failed to revoke consent', err);
    } finally {
      setRevokingId(null);
    }
  };

  const filteredConsents =
    filter === 'ALL' ? consents : consents.filter((c) => c.status === filter);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-elevated flex items-center gap-3 fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Patient-Governed Access Consents
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            You hold total sovereignty over your health data. Grant or revoke record viewing permissions in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Access Enforcement Active</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Permissions' },
          { id: 'GRANTED', label: 'Active Grants' },
          { id: 'REVOKED', label: 'Revoked' },
          { id: 'EXPIRED', label: 'Expired' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              filter === tab.id
                ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consents List */}
      {isLoading ? (
        <LoadingState message="Verifying active medical consents..." />
      ) : filteredConsents.length > 0 ? (
        <div className="space-y-4">
          {filteredConsents.map((consent) => (
            <ConsentStatusCard
              key={consent.id}
              consent={consent}
              onRevoke={handleRevoke}
              isRevoking={revokingId === consent.id}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8" />}
          title="No consent records found"
          description="When you book appointments with specialists, your granted permissions will be tracked here."
        />
      )}
    </div>
  );
};
