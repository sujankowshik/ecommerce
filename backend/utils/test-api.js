import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 5005; // Use a dedicated test port
const BASE_URL = `http://localhost:${PORT}/api`;
const TEST_MONGO_URI = 'mongodb://localhost:27017/ecommerce-test';

console.log('==================================================');
console.log('  E-COMMERCE API INTEGRATION TEST ENVIRONMENT    ');
console.log('==================================================\n');

let serverProcess = null;
let userToken = '';
let adminToken = '';

const runTests = async () => {
  try {
    console.log('Initializing test request verifications...');
    await new Promise((resolve) => setTimeout(resolve, 1500)); // short delay for MongoDB linkage

    let pass = true;

    // --- TEST 1: Health Check ---
    console.log('\n[Test 1] Verifying System Health Route...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.status === 'healthy') {
      console.log('✅ PASS: API health endpoint active.');
    } else {
      console.log('❌ FAIL: API health query did not respond correctly.');
      pass = false;
    }

    // --- TEST 2: Protected Lockout ---
    console.log('\n[Test 2] Verifying Auth Guard Lockouts (No token)...');
    const protectRes = await fetch(`${BASE_URL}/wishlist`);
    if (protectRes.status === 401) {
      console.log('✅ PASS: Unauthenticated access blocked (401).');
    } else {
      console.log('❌ FAIL: Wishlist allowed access without JWT token.');
      pass = false;
    }

    // --- TEST 3: Admin Login & Registration ---
    console.log('\n[Test 3] Simulating Firebase Administrator Login (First System SignUp)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock-admin-token' })
    });
    const adminData = await adminLoginRes.json();
    if (adminLoginRes.ok && adminData.role === 'admin') {
      adminToken = adminData.token;
      console.log('✅ PASS: Admin session validated with "admin" role.');
    } else {
      console.log(`❌ FAIL: Admin registration failed. Status: ${adminLoginRes.status}`);
      pass = false;
    }

    // --- TEST 4: User Signup & Login ---
    console.log('\n[Test 4] Simulating Firebase Customer Login Verification (Second System SignUp)...');
    const userLoginRes = await fetch(`${BASE_URL}/auth/firebase-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: 'mock-user-token' })
    });
    const userData = await userLoginRes.json();
    if (userLoginRes.ok && userData.token) {
      userToken = userData.token;
      if (userData.role === 'user') {
        console.log(`✅ PASS: JWT issued for user. Role: ${userData.role}`);
      } else {
        console.log(`❌ FAIL: Second user role expected "user", got "${userData.role}".`);
        pass = false;
      }
    } else {
      console.log('❌ FAIL: Firebase Login failed.');
      pass = false;
    }

    // --- TEST 5: Authorized Route Access ---
    console.log('\n[Test 5] Verifying Wishlist Access with User JWT...');
    const wishlistRes = await fetch(`${BASE_URL}/wishlist`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (wishlistRes.ok) {
      console.log('✅ PASS: User authorized to fetch wishlist.');
    } else {
      console.log('❌ FAIL: Blocked from fetching wishlist with valid JWT.');
      pass = false;
    }

    // --- TEST 6: Admin Panel Lockout ---
    console.log('\n[Test 6] Verifying Admin-Only Block on standard User JWT...');
    const adminBlockRes = await fetch(`${BASE_URL}/analytics`, {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    if (adminBlockRes.status === 403) {
      console.log('✅ PASS: Standard user blocked from Admin analytics (403).');
    } else {
      console.log('❌ FAIL: Standard user accessed Admin analytics route.');
      pass = false;
    }

    // --- TEST 7: Admin Panel Validation ---
    console.log('\n[Test 7] Verifying Admin Dashboard Analytics Query...');
    const analyticsRes = await fetch(`${BASE_URL}/analytics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const analyticsData = await analyticsRes.json();
    if (analyticsRes.ok && analyticsData.metrics) {
      console.log('✅ PASS: Admin successfully fetched analytics counters and trend curves.');
    } else {
      console.log('❌ FAIL: Admin failed to access analytics metrics.');
      pass = false;
    }

    console.log('\n==================================================');
    if (pass) {
      console.log('  🎉 SYSTEM VERIFICATION STATUS: 100% SUCCESSFUL  ');
    } else {
      console.log('  ⚠️ SYSTEM VERIFICATION STATUS: FAILURES DETECTED ');
    }
    console.log('==================================================');

  } catch (error) {
    console.error('Test Execution Error:', error.message);
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
    process.exit(0);
  }
};

const init = async () => {
  try {
    console.log('Clearing MongoDB Test Database for isolated test run...');
    await mongoose.connect(TEST_MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
    console.log('MongoDB Test Database cleared successfully.');

    // Spawn server process
    const serverEnv = { 
      ...process.env, 
      PORT: PORT.toString(), 
      NODE_ENV: 'test', 
      MONGO_URI: TEST_MONGO_URI 
    };
    
    serverProcess = spawn('node', [path.join(__dirname, '../server.js')], { env: serverEnv });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running')) {
        runTests();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`[Server Error]: ${data}`);
    });

  } catch (e) {
    console.error('Failed to initialize test suite:', e.message);
    process.exit(1);
  }
};

init();
