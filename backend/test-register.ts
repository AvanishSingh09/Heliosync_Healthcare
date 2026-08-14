async function testRegister() {
  const API_URL = 'http://localhost:5000/api';
  console.log('🧪 Testing User Registration on MongoDB...');

  const uniqueEmail = `testuser_${Date.now()}@heliosync.demo`;

  // 1. Test Patient Registration
  const patientRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Vikas Sharma',
      email: uniqueEmail,
      password: 'password123',
      phone: '+91 9988776655',
      role: 'PATIENT',
      gender: 'Male',
      bloodGroup: 'O+',
      dateOfBirth: '1995-06-20',
      allergies: 'None',
    }),
  });

  const patientData = await patientRes.json();
  console.log('✅ Patient Registration Response:', patientData);

  if (!patientRes.ok) {
    throw new Error(`Registration failed with status ${patientRes.status}`);
  }

  console.log('🎉 REGISTRATION WORKS 100% ON MONGODB!');
}

testRegister().catch((err) => {
  console.error('❌ Registration test error:', err);
});
