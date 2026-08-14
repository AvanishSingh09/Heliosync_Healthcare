import React from 'react';
import { Consent } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldCheck, ShieldAlert, Clock, Check, X, Ban } from 'lucide-react';

interface ConsentStatusCardProps {
  consent: Consent;
  onRevoke?: (consentId: string) => void;
  isRevoking?: boolean;
}

export const ConsentStatusCard: React.FC<ConsentStatusCardProps> = ({
  consent,
  onRevoke,
  isRevoking = false,
}) => {
  const isGranted = consent.status === 'GRANTED';
  const isRevoked = consent.status === 'REVOKED';
  const isExpired = consent.status === 'EXPIRED';

  const getStatusBadge = () => {
    if (isGranted) return <Badge variant="success">Active Consent</Badge>;
    if (isRevoked) return <Badge variant="danger">Revoked</Badge>;
    if (isExpired) return <Badge variant="warning">Expired</Badge>;
    return <Badge variant="neutral">{consent.status}</Badge>;
  };

  return (
    <Card className="border border-slate-200/80 shadow-subtle hover:border-slate-300 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isGranted ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isGranted ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              {consent.doctor?.user.name || 'Healthcare Practitioner'}
            </h4>
            <p className="text-xs text-slate-500">
              {consent.doctor?.specialization} • {consent.doctor?.hospital?.name || 'ABC Hospital'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">{getStatusBadge()}</div>
      </div>

      <div className="py-3.5 space-y-3">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Purpose: </span>
          <span>{consent.purpose}</span>
        </div>

        {/* Permissions Grid */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Authorized Medical Record Scope:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium ${
                consent.canViewHistory ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
              }`}
            >
              {consent.canViewHistory ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
              <span>Consultations</span>
            </div>

            <div
              className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium ${
                consent.canViewVitals ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
              }`}
            >
              {consent.canViewVitals ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
              <span>Vitals</span>
            </div>

            <div
              className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium ${
                consent.canViewPrescriptions
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'bg-slate-100 text-slate-400 line-through'
              }`}
            >
              {consent.canViewPrescriptions ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>Prescriptions</span>
            </div>

            <div
              className={`flex items-center gap-1.5 p-2 rounded-lg text-xs font-medium ${
                consent.canViewReports ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
              }`}
            >
              {consent.canViewReports ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5" />}
              <span>Lab Reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {consent.expiresAt
              ? `Expires on: ${new Date(consent.expiresAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}`
              : 'Granted with no expiry'}
          </span>
        </div>

        {isGranted && onRevoke && (
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
            onClick={() => onRevoke(consent.id)}
            isLoading={isRevoking}
            leftIcon={<Ban className="w-3.5 h-3.5" />}
          >
            Revoke Access
          </Button>
        )}
      </div>
    </Card>
  );
};
