const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Placeholder for n8n Webhook URL - User should update this
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/intervention';

app.use(bodyParser.json());

// Serve static files from 'public' directory
app.use(express.static('public'));

// In-memory store for student status
const students = {
    'student_123': { name: 'Alice', status: 'Active', quiz_score: 8, focus_minutes: 120 },
    'student_456': { name: 'Bob', status: 'Active', quiz_score: 5, focus_minutes: 45 }
};

console.log('Starting Student Intervention Backend...');

// 1. Student Check-in Endpoint
app.post('/check-in', async (req, res) => {
    const { student_id, quiz_score, focus_minutes } = req.body;

    if (!students[student_id]) {
        return res.status(404).json({ error: 'Student not found' });
    }

    // Update local state
    students[student_id].quiz_score = quiz_score;
    students[student_id].focus_minutes = focus_minutes;

    console.log(`[Check-in] Student: ${student_id}, Score: ${quiz_score}, Focus: ${focus_minutes}`);

    // Check intervention criteria
    if (quiz_score <= 7 || focus_minutes <= 60) {
        console.log(`[Trigger] Intervention needed for ${student_id}. Sending webhook...`);

        try {
            // Trigger n8n workflow
            // In a real scenario, we might fire and forget, or wait for confirmation
            // We'll wrap in try-catch to avoid crashing if n8n isn't running
            await axios.post(N8N_WEBHOOK_URL, {
                student_id,
                name: students[student_id].name,
                quiz_score,
                focus_minutes,
                timestamp: new Date().toISOString()
            });
            return res.json({ status: 'Intervention Triggered', student: students[student_id] });
        } catch (error) {
            console.error('[Error] Failed to call n8n webhook:', error.message);
            return res.json({ status: 'Intervention Needed (Webhook Failed)', student: students[student_id] });
        }
    }

    res.json({ status: 'OK', student: students[student_id] });
});

// 2. Assign Intervention Endpoint (Called by n8n)
app.post('/assign-intervention', (req, res) => {
    const { student_id, task } = req.body;

    if (!students[student_id]) {
        return res.status(404).json({ error: 'Student not found' });
    }

    students[student_id].status = 'Remedial';
    students[student_id].assigned_task = task;

    console.log(`[Action] Intervention Assigned for ${student_id}: "${task}". Status updated to Remedial.`);
    console.log(`[Action] App Unlocked for ${student_id}.`);

    res.json({ success: true, message: 'Intervention assigned and app unlocked' });
});

// 3. Auto-Unlock / Fail-safe Endpoint (Called by n8n on timeout)
app.post('/auto-unlock', (req, res) => {
    const { student_id, reason } = req.body;

    if (!students[student_id]) {
        return res.status(404).json({ error: 'Student not found' });
    }

    students[student_id].status = 'Active (Auto-Unlocked)';
    console.log(`[Fail-safe] Auto-unlocked ${student_id}. Reason: ${reason || 'Timeout'}`);

    res.json({ success: true, message: 'Student auto-unlocked' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
