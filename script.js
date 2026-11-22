// Initialize Lucide icons
lucide.createIcons();

// Subtle Web Audio UI Chime (Josh Comeau inspired micro-delight)
let soundEnabled = true;
let audioCtx = null;

function playClickTone(freq = 540, duration = 0.045) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors when blocked
  }
}

const soundToggleBtn = document.getElementById('sound-toggle');
const soundIconOn = document.getElementById('sound-icon-on');
const soundIconOff = document.getElementById('sound-icon-off');
soundToggleBtn.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  soundIconOn.classList.toggle('hidden', !soundEnabled);
  soundIconOff.classList.toggle('hidden', soundEnabled);
  if (soundEnabled) playClickTone(660, 0.06);
  showToast(soundEnabled ? 'UI sound effects enabled' : 'UI sound effects muted');
});

// Cursor spotlight tracking
window.addEventListener('mousemove', (e) => {
  document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
  document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
});

// Subtle 3D tilt on profile card
const profileCard = document.getElementById('profile-card');
if (profileCard) {
  profileCard.addEventListener('mousemove', (e) => {
    const rect = profileCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    profileCard.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
  profileCard.addEventListener('mouseleave', () => {
    profileCard.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  });
}

// Navbar scroll styling
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 24) {
    navbar.classList.add('bg-[#06070a]/80', 'backdrop-blur-xl', 'border-white/[0.07]');
  } else {
    navbar.classList.remove('bg-[#06070a]/80', 'backdrop-blur-xl', 'border-white/[0.07]');
  }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
  playClickTone(520);
});
document.querySelectorAll('.mobile-nav-link').forEach((link) => {
  link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});

// Scroll reveal observer
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => observer.observe(el));

// Copy Email with Fallback
document.getElementById('copy-email-btn').addEventListener('click', () => {
  const email = 'niharkadam.0311@gmail.com';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).catch(() => fallbackCopy(email));
  } else {
    fallbackCopy(email);
  }
  playClickTone(720, 0.06);
  showToast('Email copied: ' + email);
});

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

// Quick Jump Command Palette
const cmdModal = document.getElementById('cmd-modal');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');

const cmdItems = [
  { label: 'Go to Hero', hint: '#hero', action: () => scrollToSection('#hero') },
  { label: 'A Little About Me', hint: '#about', action: () => scrollToSection('#about') },
  { label: 'Craft & Skills', hint: '#craft', action: () => scrollToSection('#craft') },
  { label: 'Work', hint: '#work', action: () => scrollToSection('#work') },
  { label: 'Connect With Me', hint: '#connect', action: () => scrollToSection('#connect') },
  { label: 'Copy Email Address', hint: 'niharkadam.0311@gmail.com', action: () => document.getElementById('copy-email-btn').click() },
];

function scrollToSection(hash) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function renderCmdList(query = '') {
  const q = query.toLowerCase();
  const matches = cmdItems.filter((item) => item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q));
  cmdList.innerHTML = matches.length
    ? matches
        .map(
          (item, idx) => `
      <button type="button" data-cmd-idx="${idx}" class="cmd-item w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-300 hover:bg-blue-500/15 hover:text-white transition-colors">
        <span>${item.label}</span>
        <span class="font-mono text-[11px] text-slate-500">${item.hint}</span>
      </button>
    `
        )
        .join('')
    : '<p class="px-3 py-4 text-xs text-slate-500 text-center">No matching sections</p>';

  cmdList.querySelectorAll('.cmd-item').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      matches[i].action();
      closeCmd();
      playClickTone(650);
    });
  });
}

function openCmd() {
  cmdModal.classList.remove('hidden');
  cmdInput.value = '';
  renderCmdList();
  setTimeout(() => cmdInput.focus(), 50);
  playClickTone(580);
}

function closeCmd() {
  cmdModal.classList.add('hidden');
}

document.getElementById('cmd-open-btn').addEventListener('click', openCmd);
document.getElementById('cmd-close-btn').addEventListener('click', closeCmd);
cmdModal.addEventListener('click', (e) => {
  if (e.target === cmdModal) closeCmd();
});
cmdInput.addEventListener('input', (e) => renderCmdList(e.target.value));

window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    cmdModal.classList.contains('hidden') ? openCmd() : closeCmd();
  } else if (e.key === 'Escape') {
    closeCmd();
  }
});

// Toast Helper
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.remove('translate-y-4', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2800);
}
