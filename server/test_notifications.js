const BASE_URL = 'http://127.0.0.1:5000/api';
let TOKEN = '';

async function req(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return { status: res.status, data };
    } catch (e) {
      return { status: res.status, data: text };
    }
  } catch (error) {
    console.error(`Error requesting ${endpoint}:`, error.message);
    return { status: 500, error: error.message };
  }
}

async function testNotifications() {
  console.log('🔔 Testing Notification APIs...\n');

  const loginRes = await req('POST', '/auth/login', {
    email: "test@example.com",
    password: "password123"
  });

  if (loginRes.status === 200) {
    TOKEN = loginRes.data.token;
    console.log('✅ Login Successful\n');
  } else {
    console.error('❌ Login Failed');
    process.exit(1);
  }

  const mockToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';

  console.log('--- Save Push Token ---');
  const saveToken = await req('POST', '/notifications/token', { pushToken: mockToken });
  console.log(saveToken.status === 200 ? '✅ Save Push Token Success' : '❌ Save Push Token Failed');

  console.log('\n--- Send Notification ---');
  const sendNotif = await req('POST', '/notifications/send', {
    pushToken: mockToken,
    title: 'Test Notification',
    body: 'This is a test message'
  });
  console.log(sendNotif.status === 200 ? '✅ Send Notification Success' : '❌ Send Notification Failed');

  console.log('\n--- Send Bulk Notifications ---');
  const sendBulk = await req('POST', '/notifications/send-bulk', {
    notifications: [
      { pushToken: mockToken, title: 'Bulk 1', body: 'Message 1' },
      { pushToken: mockToken, title: 'Bulk 2', body: 'Message 2' }
    ]
  });
  console.log(sendBulk.status === 200 ? '✅ Send Bulk Notifications Success' : '❌ Send Bulk Notifications Failed');

  console.log('\n✅ Notification Tests Completed');
  process.exit(0);
}

testNotifications();
