const axios = require('axios');
const { spawn } = require('child_process');

// Start the server
const server = spawn('node', ['server.js'], { stdio: 'inherit' });

const BASE_URL = 'http://localhost:3000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    console.log('Waiting for server to start...');
    await sleep(2000);

    try {
        console.log('\n--- Test 1: Student Check-in (Low Score) ---');
        // This should trigger the "Intervention Needed" log on the server
        const checkInResponse = await axios.post(`${BASE_URL}/check-in`, {
            student_id: 'student_123',
            quiz_score: 5,
            focus_minutes: 50
        });
        console.log('Check-in Response:', checkInResponse.data);

        console.log('\n--- Test 2: Simulate n8n Assigning Intervention ---');
        // Simulate n8n calling the backend after approval
        const assignResponse = await axios.post(`${BASE_URL}/assign-intervention`, {
            student_id: 'student_123',
            task: 'Review Chapter 5'
        });
        console.log('Assign Response:', assignResponse.data);

        console.log('\n--- Test 3: Simulate n8n Timeout/Auto-unlock ---');
        const unlockResponse = await axios.post(`${BASE_URL}/auto-unlock`, {
            student_id: 'student_456',
            reason: 'Testing Timeout'
        });
        console.log('Unlock Response:', unlockResponse.data);

    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    } finally {
        console.log('\nStopping server...');
        server.kill();
    }
}

runTests();
