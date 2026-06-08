// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCsgzrFpF1krUAKFcZs8-8j0TDV_qpe_V8",
  authDomain: "verb-153c9.firebaseapp.com",
  projectId: "verb-153c9",
  storageBucket: "verb-153c9.firebasestorage.app",
  messagingSenderId: "663867785414",
  appId: "1:663867785414:web:99dbb1c312e169979817c7",
  measurementId: "G-91RHCNJLND"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, db };

// ========== FIRESTORE FUNCTIONS ==========
async function saveUserProfile(userId, profileData) {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    });
    return { success: true, message: "Profile saved successfully" };
  } catch (error) {
    console.error("Error saving profile:", error);
    throw error;
  }
}

async function getUserProfile(userId) {
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

async function updateUserProfile(userId, updates) {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

/* VoltEdge EV — shared JS */
(function () {
  // ---------- Particles ----------
  function initParticles() {
    const wrap = document.querySelector('.particles');
    if (!wrap) return;
    const n = 28;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      const size = 2 + Math.random() * 5;
      s.style.width = s.style.height = size + 'px';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.animationDuration = 8 + Math.random() * 16 + 's';
      s.style.animationDelay = -Math.random() * 16 + 's';
      s.style.background = Math.random() > 0.5 ? '#00e7ff' : '#b15cff';
      s.style.boxShadow = `0 0 12px ${s.style.background}`;
      wrap.appendChild(s);
    }
  }

  // ---------- Loader ----------
  function hideLoader() {
    const l = document.querySelector('.loader');
    if (!l) return;
    setTimeout(() => { l.classList.add('hide'); setTimeout(() => l.remove(), 700); }, 700);
  }

  // ---------- Clock ----------
  function startClock() {
    const el = document.getElementById('liveClock');
    if (!el) return;
    const tick = () => {
      const d = new Date();
      el.textContent = d.toLocaleString();
    };
    tick(); setInterval(tick, 1000);
  }

  // ---------- Auth ----------
  let currentUser = null;
  let pageInitialized = false;
  let registrationInProgress = false;

  function monitorAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      const page = document.body.dataset.page;
      if (user) {
        let name = "User";
        let role = "driver";
        if (user.displayName) {
          const parts = user.displayName.split("|");
          name = parts[0];
          role = parts[1] || "driver";
        } else {
          name = user.email.split("@")[0];
          if (user.email.includes("admin")) {
            role = "admin";
          }
        }
        currentUser = {
          uid: user.uid,
          email: user.email,
          name: name,
          role: role,
          id: role === "admin" ? "ADM-001" : "DRV-042"
        };

        if (page === 'login' || page === 'register') {
          if (registrationInProgress) return; // wait for Firestore write to finish
          window.location.href = currentUser.role === 'admin' ? 'admin-dashboard.html' : 'driver-dashboard.html';
        } else {
          if (page && page !== currentUser.role) {
            window.location.href = currentUser.role === 'admin' ? 'admin-dashboard.html' : 'driver-dashboard.html';
          } else {
            if (!pageInitialized) {
              pageInitialized = true;
              setProfile(currentUser);
              if (page === 'admin') initAdmin();
              if (page === 'driver') initDriver();
              hideLoader();
            }
          }
        }
      } else {
        currentUser = null;
        if (page === 'admin' || page === 'driver') {
          window.location.href = 'login.html';
        } else {
          if (!pageInitialized) {
            pageInitialized = true;
            if (page === 'login') initLogin();
            if (page === 'register') initRegister();
            hideLoader();
          }
        }
      }
    });
  }

  function logout() {
    const auth = getAuth();
    signOut(auth).then(() => {
      window.location.href = 'login.html';
    }).catch(err => {
      alert("Sign out failed: " + err.message);
    });
  }

  // ---------- Dummy dataset ----------
  const BRANDS = ['Tesla Model S', 'Tesla Model 3', 'Lucid Air', 'Rivian R1T', 'BMW i4', 'Hyundai Ioniq 5', 'Polestar 2', 'Mercedes EQS', 'NIO ET7', 'Ford Mach-E'];
  const DRIVERS = ['A. Singh', 'P. Kapoor', 'R. Mehta', 'S. Iyer', 'J. Doe', 'L. Wong', 'M. Garcia', 'K. Tanaka'];
  const CATS = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe'];

  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function rint(min, max) { return Math.floor(rnd(min, max + 1)); }

  function buildFleet(n = 12) {
    const fleet = [];
    for (let i = 0; i < n; i++) {
      const cap = [60, 75, 82, 95, 100, 120][rint(0, 5)];
      const pct = rint(8, 100);
      const weight = rint(1700, 2700);
      const speed = rint(0, 140);
      const cond = rint(0, 100);
      const range = Math.max(5, Math.round((cap * (pct / 100)) * 5.5 - (weight - 1700) * 0.04 - speed * 0.3));
      const charging = Math.random() < 0.25;
      fleet.push({
        id: 'EV-' + (1000 + i),
        brand: BRANDS[i % BRANDS.length],
        category: CATS[rint(0, CATS.length - 1)],
        batteryCapacity: cap,
        battery: pct,
        weight,
        motor: rint(200, 750) + ' kW',
        condition: cond,
        speed: charging ? 0 : speed,
        charging,
        driver: DRIVERS[rint(0, DRIVERS.length - 1)],
        range,
        revenue: rint(80, 480),
        maintenance: rint(0, 220),
        cycles: rint(80, 900),
        temp: rint(18, 55),
        efficiency: rint(60, 99),
        health: Math.max(20, 100 - rint(0, 60)),
      });
    }
    return fleet;
  }

  let _fleet = null;
  function fleet() {
    if (!_fleet) {
      const cached = sessionStorage.getItem('ve_fleet');
      if (cached) { try { _fleet = JSON.parse(cached); } catch { } }
      if (!_fleet) { _fleet = buildFleet(14); sessionStorage.setItem('ve_fleet', JSON.stringify(_fleet)); }
    }
    return _fleet;
  }

  // ---------- SVG sparkline ----------
  function spark(el, points, color = '#00e7ff') {
    if (!el) return;
    const w = el.clientWidth || 300, h = el.clientHeight || 80;
    const min = Math.min(...points), max = Math.max(...points);
    const sx = w / (points.length - 1);
    const ny = v => h - 6 - ((v - min) / Math.max(1, max - min)) * (h - 12);
    const d = points.map((v, i) => (i === 0 ? 'M' : 'L') + (i * sx).toFixed(1) + ',' + ny(v).toFixed(1)).join(' ');
    const area = d + ` L ${w},${h} L 0,${h} Z`;
    el.innerHTML = `
      <defs>
        <linearGradient id="gradFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path class="area" d="${area}"/>
      <path class="line" d="${d}" stroke="${color}"/>
    `;
  }

  // ---------- Render utilities ----------
  function pill(text, cls = '') { return `<span class="status-pill ${cls}">${text}</span>`; }

  // ---------- Page initializers ----------
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    startClock();

    // logout buttons
    document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); logout(); }));

    // Start monitoring auth state
    monitorAuthState();
  });

  // ---------- LOGIN ----------
  function initLogin() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      if (!email || !password) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "⚡ Authenticating...";

      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .catch(err => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          alert("Login failed: " + err.message);
        });
    });
  }

  // ---------- REGISTER ----------
  function initRegister() {
    const form = document.getElementById('regForm');
    const roleSel = form.role;
    const licenseBlock = document.getElementById('licenseBlock');
    const sync = () => { licenseBlock.style.display = roleSel.value === 'driver' ? 'block' : 'none'; };
    roleSel.addEventListener('change', sync); sync();

    const passwordInput = form.password;
    const requirementsContainer = document.querySelector('.password-requirements');
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    const reqSpecial = document.getElementById('req-special');
    const strengthBar = document.getElementById('strength-bar');

    const updateRule = (el, isValid, text) => {
      if (isValid) {
        el.innerHTML = `✓ ${text}`;
        el.style.color = 'var(--green)';
        el.style.textShadow = '0 0 8px rgba(0, 255, 163, 0.3)';
      } else {
        el.innerHTML = `✕ ${text}`;
        el.style.color = 'var(--muted)';
        el.style.textShadow = 'none';
      }
    };

    const showReqs = () => {
      if (requirementsContainer) {
        requirementsContainer.style.display = 'block';
      }
    };

    if (passwordInput) {
      passwordInput.addEventListener('focus', showReqs);
      passwordInput.addEventListener('input', () => {
        showReqs();
        const val = passwordInput.value;

        const hasLength = val.length >= 8;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSpecial = /[^A-Za-z0-9]/.test(val);

        if (reqLength) updateRule(reqLength, hasLength, 'At least 8 characters');
        if (reqUpper) updateRule(reqUpper, hasUpper, 'One uppercase letter');
        if (reqLower) updateRule(reqLower, hasLower, 'One lowercase letter');
        if (reqNumber) updateRule(reqNumber, hasNumber, 'One number');
        if (reqSpecial) updateRule(reqSpecial, hasSpecial, 'One special char');

        const count = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
        const pct = (count / 5) * 100;
        if (strengthBar) {
          strengthBar.style.width = pct + '%';

          if (count <= 2) {
            strengthBar.style.background = 'var(--red)';
            strengthBar.style.boxShadow = '0 0 8px var(--red)';
          } else if (count <= 4) {
            strengthBar.style.background = 'var(--amber)';
            strengthBar.style.boxShadow = '0 0 8px var(--amber)';
          } else {
            strengthBar.style.background = 'var(--green)';
            strengthBar.style.boxShadow = '0 0 8px var(--green)';
          }
        }
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.fullName.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const role = form.role.value;

      const hasLength = password.length >= 8;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[^A-Za-z0-9]/.test(password);

      if (!hasLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        alert('Password does not meet all security requirements.');
        if (passwordInput) passwordInput.focus();
        return;
      }

      if (password !== form.confirm.value) {
        alert('Passwords do not match');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = "⚡ Creating Account...";

      const auth = getAuth();
      registrationInProgress = true;
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          return updateProfile(userCredential.user, {
            displayName: `${name}|${role}`
          }).then(() => {
            return saveUserProfile(userCredential.user.uid, {
              fullName: name,
              email: email,
              role: role,
              licenseNumber: role === 'driver' ? form.licenseNumber?.value.trim() : '',
              phoneNumber: form.phone?.value.trim() || '',
              address: form.address?.value.trim() || '',
              photoUrl: null
            });
          });
        })
        .then(() => {
          registrationInProgress = false;
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'driver-dashboard.html';
        })
        .catch(err => {
          registrationInProgress = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          alert("Registration failed: " + err.message);
        });
    });
  }

  // ---------- ADMIN ----------
  function initAdmin() {
    if (!currentUser) return;
    setProfile(currentUser);
    const view = location.hash.replace('#', '') || 'dashboard';
    setActiveNav(view);
    renderAdminView(view);
    window.addEventListener('hashchange', () => {
      const v = location.hash.replace('#', '') || 'dashboard';
      setActiveNav(v); renderAdminView(v);
    });
  }
  function setActiveNav(view) {
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.dataset.view === view));
  }
  function setProfile(u) {
    const av = document.querySelector('.profile .avatar');
    const nm = document.querySelector('.profile .name');
    if (av) av.textContent = (u.name || 'U').slice(0, 1).toUpperCase();
    if (nm) nm.textContent = u.name + ' · ' + (u.role === 'admin' ? 'Admin' : 'Driver');
  }

  function renderAdminView(view) {
    const root = document.getElementById('view');
    const f = fleet();
    if (view === 'dashboard') return renderDashboard(root, f);
    if (view === 'garage') return renderGarage(root, f);
    if (view === 'live') return renderLive(root, f);
    if (view === 'battery') return renderBattery(root, f);
    if (view === 'driver') return renderDriverAnalysis(root, f);
    if (view === 'maintenance') return renderMaintenance(root, f);
    if (view === 'revenue') return renderRevenue(root, f);
    if (view === 'reports') return renderReports(root, f);
    renderDashboard(root, f);
  }

  function renderDashboard(root, f) {
    const charging = f.filter(c => c.charging).length;
    const alerts = f.filter(c => c.health < 50 || c.condition < 25).length;
    const rev = f.reduce((s, c) => s + c.revenue, 0);
    const energy = f.reduce((s, c) => s + c.batteryCapacity * (1 - c.battery / 100), 0).toFixed(0);
    root.innerHTML = `
      <h2 class="page-title">Mission Control <small>Realtime fleet overview</small></h2>
      <div class="kpi-grid">
        ${kpi('Total EV Cars', f.length, '+2 this week')}
        ${kpi('Cars Charging', charging, charging + ' active sessions')}
        ${kpi('Maintenance Alerts', alerts, alerts ? 'Action required' : 'All clear', alerts ? 'down' : '')}
        ${kpi('Active Drivers', new Set(f.map(c => c.driver)).size, 'Online now')}
        ${kpi('Daily Revenue', '$' + rev.toLocaleString(), '+8.4% vs yesterday')}
        ${kpi('Energy Used', energy + ' kWh', 'Today')}
      </div>
      <div class="grid-2">
        <div class="glass panel">
          <h3><span class="pulse"></span>Fleet Energy Trend (24h)</h3>
          <svg class="spark" id="trend1"></svg>
          <div class="bars" id="bars1" style="margin-top: 14px;"></div>
        </div>
        <div class="glass panel">
          <h3>Battery Status Mix</h3>
          <div style="display:flex; align-items:center; gap: 18px;">
            <div class="circle" style="--p:${Math.round(f.reduce((s, c) => s + c.battery, 0) / f.length)}; --c: var(--cyan);"><span>${Math.round(f.reduce((s, c) => s + c.battery, 0) / f.length)}%</span></div>
            <div style="flex:1;">
              <div class="row"><span>Healthy (>70%)</span><b>${f.filter(c => c.battery > 70).length}</b></div>
              <div class="batt-bar"><i style="width:${f.filter(c => c.battery > 70).length / f.length * 100}%"></i></div>
              <div class="row" style="margin-top:10px;"><span>Mid (30–70%)</span><b>${f.filter(c => c.battery > 30 && c.battery <= 70).length}</b></div>
              <div class="batt-bar"><i style="width:${f.filter(c => c.battery > 30 && c.battery <= 70).length / f.length * 100}%"></i></div>
              <div class="row" style="margin-top:10px;"><span>Low (<30%)</span><b>${f.filter(c => c.battery <= 30).length}</b></div>
              <div class="batt-bar warn"><i style="width:${f.filter(c => c.battery <= 30).length / f.length * 100}%"></i></div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>Top Performing Vehicles</h3>
          <table><thead><tr><th>Vehicle</th><th>Driver</th><th>Battery</th><th>Range</th><th>Status</th></tr></thead><tbody>
            ${f.slice(0, 6).map(c => `<tr>
              <td><b>${c.brand}</b><br><span style="color:var(--muted);font-size:11px;">${c.id}</span></td>
              <td>${c.driver}</td>
              <td>${c.battery}%</td>
              <td>${c.range} km</td>
              <td>${c.charging ? pill('Charging', 'charging') : (c.speed > 0 ? pill('On Trip', 'on') : pill('Idle', 'off'))}</td>
            </tr>`).join('')}
          </tbody></table>
        </div>
        <div class="glass panel">
          <h3>Live Alerts</h3>
          ${f.filter(c => c.battery < 20).slice(0, 2).map(c => `<div class="alert danger">⚠ ${c.id} battery low (${c.battery}%) — recommend charging</div>`).join('') || ''}
          ${f.filter(c => c.temp > 45).slice(0, 2).map(c => `<div class="alert warn">🔥 ${c.id} battery temperature ${c.temp}°C</div>`).join('') || ''}
          ${f.filter(c => c.condition < 25).slice(0, 2).map(c => `<div class="alert warn">🔧 ${c.id} requires maintenance</div>`).join('') || ''}
          <div class="alert info">⚡ Smart charging recommended at off-peak hours (22:00–06:00)</div>
        </div>
      </div>
    `;
    spark(document.getElementById('trend1'), Array.from({ length: 24 }, () => rint(40, 100)));
    const bars = document.getElementById('bars1');
    bars.innerHTML = Array.from({ length: 14 }, () => `<i style="height:${rint(20, 110)}px"></i>`).join('');
  }

  function kpi(label, value, delta, dir) {
    return `<div class="glass kpi neon-border">
      <div class="ring"></div>
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="delta ${dir || ''}">${delta || ''}</div>
    </div>`;
  }

  function renderGarage(root, f) {
    root.innerHTML = `
      <h2 class="page-title">EV Garage <small>${f.length} vehicles registered</small></h2>
      <div style="margin-bottom:14px;">
        <span class="chip active">All</span><span class="chip">Charging</span><span class="chip">On Trip</span><span class="chip">Idle</span><span class="chip">Maintenance</span>
      </div>
      <div class="grid-auto">
        ${f.map(c => carCard(c)).join('')}
      </div>
    `;
  }

  function carCard(c) {
    return `<div class="glass car-card">
      <div class="head">
        <div><div class="brand">${c.brand}</div><div class="vid">${c.id} · ${c.category}</div></div>
        ${c.charging ? pill('Charging', 'charging') : c.speed > 0 ? pill('On Trip', 'on') : pill('Idle', 'off')}
      </div>
      <div class="ev-illu">🚗⚡</div>
      <div class="row"><span>Battery</span><b>${c.battery}%</b></div>
      <div class="batt-bar ${c.battery < 25 ? 'warn' : ''}"><i style="width:${c.battery}%"></i></div>
      <div class="row"><span>Range</span><b>${c.range} km</b></div>
      <div class="row"><span>Motor</span><b>${c.motor}</b></div>
      <div class="row"><span>Condition</span><b>${c.condition}%</b></div>
      <div class="actions">
        <button class="btn">View</button>
        <button class="btn ghost">Edit</button>
        <button class="btn danger">Remove</button>
      </div>
    </div>`;
  }

  function renderLive(root, f) {
    let dist = 0;
    const hist = [];
    root.innerHTML = `
      <h2 class="page-title">Live Monitoring <small>Realtime telemetry</small></h2>
      <div class="grid-2">
        <div class="glass panel">
          <h3><span class="pulse"></span>Active Vehicles</h3>
          <table id="liveTable"><thead><tr><th>Vehicle</th><th>Driver</th><th>Speed</th><th>Battery</th><th>Status</th><th>Location</th></tr></thead><tbody></tbody></table>
        </div>
        <div class="glass panel">
          <h3>Fleet Speed (live)</h3>
          <svg class="spark" id="liveSpark"></svg>
          <div class="row" style="margin-top:10px;"><span>Avg Speed</span><b id="avgSpeed">— km/h</b></div>
          <div class="row"><span>Peak Speed</span><b id="peakSpeed">— km/h</b></div>
          <div class="row"><span>Vehicles Online</span><b>${f.length}</b></div>
        </div>
      </div>
    `;
    const ds = document.getElementById('ds');
    const dd = document.getElementById('dd');
    const update = () => {
      f.forEach(c => { if (!c.charging) c.speed = Math.max(0, c.speed + rint(-10, 10)); });
      tbody.innerHTML = f.slice(0, 8).map(c => `<tr>
        <td><b>${c.brand}</b><br><span style="color:var(--muted);font-size:11px;">${c.id}</span></td>
        <td>${c.driver}</td>
        <td><b>${c.speed}</b> km/h</td>
        <td>${c.battery}%</td>
        <td>${c.charging ? pill('Charging', 'charging') : c.speed > 0 ? pill('Online', 'on') : pill('Idle', 'off')}</td>
        <td>${(28 + Math.random()).toFixed(3)}°N, ${(77 + Math.random()).toFixed(3)}°E</td>
      </tr>`).join('');
      const avg = Math.round(f.reduce((s, c) => s + c.speed, 0) / f.length);
      hist.push(avg); if (hist.length > 30) hist.shift();
      spark(document.getElementById('liveSpark'), hist);
      document.getElementById('avgSpeed').textContent = avg + ' km/h';
      document.getElementById('peakSpeed').textContent = Math.max(...f.map(c => c.speed)) + ' km/h';
    };
    update();
    const t = setInterval(update, 1500);
    window.addEventListener('hashchange', () => clearInterval(t), { once: true });
  }

  function renderBattery(root, f) {
    const overheats = f.filter(c => c.temp > 45);
    const lows = f.filter(c => c.battery < 20);
    root.innerHTML = `
      <h2 class="page-title">Battery Analytics <small>Health, cycles, temperature</small></h2>
      ${lows.map(c => `<div class="alert danger">⚠ Low battery: ${c.id} at ${c.battery}% — Range ${c.range} km</div>`).join('')}
      ${overheats.map(c => `<div class="alert warn">🔥 Overheating: ${c.id} — ${c.temp}°C</div>`).join('')}
      <div class="grid-3">
        ${kpi('Avg Battery Health', Math.round(f.reduce((s, c) => s + c.health, 0) / f.length) + '%', 'Stable')}
        ${kpi('Charging Efficiency', Math.round(f.reduce((s, c) => s + c.efficiency, 0) / f.length) + '%', '+2.1%')}
        ${kpi('Avg Cycles', Math.round(f.reduce((s, c) => s + c.cycles, 0) / f.length), 'Lifetime')}
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Battery Degradation by Vehicle</h3>
        <table><thead><tr><th>Vehicle</th><th>Capacity</th><th>Current</th><th>Health</th><th>Cycles</th><th>Temp</th><th>Range</th></tr></thead><tbody>
          ${f.map(c => `<tr>
            <td><b>${c.brand}</b><br><span style="color:var(--muted);font-size:11px;">${c.id}</span></td>
            <td>${c.batteryCapacity} kWh</td>
            <td>${c.battery}%</td>
            <td>${c.health}%</td>
            <td>${c.cycles}</td>
            <td style="color:${c.temp > 45 ? 'var(--red)' : 'var(--text)'}">${c.temp}°C</td>
            <td>${c.range} km</td>
          </tr>`).join('')}
        </tbody></table>
      </div>
    `;
  }

  function renderDriverAnalysis(root, f) {
    const drivers = Array.from(new Set(f.map(c => c.driver))).map(name => ({
      name,
      safety: rint(60, 99),
      eco: rint(50, 98),
      avg: rint(40, 90),
      over: rint(0, 12),
      brakes: rint(0, 20),
    }));
    root.innerHTML = `
      <h2 class="page-title">Driver Analysis <small>Behavior &amp; safety scoring</small></h2>
      <div class="grid-auto">
        ${drivers.map(d => `<div class="glass panel">
          <div class="row"><b style="font-size:16px;">${d.name}</b>${pill(d.safety > 80 ? 'Safe' : d.safety > 60 ? 'Average' : 'Risky', d.safety > 80 ? 'on' : d.safety > 60 ? 'warn' : 'danger')}</div>
          <div style="display:flex; gap:16px; align-items:center; margin-top:12px;">
            <div class="circle" style="--p:${d.safety}; --c: var(--cyan);"><span>${d.safety}</span></div>
            <div style="flex:1;">
              <div class="row"><span>Eco Score</span><b>${d.eco}</b></div>
              <div class="batt-bar"><i style="width:${d.eco}%"></i></div>
              <div class="row" style="margin-top:8px;"><span>Avg Speed</span><b>${d.avg} km/h</b></div>
              <div class="row"><span>Overspeeding</span><b>${d.over}x</b></div>
              <div class="row"><span>Sudden Braking</span><b>${d.brakes}x</b></div>
            </div>
          </div>
        </div>`).join('')}
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Top Drivers — Radar View</h3>
        ${radarSVG(drivers[0])}
      </div>
    `;
  }

  function radarSVG(d) {
    const metrics = [{ k: 'Safety', v: d.safety }, { k: 'Eco', v: d.eco }, { k: 'Smooth', v: 100 - d.brakes * 4 }, { k: 'Discipline', v: 100 - d.over * 6 }, { k: 'Avg Spd', v: Math.min(100, d.avg + 10) }];
    const cx = 160, cy = 140, r = 110;
    const pts = metrics.map((m, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      const rad = (m.v / 100) * r;
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    });
    const bgPts = metrics.map((_, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    const labels = metrics.map((m, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      return `<text x="${cx + Math.cos(a) * (r + 18)}" y="${cy + Math.sin(a) * (r + 18)}" text-anchor="middle">${m.k}</text>`;
    }).join('');
    return `<svg class="radar" viewBox="0 0 320 290" width="100%" height="290">
      ${bgPts.map(p => `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}"/>`).join('')}
      <polygon class="bg" points="${bgPts.map(p => p.join(',')).join(' ')}"/>
      <polygon class="val" points="${pts.map(p => p.join(',')).join(' ')}"/>
      ${labels}
    </svg>`;
  }

  function renderMaintenance(root, f) {
    const needing = f.filter(c => c.health < 50 || c.condition < 30);
    root.innerHTML = `
      <h2 class="page-title">Maintenance Center <small>Predictive alerts &amp; service history</small></h2>
      <div class="grid-3">
        ${kpi('Total Service Cost', '$' + f.reduce((s, c) => s + c.maintenance, 0).toLocaleString(), 'This month')}
        ${kpi('Pending Services', needing.length, needing.length ? 'Schedule now' : 'All up to date')}
        ${kpi('Fleet Condition Avg', Math.round(f.reduce((s, c) => s + c.condition, 0) / f.length) + '%', '')}
      </div>
      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>Predicted Repair Alerts</h3>
          ${needing.length ? needing.map(c => `<div class="alert ${c.condition < 15 ? 'danger' : 'warn'}">🔧 ${c.id} (${c.brand}) — Condition ${c.condition}% · Battery health ${c.health}%</div>`).join('') : '<div class="alert info">All vehicles healthy.</div>'}
        </div>
        <div class="glass panel">
          <h3>Service Timeline</h3>
          <div class="timeline">
            <div class="item"><b>EV-1003</b> · Brake pad replaced<br><span style="color:var(--muted);font-size:12px;">2 days ago · $180</span></div>
            <div class="item"><b>EV-1006</b> · Battery coolant top-up<br><span style="color:var(--muted);font-size:12px;">5 days ago · $60</span></div>
            <div class="item"><b>EV-1001</b> · Tire rotation<br><span style="color:var(--muted);font-size:12px;">1 week ago · $40</span></div>
            <div class="item"><b>EV-1008</b> · Software update OTA<br><span style="color:var(--muted);font-size:12px;">2 weeks ago · $0</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderRevenue(root, f) {
    const rev = f.reduce((s, c) => s + c.revenue, 0);
    const maint = f.reduce((s, c) => s + c.maintenance, 0);
    const energyCost = Math.round(rev * 0.18);
    const profit = rev - maint - energyCost;
    root.innerHTML = `
      <h2 class="page-title">Revenue Analytics <small>Profit, expenses, ROI</small></h2>
      <div class="grid-3">
        ${kpi('Daily Revenue', '$' + rev.toLocaleString(), '+8.4%')}
        ${kpi('Monthly Revenue', '$' + (rev * 27).toLocaleString(), 'Projected')}
        ${kpi('Net Profit', '$' + profit.toLocaleString(), 'Margin ' + Math.round(profit / rev * 100) + '%')}
      </div>
      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>Profit Trend (30 days)</h3>
          <svg class="spark" id="revSpark" style="height:160px;"></svg>
        </div>
        <div class="glass panel">
          <h3>Expense Breakdown</h3>
          ${donut([
      { label: 'Energy', value: energyCost, color: '#00e7ff' },
      { label: 'Maintenance', value: maint, color: '#b15cff' },
      { label: 'Operations', value: Math.round(rev * 0.1), color: '#2a5cff' },
    ])}
        </div>
      </div>
    `;
    spark(document.getElementById('revSpark'), Array.from({ length: 30 }, () => rint(500, 1800)), '#b15cff');
  }

  function donut(parts) {
    const total = parts.reduce((s, p) => s + p.value, 0);
    let acc = 0;
    const r = 60, cx = 80, cy = 80;
    const segs = parts.map(p => {
      const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
      acc += p.value;
      const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
      const large = (a1 - a0) > Math.PI ? 1 : 0;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      return `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z" fill="${p.color}" opacity="0.9"/>`;
    }).join('');
    const legend = parts.map(p => `<div class="row"><span><i style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px;margin-right:8px;box-shadow:0 0 8px ${p.color}"></i>${p.label}</span><b>$${p.value.toLocaleString()}</b></div>`).join('');
    return `<div style="display:flex; gap:16px; align-items:center;">
      <svg width="160" height="160" viewBox="0 0 160 160">${segs}<circle cx="80" cy="80" r="38" fill="#0a0d1f"/></svg>
      <div style="flex:1;">${legend}</div>
    </div>`;
  }

  function renderReports(root, f) {
    root.innerHTML = `
      <h2 class="page-title">Reports <small>Generate &amp; download</small></h2>
      <div class="glass panel">
        <h3>Filters</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:12px;">
          <div class="form-group"><label>From</label><input class="input" type="date"></div>
          <div class="form-group"><label>To</label><input class="input" type="date"></div>
          <div class="form-group"><label>Vehicle</label>
            <select class="input"><option>All Vehicles</option>${f.map(c => `<option>${c.id} — ${c.brand}</option>`).join('')}</select></div>
          <div class="form-group"><label>Driver</label>
            <select class="input"><option>All Drivers</option>${Array.from(new Set(f.map(c => c.driver))).map(d => `<option>${d}</option>`).join('')}</select></div>
        </div>
        <div style="display:flex; gap:10px; margin-top:8px;">
          <button class="btn" onclick="VE.exportCSV()">⬇ Excel / CSV</button>
          <button class="btn ghost" onclick="VE.exportPDF()">⬇ PDF Report</button>
        </div>
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Preview</h3>
        <table><thead><tr><th>Vehicle</th><th>Driver</th><th>Battery</th><th>Range</th><th>Revenue</th><th>Maintenance</th></tr></thead><tbody>
          ${f.map(c => `<tr><td>${c.id} · ${c.brand}</td><td>${c.driver}</td><td>${c.battery}%</td><td>${c.range} km</td><td>$${c.revenue}</td><td>$${c.maintenance}</td></tr>`).join('')}
        </tbody></table>
      </div>
    `;
  }

  // ---------- DRIVER ----------
  function initDriver() {
    if (!currentUser) return;
    setProfile(currentUser);
    const view = location.hash.replace('#', '') || 'home';
    setActiveNav(view);
    renderDriverView(view, currentUser);
    window.addEventListener('hashchange', () => {
      const v = location.hash.replace('#', '') || 'home';
      setActiveNav(v); renderDriverView(v, currentUser);
    });
  }

  function renderDriverView(view, u) {
    const root = document.getElementById('view');
    const car = fleet()[0];
    if (view === 'home') return driverHome(root, car, u);
    if (view === 'vehicle') return driverVehicle(root, car);
    if (view === 'trip') return driverTrip(root, car);
    if (view === 'health') return driverHealth(root, car);
    if (view === 'perf') return driverPerf(root, u);
    driverHome(root, car, u);
  }

  function driverHome(root, c, u) {
    root.innerHTML = `
      <h2 class="page-title">Welcome, ${u.name || 'Driver'} <small>Your EV status</small></h2>
      <div class="grid-2">
        <div class="glass panel">
          <h3>${c.brand} · ${c.id}</h3>
          <div class="ev-illu" style="height:160px; font-size:80px;">🚗⚡</div>
          <div class="row"><span>Battery</span><b>${c.battery}%</b></div>
          <div class="batt-bar"><i style="width:${c.battery}%"></i></div>
          <div class="row" style="margin-top:10px;"><span>Remaining Range</span><b>${c.range} km</b></div>
          <div class="row"><span>Charging</span>${c.charging ? pill('Yes', 'charging') : pill('No', 'off')}</div>
        </div>
        <div class="glass panel">
          <h3>Today's Trip</h3>
          <div class="circle" style="--p:${c.efficiency}; --c: var(--green);"><span>${c.efficiency}%</span></div>
          <p style="color:var(--muted); margin-top:10px;">Eco efficiency for current trip</p>
          <div class="row"><span>Distance</span><b>${rint(20, 80)} km</b></div>
          <div class="row"><span>Avg Speed</span><b>${rint(35, 75)} km/h</b></div>
          <div class="row"><span>Energy Used</span><b>${rint(5, 20)} kWh</b></div>
        </div>
      </div>
    `;
  }

  function driverVehicle(root, c) {
    root.innerHTML = `
      <h2 class="page-title">My Vehicle</h2>
      <div class="glass panel">
        <h3>${c.brand}</h3>
        <div class="grid-3">
          <div><div class="row"><span>Vehicle ID</span><b>${c.id}</b></div>
          <div class="row"><span>Category</span><b>${c.category}</b></div>
          <div class="row"><span>Motor</span><b>${c.motor}</b></div></div>
          <div><div class="row"><span>Battery Capacity</span><b>${c.batteryCapacity} kWh</b></div>
          <div class="row"><span>Vehicle Weight</span><b>${c.weight} kg</b></div>
          <div class="row"><span>Condition</span><b>${c.condition}%</b></div></div>
          <div><div class="row"><span>Battery %</span><b>${c.battery}%</b></div>
          <div class="row"><span>Range</span><b>${c.range} km</b></div>
          <div class="row"><span>Status</span>${c.charging ? pill('Charging', 'charging') : pill('Ready', 'on')}</div></div>
        </div>
      </div>
    `;
  }

  function driverTrip(root, c) {
    let dist = 0;
    const hist = [];
    root.innerHTML = `
      <h2 class="page-title">Current Trip <small>Live</small></h2>
      <div class="grid-2">
        <div class="glass panel">
          <h3><span class="pulse"></span>Live Telemetry</h3>
          <div class="circle" style="--p:${Math.min(100, c.speed)}; --c: var(--cyan);"><span id="ds">${c.speed}</span></div>
          <p style="color:var(--muted);margin-top:8px;">Current speed (km/h)</p>
          <div class="row"><span>Distance Covered</span><b id="dd">0 km</b></div>
          <div class="row"><span>Battery Prediction (end)</span><b>${Math.max(0, c.battery - 12)}%</b></div>
          <div class="row"><span>Route</span><b>Sector 21 → Hub North</b></div>
        </div>
        <div class="glass panel">
          <h3>Speed Trend</h3>
          <svg class="spark" id="dspark" style="height:160px;"></svg>
        </div>
      </div>
    `;
    const ds = document.getElementById('ds');
    const dd = document.getElementById('dd');
    const update = () => {
      c.speed = Math.max(0, c.speed + rint(-10, 10));
      dist += c.speed / 3600 * 1.5;
      ds.textContent = c.speed;
      dd.textContent = dist.toFixed(2) + ' km';
      hist.push(c.speed);
      if (hist.length > 30) hist.shift();
      spark(document.getElementById('dspark'), hist);
    };
    update();
    const t = setInterval(update, 1500);
    window.addEventListener('hashchange', () => clearInterval(t), { once: true });
  }

  function driverHealth(root, c) {
    root.innerHTML = `
      <h2 class="page-title">Vehicle Health</h2>
      <div class="grid-3">
        ${kpi('Battery Health', c.health + '%', c.health > 70 ? 'Excellent' : c.health > 40 ? 'Fair' : 'Service soon', c.health > 40 ? '' : 'down')}
        ${kpi('Tire Condition', rint(60, 95) + '%', 'OK')}
        ${kpi('Vehicle Condition', c.condition + '%', '')}
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Service Alerts</h3>
        ${c.health < 50 ? '<div class="alert warn">🔋 Battery health declining — schedule check</div>' : ''}
        ${c.condition < 30 ? '<div class="alert danger">🔧 Maintenance required immediately</div>' : '<div class="alert info">No active alerts.</div>'}
      </div>
    `;
  }

  function driverPerf(root, u) {
    const safety = rint(70, 98), eco = rint(60, 95);
    root.innerHTML = `
      <h2 class="page-title">My Performance</h2>
      <div class="grid-3">
        ${kpi('Driving Score', safety, safety > 85 ? 'Excellent' : 'Good')}
        ${kpi('Eco Score', eco, '+3 this week')}
        ${kpi('Trips This Week', rint(8, 24), '')}
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Weekly Trend</h3>
        <svg class="spark" id="pspark" style="height:160px;"></svg>
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Recent Trips</h3>
        <table><thead><tr><th>Date</th><th>Route</th><th>Distance</th><th>Score</th></tr></thead><tbody>
          ${Array.from({ length: 6 }).map((_, i) => `<tr><td>${new Date(Date.now() - i * 86400000).toLocaleDateString()}</td><td>Route ${i + 1}</td><td>${rint(20, 120)} km</td><td>${rint(70, 98)}</td></tr>`).join('')}
        </tbody></table>
      </div>
    `;
    spark(document.getElementById('pspark'), Array.from({ length: 14 }, () => rint(60, 100)), '#00ffa3');
  }

  // ---------- Export ----------
  function exportCSV() {
    const f = fleet();
    const headers = ['id', 'brand', 'category', 'battery', 'range', 'speed', 'driver', 'revenue', 'maintenance'];
    const rows = f.map(c => headers.map(h => c[h]).join(','));
    const csv = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'voltedge_fleet.csv'; a.click();
  }
  function exportPDF() {
    const w = window.open('', '_blank');
    const f = fleet();
    w.document.write(`<html><head><title>VoltEdge Report</title><style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px;font-size:12px}h1{color:#2a5cff}</style></head><body><h1>VoltEdge EV — Fleet Report</h1><p>Generated ${new Date().toLocaleString()}</p><table><thead><tr><th>ID</th><th>Brand</th><th>Battery</th><th>Range</th><th>Driver</th><th>Revenue</th></tr></thead><tbody>${f.map(c => `<tr><td>${c.id}</td><td>${c.brand}</td><td>${c.battery}%</td><td>${c.range} km</td><td>${c.driver}</td><td>$${c.revenue}</td></tr>`).join('')}</tbody></table><script>window.print()</script></body></html>`);
    w.document.close();
  }

  window.VE = { exportCSV, exportPDF, logout };
})();
