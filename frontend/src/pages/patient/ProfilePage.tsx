import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patients';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { User, Phone, MapPin, Heart, Shield, CheckCircle } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const patient = user?.patient;

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || patient?.phone || '');
  const [gender, setGender] = useState(patient?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(patient?.bloodGroup || 'B+');
  const [address, setAddress] = useState(patient?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(patient?.emergencyContact || '');
  const [allergies, setAllergies] = useState(patient?.allergies || '');

  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient?.id) return;
    setIsLoading(true);
    setSavedSuccess(false);

    try {
      await patientService.updatePatient(patient.id, {
        name,
        phone,
        gender,
        bloodGroup,
        address,
        emergencyContact,
        allergies,
      });

      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
          Patient Demographic Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal identifiers, emergency contacts, and known clinical allergies.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-elevated flex items-center gap-3 fade-in">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      <Card className="border border-slate-200/80 shadow-subtle p-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Header Profile Badge */}
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-black shadow-sm">
              {name.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{name}</h3>
              <p className="text-xs text-slate-500">
                Patient Number: <strong className="text-slate-800">{patient?.patientNumber}</strong>
              </p>
              <p className="text-[11px] text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Gender"
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' },
              ]}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
            <Select
              label="Blood Group"
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
              ]}
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
            />
          </div>

          <Input
            label="Home Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Emergency Contact & Relationship"
              placeholder="e.g. Sunita Kumar (Mother) - +91 98765 43219"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
            <Input
              label="Known Allergies"
              placeholder="e.g. Penicillin, Sulfa drugs, None"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
