document.addEventListener('DOMContentLoaded', () => {

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Alarm audio
  const alarm = new Audio('alert.mp3');
  alarm.volume = 1.0;

  function playAlarm() {
    if (!window.isSoundEnabled()) return;
    alarm.currentTime = 0;
    alarm.loop = true;
    alarm.play();
    setTimeout(() => {
      alarm.pause();
      alarm.loop = false;
    }, 5000);
  }


  const username = sessionStorage.getItem('username');

  let totalSeconds = parseInt(sessionStorage.getItem('sessionSeconds'));  // Get long user wants to revise
  const socket = io();

  socket.emit('lock-in');
  socket.emit('send-message', { user: username, text: `Locked in.`}); // Sent to server

  if (!totalSeconds || totalSeconds <= 0) { // Go back home if you can't find value or value is less than or equal to 0
    socket.emit('stop-session');
    window.location.href = 'home.html';
    return;
  }

  let remaining = totalSeconds;
  const countdownMin = document.getElementById('minutes-display');
  const countdownSec = document.getElementById('seconds-display');

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600); // Hours
    const m = Math.floor((seconds % 3600) / 60);  // Minutes
    const s = seconds % 60; // Seconds
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; // 01:30:05
    // padStart ensures the string is at least 2 characters long (adds 0 if not)
  }

  function formatMin(seconds) {
    const m = Math.floor(seconds / 60);
    return `${m}`;
  }

  function formatSec(seconds) {
    const s = seconds % 60;
    return `${String(s).padStart(2, '0')}`;
  }

  countdownMin.textContent = formatMin(remaining); // Chnage countdown text content to display time
  countdownSec.textContent = formatSec(remaining); // Chnage countdown text content to display time
  document.title = `${formatMin(remaining)}:${formatSec(remaining)} — Lock In`;

  const timer = setInterval(() => {
    remaining--; // Subtracts 1
    countdownMin.textContent = formatMin(remaining); // Chnage countdown text content to display time
    countdownSec.textContent = formatSec(remaining); // Chnage countdown text content to display time
    document.title = `${formatMin(remaining)}:${formatSec(remaining)} — Lock In`;

    if (remaining <= 0) {
      clearInterval(timer);
      subtractTime(totalSeconds);
      playAlarm(); // play first
      
      if (Notification.permission === 'granted') {
        new Notification('Lock In', { body: 'Time is up! Great work!' });
      }

      setTimeout(() => { // wait for alarm mp3 to finish before alert freezes the page
        // alert('Time is up! Great work!');
        socket.emit('stop-session');
        window.location.href = 'home.html';
      }, 5000);
    }
  }, 1000); // Runs function every second

  function subtractTime(secondsStudied) {
    const currentMins = (parseFloat(sessionStorage.getItem('targetHours') || 0) * 60) + parseFloat(sessionStorage.getItem('targetMins') || 0); // How many hours user has left in total
    const studiedMins = Math.round(secondsStudied / 60); // hoursStudied
    const leftMins = Math.max(0, currentMins - studiedMins);
    const newHours = Math.floor(leftMins/60); // How many hours user has left after subtracting session 
    const newMins = Math.max(0, leftMins - (newHours * 60));
    sessionStorage.setItem('targetHours', newHours); // Convert to string and round to 2 dp
    sessionStorage.setItem('targetMins', newMins);
    socket.emit('send-message', { user: username, text: `Completed a ${studiedMins} minute session.`});
  }

  document.querySelector('.lockedin-button').addEventListener('click', (e) => {
      e.preventDefault();
      clearInterval(timer); // Stops interval from running using id that was saved (above)
      const secondsStudied = totalSeconds - remaining; // How long user studied
      subtractTime(secondsStudied);

      // alert user
      playAlarm();
      //alert('STOPPP');
      
      socket.emit('stop-session');
      window.location.href = 'home.html';
  });
});