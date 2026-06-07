// ── THEME TOGGLE ──
const themes = [
  'dark', 'ember', 'ivory',
  'clear-dark', 'slate', 'clear-light',
  'rose', 'rose-light', 'ocean',
  'sand', 'moss', 'noir',
  'lavender', 'crimson'
];

const labels = {
  'dark':        '🕯 Ember',
  'ember':       '🤍 Ivory',
  'ivory':       '◼ Clear Dark',
  'clear-dark':  '🔷 Slate',
  'slate':       '☀ Clear Light',
  'clear-light': '🌸 Rose',
  'rose':        '🌷 Rose Light',
  'rose-light':  '🌊 Ocean',
  'ocean':       '🏜 Sand',
  'sand':        '🌿 Moss',
  'moss':        '⬛ Noir',
  'noir':        '💜 Lavender',
  'lavender':    '🔴 Crimson',
  'crimson':     '🕯 Dark',
};

// Theme changing
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.textContent = labels[savedTheme];

  themeBtn.addEventListener('click', () => {
    const current = localStorage.getItem('theme') || 'dark';
    const next = themes[(themes.indexOf(current) + 1) % themes.length];
    applyTheme(next);
    localStorage.setItem('theme', next);
    themeBtn.textContent = labels[next];
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? '' : theme);
}

// ── AUDIO TOGGLE ──
let soundEnabled = localStorage.getItem('sound') !== 'false';

const audioToggle = document.getElementById('audio-toggle');
if (audioToggle) {
  audioToggle.textContent = soundEnabled ? '🔔' : '🔕';

  audioToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled);
    audioToggle.textContent = soundEnabled ? '🔔' : '🔕';
  });
}

window.isSoundEnabled = () => soundEnabled;