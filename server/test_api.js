
// import fetch from 'node-fetch'; // Just in case, but node 18+ has global fetch. 
// Actually, with node 20+, fetch is global. I will try global fetch.

const BASE_URL = 'http://127.0.0.1:5000/api';
let TOKEN = '';

// Helper for requests
async function req(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const options = {
    method,
    headers,
  };

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

async function runTests() {
  console.log('🚀 Starting API Tests...\n');

  // 1. LOGIN
  console.log('--- Auth ---');
  // Register (might fail if exists, which is fine)
  await req('POST', '/auth/register', {
    name: "Test User",
    email: "test@example.com",
    password: "password123"
  });
  
  const loginRes = await req('POST', '/auth/login', {
    email: "test@example.com",
    password: "password123"
  });
  
  if (loginRes.status === 200) {
    TOKEN = loginRes.data.token;
    console.log('✅ Login Successful');
  } else {
    console.error('❌ Login Failed:', loginRes.data);
    process.exit(1);
  }

  // 2. USER PROFILE
  console.log('\n--- User Profile ---');
  const updateProfile = await req('PUT', '/user/profile', {
    display_name: "Tester",
    height: 180,
    weight: 75,
    goals: ["Test Everything"]
  });
  console.log(updateProfile.status === 200 || updateProfile.status === 201 ? '✅ Profile Updated' : '❌ Profile Update Failed');
  
  const getProfile = await req('GET', '/user/profile');
  console.log(getProfile.status === 200 ? '✅ Get Profile Success' : '❌ Get Profile Failed');

  // 3. SETTINGS
  console.log('\n--- User Settings ---');
  const setSetting = await req('POST', '/user/settings', { key: 'notifications', value: true });
  console.log(setSetting.status === 201 || setSetting.status === 200 ? '✅ Setting Created/Updated' : '❌ Setting Failed');
  
  const getSettings = await req('GET', '/user/settings');
  console.log(getSettings.status === 200 && getSettings.data.length > 0 ? '✅ Get Settings Success' : '❌ Get Settings Failed');

  // 4. HEALTH DATA
  console.log('\n--- Health Data ---');
  const addHealth = await req('POST', '/user/health', {
    steps: 5000,
    water_intake: 1500
  });
  if (addHealth.status === 201) {
    console.log('✅ Add Health Log Success');
    const healthId = addHealth.data._id;
    
    const updateHealth = await req('PUT', `/user/health/${healthId}`, { steps: 6000 });
    if (updateHealth.status === 200) console.log('✅ Update Health Log Success');
    else console.log('❌ Update Health Log Failed', updateHealth.status, updateHealth.data);
    
    const delHealth = await req('DELETE', `/user/health/${healthId}`);
    if (delHealth.status === 200) console.log('✅ Delete Health Log Success');
    else console.log('❌ Delete Health Log Failed', delHealth.status, delHealth.data);
  } else {
    console.log('❌ Add Health Log Failed', addHealth.data);
  }

  // 5. MEALS
  console.log('\n--- Meals ---');
  const addPlan = await req('POST', '/meals/plans', {
    name: "Test Plan",
    meals: [{ type: "Breakfast", name: "Eggs" }]
  });
  
  if (addPlan.status === 201) {
    console.log('✅ Create Meal Plan Success');
    const planId = addPlan.data._id;
    
    const getPlan = await req('GET', `/meals/plans/${planId}`);
    console.log(getPlan.status === 200 ? '✅ Get Meal Plan Success' : '❌ Get Meal Plan Failed');

    const updatePlan = await req('PUT', `/meals/plans/${planId}`, { name: "Updated Plan" });
    if (updatePlan.status === 200) console.log('✅ Update Meal Plan Success');
    else console.log('❌ Update Meal Plan Failed', updatePlan.status, updatePlan.data);

    const delPlan = await req('DELETE', `/meals/plans/${planId}`);
    if (delPlan.status === 200) console.log('✅ Delete Meal Plan Success');
    else console.log('❌ Delete Meal Plan Failed', delPlan.status, delPlan.data);
  } else {
    console.log('❌ Create Meal Plan Failed');
  }

  // Recipes
  const addRecipe = await req('POST', '/meals/recipes', { name: "Test Recipe", calories: 500 });
  if (addRecipe.status === 201) {
    console.log('✅ Create Recipe Success');
    const recipeId = addRecipe.data._id;
    const delRecipe = await req('DELETE', `/meals/recipes/${recipeId}`);
    console.log(delRecipe.status === 200 ? '✅ Delete Recipe Success' : '❌ Delete Recipe Failed');
  }

  // 6. WORKOUTS
  console.log('\n--- Workouts ---');
  const addWorkout = await req('POST', '/workouts', { name: "Morning Run", duration: 30 });
  if (addWorkout.status === 201) {
    console.log('✅ Create Workout Success');
    const wId = addWorkout.data._id;
    const upWorkout = await req('PUT', `/workouts/${wId}`, { duration: 45 });
    console.log(upWorkout.status === 200 ? '✅ Update Workout Success' : '❌ Update Workout Failed');
    const delWorkout = await req('DELETE', `/workouts/${wId}`);
    console.log(delWorkout.status === 200 ? '✅ Delete Workout Success' : '❌ Delete Workout Failed');
  }

  // 7. CHAT
  console.log('\n--- Chat ---');
  const addSession = await req('POST', '/chat/sessions', { title: "Test Chat" });
  if (addSession.status === 201) {
    console.log('✅ Create Session Success');
    const sId = addSession.data._id;
    
    const sendMsg = await req('POST', `/chat/sessions/${sId}/messages`, { content: "Hello", role: "user" });
    console.log(sendMsg.status === 201 ? '✅ Send Message Success' : '❌ Send Message Failed');
    
    const getMsgs = await req('GET', `/chat/sessions/${sId}/messages`);
    console.log(getMsgs.status === 200 && getMsgs.data.length > 0 ? '✅ Get Messages Success' : '❌ Get Messages Failed');

    const delSession = await req('DELETE', `/chat/sessions/${sId}`);
    console.log(delSession.status === 200 ? '✅ Delete Session Success' : '❌ Delete Session Failed');
  }

  console.log('\n--- Tests Completed ---');
}

runTests();
