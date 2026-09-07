const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const testApis = async () => {
  console.log('🚀 Starting API Verification Tests...');

  try {
    // 1. Check Healthcheck
    const healthRes = await fetch(`http://localhost:${PORT}/`);
    const healthJson = await healthRes.json();
    console.log('✅ Healthcheck status:', healthRes.status, healthJson);

    // 2. Register Test User
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Integration Tester',
        email: `test-${Date.now()}@test.com`,
        password: 'password123',
      }),
    });
    
    if (regRes.status !== 201) {
      throw new Error(`Register failed with status: ${regRes.status}`);
    }
    const userJson = await regRes.json();
    console.log('✅ User Registration passed:', userJson._id, userJson.email);
    const token = userJson.token;

    // 3. Login User
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userJson.email,
        password: 'password123',
      }),
    });
    
    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status: ${loginRes.status}`);
    }
    const loginJson = await loginRes.json();
    console.log('✅ User Login passed. JWT received:', !!loginJson.token);

    // 4. Place service booking
    const bookRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Integration Tester',
        phone: '123456789',
        email: userJson.email,
        address: 'Test Street, Mirgunj',
        serviceType: 'RO Service',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        language: 'en',
      }),
    });

    if (bookRes.status !== 201) {
      const errorText = await bookRes.text();
      throw new Error(`Booking creation failed: ${bookRes.status} - ${errorText}`);
    }
    const bookJson = await bookRes.json();
    console.log('✅ Booking placement passed. Booking ID:', bookJson._id);

    // 5. Fetch My Bookings
    const myBookingsRes = await fetch(`${BASE_URL}/bookings/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const myBookingsJson = await myBookingsRes.json();
    console.log(`✅ Fetch My Bookings passed. Customer has ${myBookingsJson.length} bookings.`);

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    process.exit(1);
  }
};

// Wait 2 seconds to make sure server starts, then run tests
setTimeout(testApis, 2000);
