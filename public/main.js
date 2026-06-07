const socket = io();
const ROOM = 'general';

// ─── WELCOME PAGE ──────────────────────────────────────────────
const loginForm = document.getElementById('login-form');

if (loginForm) {  // Checking to see if there is a loginForm
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();  // Removes whitespace at both ends of the string and returns new string
    const targetHours = document.getElementById('hours').value || 0;
    const targetMins = document.getElementById('minutes').value || 0; 

    if (!username) return;
    const totalMins = (parseInt(targetHours) * 60) + parseInt(targetMins);
    if (totalMins <= 0) return;

    // Save to sessionStorage so the home page can access them
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('targetHours', targetHours);
    sessionStorage.setItem('targetMins', targetMins);

    // Redirect to home/chat page
    window.location.href = 'home.html';
  });
}

// ─── HOME / CHAT PAGE ──────────────────────────────────────────
const chatForm = document.getElementById('chat-form');
const messagesContainer = document.querySelector('.messages'); // Contains all messages

if (chatForm) {
    // Getting username and targetHours
    const username = sessionStorage.getItem('username') || 'Anonymous';
    const targetHours = sessionStorage.getItem('targetHours');
    const targetMins = sessionStorage.getItem('targetMins');

    // Update the "x hours left" heading if the element exists
    const timeHeading = document.querySelector('.home-main h1');
    if (timeHeading) {
    timeHeading.textContent = targetHours && targetMins
        ? `You have ${targetHours} hour(s) and ${targetMins} minute(s) left`
        : 'Welcome back.';
    }

    // Receive messages and render them to the user
    socket.on('message', (data) => { // Received from server
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');

        const name = document.createElement('div');
        name.classList.add('msg-user')
        const p = document.createElement('p');

        name.textContent = `${data.user}`;
        p.textContent = `${data.text}`;

        messageDiv.appendChild(name);
        messageDiv.appendChild(p);
        messagesContainer.appendChild(messageDiv);

        // Auto-scroll to latest message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    socket.on('message-history', (messages) => {
        messages.forEach((data) => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message');
            const name = document.createElement('div');
            name.classList.add('msg-user');
            const p = document.createElement('p');
            name.textContent = data.user;
            p.textContent = data.text;
            messageDiv.appendChild(name);
            messageDiv.appendChild(p);
            messagesContainer.appendChild(messageDiv);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // User locking-in
    const startForm = document.getElementById('start-form');

    if (startForm) {
        startForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = sessionStorage.getItem('username') || 'Anonymous';
            const timeHours = parseInt(document.getElementById('hours').value.trim());
            const timeMins = parseInt(document.getElementById('minutes').value.trim());

            // Validation: must be a number greater than 0
            const totalSeconds = (timeHours * 3600) + (timeMins * 60);
            if (isNaN(totalSeconds) || totalSeconds <= 0) {
                alert('Please enter a valid time!');
                return;
            }

            // Save session time in seconds
            const sessionSeconds = Math.round((timeHours * 3600) + (timeMins * 60));
            sessionStorage.setItem('sessionSeconds', sessionSeconds);
            sessionStorage.setItem('sessionStart', Date.now()); // record when they started

            window.location.href = 'lockedin.html';
        });
    }

}
// Updating live counts
const liveCount = document.getElementById('live-count')
if(liveCount) {
    socket.on('update-counts', ({ activeUsers, lockedIn }) => {
        liveCount.textContent = activeUsers;
        // if you have a separate "locked in" counter element
        const lockedInEl = document.getElementById('locked-in-count');
        if (lockedInEl) lockedInEl.textContent = lockedIn;
    });
}

