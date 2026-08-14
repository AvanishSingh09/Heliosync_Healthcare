async function testSrijan() {
  const API_URL = 'http://localhost:5000/api';
  console.log('🧪 Testing registration for Srijan Tripathi...');

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Srijan Tripathi',
      email: 'srijantripathi55@gmail.com',
      password: 'password123',
      phone: '+91 63970 40255',
      role: 'PATIENT',
      gender: 'Male',
      bloodGroup: 'B+',
      dateOfBirth: '1998-05-15',
      allergies: 'None',
    }),
  });

  const data = await res.json();
  console.log('✅ Registration Result:', data);
}

testSrijan().catch(console.error);
