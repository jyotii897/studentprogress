document.getElementById('checkInForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const statusCard = document.getElementById('statusMessage');
    const statusTitle = document.getElementById('statusTitle');
    const statusText = document.getElementById('statusText');

    // Loading state
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    statusCard.classList.add('hidden');

    const formData = {
        student_id: document.getElementById('student_id').value,
        quiz_score: parseInt(document.getElementById('quiz_score').value),
        focus_minutes: parseInt(document.getElementById('focus_minutes').value)
    };

    try {
        const response = await fetch('/check-in', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        // Show result
        statusCard.classList.remove('hidden');
        statusCard.className = 'status-card'; // Reset classes

        if (data.status === 'OK') {
            statusCard.classList.add('success');
            statusTitle.textContent = 'Great Job!';
            statusTitle.style.color = 'var(--success)';
            statusText.textContent = 'Your progress is on track. Keep it up!';
        } else {
            statusCard.classList.add('warning');
            statusTitle.textContent = 'Intervention Needed';
            statusTitle.style.color = 'var(--warning)';
            statusText.textContent = 'A mentor has been notified to help you with your progress.';
        }

    } catch (error) {
        console.error('Error:', error);
        statusCard.classList.remove('hidden');
        statusTitle.textContent = 'Error';
        statusTitle.style.color = 'var(--danger)';
        statusText.textContent = 'Failed to submit check-in. Please try again.';
    } finally {
        submitBtn.textContent = 'Submit Check-In';
        submitBtn.disabled = false;
    }
});
