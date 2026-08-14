import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { HeartPulse, Mail, Lock, User, Phone, Stethoscope } from 'lucide-react';

export const Register: React.FC = () => {
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient fields
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [dateOfBirth, setDateOfBirth] = useState('1998-05-15');
  const [allergies, setAllergies] = useState('None');

  // Doctor fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [consultationFee, setConsultationFee] = useState('800');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        role,
      };

      if (role === 'PATIENT') {
        payload.gender = gender;
        payload.bloodGroup = bloodGroup;
        payload.dateOfBirth = dateOfBirth;
        payload.allergies = allergies;
      } else {
        payload.specialization = specialization;
        payload.qualification = qualification;
        payload.consultationFee = parseFloat(consultationFee);
      }

      const res = await authService.register(payload);
      if (res.data) {
        login(res.data.token, res.data.user);
        if (res.data.user.role === 'PATIENT') {
          navigate('/patient/dashboard');
        } else {
          navigate('/doctor/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 text-white shadow-sm mb-3">
          <HeartPulse className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Join Heliosync</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Create your patient profile or practitioner account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <Card className="border border-slate-200 shadow-elevated p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Role Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'PATIENT' ? 'bg-white text-brand-700 shadow-subtle' : 'text-slate-500'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Patient Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                role === 'DOCTOR' ? 'bg-white text-sky-700 shadow-subtle' : 'text-slate-500'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Account</span>
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              placeholder={role === 'PATIENT' ? 'e.g. Rahul Kumar' : 'e.g. Dr. Ankit Sharma'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {role === 'PATIENT' ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                  <Input
                    label="Known Allergies"
                    placeholder="e.g. Penicillin, None"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Specialization"
                    placeholder="e.g. Cardiology"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                  />
                  <Input
                    label="Qualification"
                    placeholder="e.g. MBBS, MD"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  placeholder="800"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold mt-2"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
