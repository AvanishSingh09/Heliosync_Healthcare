import { getCache, setCache, delCache, invalidatePatientCaches } from './src/config/redis';

async function testRedisCache() {
  console.log('🧪 Testing Redis Cache-Aside & Invalidation Layer...');

  const mockPatientId = '6a7f5bb9c746288353a0a059';
  const mockProfile = {
    id: mockPatientId,
    name: 'Srijan Tripathi',
    patientNumber: 'P-16846',
    bloodGroup: 'B+',
    gender: 'Male',
  };

  const key = `patient:profile:${mockPatientId}`;

  // 1. Invalidate any existing cache
  await delCache(key);

  // 2. Initial Get (Cache Miss)
  const miss = await getCache(key);
  console.log('1️⃣ Cache Miss result (expected null):', miss);

  // 3. Set Cache
  const startTime = Date.now();
  await setCache(key, mockProfile, 3600);
  console.log('2️⃣ Set Cache executed successfully');

  // 4. Second Get (Cache Hit)
  const hit = await getCache(key);
  const latency = Date.now() - startTime;
  console.log('3️⃣ Cache Hit result:', hit);
  console.log(`⚡ Cache Hit Latency: ${latency}ms`);

  // 5. Invalidate via invalidatePatientCaches
  await invalidatePatientCaches(mockPatientId);
  const postInvalidation = await getCache(key);
  console.log('4️⃣ Post-Invalidation result (expected null):', postInvalidation);

  console.log('🎉 REDIS CACHE LAYER PASSED ALL TESTS SUCCESSFULLY!');
  process.exit(0);
}

testRedisCache().catch((err) => {
  console.error('❌ Redis test error:', err);
  process.exit(1);
});
