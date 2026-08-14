import React, { useEffect, useState } from 'react';
import { patientService } from '../../services/patients';
import { Patient } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { User, Phone, Search } from 'lucide-react';

export const HospitalPatientsList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await patientService.getPatients({ search: search || undefined });
      if (res.data) setPatients(res.data);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Patient Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centrally registered patient records, identifiers, and demographics.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
          />
        </form>
      </div>

      {isLoading ? (
        <LoadingState message="Loading patient registry..." />
      ) : (
        <Card className="border border-slate-200 p-0 overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Gender / Blood Group</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Allergies</th>
                  <th className="py-3 px-4">Consultations Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-brand-700">{p.patientNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{p.user?.name}</td>
                    <td className="py-3 px-4">
                      {p.gender} • <Badge variant="neutral">{p.bloodGroup || 'N/A'}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      {p.phone || 'N/A'}
                      <span className="block text-[10px] text-slate-400">{p.user?.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          p.allergies && p.allergies !== 'None'
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-500'
                        }
                      >
                        {p.allergies || 'None'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {p._count?.encounters || 0} visits
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
