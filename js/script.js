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

  // Custom Global State
  let activeModalCarId = null;
  let _revFilterState = {
    type: 'daily',
    date: '2026-06-09',
    month: '2026-06',
    from: '2026-06-01',
    to: '2026-06-09',
    category: 'All',
    model: 'All'
  };
  let _drvFilterState = {
    type: '3month',
    from: '2026-03-09',
    to: '2026-06-09'
  };
  let _drvVehicleFilter = {
    type: 'monthly',
    date: '2026-06-09',
    month: '2026-06',
    from: '2026-06-01',
    to: '2026-06-09'
  };
  let _reportsFilterState = {
    from: '2026-06-01',
    to: '2026-06-09',
    vehicleId: 'All',
    driver: 'All'
  };

  function getSearchedFleet(f) {
    const searchInput = document.querySelector('.search input');
    const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!searchVal) return f;
    return f.filter(c => 
      c.brand.toLowerCase().includes(searchVal) ||
      c.id.toLowerCase().includes(searchVal) ||
      c.category.toLowerCase().includes(searchVal) ||
      c.driver.toLowerCase().includes(searchVal)
    );
  }

  function getFilteredReportsData(f) {
    const fromDate = _reportsFilterState.from;
    const toDate = _reportsFilterState.to;
    const dates = [];
    
    if (fromDate && toDate) {
      let curr = new Date(fromDate + 'T00:00:00Z');
      const end = new Date(toDate + 'T00:00:00Z');
      
      if (!isNaN(curr.getTime()) && !isNaN(end.getTime())) {
        let count = 0;
        while (curr <= end && count < 90) {
          dates.push(curr.toISOString().split('T')[0]);
          curr.setUTCDate(curr.getUTCDate() + 1);
          count++;
        }
      }
    }

    let filteredFleet = f;
    if (_reportsFilterState.vehicleId !== 'All') {
      filteredFleet = filteredFleet.filter(c => c.id === _reportsFilterState.vehicleId);
    }
    if (_reportsFilterState.driver !== 'All') {
      filteredFleet = filteredFleet.filter(c => c.driver === _reportsFilterState.driver);
    }

    return filteredFleet.map(c => {
      let revenue = 0;
      let maintenance = 0;
      let distance = 0;
      
      dates.forEach(d => {
        const stats = getCarStatsForDate(c, d);
        revenue += stats.revenue;
        maintenance += stats.maintenance;
        distance += stats.distance;
      });

      return {
        id: c.id,
        brand: c.brand,
        category: c.category,
        battery: c.battery,
        range: c.range,
        driver: c.driver,
        revenue: revenue,
        maintenance: maintenance,
        distance: distance
      };
    });
  }

  function monitorAuthState() {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      const page = document.body.dataset.page;
      if (user) {
        let name = "User";
        let role = "driver";
        
        // Fetch profile from Firestore to determine actual role
        const profile = await getUserProfile(user.uid);
        if (profile && profile.role) {
          role = profile.role;
          name = profile.fullName || name;
        } else if (user.displayName) {
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
          // Strict Role-Based Dashboard Protection
          if (currentUser.role === 'admin') {
            if (page === 'driver' || page === 'profile') {
              window.location.href = 'admin-dashboard.html';
              return;
            }
          } else if (currentUser.role === 'driver') {
            if (page === 'admin') {
              window.location.href = 'driver-dashboard.html';
              return;
            }
          }

          if (!pageInitialized) {
            pageInitialized = true;
            setProfile(currentUser);
            if (page === 'admin') initAdmin();
            if (page === 'driver') initDriver();
            hideLoader();
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

  // ---------- Real Dataset ----------
  let BRANDS = [];
  let DRIVERS = [];
  let CATS = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe'];
  let _rawDataset = [];

  function rnd(min, max) { return Math.random() * (max - min) + min; }
  function rint(min, max) { return Math.floor(rnd(min, max + 1)); }

  // Map vehicle type to category
  function getCategory(carType) {
    const sedans = ['Tata', 'Tesla Model 3', 'Tesla Model S', 'BMW i4', 'NIO'];
    const suvs = ['Hyundai Ioniq 5', 'Ford Mach-E', 'Mercedes EQS'];
    const hatchbacks = ['Nissan Leaf', 'Chevy Bolt'];
    const pickups = ['Rivian R1T', 'Tesla Cybertruck'];
    const coupes = ['Polestar', 'Porsche Taycan'];
    
    if (sedans.some(s => carType.includes(s))) return 'Sedan';
    if (suvs.some(s => carType.includes(s))) return 'SUV';
    if (hatchbacks.some(s => carType.includes(s))) return 'Hatchback';
    if (pickups.some(s => carType.includes(s))) return 'Pickup';
    if (coupes.some(s => carType.includes(s))) return 'Coupe';
    return 'Sedan'; // default
  }

  // Transform raw dataset to app format
  function transformDataset(rawData) {
    return rawData.map((d, i) => ({
      id: `EV-${1000 + i}`,
      brand: d.car_type,
      category: getCategory(d.car_type),
      batteryCapacity: d.battery_capacity_kwh,
      battery: d.battery_percentage,
      weight: d.vehicle_weight_kg,
      motor: d.motor_power_kw + ' kW',
      condition: d.maintenance_status === 'Completed' ? 30 : 100,
      speed: d.charging_status === 'Charging' ? 0 : d.speed_kmph,
      charging: d.charging_status === 'Charging',
      driver: `Driver-${d.driver_id}`,
      range: Math.round(d.remaining_distance_km),
      revenue: d.trip_income + d.other_charges,
      maintenance: d.maintenance_count * 20,
      cycles: d.charge_count,
      temp: d.temperature_c,
      efficiency: Math.min(99, Math.max(60, 100 - (d.vehicle_age_years * 5))),
      health: d.battery_health_pct,
      overspeeding: d.overspeeding,
      roadType: d.road_type,
      passengers: d.passenger_count,
      tripDistance: d.distance_travelled_km,
      tripDuration: d.trip_duration_min,
      adminId: d.admin_id,
      driverId: d.driver_id,
      vehicleAge: d.vehicle_age_years
    }));
  }

  // Load dataset and extract unique values
  async function loadDataset() {
    try {
      // Try to fetch the dataset from the correct path
      const response = await fetch('/data/fleet-dataset.json');
      if (!response.ok) {
        console.warn('Dataset file not found, using fallback data');
        return buildDummyFleet(50); // Return more vehicles as fallback
      }
      _rawDataset = await response.json();
      
      // Transform data
      const transformedData = transformDataset(_rawDataset);
      
      // Extract unique brands
      BRANDS = [...new Set(transformedData.map(d => d.brand))];
      
      // Extract unique drivers
      DRIVERS = [...new Set(transformedData.map(d => d.driver))];
      
      console.log('Dataset loaded successfully:', transformedData.length, 'vehicles');
      return transformedData;
    } catch (error) {
      console.error('Failed to load dataset:', error);
      // Fallback: build small dummy fleet
      return buildDummyFleet(50);
    }
  }

  function buildDummyFleet(n = 14) {
    BRANDS = ['Tesla Model S', 'Tesla Model 3', 'Lucid Air', 'Rivian R1T', 'BMW i4', 'Hyundai Ioniq 5', 'Polestar 2', 'Mercedes EQS', 'NIO ET7', 'Ford Mach-E'];
    DRIVERS = ['A. Singh', 'P. Kapoor', 'R. Mehta', 'S. Iyer', 'J. Doe', 'L. Wong', 'M. Garcia', 'K. Tanaka'];
    
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
  let _fleetLoaded = false;

  async function fleet() {
    if (!_fleet) {
      const cached = sessionStorage.getItem('ve_fleet');
      if (cached) { 
        try { 
          _fleet = JSON.parse(cached); 
        } catch { } 
      }
      if (!_fleet) { 
        if (!_fleetLoaded) {
          _fleetLoaded = true;
          _fleet = await loadDataset();
        } else {
          _fleet = buildDummyFleet(14);
        }
        sessionStorage.setItem('ve_fleet', JSON.stringify(_fleet)); 
      }
    }
    return _fleet;
  }

  // ---------- SVG sparkline ----------
  function spark(el, points, color = '#00e7ff') {
    if (!el || !points.length) return;
    const w = el.clientWidth || 300, h = el.clientHeight || 120;
    
    // Padding to make space for labels
    const padLeft = 50;
    const padRight = 15;
    const padTop = 20;
    const padBottom = 20;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;
    
    const min = Math.min(...points);
    const max = Math.max(...points);
    const avg = Math.round(points.reduce((s, x) => s + x, 0) / points.length);
    const current = points[points.length - 1];
    
    // X step
    const sx = plotW / Math.max(1, points.length - 1);
    
    // Y normalization
    const range = Math.max(1, max - min);
    const ny = v => h - padBottom - ((v - min) / range) * plotH;
    
    // Points list path
    const d = points.map((v, i) => {
      const x = padLeft + i * sx;
      const y = ny(v);
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    
    const area = d + ` L ${(padLeft + plotW).toFixed(1)},${(h - padBottom).toFixed(1)} L ${padLeft.toFixed(1)},${(h - padBottom).toFixed(1)} Z`;
    
    // Determine units based on element ID
    let unit = "";
    let labelType = "";
    if (el.id === 'dspark' || el.id === 'liveSpark') {
      unit = " km/h";
      labelType = "Speed";
    } else if (el.id === 'pspark') {
      unit = "%";
      labelType = "Eco Score";
    } else if (el.id === 'revSpark') {
      unit = "";
      labelType = "₹";
    }
    
    // Grid values: max, min, avg
    const gridValues = [max, avg, min];
    // Remove duplicates if values are close
    const uniqueGridValues = Array.from(new Set(gridValues)).sort((a,b) => b - a);
    
    let svg = `
      <defs>
        <linearGradient id="gradFill-${el.id}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
        </linearGradient>
        <filter id="glow-${el.id}" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
    
    // Draw Grid Lines & Labels
    uniqueGridValues.forEach(val => {
      const y = ny(val);
      let displayVal = val.toLocaleString();
      if (labelType === '₹') {
        displayVal = '₹' + displayVal;
      } else {
        displayVal = displayVal + unit;
      }
      
      svg += `
        <line x1="${padLeft}" y1="${y}" x2="${w - padRight}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="2,2" />
        <text x="${padLeft - 8}" y="${y + 4}" text-anchor="end" fill="var(--muted)" style="font-size: 9px; font-family: system-ui, sans-serif;">${displayVal}</text>
      `;
    });
    
    // Draw X-axis line
    svg += `<line x1="${padLeft}" y1="${h - padBottom}" x2="${w - padRight}" y2="${h - padBottom}" stroke="rgba(255,255,255,0.12)" stroke-width="1" />`;
    
    // Draw timeline indicators
    let startLabel = "Start";
    let endLabel = "Now";
    if (el.id === 'pspark') {
      startLabel = "2 weeks ago";
      endLabel = "Today";
    } else if (el.id === 'revSpark') {
      startLabel = "Start";
      endLabel = "End";
    }
    
    svg += `
      <text x="${padLeft}" y="${h - 4}" text-anchor="start" fill="var(--muted)" style="font-size: 9px; font-family: system-ui, sans-serif;">${startLabel}</text>
      <text x="${w - padRight}" y="${h - 4}" text-anchor="end" fill="var(--muted)" style="font-size: 9px; font-family: system-ui, sans-serif;">${endLabel}</text>
    `;

    // Draw area and line path
    svg += `
      <path d="${area}" fill="url(#gradFill-${el.id})" />
      <path d="${d}" fill="none" stroke="${color}" stroke-width="2" filter="url(#glow-${el.id})" style="stroke-linecap: round; stroke-linejoin: round;" />
    `;
    
    // Draw dot at current value
    const lastX = padLeft + plotW;
    const lastY = ny(current);
    svg += `
      <circle cx="${lastX}" cy="${lastY}" r="4" fill="${color}" filter="url(#glow-${el.id})" />
      <circle cx="${lastX}" cy="${lastY}" r="2" fill="white" />
    `;
    
    // Add title in top-left
    let title = labelType;
    if (el.id === 'dspark') title = "Live Speed Profile";
    else if (el.id === 'liveSpark') title = "Fleet Average Speed";
    else if (el.id === 'pspark') title = "Eco driving performance index";
    else if (el.id === 'revSpark') title = "Profit Index";
    
    svg += `
      <text x="${padLeft}" y="${padTop - 8}" fill="var(--muted)" style="font-size: 10px; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase; font-family: system-ui, sans-serif;">
        ${title} (Current: ${labelType === '₹' ? '₹' + current.toLocaleString() : current + unit})
      </text>
    `;

    // Draw guide line and marker for hover
    svg += `
      <line id="${el.id}-guide" x1="0" y1="${padTop}" x2="0" y2="${h - padBottom}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0" style="pointer-events: none;" />
      <circle id="${el.id}-marker" cx="0" cy="0" r="5" fill="${color}" stroke="#ffffff" stroke-width="1.5" opacity="0" style="pointer-events: none;" />
    `;
    
    el.innerHTML = svg;

    // Save interactive parameters for event listener
    el._sparkPoints = points;
    el._sparkColor = color;
    el._sparkPadLeft = padLeft;
    el._sparkPadRight = padRight;
    el._sparkPadTop = padTop;
    el._sparkPadBottom = padBottom;
    el._sparkMin = min;
    el._sparkMax = max;
    el._sparkUnit = unit;
    el._sparkLabelType = labelType;
    el._sparkTitle = title;

    // Attach hover listener once
    if (!el._hasSparkHover) {
      el._hasSparkHover = true;
      el.style.cursor = 'crosshair';

      el.addEventListener('mousemove', (e) => {
        const pts = el._sparkPoints;
        if (!pts || !pts.length) return;
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        const padLeft = el._sparkPadLeft;
        const padRight = el._sparkPadRight;
        const padTop = el._sparkPadTop;
        const padBottom = el._sparkPadBottom;
        const plotW = rect.width - padLeft - padRight;
        const plotH = rect.height - padTop - padBottom;
        const min = el._sparkMin;
        const max = el._sparkMax;
        const unit = el._sparkUnit;
        const labelType = el._sparkLabelType;
        
        const sx = plotW / Math.max(1, pts.length - 1);
        const relativeX = mouseX - padLeft;
        let idx = Math.round(relativeX / sx);
        idx = Math.max(0, Math.min(pts.length - 1, idx));
        
        const val = pts[idx];
        const range = Math.max(1, max - min);
        const valY = rect.height - padBottom - ((val - min) / range) * plotH;
        const valX = padLeft + idx * sx;
        
        const guide = el.querySelector(`#${el.id}-guide`);
        const marker = el.querySelector(`#${el.id}-marker`);
        if (guide) {
          guide.setAttribute('x1', valX);
          guide.setAttribute('x2', valX);
          guide.setAttribute('y1', padTop);
          guide.setAttribute('y2', rect.height - padBottom);
          guide.style.opacity = '1';
        }
        if (marker) {
          marker.setAttribute('cx', valX);
          marker.setAttribute('cy', valY);
          marker.style.opacity = '1';
        }
        
        let tooltip = document.getElementById('chartTooltip');
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'chartTooltip';
          tooltip.style.cssText = `
            position: fixed;
            background: rgba(8, 11, 32, 0.95);
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            border: 1px solid rgba(0, 231, 255, 0.3);
            pointer-events: none;
            z-index: 1000;
            display: none;
            box-shadow: 0 0 15px rgba(0, 231, 255, 0.25);
            font-family: system-ui, sans-serif;
          `;
          document.body.appendChild(tooltip);
        }
        
        let displayVal = val.toLocaleString();
        if (labelType === '₹') {
          displayVal = '₹' + displayVal;
        } else {
          displayVal = displayVal + unit;
        }
        
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: ${el._sparkColor || '#00e7ff'}; margin-bottom: 2px;">${el._sparkTitle}</div>
          <div style="font-size: 13px;">Value: <strong>${displayVal}</strong></div>
          <div style="font-size: 10px; color: var(--muted); margin-top: 4px;">Data index: Point ${idx + 1} of ${pts.length}</div>
        `;
        tooltip.style.borderColor = el._sparkColor;
        tooltip.style.boxShadow = `0 0 15px ${el._sparkColor}40`;
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 12 + 'px';
        tooltip.style.top = e.clientY - 35 + 'px';
      });
      
      el.addEventListener('mouseleave', () => {
        const guide = el.querySelector(`#${el.id}-guide`);
        const marker = el.querySelector(`#${el.id}-marker`);
        if (guide) guide.style.opacity = '0';
        if (marker) marker.style.opacity = '0';
        
        const tooltip = document.getElementById('chartTooltip');
        if (tooltip) tooltip.style.display = 'none';
      });
    }
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

  // ---------- Command Center Telemetry Modal ----------
  function getOrCreateModal() {
    let modalBack = document.getElementById('vehicleTelemetryModal');
    if (!modalBack) {
      modalBack = document.createElement('div');
      modalBack.className = 'modal-back';
      modalBack.id = 'vehicleTelemetryModal';
      modalBack.innerHTML = `<div class="glass modal" id="modalContent"></div>`;
      document.body.appendChild(modalBack);
      
      modalBack.addEventListener('click', (e) => {
        if (e.target === modalBack) {
          window.closeModal();
        }
      });
    }
    return modalBack;
  }

  window.openCarTelemetryModal = async function(carId) {
    activeModalCarId = carId;
    const modalBack = getOrCreateModal();
    modalBack.classList.add('open');
    
    const f = await fleet();
    const c = f.find(x => x.id === carId);
    if (!c) return;
    
    const content = document.getElementById('modalContent');
    content.innerHTML = `
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
        <h3 style="margin-bottom:0; color: var(--text);"><span class="ic">🚗</span> Telemetry: ${c.brand} (${c.id})</h3>
        <button class="icon-btn" onclick="window.closeModal()" style="font-size: 16px; border:none; background:transparent; cursor:pointer;">✕</button>
      </div>
      <div class="grid-2" style="grid-template-columns: 1.2fr 1fr; gap: 20px;">
        <!-- Left Column: Speedometer & Live Telemetry -->
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 10px;">
          <div id="modalSpeedCircle" class="circle" style="--p:${Math.round(Math.min(100, (c.speed / 140) * 100))}; --c: ${c.speed > 90 ? 'var(--red)' : 'var(--cyan)'}; width:160px; height:160px;">
            <span style="font-size: 32px;"><b id="modalSpeedVal">${c.speed}</b><br><small style="font-size:11px; color:var(--muted);">km/h</small></span>
          </div>
          <div id="modalSpeedWarning" class="alert danger" style="margin-top: 15px; width:100%; text-align:center; justify-content:center; display: ${c.speed > 90 ? 'flex' : 'none'};">
            ⚠️ OVERSPEED ALERT: Exceeded 90 km/h limit!
          </div>
          <div style="width:100%; margin-top: 15px;">
            <div class="row"><span>Status</span><b id="modalStatus" style="color:${c.charging ? 'var(--cyan)' : c.speed > 90 ? 'var(--red)' : c.speed > 0 ? 'var(--green)' : 'var(--muted)'}">${c.charging ? 'Charging' : c.speed > 90 ? 'Overspeeding' : c.speed > 0 ? 'On Trip' : 'Idle'}</b></div>
            <div class="row" style="margin-top:8px;"><span>Battery %</span><b>${c.battery}%</b></div>
            <div class="batt-bar" style="margin-top:4px;"><i style="width:${c.battery}%"></i></div>
            <div class="row" style="margin-top:8px;"><span>Range</span><b>${c.range} km</b></div>
          </div>
        </div>
        
        <!-- Right Column: Driver & Action Panel -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="glass panel" style="padding: 12px; background: rgba(255,255,255,0.02); border-color: rgba(120,140,255,0.15);">
            <h4 style="color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Driver Assigned</h4>
            <select class="input" onchange="window.reassignDriver('${c.id}', this.value)" style="padding:6px; font-size:13px; margin-top:4px;">
              ${DRIVERS.map(d => `<option value="${d}" ${c.driver === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
            <div style="font-size:12px; color:var(--muted); margin-top: 6px;">License: LIC-${c.id.split('-')[1]}</div>
          </div>
          
          <div class="glass panel" style="padding: 12px; background: rgba(255,255,255,0.02); border-color: rgba(120,140,255,0.15);">
            <h4 style="color:var(--muted); font-size:11px; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Actions</h4>
            <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
              <button class="btn block" id="btnWarnDriver" onclick="window.issueDriverWarning('${c.id}')">
                📢 Send Warning
              </button>
              <button class="btn ghost block" id="btnGovernSpeed" onclick="window.toggleSpeedGovernor('${c.id}')" style="border-color:${c.governed ? 'var(--green)' : 'var(--card-border)'}; color:${c.governed ? 'var(--green)' : 'var(--text)'}; padding: 8px 12px; font-size: 11px;">
                ${c.governed ? '🔓 Disable Governor' : '⚡ Enable Governor (80km/h)'}
              </button>
            </div>
            <div id="modalActionMsg" style="margin-top: 10px; font-size:12px; color:var(--green); text-align:center; min-height: 18px; text-shadow:0 0 8px rgba(0,255,163,0.3);"></div>
          </div>
        </div>
      </div>
    `;
  };

  window.closeModal = function() {
    const modalBack = document.getElementById('vehicleTelemetryModal');
    if (modalBack) modalBack.classList.remove('open');
    activeModalCarId = null;
  };

  window.issueDriverWarning = async function(carId) {
    const f = await fleet();
    const c = f.find(x => x.id === carId);
    if (!c) return;
    c.warningSent = true;
    sessionStorage.setItem('ve_fleet', JSON.stringify(f));
    
    const msgEl = document.getElementById('modalActionMsg');
    if (msgEl) {
      msgEl.textContent = `📢 Speed warning broadcasted to ${c.driver}!`;
      msgEl.style.color = 'var(--green)';
      setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 3000);
    }
  };

  window.toggleSpeedGovernor = async function(carId) {
    const f = await fleet();
    const c = f.find(x => x.id === carId);
    if (!c) return;
    c.governed = !c.governed;
    if (c.governed) {
      c.speed = Math.min(80, c.speed);
    }
    sessionStorage.setItem('ve_fleet', JSON.stringify(f));
    
    const msgEl = document.getElementById('modalActionMsg');
    if (msgEl) {
      msgEl.textContent = c.governed ? `⚡ Speed Governor Activated!` : `🔓 Speed Governor Deactivated!`;
      msgEl.style.color = c.governed ? 'var(--cyan)' : 'var(--amber)';
      setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 3000);
    }
    
    const govBtn = document.getElementById('btnGovernSpeed');
    if (govBtn) {
      govBtn.innerHTML = c.governed ? '🔓 Disable Governor' : '⚡ Enable Governor (80km/h)';
      govBtn.style.borderColor = c.governed ? 'var(--green)' : 'var(--card-border)';
      govBtn.style.color = c.governed ? 'var(--green)' : 'var(--text)';
    }
  };

  window.reassignDriver = async function(carId, driverName) {
    const f = await fleet();
    const c = f.find(x => x.id === carId);
    if (c) {
      c.driver = driverName;
      sessionStorage.setItem('ve_fleet', JSON.stringify(f));
      const msgEl = document.getElementById('modalActionMsg');
      if (msgEl) {
        msgEl.textContent = `👤 Reassigned to ${driverName}!`;
        msgEl.style.color = 'var(--cyan)';
        setTimeout(() => { if (msgEl) msgEl.textContent = ''; }, 3000);
      }
    }
  };

  window.removeVehicle = async function(carId) {
    if (confirm(`Are you sure you want to remove vehicle ${carId}?`)) {
      const f = await fleet();
      const idx = f.findIndex(x => x.id === carId);
      if (idx !== -1) {
        f.splice(idx, 1);
        sessionStorage.setItem('ve_fleet', JSON.stringify(f));
        const view = location.hash.replace('#', '') || 'dashboard';
        renderAdminView(view);
      }
    }
  };

  async function updateModalLiveTelemetry() {
    if (!activeModalCarId) return;
    const f = await fleet();
    const c = f.find(x => x.id === activeModalCarId);
    if (!c) return;
    
    const speedEl = document.getElementById('modalSpeedVal');
    if (speedEl) speedEl.textContent = c.speed;
    
    const circleEl = document.getElementById('modalSpeedCircle');
    if (circleEl) {
      circleEl.style.setProperty('--p', Math.round(Math.min(100, (c.speed / 140) * 100)));
      if (c.speed > 90) {
        circleEl.style.setProperty('--c', 'var(--red)');
      } else {
        circleEl.style.setProperty('--c', 'var(--cyan)');
      }
    }
    
    const warnBanner = document.getElementById('modalSpeedWarning');
    if (warnBanner) {
      warnBanner.style.display = c.speed > 90 ? 'flex' : 'none';
    }

    const statusEl = document.getElementById('modalStatus');
    if (statusEl) {
      statusEl.textContent = c.charging ? 'Charging' : c.speed > 90 ? 'Overspeeding' : c.speed > 0 ? 'On Trip' : 'Idle';
      statusEl.style.color = c.charging ? 'var(--cyan)' : c.speed > 90 ? 'var(--red)' : c.speed > 0 ? 'var(--green)' : 'var(--muted)';
    }
  }

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
  async function initAdmin() {
    if (!currentUser) return;
    setProfile(currentUser);
    
    // Load dataset first
    await fleet();
    
    const view = location.hash.replace('#', '') || 'dashboard';
    setActiveNav(view);
    renderAdminView(view);

    // Start global simulation ticker
    if (!window._simInterval) {
      window._simInterval = setInterval(async () => {
        const f = await fleet();
        f.forEach(c => {
          if (!c.charging) {
            if (c.governed) {
              c.speed = Math.max(30, Math.min(80, c.speed + rint(-4, 4)));
            } else {
              c.speed = Math.max(0, c.speed + rint(-10, 10));
            }
          }
        });
        sessionStorage.setItem('ve_fleet', JSON.stringify(f));
        updateModalLiveTelemetry();
      }, 1500);
    }

    const searchInput = document.querySelector('.search input');
    if (searchInput) {
      searchInput.oninput = () => {
        const v = location.hash.replace('#', '') || 'dashboard';
        renderAdminView(v);
      };
    }

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

  async function renderAdminView(view) {
    const root = document.getElementById('view');
    const f = await fleet();
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
    f = getSearchedFleet(f);
    const charging = f.filter(c => c.charging).length;
    const maintenance = f.filter(c => c.condition < 50).length;
    const working = f.length - charging - maintenance;
    const total = f.length;
    const inGarage = f.filter(c => c.speed === 0).length;
    const idleCount = f.filter(c => c.speed === 0 && !c.charging).length;
    const overspeeding = f.filter(c => c.speed > 90).length;
    const alerts = f.filter(c => c.health < 50 || c.condition < 25).length;
    const rev = f.reduce((s, c) => s + c.revenue, 0);
    const energy = f.reduce((s, c) => s + c.batteryCapacity * (1 - c.battery / 100), 0).toFixed(0);
    
    root.innerHTML = `
      <h2 class="page-title">Mission Control <small>50 Unique Vehicles • 5000 Trip Records</small></h2>
      <div class="kpi-grid">
        ${kpi('🔌 Charging Cars', 2, 'Latest Status')}
        ${kpi('🔧 Maintenance Cars', 0, 'Latest Status')}
        ${kpi(' Working Cars', 48, 'Latest Status')}
        ${kpi(' Total Vehicles in Garage', 50, 'Fleet Size')}
      </div>
      <div class="kpi-grid" style="margin-top: 8px;">
        ${kpi('Total Trips', 5000)}
        ${kpi('Overspeeding Trips', overspeeding, overspeeding ? 'Action required' : 'All safe', overspeeding ? 'down' : '', "location.hash='#live?filter=overspeed'")}
        ${kpi('Active Drivers', new Set(f.map(c => c.driver)).size, 'Online now')}
        ${kpi('Daily Revenue', '₹' + rev.toLocaleString(), '+8.4% vs yesterday', '', "location.hash='#revenue'")}
        ${kpi('Energy Used', energy + ' kWh', 'Today')}
      </div>
      <div class="glass panel" style="margin-top: 16px;">
        <h3> Fleet Status Summary (Latest Trip Status)</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 12px;">
          <div style="padding: 20px; background: rgba(0, 231, 255, 0.08); border-radius: 8px; border: 2px solid rgba(0, 231, 255, 0.3); text-align: center;">
            <div style="font-size: 14px; color: var(--muted); margin-bottom: 8px;">🔌 CHARGING</div>
            <div style="font-size: 40px; font-weight: 700; color: #00e7ff;">2</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">4% of fleet</div>
            <div style="width: 100%; height: 8px; background: rgba(0,231,255,0.2); border-radius: 4px; margin-top: 12px; overflow: hidden;">
              <div style="width: 4%; height: 100%; background: #00e7ff;"></div>
            </div>
          </div>
          <div style="padding: 20px; background: rgba(177, 92, 255, 0.08); border-radius: 8px; border: 2px solid rgba(177, 92, 255, 0.3); text-align: center;">
            <div style="font-size: 14px; color: var(--muted); margin-bottom: 8px;">🔧 MAINTENANCE</div>
            <div style="font-size: 40px; font-weight: 700; color: #b15cff;">0</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">0% of fleet</div>
            <div style="width: 100%; height: 8px; background: rgba(177,92,255,0.2); border-radius: 4px; margin-top: 12px; overflow: hidden;">
              <div style="width: 0%; height: 100%; background: #b15cff;"></div>
            </div>
          </div>
          <div style="padding: 20px; background: rgba(34, 197, 94, 0.08); border-radius: 8px; border: 2px solid rgba(34, 197, 94, 0.3); text-align: center;">
            <div style="font-size: 14px; color: var(--muted); margin-bottom: 8px;">✅ WORKING</div>
            <div style="font-size: 40px; font-weight: 700; color: #22c55e;">48</div>
            <div style="font-size: 12px; color: var(--muted); margin-top: 6px;">96% of fleet</div>
            <div style="width: 100%; height: 8px; background: rgba(34,197,94,0.2); border-radius: 4px; margin-top: 12px; overflow: hidden;">
              <div style="width: 96%; height: 100%; background: #22c55e;"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="glass panel" style="margin-top: 16px;">
        <h3>🔌 Charging Vehicles</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(0, 231, 255, 0.08); border-radius: 8px; border: 1px solid rgba(0, 231, 255, 0.2);">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #00e7ff;">VEH025</div>
              <div style="font-size: 12px; color: var(--muted);">Tata Punch EV | Driver: DRV043</div>
            </div>
            <div style="text-align: right; margin-right: 12px;">
              <div style="font-size: 18px; font-weight: 700; color: #00e7ff;">27%</div>
              <div style="font-size: 11px; color: var(--muted);">Battery</div>
            </div>
            <div style="width: 100px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div style="width: 27%; height: 100%; background: linear-gradient(90deg, #00e7ff, #b15cff);"></div>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: rgba(0, 231, 255, 0.08); border-radius: 8px; border: 1px solid rgba(0, 231, 255, 0.2);">
            <div style="flex: 1;">
              <div style="font-weight: 600; color: #00e7ff;">VEH038</div>
              <div style="font-size: 12px; color: var(--muted);">MG ZS EV | Driver: DRV049</div>
            </div>
            <div style="text-align: right; margin-right: 12px;">
              <div style="font-size: 18px; font-weight: 700; color: #00e7ff;">27%</div>
              <div style="font-size: 11px; color: var(--muted);">Battery</div>
            </div>
            <div style="width: 100px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div style="width: 27%; height: 100%; background: linear-gradient(90deg, #00e7ff, #b15cff);"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-2" style="margin-top: 16px;">
        <div class="glass panel">
          <h3>📈 3-Month Fleet Income</h3>
          <svg id="incomeChart" style="width: 100%; height: 300px; margin-top: 10px;"></svg>
          <div style="font-size:11px; color:var(--muted); margin: 6px 0 10px 0; line-height: 1.4; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 8px;">
            💡 <strong>About Fleet Income:</strong> Visualizes the consolidated gross revenue aggregated across the entire fleet of 50 vehicles for March, April, and May. Values are represented in Lakhs (L). Hover over each bar to see precise numeric revenue metrics.
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px; font-size: 12px;">
            <div style="padding: 8px; background: rgba(0,231,255,0.08); border-radius: 6px; text-align: center;">
              <div style="color: var(--muted); margin-bottom: 4px;">March</div>
              <div style="font-weight: 700; color: #00e7ff;" id="month1Income">₹0</div>
            </div>
            <div style="padding: 8px; background: rgba(177,92,255,0.08); border-radius: 6px; text-align: center;">
              <div style="color: var(--muted); margin-bottom: 4px;">April</div>
              <div style="font-weight: 700; color: #b15cff;" id="month2Income">₹0</div>
            </div>
            <div style="padding: 8px; background: rgba(34,197,94,0.08); border-radius: 6px; text-align: center;">
              <div style="color: var(--muted); margin-bottom: 4px;">May</div>
              <div style="font-weight: 700; color: #22c55e;" id="month3Income">₹0</div>
            </div>
          </div>
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
            ${f.slice(0, 6).map(c => `<tr style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">
              <td><b>${c.brand}</b><br><span style="color:var(--muted);font-size:11px;">${c.id}</span></td>
              <td>${c.driver}</td>
              <td>${c.battery}%</td>
              <td>${c.range} km</td>
              <td>${c.charging ? pill('Charging', 'charging') : (c.speed > 90 ? pill('Overspeed', 'danger') : c.speed > 0 ? pill('On Trip', 'on') : pill('Idle', 'off'))}</td>
            </tr>`).join('')}
          </tbody></table>
        </div>
        <div class="glass panel">
          <h3>Live Alerts</h3>
          ${f.filter(c => c.speed > 90).slice(0, 2).map(c => `<div class="alert danger" style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">🚨 ${c.id} overspeeding at ${c.speed} km/h! Click to check</div>`).join('') || ''}
          ${f.filter(c => c.battery < 20).slice(0, 2).map(c => `<div class="alert danger">⚠ ${c.id} battery low (${c.battery}%) — recommend charging</div>`).join('') || ''}
          ${f.filter(c => c.temp > 45).slice(0, 2).map(c => `<div class="alert warn">🔥 ${c.id} battery temperature ${c.temp}°C</div>`).join('') || ''}
          ${f.filter(c => c.condition < 25).slice(0, 2).map(c => `<div class="alert warn">🔧 ${c.id} requires maintenance</div>`).join('') || ''}
          <div class="alert info">⚡ Smart charging recommended at off-peak hours (22:00–06:00)</div>
        </div>
      </div>
    `;
    // Generate 3-month income data for each vehicle
    const vehicleMonths = f.map(vehicle => {
      const month1 = Math.round(vehicle.revenue * rint(80, 120) / 100);
      const month2 = Math.round(vehicle.revenue * rint(90, 130) / 100);
      const month3 = Math.round(vehicle.revenue * rint(100, 140) / 100);
      return [month1, month2, month3];
    });
    
    // Calculate totals
    const month1Data = vehicleMonths.reduce((sum, m) => sum + m[0], 0);
    const month2Data = vehicleMonths.reduce((sum, m) => sum + m[1], 0);
    const month3Data = vehicleMonths.reduce((sum, m) => sum + m[2], 0);
    
    // Update monthly income displays
    document.getElementById('month1Income').textContent = '₹' + month1Data.toLocaleString();
    document.getElementById('month2Income').textContent = '₹' + month2Data.toLocaleString();
    document.getElementById('month3Income').textContent = '₹' + month3Data.toLocaleString();
    
    // Render responsive multi-line chart
    renderIncomeLineChart(document.getElementById('incomeChart'), vehicleMonths, f.map(v => v.id));
  }

  function renderIncomeLineChart(svgEl, vehicleData, vehicleIds) {
    if (!svgEl || !vehicleData.length) return;
    
    const padding = 50;
    const w = svgEl.clientWidth || 600;
    const h = svgEl.clientHeight || 300;
    const plotW = w - 2 * padding;
    const plotH = h - 2 * padding;
    
    // Calculate monthly totals
    const months = ['March', 'April', 'May'];
    const monthlyTotals = [
      vehicleData.reduce((sum, data) => sum + data[0], 0),
      vehicleData.reduce((sum, data) => sum + data[1], 0),
      vehicleData.reduce((sum, data) => sum + data[2], 0)
    ];
    
    const maxIncome = Math.max(...monthlyTotals) * 1.15;
    const minIncome = 0;
    const range = maxIncome - minIncome;
    
    let svg = `<defs>
      <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#00e7ff"/>
        <stop offset="100%" stop-color="#0ea5e9"/>
      </linearGradient>
    </defs>`;
    
    // Add axes
    svg += `<line x1="${padding}" y1="${h-padding}" x2="${w-padding}" y2="${h-padding}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${h-padding}" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>`;
    
    // Draw bars
    const barWidth = plotW / (3 * 1.5);
    const barSpacing = plotW / 3;
    
    monthlyTotals.forEach((total, monthIndex) => {
      const barHeight = (total / range) * plotH;
      const barX = padding + monthIndex * barSpacing + (barSpacing - barWidth) / 2;
      const barY = h - padding - barHeight;
      
      // Bar with glow effect
      svg += `<defs>
        <filter id="glow${monthIndex}" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" fill="url(#barGrad)" opacity="0.85" rx="4" filter="url(#glow${monthIndex})" class="revenue-bar" data-month="${monthIndex}" style="cursor:pointer; transition: all 0.3s ease;"/>
      <text x="${barX + barWidth/2}" y="${barY - 12}" text-anchor="middle" style="font-size:13px; fill:#00e7ff; font-weight:700;">₹${(total/100000).toFixed(1)}L</text>`;
    });
    
    // Add month labels
    monthlyTotals.forEach((_, monthIndex) => {
      const labelX = padding + monthIndex * barSpacing + barSpacing / 2;
      svg += `<text x="${labelX}" y="${h - padding + 30}" text-anchor="middle" style="font-size:14px; fill:rgba(255,255,255,0.8); font-weight:600;">${months[monthIndex]}</text>`;
    });
    
    // Add Y-axis values
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const value = minIncome + (range / ySteps) * i;
      const y = h - padding - (i / ySteps) * plotH;
      svg += `<text x="${padding - 12}" y="${y + 4}" text-anchor="end" style="font-size:10px; fill:rgba(255,255,255,0.5);">₹${(value/100000).toFixed(1)}L</text>
              <line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>`;
    }
    
    // Add title
    svg += `<text x="${w/2}" y="${30}" text-anchor="middle" style="font-size:16px; fill:rgba(255,255,255,0.9); font-weight:700;">Total Fleet Revenue (3-Month Trend)</text>`;
    
    svgEl.innerHTML = svg;
    
    // Create tooltip
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'chartTooltip';
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 14px 18px;
        border-radius: 8px;
        font-size: 13px;
        border: 1px solid rgba(0, 231, 255, 0.4);
        pointer-events: none;
        z-index: 1000;
        display: none;
        box-shadow: 0 0 20px rgba(0, 231, 255, 0.3);
      `;
      document.body.appendChild(tooltip);
    }
    
    // Add bar hover listeners
    const bars = svgEl.querySelectorAll('.revenue-bar');
    bars.forEach((bar, idx) => {
      bar.addEventListener('mouseenter', (e) => {
        bar.style.opacity = '1';
        bar.style.filter = 'drop-shadow(0 0 8px #00e7ff)';
        
        tooltip.innerHTML = `
          <div style="font-weight: 700; color: #00e7ff; margin-bottom: 8px;">${months[idx]}</div>
          <div style="font-size:14px; margin-bottom: 6px;"><strong>₹${monthlyTotals[idx].toLocaleString()}</strong></div>
          <div style="font-size:11px; color:rgba(255,255,255,0.7);">Across all 50 vehicles</div>
        `;
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
      });
      
      bar.addEventListener('mouseleave', () => {
        bar.style.opacity = '0.85';
        bar.style.filter = 'none';
        tooltip.style.display = 'none';
      });
    });
  }

  function kpi(label, value, delta, dir, onclick = '') {
    const clickAttr = onclick ? `onclick="${onclick}" style="cursor:pointer;"` : '';
    return `<div class="glass kpi neon-border" ${clickAttr}>
      <div class="ring"></div>
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="delta ${dir || ''}">${delta || ''}</div>
    </div>`;
  }

  function kpiListItem(label, value, delta, dir, onclick = '') {
    const clickAttr = onclick ? `onclick="${onclick}" style="cursor:pointer;"` : '';
    return `<div class="glass kpi-list-item neon-border" ${clickAttr}>
      <div class="kpi-info">
        <span class="kpi-label">${label}</span>
        <span class="kpi-value">${value}</span>
      </div>
      <span class="kpi-delta ${dir || ''}">${delta || ''}</span>
    </div>`;
  }

  window.setGarageFilter = function(filterName) {
    window._garageFilter = filterName;
    renderGarage(document.getElementById('view'), fleet());
  };

  window.toggleCategory = function(categoryName) {
    if (!window._garageCollapsed) {
      window._garageCollapsed = {};
    }
    window._garageCollapsed[categoryName] = !window._garageCollapsed[categoryName];
    renderGarage(document.getElementById('view'), fleet());
  };

  window.deployCategoryVehicle = async function() {
    const cat = document.getElementById('newVehicleCategory').value;
    const f = await fleet();
    
    // Find next ID
    const maxIdNum = f.reduce((max, c) => {
      const num = parseInt(c.id.split('-')[1]);
      return num > max ? num : max;
    }, 1000);
    
    const catBrands = {
      'Sedan': ['Tesla Model 3', 'Tesla Model S', 'Lucid Air', 'BMW i4', 'NIO ET7'],
      'SUV': ['Hyundai Ioniq 5', 'Mercedes EQS', 'Ford Mach-E', 'Tesla Model Y', 'Audi Q8 e-tron'],
      'Pickup': ['Rivian R1T', 'Tesla Cybertruck', 'Ford F-150 Lightning', 'GMC Hummer EV'],
      'Hatchback': ['Polestar 2', 'Nissan Leaf', 'Chevy Bolt EV', 'Mini Cooper SE'],
      'Coupe': ['Porsche Taycan', 'Audi e-tron GT', 'Maserati GranTurismo Folgore']
    };
    
    const brands = catBrands[cat] || ['Tesla Model Y'];
    const brandName = brands[rint(0, brands.length - 1)];
    const cap = [75, 85, 100, 110][rint(0, 3)];
    
    const newVehicle = {
      id: `EV-${maxIdNum + 1}`,
      brand: brandName,
      category: cat,
      batteryCapacity: cap,
      battery: 100,
      weight: rint(1800, 2600),
      motor: rint(250, 600) + ' kW',
      condition: 100,
      speed: 0,
      charging: false,
      driver: DRIVERS[rint(0, DRIVERS.length - 1)],
      range: Math.round(cap * 5.5),
      revenue: 0,
      maintenance: 0,
      cycles: 0,
      temp: 25,
      efficiency: rint(85, 98),
      health: 100
    };
    
    f.push(newVehicle);
    sessionStorage.setItem('ve_fleet', JSON.stringify(f));
    
    renderGarage(document.getElementById('view'), f);
  };

  function renderGarage(root, f) {
    f = getSearchedFleet(f);
    if (!window._garageFilter) {
      window._garageFilter = 'All';
    }
    
    let filtered = f;
    if (window._garageFilter === 'Charging') filtered = f.filter(c => c.charging);
    else if (window._garageFilter === 'On Trip') filtered = f.filter(c => c.speed > 0 && !c.charging);
    else if (window._garageFilter === 'Idle') filtered = f.filter(c => c.speed === 0 && !c.charging);
    else if (window._garageFilter === 'Maintenance') filtered = f.filter(c => c.health < 50 || c.condition < 30);
    else if (window._garageFilter === 'Overspeeding') filtered = f.filter(c => c.speed > 90);

    const categories = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe'];
    const grouped = {};
    categories.forEach(cat => {
      grouped[cat] = filtered.filter(c => c.category === cat);
    });

    const categoryIcons = {
      'Sedan': '🚙',
      'SUV': '🚙💨',
      'Pickup': '🛻',
      'Hatchback': '🚗',
      'Coupe': '🏎️'
    };

    root.innerHTML = `
      <h2 class="page-title">EV Garage <small>${f.length} vehicles registered</small></h2>
      
      <!-- Filter chips -->
      <div style="margin-bottom:18px;">
        ${['All', 'Charging', 'On Trip', 'Idle', 'Maintenance', 'Overspeeding'].map(chipName => `
          <span class="chip ${window._garageFilter === chipName ? 'active' : ''}" onclick="window.setGarageFilter('${chipName}')">
            ${chipName} (${chipName === 'All' ? f.length : 
                           chipName === 'Charging' ? f.filter(c => c.charging).length :
                           chipName === 'On Trip' ? f.filter(c => c.speed > 0 && !c.charging).length :
                           chipName === 'Idle' ? f.filter(c => c.speed === 0 && !c.charging).length :
                           chipName === 'Maintenance' ? f.filter(c => c.health < 50 || c.condition < 30).length :
                           f.filter(c => c.speed > 90).length})
          </span>
        `).join('')}
      </div>

      <!-- Grouped Category Panels -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        ${categories.map(cat => {
          const catCars = grouped[cat];
          if (catCars.length === 0) return ''; 
          
          const avgBatt = catCars.length ? Math.round(catCars.reduce((s,c)=>s+c.battery, 0) / catCars.length) : 0;
          const avgCond = catCars.length ? Math.round(catCars.reduce((s,c)=>s+c.condition, 0) / catCars.length) : 0;
          const catRev = catCars.reduce((s,c)=>s+c.revenue, 0);
          
          const isCollapsed = window._garageCollapsed ? window._garageCollapsed[cat] : false;
          
          return `
            <div class="glass panel category-panel" style="padding: 16px; border-left: 4px solid var(--violet-glow);">
              <div class="category-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; cursor:pointer;" onclick="window.toggleCategory('${cat}')">
                <div style="display:flex; align-items:center; gap:12px;">
                  <span style="font-size:24px;">${categoryIcons[cat] || '🚗'}</span>
                  <div>
                    <h3 style="margin-bottom:2px; color:var(--text); font-size:16px;">${cat}s</h3>
                    <span style="font-size:12px; color:var(--muted);">${catCars.length} Vehicle(s)</span>
                  </div>
                </div>
                
                <!-- Mini stats -->
                <div style="display:flex; gap:24px; align-items:center;">
                  <div style="text-align:right;">
                    <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Avg Battery</div>
                    <div style="font-weight:bold; font-size:14px; color:var(--cyan);">${avgBatt}%</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Avg Condition</div>
                    <div style="font-weight:bold; font-size:14px; color:var(--green);">${avgCond}%</div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-size:11px; color:var(--muted); text-transform:uppercase;">Total Revenue</div>
                    <div style="font-weight:bold; font-size:14px; color:var(--amber);">₹${catRev.toLocaleString()}</div>
                  </div>
                  <span style="font-size:16px; color:var(--muted); margin-left: 8px;">${isCollapsed ? '▼' : '▲'}</span>
                </div>
              </div>
              
              <!-- Collapsible vehicles list -->
              <div style="margin-top: 16px; display: ${isCollapsed ? 'none' : 'block'};">
                ${catCars.length === 0 ? `
                  <div style="color:var(--muted); font-size:13px; text-align:center; padding:20px;">No vehicles found in this category.</div>
                ` : `
                  <div class="car-list">
                    ${catCars.map(c => carListItem(c)).join('')}
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function carListItem(c) {
    return `<div class="glass car-list-item">
      <div class="col-main">
        <div class="brand" style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">${c.brand}</div>
        <div class="vid">${c.id} · ${c.category}</div>
      </div>
      <div class="col-status">
        ${c.charging ? pill('Charging', 'charging') : c.speed > 90 ? pill('Overspeed', 'danger') : c.speed > 0 ? pill('On Trip', 'on') : pill('Idle', 'off')}
      </div>
      <div class="col-battery">
        <div class="row"><span>Battery:</span> <b>${c.battery}%</b></div>
        <div class="batt-bar ${c.battery < 25 ? 'warn' : ''}"><i style="width:${c.battery}%"></i></div>
      </div>
      <div class="col-stats">
        <div><span>Range</span><b>${c.range} km</b></div>
        <div><span>Condition</span><b>${c.condition}%</b></div>
      </div>
      <div class="col-motor">
        <span>Motor:</span><b>${c.motor}</b>
      </div>
      <div class="col-actions">
        <button class="btn" onclick="window.openCarTelemetryModal('${c.id}')">View</button>
        <button class="btn ghost" onclick="window.openCarTelemetryModal('${c.id}')">Edit</button>
        <button class="btn danger" onclick="window.removeVehicle('${c.id}')">Remove</button>
      </div>
    </div>`;
  }

  async function renderLive(root, f) {
    const hist = [];
    const hash = location.hash.replace('#', '') || 'live';
    const filter = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]).get('filter') : '';
    
    let filterLabel = 'Realtime telemetry';
    if (filter === 'overspeed') filterLabel = 'Filtering: Overspeeding Vehicles (>90 km/h)';
    else if (filter === 'charging') filterLabel = 'Filtering: Charging Vehicles';

    root.innerHTML = `
      <h2 class="page-title">Live Monitoring <small>${filterLabel}</small></h2>
      
      ${filter ? `
        <div style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">
          <span class="status-pill warn" style="text-transform:none;">Active Filter: ${filter}</span>
          <a href="#live" style="color:var(--cyan); font-size:12px; text-decoration:none;">[Clear Filter]</a>
        </div>
      ` : ''}

      <div class="grid-2">
        <div class="glass panel">
          <h3><span class="pulse"></span>Active Vehicles</h3>
          <table id="liveTable"><thead><tr><th>Vehicle</th><th>Driver</th><th>Speed</th><th>Battery</th><th>Status</th><th>Location</th></tr></thead><tbody></tbody></table>
        </div>
        <div class="glass panel">
          <h3>Fleet Speed (live)</h3>
          <svg class="spark" id="liveSpark"></svg>
          <div style="font-size:11px; color:var(--muted); margin: 6px 0 12px 0; line-height: 1.4; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 8px;">
            💡 <strong>About Fleet Speed:</strong> Tracks the rolling average speed of all active vehicles on trip. Refreshed in real-time every 1.5 seconds. Hover over the graph to view specific values.
          </div>
          <div class="row" style="margin-top:10px;"><span>Avg Speed</span><b id="avgSpeed">— km/h</b></div>
          <div class="row"><span>Peak Speed</span><b id="peakSpeed">— km/h</b></div>
          <div class="row"><span>Vehicles Online</span><b>${f.length}</b></div>
        </div>
      </div>
    `;

    const tbody = document.querySelector('#liveTable tbody');
    const update = async () => {
      try {
        const currentFleet = getSearchedFleet(await fleet());
        const currentHash = location.hash.replace('#', '') || 'live';
        const currentFilter = currentHash.includes('?') ? new URLSearchParams(currentHash.split('?')[1]).get('filter') : '';

        let displayFleet = currentFleet || [];
        if (currentFilter === 'overspeed') {
          displayFleet = (currentFleet || []).filter(c => c.speed > 90);
        } else if (currentFilter === 'charging') {
          displayFleet = (currentFleet || []).filter(c => c.charging);
        }

        if (tbody && Array.isArray(displayFleet)) {
          tbody.innerHTML = displayFleet.map(c => {
            const isOverspeed = c.speed > 90;
            const speedStyle = isOverspeed ? 'color: var(--red); font-weight: bold; text-shadow: 0 0 8px rgba(255,59,107,0.4);' : '';
            const speedText = isOverspeed ? `⚠️ ${c.speed}` : c.speed;
            return `<tr class="${isOverspeed ? 'overspeed-row' : ''}" style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">
              <td><b>${c.brand}</b><br><span style="color:var(--muted);font-size:11px;">${c.id}</span></td>
              <td>${c.driver}</td>
              <td style="${speedStyle}"><b>${speedText}</b> km/h</td>
              <td>${c.battery}%</td>
              <td>${c.charging ? pill('Charging', 'charging') : c.speed > 90 ? pill('Overspeed', 'danger') : c.speed > 0 ? pill('Online', 'on') : pill('Idle', 'off')}</td>
              <td>${(28 + Math.random()).toFixed(3)}°N, ${(77 + Math.random()).toFixed(3)}°E</td>
            </tr>`;
          }).join('');
        }

        if (Array.isArray(currentFleet) && currentFleet.length > 0) {
          const avg = Math.round(currentFleet.reduce((s, c) => s + c.speed, 0) / currentFleet.length);
          hist.push(avg); if (hist.length > 30) hist.shift();
          spark(document.getElementById('liveSpark'), hist);
          
          const avgSpeedEl = document.getElementById('avgSpeed');
          if (avgSpeedEl) avgSpeedEl.textContent = avg + ' km/h';
          
          const peakSpeedEl = document.getElementById('peakSpeed');
          if (peakSpeedEl) peakSpeedEl.textContent = Math.max(...currentFleet.map(c => c.speed)) + ' km/h';
        }
      } catch (err) {
        console.error('Live monitoring update error:', err);
      }
    };

    // Initial update
    update();
    // Live updates
    const t = setInterval(update, 1500);
    window.addEventListener('hashchange', () => clearInterval(t), { once: true });
  }

  function renderBattery(root, f) {
    f = getSearchedFleet(f);
    const overheats = f.filter(c => c.temp > 45);
    const lows = f.filter(c => c.battery < 20);

    // Calculate last 3 months (90 days) of dates
    const last90Days = [];
    const baseDate = new Date('2026-06-09');
    for (let i = 0; i < 90; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      last90Days.push(d.toISOString().split('T')[0]);
    }

    // Compute individual charging expenses (18% of revenue)
    const individualExpenses = f.map(c => {
      let totalChargeExp = 0;
      last90Days.forEach(d => {
        const stats = getCarStatsForDate(c, d);
        totalChargeExp += Math.round(stats.revenue * 0.18);
      });
      return {
        id: c.id,
        brand: c.brand,
        category: c.category,
        expense: totalChargeExp
      };
    });

    // Group by brand
    const brandExpenses = {};
    individualExpenses.forEach(x => {
      if (!brandExpenses[x.brand]) {
        brandExpenses[x.brand] = {
          brand: x.brand,
          category: x.category,
          count: 0,
          totalExpense: 0
        };
      }
      brandExpenses[x.brand].count++;
      brandExpenses[x.brand].totalExpense += x.expense;
    });
    const brandExpensesList = Object.values(brandExpenses).sort((a, b) => b.totalExpense - a.totalExpense);

    root.innerHTML = `
      <h2 class="page-title">Battery Analytics <small>Health, cycles, temperature</small></h2>
      ${lows.map(c => `<div class="alert danger">⚠ Low battery: ${c.id} at ${c.battery}% — Range ${c.range} km</div>`).join('')}
      ${overheats.map(c => `<div class="alert warn">🔥 Overheating: ${c.id} — ${c.temp}°C</div>`).join('')}
      <div class="grid-3">
        ${kpi('Avg Battery Health', Math.round(f.reduce((s, c) => s + c.health, 0) / f.length) + '%', 'Stable')}
        ${kpi('Charging Efficiency', Math.round(f.reduce((s, c) => s + c.efficiency, 0) / f.length) + '%', '+2.1%')}
        ${kpi('Avg Cycles', Math.round(f.reduce((s, c) => s + c.cycles, 0) / f.length), 'Lifetime')}
      </div>

      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>⚡ Brand Charging Expenses (Last 3 Months)</h3>
          <table>
            <thead>
              <tr>
                <th>Model / Brand</th>
                <th>Category</th>
                <th>Vehicles Count</th>
                <th>Total Expenses</th>
              </tr>
            </thead>
            <tbody>
              ${brandExpensesList.length === 0 ? `
                <tr><td colspan="4" style="text-align:center; color:var(--muted);">No charging expenses matches filter.</td></tr>
              ` : brandExpensesList.map(b => `
                <tr>
                  <td><b>${b.brand}</b></td>
                  <td><span class="status-pill off">${b.category}</span></td>
                  <td><b>${b.count}</b> vehicle(s)</td>
                  <td style="color:var(--cyan); font-weight:600;">₹${b.totalExpense.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="glass panel">
          <h3>🚗 Individual Charging Expenses (Last 3 Months)</h3>
          <table style="width: 100%;">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Model</th>
                <th>Expenses</th>
              </tr>
            </thead>
            <tbody>
              ${individualExpenses.length === 0 ? `
                <tr><td colspan="3" style="text-align:center; color:var(--muted);">No vehicle matches filter.</td></tr>
              ` : individualExpenses.map(c => `
                <tr style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">
                  <td><b>${c.id}</b></td>
                  <td>${c.brand}</td>
                  <td style="color:var(--cyan); font-weight:600;">₹${c.expense.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
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
    f = getSearchedFleet(f);

    const getDatesInRange = (startDate, endDate) => {
      const dates = [];
      let curr = new Date(startDate);
      const end = new Date(endDate);
      let count = 0;
      while (curr <= end && count < 180) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
        count++;
      }
      return dates;
    };

    const dates = getDatesInRange(_drvFilterState.from, _drvFilterState.to);

    const drivers = Array.from(new Set(f.map(c => c.driver))).map(name => {
      const driverCars = f.filter(c => c.driver === name);
      let totalDistance = 0;
      let totalOverspeed = 0;
      let totalBraking = 0;
      let speedSum = 0;
      let count = 0;

      // Group overspeed violations by month
      const overspeedByMonth = {};

      dates.forEach(d => {
        const monthStr = d.substring(0, 7); // e.g. "2026-03"
        driverCars.forEach(c => {
          const stats = getCarStatsForDate(c, d);
          totalDistance += stats.distance;
          totalOverspeed += stats.overspeedViolations;
          totalBraking += stats.suddenBraking;
          speedSum += stats.avgSpeed;
          count++;

          if (stats.overspeedViolations > 0) {
            overspeedByMonth[monthStr] = (overspeedByMonth[monthStr] || 0) + stats.overspeedViolations;
          }
        });
      });

      const avg = count > 0 ? Math.round(speedSum / count) : rint(40, 70);
      
      // Normalize scoring based on period duration (daysCount) to prevent scores dropping to minimum for longer periods
      const daysCount = dates.length || 1;
      const avgDailyOverspeed = totalOverspeed / daysCount;
      const avgDailyBraking = totalBraking / daysCount;
      
      let safety = 100 - (avgDailyOverspeed * 30) - (avgDailyBraking * 15);
      safety = Math.max(50, Math.min(100, Math.round(safety)));

      let eco = 98 - (avgDailyBraking * 12) - (avg > 70 ? (avg - 70) * 0.4 : 0);
      eco = Math.max(50, Math.min(98, Math.round(eco)));

      return {
        name,
        safety,
        eco,
        avg,
        over: totalOverspeed,
        brakes: totalBraking,
        distance: totalDistance,
        overspeedByMonth
      };
    });

    const formatDateLabel = (dStr) => {
      const [y, m, d] = dStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
    };
    const dateLabel = `Showing behavior stats from ${formatDateLabel(_drvFilterState.from)} to ${formatDateLabel(_drvFilterState.to)}`;

    root.innerHTML = `
      <h2 class="page-title">Driver Analysis <small>Behavior &amp; safety scoring</small></h2>
      <p style="color:var(--muted); font-size:13px; margin-top:-12px; margin-bottom:16px;">
        📊 ${dateLabel} (${_drvFilterState.type === '3month' ? 'Default 3-Month Period' : _drvFilterState.type === 'all' ? 'All Period' : 'Custom Period'})
      </p>
      
      <!-- Filter Panel -->
      <div class="glass panel" style="margin-bottom:16px;">
        <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end;">
          <div class="form-group" style="margin-bottom:0; flex:1; min-width:160px;">
            <label>Analysis Period</label>
            <select class="input" id="drvFilterType" style="padding: 8px 12px; font-size:13px;">
              <option value="3month" ${_drvFilterState.type === '3month' ? 'selected' : ''}>Last 3 Months (Default)</option>
              <option value="all" ${_drvFilterState.type === 'all' ? 'selected' : ''}>Show All (6 Months)</option>
              <option value="custom" ${_drvFilterState.type === 'custom' ? 'selected' : ''}>Custom Range</option>
            </select>
          </div>
          
          <div id="drvRangeGroup" style="display:${_drvFilterState.type === 'custom' ? 'flex' : 'none'}; gap:10px; align-items:center; flex:2; min-width:260px;">
            <div class="form-group" style="margin-bottom:0; flex:1;">
              <label>From</label>
              <input class="input" type="date" id="drvRangeFrom" value="${_drvFilterState.from}" style="padding: 8px 12px; font-size:13px;">
            </div>
            <div class="form-group" style="margin-bottom:0; flex:1;">
              <label>To</label>
              <input class="input" type="date" id="drvRangeTo" value="${_drvFilterState.to}" style="padding: 8px 12px; font-size:13px;">
            </div>
          </div>
          
          <button class="btn" id="btnApplyDrvFilter" style="padding: 8px 16px; font-size:12px;">⚡ Apply Period</button>
        </div>
      </div>

      <div class="driver-list">
        ${drivers.length === 0 ? `
          <div class="glass panel" style="text-align: center; color: var(--muted); padding: 32px;">
            No driver data found for the current filter.
          </div>
        ` : drivers.map(d => `<div class="glass driver-list-item">
          <div class="col-driver">
            <div class="avatar" style="width:36px; height:36px; border-radius:50%; font-weight:bold; display:grid; place-items:center;">${d.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <b style="font-size:16px;">${d.name}</b>
              <div style="margin-top: 4px;">
                ${pill(d.safety > 80 ? 'Safe' : d.safety > 60 ? 'Average' : 'Risky', d.safety > 80 ? 'on' : d.safety > 60 ? 'warn' : 'danger')}
              </div>
            </div>
          </div>
          <div class="col-score">
            <div class="row-simple"><span>Safety Score</span><b>${d.safety}%</b></div>
            <div class="batt-bar"><i style="width:${d.safety}%"></i></div>
          </div>
          <div class="col-score">
            <div class="row-simple"><span>Eco Score</span><b>${d.eco}%</b></div>
            <div class="batt-bar"><i style="width:${d.eco}%"></i></div>
          </div>
          <div class="col-violations">
            <div>Overspeed: <b style="color:${d.over > 0 ? 'var(--red)' : 'var(--text)'}; font-weight:600;">${d.over}x</b></div>
            <div style="margin-top: 4px;">Braking: <b>${d.brakes}x</b></div>
            ${d.over > 0 ? `
              <div style="font-size: 10px; color: var(--muted); margin-top: 4px; line-height: 1.3;">
                ${Object.entries(d.overspeedByMonth).map(([m, val]) => {
                  const month = m.split('-')[1];
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return `${monthNames[parseInt(month) - 1]}:${val}x`;
                }).join(' ')}
              </div>
            ` : ''}
          </div>
          <div class="col-details">
            <div>Avg Speed: <b>${d.avg} km/h</b></div>
            <div style="margin-top: 4px;">Distance: <b>${Math.round(d.distance).toLocaleString()} km</b></div>
          </div>
        </div>`).join('')}
      </div>
      
      <div class="glass panel" style="margin-top:16px;">
        <h3>Top Drivers — Radar View</h3>
        ${drivers.length > 0 ? radarSVG(drivers[0]) : '<p style="color:var(--muted); padding: 16px 0;">No radar data available</p>'}
      </div>
    `;

    const drvFilterType = document.getElementById('drvFilterType');
    const drvRangeGroup = document.getElementById('drvRangeGroup');
    const btnApplyDrvFilter = document.getElementById('btnApplyDrvFilter');

    if (drvFilterType) {
      drvFilterType.addEventListener('change', (e) => {
        const val = e.target.value;
        drvRangeGroup.style.display = val === 'custom' ? 'flex' : 'none';
      });
    }

    if (btnApplyDrvFilter) {
      btnApplyDrvFilter.addEventListener('click', () => {
        _drvFilterState.type = drvFilterType.value;
        if (_drvFilterState.type === 'all') {
          _drvFilterState.from = '2025-12-12';
          _drvFilterState.to = '2026-06-09';
        } else if (_drvFilterState.type === '3month') {
          _drvFilterState.from = '2026-03-09';
          _drvFilterState.to = '2026-06-09';
        } else {
          _drvFilterState.from = document.getElementById('drvRangeFrom').value;
          _drvFilterState.to = document.getElementById('drvRangeTo').value;
        }
        renderDriverAnalysis(root, f);
      });
    }
  }

  function radarSVG(d) {
    const metrics = [
      { k: 'Safety', v: d.safety },
      { k: 'Eco', v: d.eco },
      { k: 'Smoothness', v: 100 - d.brakes * 4 },
      { k: 'Discipline', v: 100 - d.over * 6 },
      { k: 'Avg Speed', v: Math.min(100, d.avg + 10) }
    ];
    const cx = 160, cy = 145, r = 100;
    
    // Concentric grid rings
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    let gridHTML = '';
    
    gridLevels.forEach(lvl => {
      const lvlPts = metrics.map((_, i) => {
        const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
        return [cx + Math.cos(a) * r * lvl, cy + Math.sin(a) * r * lvl];
      });
      // Concentric polygon ring
      gridHTML += `<polygon points="${lvlPts.map(p => p.join(',')).join(' ')}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="2,2"/>`;
      
      // Level labels along the vertical axis (except level 0)
      const labelY = cy - r * lvl;
      gridHTML += `<text x="${cx + 6}" y="${labelY + 3}" fill="rgba(255,255,255,0.35)" style="font-size: 8px; font-family: system-ui, sans-serif;">${Math.round(lvl * 100)}</text>`;
    });

    const pts = metrics.map((m, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      const rad = (m.v / 100) * r;
      return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
    });
    
    const bgPts = metrics.map((_, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });
    
    // Connect axes lines from center to outer points
    const axesHTML = bgPts.map(p => `<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>`).join('');
    
    // Labels containing values
    const labels = metrics.map((m, i) => {
      const a = -Math.PI / 2 + (i / metrics.length) * Math.PI * 2;
      const labelX = cx + Math.cos(a) * (r + 20);
      const labelY = cy + Math.sin(a) * (r + 14);
      let anchor = 'middle';
      if (Math.cos(a) > 0.1) anchor = 'start';
      else if (Math.cos(a) < -0.1) anchor = 'end';
      
      return `<text x="${labelX}" y="${labelY}" text-anchor="${anchor}" fill="rgba(255,255,255,0.85)" style="font-size: 11px; font-weight: 600; font-family: system-ui, sans-serif;">
        ${m.k}: <tspan fill="var(--cyan)" font-weight="700">${Math.round(m.v)}</tspan>
      </text>`;
    }).join('');
    
    // Highlight points on the value polygon
    const pointsHTML = pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--cyan)" stroke="#fff" stroke-width="1" filter="drop-shadow(0 0 4px var(--cyan))" />`).join('');

    return `
      <svg class="radar" viewBox="0 0 320 290" width="100%" height="290">
        ${gridHTML}
        ${axesHTML}
        <polygon class="val" points="${pts.map(p => p.join(',')).join(' ')}"/>
        ${pointsHTML}
        ${labels}
      </svg>
      <div style="font-size: 12px; line-height: 1.5; color: var(--muted); margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
        <p style="margin: 0; font-weight: 600; color: rgba(255,255,255,0.95); margin-bottom: 6px;">💡 About Top Drivers Radar View:</p>
        <p style="margin: 0;">This chart scales from 0 to 100 on five core driver telemetry dimensions:</p>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; color: var(--muted); display: flex; flex-direction: column; gap: 4px;">
          <li><strong>Safety Score:</strong> Evaluates sudden accelerations, braking, and speeding.</li>
          <li><strong>Eco Driving:</strong> Assesses energy efficiency and regenerative braking reuse.</li>
          <li><strong>Smoothness:</strong> High score indicates clean, gradual deceleration profile.</li>
          <li><strong>Discipline:</strong> Tracks speed threshold conformity (avoids >90 km/h).</li>
          <li><strong>Avg Speed Index:</strong> Measures average speed relative to route guidelines.</li>
        </ul>
      </div>
    `;
  }

  function renderMaintenance(root, f) {
    f = getSearchedFleet(f);
    const needing = f.filter(c => c.health < 50 || c.condition < 30);

    const totalMaint = f.reduce((s, c) => s + c.maintenance, 0);
    const totalCharging = f.reduce((s, c) => s + Math.round(c.revenue * 0.18), 0);
    const totalService = totalMaint + totalCharging;
    const avgService = f.length > 0 ? Math.round(totalService / f.length) : 0;
    const avgMaint = f.length > 0 ? Math.round(totalMaint / f.length) : 0;
    const avgCharging = f.length > 0 ? Math.round(totalCharging / f.length) : 0;

    root.innerHTML = `
      <h2 class="page-title">Maintenance Center <small>Predictive alerts &amp; service history</small></h2>
      
      <div class="kpi-grid">
        ${kpi('Total Service Cost', '₹' + totalService.toLocaleString(), `Maint: ₹${totalMaint.toLocaleString()} | Charging: ₹${totalCharging.toLocaleString()}`)}
        ${kpi('Average Service Cost', '₹' + avgService.toLocaleString(), `Per vehicle average`)}
        ${kpi('Total Charging Cost', '₹' + totalCharging.toLocaleString(), `Energy cost (18% of revenue)`)}
        ${kpi('Fleet Condition Avg', (f.length > 0 ? Math.round(f.reduce((s, c) => s + c.condition, 0) / f.length) : 0) + '%', '')}
      </div>

      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>Predicted Repair Alerts</h3>
          ${needing.length ? needing.map(c => `<div class="alert ${c.condition < 15 ? 'danger' : 'warn'}">🔧 ${c.id} (${c.brand}) — Condition ${c.condition}% · Battery health ${c.health}%</div>`).join('') : '<div class="alert info">All vehicles healthy.</div>'}
        </div>
        <div class="glass panel">
          <h3>Service Timeline</h3>
          <div class="timeline">
            <div class="item"><b>EV-1003</b> · Brake pad replaced<br><span style="color:var(--muted);font-size:12px;">2 days ago · ₹180</span></div>
            <div class="item"><b>EV-1006</b> · Battery coolant top-up<br><span style="color:var(--muted);font-size:12px;">5 days ago · ₹60</span></div>
            <div class="item"><b>EV-1001</b> · Tire rotation<br><span style="color:var(--muted);font-size:12px;">1 week ago · ₹40</span></div>
            <div class="item"><b>EV-1008</b> · Software update OTA<br><span style="color:var(--muted);font-size:12px;">2 weeks ago · ₹0</span></div>
          </div>
        </div>
      </div>

      <div class="glass panel" style="margin-top:16px;">
        <h3>Vehicle Maintenance &amp; Charging Breakdown</h3>
        <table>
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Brand / Model</th>
              <th>Condition</th>
              <th>Maintenance Cost</th>
              <th>Charging Cost</th>
              <th>Total Service Cost</th>
            </tr>
          </thead>
          <tbody>
            ${f.length === 0 ? `
              <tr><td colspan="6" style="text-align:center; color:var(--muted);">No vehicles match current search filter.</td></tr>
            ` : f.map(c => {
              const maint = c.maintenance;
              const charging = Math.round(c.revenue * 0.18);
              const total = maint + charging;
              return `
                <tr style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">
                  <td><b>${c.id}</b></td>
                  <td>${c.brand}</td>
                  <td>
                    <span class="status-pill ${c.condition > 70 ? 'on' : c.condition > 40 ? 'warn' : 'danger'}">
                      ${c.condition}% Health
                    </span>
                  </td>
                  <td style="color:${maint > 0 ? 'var(--red)' : 'var(--text)'}">₹${maint.toLocaleString()}</td>
                  <td style="color:var(--cyan); font-weight:600;">₹${charging.toLocaleString()}</td>
                  <td style="color:var(--green); font-weight:600;">₹${total.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          ${f.length > 0 ? `
          <tfoot>
            <tr style="font-weight:bold; border-top:2px solid var(--border); background:rgba(255,255,255,0.02);">
              <td>Average</td>
              <td>All Vehicles</td>
              <td>-</td>
              <td style="color:var(--red)">₹${avgMaint.toLocaleString()}</td>
              <td style="color:var(--cyan)">₹${avgCharging.toLocaleString()}</td>
              <td style="color:var(--green)">₹${avgService.toLocaleString()}</td>
            </tr>
            <tr style="font-weight:bold; background:rgba(255,255,255,0.04);">
              <td>Total</td>
              <td>All Vehicles</td>
              <td>-</td>
              <td style="color:var(--red)">₹${totalMaint.toLocaleString()}</td>
              <td style="color:var(--cyan)">₹${totalCharging.toLocaleString()}</td>
              <td style="color:var(--green)">₹${totalService.toLocaleString()}</td>
            </tr>
          </tfoot>
          ` : ''}
        </table>
      </div>
    `;
  }

  function getCarStatsForDate(car, dateStr) {
    const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                 car.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                 
    const pseudoRnd = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    
    const revSeed = pseudoRnd(seed);
    const revenue = Math.round(100 + revSeed * 300); 
    
    const maintSeed = pseudoRnd(seed + 1);
    const hasMaint = maintSeed < 0.12; 
    const maintenance = hasMaint ? Math.round(40 + maintSeed * 160) : 0;
    
    const distanceSeed = pseudoRnd(seed + 2);
    const distance = Math.round(60 + distanceSeed * 190); 

    const overspeedSeed = pseudoRnd(seed + 3);
    const hasOverspeed = overspeedSeed < 0.22; // 22% probability
    const overspeedViolations = hasOverspeed ? Math.floor(1 + pseudoRnd(seed + 4) * 3) : 0;

    const brakingSeed = pseudoRnd(seed + 5);
    const hasBraking = brakingSeed < 0.35; // 35% probability
    const suddenBraking = hasBraking ? Math.floor(1 + pseudoRnd(seed + 6) * 4) : 0;

    const speedSeed = pseudoRnd(seed + 7);
    const avgSpeed = Math.round(45 + speedSeed * 35); // 45 to 80 km/h
    
    return { revenue, maintenance, distance, overspeedViolations, suddenBraking, avgSpeed };
  }

  function renderRevenue(root, f) {
    f = getSearchedFleet(f);

    // Calculate dates list
    const getDatesInRange = (startDate, endDate) => {
      const dates = [];
      let curr = new Date(startDate);
      const end = new Date(endDate);
      let count = 0;
      while (curr <= end && count < 90) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
        count++;
      }
      return dates;
    };

    const getDatesInMonth = (yearMonthStr) => {
      const [year, month] = yearMonthStr.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const dates = [];
      for (let i = 1; i <= lastDay; i++) {
        const dayStr = String(i).padStart(2, '0');
        dates.push(`${yearMonthStr}-${dayStr}`);
      }
      return dates;
    };

    let dates = [];
    let titleDetail = '';
    
    if (_revFilterState.type === 'daily') {
      dates = [_revFilterState.date];
      titleDetail = `for ${_revFilterState.date}`;
    } else if (_revFilterState.type === 'monthly') {
      dates = getDatesInMonth(_revFilterState.month);
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const [y, m] = _revFilterState.month.split('-');
      titleDetail = `for ${monthNames[parseInt(m) - 1]} ${y}`;
    } else if (_revFilterState.type === 'range') {
      dates = getDatesInRange(_revFilterState.from, _revFilterState.to);
      titleDetail = `from ${_revFilterState.from} to ${_revFilterState.to}`;
    }

    // Dynamic dropdown filters options
    const categories = ['All', 'Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe'];
    const distinctBrands = Array.from(new Set(
      _revFilterState.category === 'All' 
        ? f.map(c => c.brand) 
        : f.filter(c => c.category === _revFilterState.category).map(c => c.brand)
    )).sort();
    const availableModels = ['All', ...distinctBrands];

    // Apply category & model filters to fleet
    let activeFleet = f;
    if (_revFilterState.category !== 'All') {
      activeFleet = activeFleet.filter(c => c.category === _revFilterState.category);
    }
    if (_revFilterState.model !== 'All') {
      activeFleet = activeFleet.filter(c => c.brand === _revFilterState.model);
    }

    let totalRevenue = 0;
    let totalMaintenance = 0;
    let totalDistance = 0;
    
    // Detailed list of vehicles breakdown
    const carBreakdown = activeFleet.map(c => {
      let carRev = 0;
      let carMaint = 0;
      let carDist = 0;
      dates.forEach(d => {
        const stats = getCarStatsForDate(c, d);
        carRev += stats.revenue;
        carMaint += stats.maintenance;
        carDist += stats.distance;
      });
      totalRevenue += carRev;
      totalMaintenance += carMaint;
      totalDistance += carDist;
      
      const carEnergyCost = Math.round(carRev * 0.18);
      const carProfit = carRev - carMaint - carEnergyCost;
      
      return {
        id: c.id,
        brand: c.brand,
        distance: carDist,
        revenue: carRev,
        maintenance: carMaint,
        energy: carEnergyCost,
        profit: carProfit
      };
    });

    // Brand grouped summary totals calculations
    const brandStatsMap = {};
    dates.forEach(d => {
      f.forEach(c => {
        // Group totals filter check (strictly match category if category is selected)
        if (_revFilterState.category !== 'All' && c.category !== _revFilterState.category) return;
        
        const stats = getCarStatsForDate(c, d);
        if (!brandStatsMap[c.brand]) {
          brandStatsMap[c.brand] = {
            brand: c.brand,
            category: c.category,
            vehiclesCount: new Set(),
            distance: 0,
            revenue: 0,
            maintenance: 0
          };
        }
        brandStatsMap[c.brand].vehiclesCount.add(c.id);
        brandStatsMap[c.brand].distance += stats.distance;
        brandStatsMap[c.brand].revenue += stats.revenue;
        brandStatsMap[c.brand].maintenance += stats.maintenance;
      });
    });

    const brandSummaryList = Object.values(brandStatsMap).map(bs => {
      const energy = Math.round(bs.revenue * 0.18);
      const profit = bs.revenue - bs.maintenance - energy;
      return {
        brand: bs.brand,
        category: bs.category,
        count: bs.vehiclesCount.size,
        distance: bs.distance,
        revenue: bs.revenue,
        maintenance: bs.maintenance,
        profit: profit
      };
    }).sort((a, b) => b.revenue - a.revenue);

    const energyCost = Math.round(totalRevenue * 0.18);
    const opsCost = Math.round(totalRevenue * 0.10);
    const profit = totalRevenue - totalMaintenance - energyCost - opsCost;
    
    const dailyRevenues = [];
    dates.forEach(d => {
      let dayRev = 0;
      activeFleet.forEach(c => {
        dayRev += getCarStatsForDate(c, d).revenue;
      });
      dailyRevenues.push(dayRev);
    });
    
    let sparkPoints = dailyRevenues;
    if (dates.length === 1) {
      const targetDate = new Date(_revFilterState.date);
      const last7Dates = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(targetDate);
        d.setDate(d.getDate() - i);
        last7Dates.push(d.toISOString().split('T')[0]);
      }
      sparkPoints = last7Dates.map(dStr => {
        let revVal = 0;
        activeFleet.forEach(c => { revVal += getCarStatsForDate(c, dStr).revenue; });
        return revVal;
      });
    }

    root.innerHTML = `
      <h2 class="page-title">Revenue Analytics <small>${titleDetail}</small></h2>
      
      <!-- Filter controls -->
      <div class="glass panel" style="margin-bottom: 20px; padding: 16px;">
        <h3 style="font-size:13px; margin-bottom:12px;">💹 Time Period &amp; Fleet Filters</h3>
        <div class="revenue-controls">
          <div class="form-group" style="margin-bottom:0; flex:1; min-width:140px;">
            <label>Filter Type</label>
            <select class="input" id="revFilterType" style="padding: 8px 12px; font-size:13px;">
              <option value="daily" ${_revFilterState.type === 'daily' ? 'selected' : ''}>Specific Date</option>
              <option value="monthly" ${_revFilterState.type === 'monthly' ? 'selected' : ''}>Specific Month</option>
              <option value="range" ${_revFilterState.type === 'range' ? 'selected' : ''}>Custom Range</option>
            </select>
          </div>
          
          <div class="form-group" id="revDateGroup" style="margin-bottom:0; flex:1; min-width:140px; display: ${_revFilterState.type === 'daily' ? 'block' : 'none'};">
            <label>Choose Date</label>
            <input class="input" type="date" id="revDate" value="${_revFilterState.date}" style="padding: 8px 12px; font-size:13px;">
          </div>
          
          <div class="form-group" id="revMonthGroup" style="margin-bottom:0; flex:1; min-width:140px; display: ${_revFilterState.type === 'monthly' ? 'block' : 'none'};">
            <label>Choose Month</label>
            <input class="input" type="month" id="revMonth" value="${_revFilterState.month}" style="padding: 8px 12px; font-size:13px;">
          </div>
          
          <div class="form-group" id="revRangeGroup" style="margin-bottom:0; flex:2; min-width:260px; display: ${_revFilterState.type === 'range' ? 'flex' : 'none'}; gap: 10px;">
            <div style="flex:1;">
              <label>From</label>
              <input class="input" type="date" id="revRangeFrom" value="${_revFilterState.from}" style="padding: 8px 12px; font-size:13px;">
            </div>
            <div style="flex:1;">
              <label>To</label>
              <input class="input" type="date" id="revRangeTo" value="${_revFilterState.to}" style="padding: 8px 12px; font-size:13px;">
            </div>
          </div>

          <div class="form-group" style="margin-bottom:0; flex:1; min-width:140px;">
            <label>Category</label>
            <select class="input" id="revCategory" style="padding: 8px 12px; font-size:13px;" onchange="window.updateRevModelsDropdown()">
              ${categories.map(cat => `<option value="${cat}" ${_revFilterState.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:0; flex:1; min-width:140px;">
            <label>Vehicle Model / Brand</label>
            <select class="input" id="revModel" style="padding: 8px 12px; font-size:13px;">
              ${availableModels.map(m => `<option value="${m}" ${_revFilterState.model === m ? 'selected' : ''}>${m}</option>`).join('')}
            </select>
          </div>
          
          <button class="btn" id="btnApplyRevFilter" style="padding: 8px 16px; font-size:12px;">⚡ Apply Filter</button>
        </div>
      </div>

      <div class="grid-3">
        ${kpi('Total Revenue', '₹' + totalRevenue.toLocaleString(), _revFilterState.type === 'daily' ? 'For single day' : `${dates.length} days total`)}
        ${kpi('Total Expenses', '₹' + (totalMaintenance + energyCost + opsCost).toLocaleString(), 'Maint + Energy + Ops')}
        ${kpi('Net Profit', '₹' + profit.toLocaleString(), 'Margin ' + (totalRevenue > 0 ? Math.round(profit / totalRevenue * 100) : 0) + '%', profit < 0 ? 'down' : '')}
      </div>
      
      <div class="grid-2" style="margin-top:16px;">
        <div class="glass panel">
          <h3>Profit Trend ${_revFilterState.type === 'daily' ? '(Last 7 Days)' : '(Selected Period)'}</h3>
          <svg class="spark" id="revSpark" style="height:160px;"></svg>
          <div style="font-size:11px; color:var(--muted); margin: 6px 0 10px 0; line-height: 1.4; border-bottom: 1px dashed rgba(255,255,255,0.08); padding-bottom: 8px;">
            💡 <strong>About Profit Trend:</strong> Tracks daily net income fluctuations after operating expenses are deducted from fleet ride revenues. Hover over the curve to inspect raw numeric data point details.
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; color:var(--muted);">
            <span>${_revFilterState.type === 'daily' ? '7 days ago' : dates[0]}</span>
            <span>${_revFilterState.type === 'daily' ? _revFilterState.date : dates[dates.length - 1]}</span>
          </div>
        </div>
        <div class="glass panel">
          <h3>Expense Breakdown</h3>
          ${donut([
            { label: 'Energy Cost (18%)', value: energyCost, color: '#00e7ff' },
            { label: 'Maintenance', value: totalMaintenance, color: '#b15cff' },
            { label: 'Operations (10%)', value: opsCost, color: '#2a5cff' },
          ])}
          <div style="font-size:11px; color:var(--muted); margin-top:12px; line-height: 1.4; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 8px;">
            💡 <strong>About Expenses:</strong> Shows the split of total expenses. <em>Energy Cost</em> represents charging electricity fees (estimated at 18% of revenue). <em>Maintenance</em> lists sum of parts &amp; service logs. <em>Operations</em> covers license and admin overheads (10% of revenue).
          </div>
        </div>
      </div>

      <div class="glass panel" style="margin-top:16px;">
        <h3>Brand Performance Summary (Aggregated Brand Totals)</h3>
        <table class="revenue-table" style="margin-bottom:24px;">
          <thead>
            <tr>
              <th>Model / Brand</th>
              <th>Category</th>
              <th>Vehicles Count</th>
              <th>Total Distance</th>
              <th>Total Revenue</th>
              <th>Total Maintenance</th>
              <th>Est. Net Profit</th>
            </tr>
          </thead>
          <tbody>
            ${brandSummaryList.length === 0 ? `
              <tr><td colspan="7" style="text-align:center; color:var(--muted);">No brand summary matches active filters.</td></tr>
            ` : brandSummaryList.map(b => `
              <tr>
                <td><b>${b.brand}</b></td>
                <td><span class="status-pill off">${b.category}</span></td>
                <td><b>${b.count}</b> vehicle(s)</td>
                <td>${b.distance.toLocaleString()} km</td>
                <td style="color:var(--green); font-weight:600;">₹${b.revenue.toLocaleString()}</td>
                <td style="color:${b.maintenance > 0 ? 'var(--red)' : 'var(--text)'}">₹${b.maintenance.toLocaleString()}</td>
                <td style="color:${b.profit >= 0 ? 'var(--cyan)' : 'var(--red)'}; font-weight:600;">₹${b.profit.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="glass panel" style="margin-top:16px;">
        <h3>Individual Vehicle Revenue Breakdown</h3>
        <table class="revenue-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle Model</th>
              <th>Distance (km)</th>
              <th>Revenue</th>
              <th>Maintenance</th>
              <th>Estimated Profit</th>
            </tr>
          </thead>
          <tbody>
            ${carBreakdown.length === 0 ? `
              <tr><td colspan="6" style="text-align:center; color:var(--muted);">No vehicle breakdown matches active filters.</td></tr>
            ` : carBreakdown.map(c => `
              <tr style="cursor:pointer;" onclick="window.openCarTelemetryModal('${c.id}')">
                <td><b>${c.id}</b></td>
                <td>${c.brand}</td>
                <td>${c.distance.toLocaleString()} km</td>
                <td style="color:var(--green); font-weight:600;">₹${c.revenue.toLocaleString()}</td>
                <td style="color:${c.maintenance > 0 ? 'var(--red)' : 'var(--text)'}">₹${c.maintenance.toLocaleString()}</td>
                <td style="color:${c.profit >= 0 ? 'var(--cyan)' : 'var(--red)'}; font-weight:600;">₹${c.profit.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    spark(document.getElementById('revSpark'), sparkPoints, '#b15cff');

    const filterType = document.getElementById('revFilterType');
    const dateGroup = document.getElementById('revDateGroup');
    const monthGroup = document.getElementById('revMonthGroup');
    const rangeGroup = document.getElementById('revRangeGroup');

    filterType.addEventListener('change', (e) => {
      const val = e.target.value;
      dateGroup.style.display = val === 'daily' ? 'block' : 'none';
      monthGroup.style.display = val === 'monthly' ? 'block' : 'none';
      rangeGroup.style.display = val === 'range' ? 'flex' : 'none';
    });

    // Models dropdown updater helper
    window.updateRevModelsDropdown = () => {
      const catSelect = document.getElementById('revCategory');
      const modelSelect = document.getElementById('revModel');
      if (!catSelect || !modelSelect) return;
      
      const selectedCat = catSelect.value;
      const currentFleet = getSearchedFleet(fleet());
      
      const brandsList = Array.from(new Set(
        selectedCat === 'All' 
          ? currentFleet.map(c => c.brand) 
          : currentFleet.filter(c => c.category === selectedCat).map(c => c.brand)
      )).sort();
      
      const models = ['All', ...brandsList];
      modelSelect.innerHTML = models.map(m => `<option value="${m}" ${m === _revFilterState.model ? 'selected' : ''}>${m}</option>`).join('');
    };

    document.getElementById('btnApplyRevFilter').addEventListener('click', () => {
      _revFilterState.type = filterType.value;
      if (_revFilterState.type === 'daily') {
        _revFilterState.date = document.getElementById('revDate').value;
      } else if (_revFilterState.type === 'monthly') {
        _revFilterState.month = document.getElementById('revMonth').value;
      } else if (_revFilterState.type === 'range') {
        _revFilterState.from = document.getElementById('revRangeFrom').value;
        _revFilterState.to = document.getElementById('revRangeTo').value;
      }
      _revFilterState.category = document.getElementById('revCategory').value;
      _revFilterState.model = document.getElementById('revModel').value;
      renderRevenue(root, f);
    });
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
    const legend = parts.map(p => `<div class="row"><span><i style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px;margin-right:8px;box-shadow:0 0 8px ${p.color}"></i>${p.label}</span><b>₹${p.value.toLocaleString()}</b></div>`).join('');
    return `<div style="display:flex; gap:16px; align-items:center;">
      <svg width="160" height="160" viewBox="0 0 160 160">${segs}<circle cx="80" cy="80" r="38" fill="#0a0d1f"/></svg>
      <div style="flex:1;">${legend}</div>
    </div>`;
  }

  function renderReports(root, f) {
    const reportData = getFilteredReportsData(f);
    root.innerHTML = `
      <h2 class="page-title">Reports <small>Generate &amp; download</small></h2>
      <div class="glass panel">
        <h3>Filters</h3>
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap:12px;">
          <div class="form-group">
            <label>From</label>
            <input class="input" type="date" id="repFrom" value="${_reportsFilterState.from}">
          </div>
          <div class="form-group">
            <label>To</label>
            <input class="input" type="date" id="repTo" value="${_reportsFilterState.to}">
          </div>
          <div class="form-group">
            <label>Vehicle</label>
            <select class="input" id="repVehicle">
              <option value="All" ${_reportsFilterState.vehicleId === 'All' ? 'selected' : ''}>All Vehicles</option>
              ${f.map(c => `<option value="${c.id}" ${_reportsFilterState.vehicleId === c.id ? 'selected' : ''}>${c.id} — ${c.brand}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Driver</label>
            <select class="input" id="repDriver">
              <option value="All" ${_reportsFilterState.driver === 'All' ? 'selected' : ''}>All Drivers</option>
              ${Array.from(new Set(f.map(c => c.driver))).sort().map(d => `<option value="${d}" ${_reportsFilterState.driver === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:flex; gap:10px; margin-top:16px;">
          <button class="btn" id="btnApplyReportsFilter">⚡ Apply Filters</button>
          <button class="btn ghost" onclick="VE.exportCSV()">⬇ Excel / CSV</button>
          <button class="btn ghost" onclick="VE.exportPDF()">⬇ PDF Report</button>
        </div>
      </div>
      <div class="glass panel" style="margin-top:16px;">
        <h3>Preview</h3>
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Battery</th>
              <th>Range</th>
              <th>Revenue</th>
              <th>Maintenance</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.length === 0 ? `
              <tr><td colspan="6" style="text-align:center; color:var(--muted);">No records match the selected filters.</td></tr>
            ` : reportData.map(c => `
              <tr>
                <td>${c.id} · ${c.brand}</td>
                <td>${c.driver}</td>
                <td>${c.battery}%</td>
                <td>${c.range} km</td>
                <td style="color:var(--green); font-weight:600;">₹${c.revenue.toLocaleString()}</td>
                <td style="color:${c.maintenance > 0 ? 'var(--red)' : 'var(--text)'}">₹${c.maintenance.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnApplyReportsFilter').addEventListener('click', () => {
      _reportsFilterState.from = document.getElementById('repFrom').value;
      _reportsFilterState.to = document.getElementById('repTo').value;
      _reportsFilterState.vehicleId = document.getElementById('repVehicle').value;
      _reportsFilterState.driver = document.getElementById('repDriver').value;
      renderReports(root, f);
    });
  }

  // ---------- DRIVER ----------
  async function initDriver() {
    if (!currentUser) return;
    setProfile(currentUser);
    
    // Load dataset first
    await fleet();
    
    const view = location.hash.replace('#', '') || 'home';
    setActiveNav(view);
    renderDriverView(view, currentUser);
    window.addEventListener('hashchange', () => {
      const v = location.hash.replace('#', '') || 'home';
      setActiveNav(v); renderDriverView(v, currentUser);
    });
  }

  async function renderDriverView(view, u) {
    const root = document.getElementById('view');
    const f = await fleet();
    const car = f.find(c => c.driver === u.name) || f[0];
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
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div class="glass car-list-item" style="padding: 20px; align-items: center; justify-content: space-between;">
          <div class="col-main">
            <h3 style="margin-bottom: 4px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px;">Current Vehicle</h3>
            <div class="brand" style="font-size: 20px; font-weight:700;">${c.brand}</div>
            <div class="vid" style="font-size: 12px; margin-top: 4px; color:var(--muted);">${c.id} · ${c.category}</div>
          </div>
          <div class="col-status">
            ${c.charging ? pill('Charging', 'charging') : pill('Ready', 'on')}
          </div>
          <div class="col-battery" style="flex: 3; min-width: 200px;">
            <div class="row"><span>Battery:</span> <b>${c.battery}%</b></div>
            <div class="batt-bar"><i style="width:${c.battery}%"></i></div>
            <div class="row" style="margin-top:8px;"><span>Remaining Range:</span> <b>${c.range} km</b></div>
          </div>
        </div>
        
        <div class="glass car-list-item" style="padding: 20px; align-items: center; justify-content: space-between;">
          <div class="col-main">
            <h3 style="margin-bottom: 4px; font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px;">Today's Trip</h3>
            <div class="brand" style="font-size: 20px; font-weight:700;">Active Driving Stats</div>
            <div class="vid" style="font-size: 12px; margin-top: 4px; color:var(--muted);">Driver safety score &amp; speed</div>
          </div>
          <div class="col-status" style="flex: 1.5; display: flex; align-items: center; gap: 12px;">
            <div class="circle" style="--p:${c.efficiency}; --c: var(--green); width: 70px; height: 70px;"><span style="font-size: 15px;">${c.efficiency}%</span></div>
            <span style="font-size: 11px; color: var(--muted); text-transform: uppercase;">Eco Score</span>
          </div>
          <div class="col-stats" style="flex: 2.5; font-size: 13px; min-width: 180px;">
            <div class="row" style="margin-bottom: 6px;"><span>Distance</span><b>${rint(20, 80)} km</b></div>
            <div class="row" style="margin-bottom: 6px;"><span>Avg Speed</span><b>${rint(35, 75)} km/h</b></div>
            <div class="row"><span>Energy Used</span><b>${rint(5, 20)} kWh</b></div>
          </div>
        </div>
      </div>
    `;
  }

  function driverVehicle(root, c) {
    const getDatesInRange = (startDate, endDate) => {
      const dates = [];
      let curr = new Date(startDate);
      const end = new Date(endDate);
      let count = 0;
      while (curr <= end && count < 90) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
        count++;
      }
      return dates;
    };

    const getDatesInMonth = (yearMonthStr) => {
      const [year, month] = yearMonthStr.split('-').map(Number);
      const lastDay = new Date(year, month, 0).getDate();
      const dates = [];
      for (let i = 1; i <= lastDay; i++) {
        const dayStr = String(i).padStart(2, '0');
        dates.push(`${yearMonthStr}-${dayStr}`);
      }
      return dates;
    };

    let dates = [];
    if (_drvVehicleFilter.type === 'daily') {
      dates = [_drvVehicleFilter.date];
    } else if (_drvVehicleFilter.type === 'monthly') {
      dates = getDatesInMonth(_drvVehicleFilter.month);
    } else if (_drvVehicleFilter.type === 'range') {
      dates = getDatesInRange(_drvVehicleFilter.from, _drvVehicleFilter.to);
    }

    let rev = 0;
    let maint = 0;
    let distance = 0;
    let overspeed = 0;

    dates.forEach(d => {
      const stats = getCarStatsForDate(c, d);
      rev += stats.revenue;
      maint += stats.maintenance;
      distance += stats.distance;
      overspeed += stats.overspeedViolations;
    });

    const charging = Math.round(rev * 0.18);
    const totalExpenses = maint + charging;

    root.innerHTML = `
      <h2 class="page-title">My Vehicle</h2>
      
      <!-- Specifications Panel -->
      <div class="glass panel">
        <h3>${c.brand} Specifications</h3>
        <div class="spec-list">
          <div class="spec-row"><span>Vehicle ID</span><b>${c.id}</b></div>
          <div class="spec-row"><span>Category</span><b>${c.category}</b></div>
          <div class="spec-row"><span>Motor</span><b>${c.motor}</b></div>
          <div class="spec-row"><span>Battery Capacity</span><b>${c.batteryCapacity} kWh</b></div>
          <div class="spec-row"><span>Vehicle Weight</span><b>${c.weight} kg</b></div>
          <div class="spec-row"><span>Condition</span><b>${c.condition}%</b></div>
          <div class="spec-row"><span>Battery %</span><b>${c.battery}%</b></div>
          <div class="spec-row"><span>Range</span><b>${c.range} km</b></div>
          <div class="spec-row"><span>Status</span><b>${c.charging ? pill('Charging', 'charging') : pill('Ready', 'on')}</b></div>
        </div>
      </div>

      <!-- Financials Period Filter -->
      <div class="glass panel" style="margin-top:16px;">
        <h3>Period Revenue &amp; Expenses</h3>
        <div style="display:flex; flex-wrap:wrap; gap:16px; align-items:flex-end; margin-bottom:16px;">
          <div class="form-group" style="margin-bottom:0; flex:1; min-width:140px;">
            <label>Filter Type</label>
            <select class="input" id="drvVehFilterType" style="padding: 8px 12px; font-size:13px;">
              <option value="daily" ${_drvVehicleFilter.type === 'daily' ? 'selected' : ''}>Specific Date</option>
              <option value="monthly" ${_drvVehicleFilter.type === 'monthly' ? 'selected' : ''}>Specific Month</option>
              <option value="range" ${_drvVehicleFilter.type === 'range' ? 'selected' : ''}>Custom Range</option>
            </select>
          </div>
          
          <div class="form-group" id="drvVehDateGroup" style="margin-bottom:0; flex:1; min-width:140px; display: ${_drvVehicleFilter.type === 'daily' ? 'block' : 'none'};">
            <label>Choose Date</label>
            <input class="input" type="date" id="drvVehDate" value="${_drvVehicleFilter.date}" style="padding: 8px 12px; font-size:13px;">
          </div>
          
          <div class="form-group" id="drvVehMonthGroup" style="margin-bottom:0; flex:1; min-width:140px; display: ${_drvVehicleFilter.type === 'monthly' ? 'block' : 'none'};">
            <label>Choose Month</label>
            <input class="input" type="month" id="drvVehMonth" value="${_drvVehicleFilter.month}" style="padding: 8px 12px; font-size:13px;">
          </div>
          
          <div class="form-group" id="drvVehRangeGroup" style="margin-bottom:0; flex:2; min-width:260px; display: ${_drvVehicleFilter.type === 'range' ? 'flex' : 'none'}; gap: 10px;">
            <div style="flex:1;">
              <label>From</label>
              <input class="input" type="date" id="drvVehRangeFrom" value="${_drvVehicleFilter.from}" style="padding: 8px 12px; font-size:13px;">
            </div>
            <div style="flex:1;">
              <label>To</label>
              <input class="input" type="date" id="drvVehRangeTo" value="${_drvVehicleFilter.to}" style="padding: 8px 12px; font-size:13px;">
            </div>
          </div>
          
          <button class="btn" id="btnApplyDrvVehFilter" style="padding: 8px 16px; font-size:12px;">⚡ Apply Period</button>
        </div>

        <div class="kpi-list" style="margin-top:16px;">
          ${kpiListItem('Earnings Generated', '₹' + rev.toLocaleString(), `From ${dates.length} day(s)`)}
          ${kpiListItem('Total Period Expenses', '₹' + totalExpenses.toLocaleString(), `Maint: ₹${maint.toLocaleString()} | Charging: ₹${charging.toLocaleString()}`)}
          ${kpiListItem('Net Earnings', '₹' + (rev - totalExpenses).toLocaleString(), 'Earnings minus Expenses', (rev - totalExpenses) < 0 ? 'down' : '')}
        </div>

        <!-- Overspeed Warnings -->
        ${overspeed > 0 ? `
          <div class="alert danger" style="margin-top:16px;">
            ⚠️ <b>OVERSPEEDING WARNING:</b> You committed <b>${overspeed}x</b> overspeeding violations during this period! Your driving habits are being monitored. Please keep speeds under the speed limit or safety threshold (90 km/h) to maintain safety compliance.
          </div>
        ` : `
          <div class="alert" style="background: rgba(0, 255, 163, 0.08); border: 1px solid rgba(0, 255, 163, 0.3); color: var(--green); margin-top: 16px;">
            ✓ <b>Safe Driver Status:</b> No overspeed violations recorded in this period. Excellent compliance!
          </div>
        `}
      </div>
    `;

    // Wire events
    const filterType = document.getElementById('drvVehFilterType');
    const dateGroup = document.getElementById('drvVehDateGroup');
    const monthGroup = document.getElementById('drvVehMonthGroup');
    const rangeGroup = document.getElementById('drvVehRangeGroup');

    if (filterType) {
      filterType.addEventListener('change', (e) => {
        const val = e.target.value;
        dateGroup.style.display = val === 'daily' ? 'block' : 'none';
        monthGroup.style.display = val === 'monthly' ? 'block' : 'none';
        rangeGroup.style.display = val === 'range' ? 'flex' : 'none';
      });
    }

    const btnApply = document.getElementById('btnApplyDrvVehFilter');
    if (btnApply) {
      btnApply.addEventListener('click', () => {
        _drvVehicleFilter.type = filterType.value;
        if (_drvVehicleFilter.type === 'daily') {
          _drvVehicleFilter.date = document.getElementById('drvVehDate').value;
        } else if (_drvVehicleFilter.type === 'monthly') {
          _drvVehicleFilter.month = document.getElementById('drvVehMonth').value;
        } else if (_drvVehicleFilter.type === 'range') {
          _drvVehicleFilter.from = document.getElementById('drvVehRangeFrom').value;
          _drvVehicleFilter.to = document.getElementById('drvVehRangeTo').value;
        }
        driverVehicle(root, c);
      });
    }
  }

  function driverTrip(root, c) {
    // Check if we have a prediction result to display
    if (window._predictionResult) {
      const prediction = window._predictionResult;
      root.innerHTML = `
        <h2 class="page-title">Predicted Remaining Distance <small>ML-Powered Prediction</small></h2>
        
        <!-- Prediction Result Card -->
        <div class="glass panel" style="max-width: 700px; margin: 0 auto;">
          <div style="text-align: center; padding: 32px;">
            <h3 style="color: var(--cyan); margin-bottom: 8px;">🤖 AI Prediction Result</h3>
            <div style="font-size: 72px; font-weight: 700; color: var(--cyan); margin: 24px 0; text-shadow: 0 0 30px rgba(0, 231, 255, 0.5);">
              ${prediction.predictedRange} km
            </div>
            <p style="color: var(--muted); font-size: 14px; margin-bottom: 32px;">Predicted Remaining Distance</p>
            
            <!-- Trip Details -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: left; margin-top: 32px;">
              <div class="spec-row">
                <span>Car Type</span>
                <b>${prediction.inputs.carType}</b>
              </div>
              <div class="spec-row">
                <span>Battery Level</span>
                <b>${prediction.inputs.battery}%</b>
              </div>
              <div class="spec-row">
                <span>Speed</span>
                <b>${prediction.inputs.speed} km/h</b>
              </div>
              <div class="spec-row">
                <span>Odometer</span>
                <b>${prediction.inputs.odometer.toLocaleString()} km</b>
              </div>
              <div class="spec-row">
                <span>Passengers</span>
                <b>${prediction.inputs.passengers}</b>
              </div>
              <div class="spec-row">
                <span>Road Type</span>
                <b>${prediction.inputs.drivingMode}</b>
              </div>
            </div>
            
            <!-- Car Specifications -->
            ${prediction.specs ? `
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
                <h4 style="color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Vehicle Specifications</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; text-align: left;">
                  <div class="spec-row">
                    <span>Battery Capacity</span>
                    <b>${prediction.specs.battery_capacity_kwh} kWh</b>
                  </div>
                  <div class="spec-row">
                    <span>Max Range</span>
                    <b>${prediction.specs.max_range_km} km</b>
                  </div>
                  <div class="spec-row">
                    <span>Vehicle Weight</span>
                    <b>${prediction.specs.vehicle_weight_kg} kg</b>
                  </div>
                  <div class="spec-row">
                    <span>Motor Power</span>
                    <b>${prediction.specs.motor_power_kw} kW</b>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Actions -->
            <div style="display: flex; gap: 12px; margin-top: 32px;">
              <button class="btn block" onclick="window.newPrediction()" style="flex: 1;">🔄 New Prediction</button>
            </div>
          </div>
        </div>
      `;
      
      window.newPrediction = () => {
        window._predictionResult = null;
        driverTrip(root, c);
      };
      
      return;
    }
    
    // Show prediction form
    root.innerHTML = `
      <h2 class="page-title">Predict Remaining Distance <small>ML-Powered Range Prediction</small></h2>
      <div class="glass panel" style="max-width: 700px; margin: 0 auto; padding: 24px;">
        <h3 style="margin-bottom: 16px; color: var(--text);">🤖 Enter Vehicle Details</h3>
        <p style="color: var(--muted); font-size: 13px; margin-bottom: 20px;">Provide the following information for AI-powered range prediction:</p>
        
        <form id="startTripForm" style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            
            <!-- Car Type -->
            <div class="form-group">
              <label for="tripCarType">Car Type</label>
              <select class="input" id="tripCarType" required>
                <option value="" disabled selected>Select Car Model</option>
                <option value="Tata Punch EV">Tata Punch EV</option>
                <option value="MG ZS EV">MG ZS EV</option>
                <option value="Volvo EX40">Volvo EX40</option>
              </select>
              <span style="font-size: 11px; color: var(--muted);">ML-supported models</span>
            </div>
            
            <!-- Battery Percentage -->
            <div class="form-group">
              <label for="tripBattery">Current Battery (%)</label>
              <input class="input" type="number" id="tripBattery" required min="1" max="100" placeholder="e.g. 80">
              <span style="font-size: 11px; color: var(--muted);">Between 1-100%</span>
            </div>
            
            <!-- Speed -->
            <div class="form-group">
              <label for="tripSpeed">Speed (km/h)</label>
              <input class="input" type="number" id="tripSpeed" required min="0" max="200" placeholder="e.g. 60">
              <span style="font-size: 11px; color: var(--muted);">Current or average speed</span>
            </div>
            
            <!-- Total KM Run -->
            <div class="form-group">
              <label for="tripOdometer">Odometer Reading (km)</label>
              <input class="input" type="number" id="tripOdometer" required min="0" placeholder="e.g. 15000">
              <span style="font-size: 11px; color: var(--muted);">Total distance travelled</span>
            </div>
            
            <!-- Passenger Count -->
            <div class="form-group">
              <label for="tripPassengers">Passenger Count</label>
              <input class="input" type="number" id="tripPassengers" required min="1" max="8" placeholder="e.g. 2">
              <span style="font-size: 11px; color: var(--muted);">Including driver</span>
            </div>
          </div>
          
          <!-- Driving Mode -->
          <div class="form-group" style="margin-top: 8px;">
            <label>Road Type / Driving Mode</label>
            <div style="display: flex; gap: 20px; margin-top: 6px;">
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; text-transform: none; color: var(--text);">
                <input type="radio" name="drivingMode" value="City" checked style="width: 16px; height: 16px; accent-color: var(--cyan);">
                🏙️ City Driving
              </label>
              <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; text-transform: none; color: var(--text);">
                <input type="radio" name="drivingMode" value="Highway" style="width: 16px; height: 16px; accent-color: var(--cyan);">
                🛣️ Highway Driving
              </label>
            </div>
          </div>
          
          <!-- ML Status Indicator -->
          <div id="mlStatusIndicator" style="margin-top: 8px;"></div>
          
          <button class="btn block" type="submit" id="predictBtn" style="margin-top: 10px;">
            🤖 Predict Remaining Distance
          </button>
        </form>
      </div>
    `;
    
    // Check ML status
    (async () => {
      try {
        const { checkMLHealth } = await import('./ml-service.js');
        const health = await checkMLHealth();
        const statusDiv = document.getElementById('mlStatusIndicator');
        if (statusDiv) {
          if (health.available && health.modelLoaded) {
            statusDiv.innerHTML = `
              <div class="alert" style="background: rgba(0, 255, 163, 0.08); border: 1px solid rgba(0, 255, 163, 0.3); color: var(--green);">
                ✅ <b>ML Engine Active:</b> Predictions powered by AI with 87.5% accuracy
              </div>
            `;
          } else {
            statusDiv.innerHTML = `
              <div class="alert" style="background: rgba(255, 178, 43, 0.08); border: 1px solid rgba(255, 178, 43, 0.3); color: var(--amber);">
                ⚠️ <b>ML Engine Offline:</b> Using formula-based predictions. Start Flask API for ML predictions.
              </div>
            `;
          }
        }
      } catch (e) {
        console.log('ML service not available:', e);
      }
    })();
    
    document.getElementById('startTripForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('predictBtn');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '🔄 Predicting...';
      
      const odo = Number(document.getElementById('tripOdometer').value);
      const batt = Number(document.getElementById('tripBattery').value);
      const carType = document.getElementById('tripCarType').value;
      const drivingMode = document.querySelector('input[name="drivingMode"]:checked').value;
      const speed = Number(document.getElementById('tripSpeed').value);
      const passengers = Number(document.getElementById('tripPassengers').value);
      
      try {
        const { predictRange } = await import('./ml-service.js');
        const mlData = {
          car_type: carType,
          battery_percentage: batt,
          road_type: drivingMode,
          speed_kmph: speed,
          total_km_run: odo,
          passenger_count: passengers
        };
        
        const result = await predictRange(mlData);
        
        if (result.success) {
          window._predictionResult = {
            predictedRange: Math.round(result.predictedRange),
            inputs: {
              carType,
              battery: batt,
              speed,
              odometer: odo,
              passengers,
              drivingMode
            },
            specs: result.specs
          };
          driverTrip(root, c);
        } else {
          throw new Error(result.error || 'Prediction failed');
        }
      } catch (error) {
        // Fallback to formula-based calculation
        const efficiency = drivingMode === 'City' ? 6.5 : 4.8;
        const predictedRange = Math.round(batt * efficiency);
        
        window._predictionResult = {
          predictedRange: predictedRange,
          inputs: {
            carType,
            battery: batt,
            speed,
            odometer: odo,
            passengers,
            drivingMode
          },
          specs: null
        };
        driverTrip(root, c);
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
      }
    });
  }

  function driverHealth(root, c) {
    root.innerHTML = `
      <h2 class="page-title">Vehicle Health</h2>
      <div class="kpi-list">
        ${kpiListItem('Battery Health', c.health + '%', c.health > 70 ? 'Excellent' : c.health > 40 ? 'Fair' : 'Service soon', c.health > 40 ? '' : 'down')}
        ${kpiListItem('Tire Condition', rint(60, 95) + '%', 'OK')}
        ${kpiListItem('Vehicle Condition', c.condition + '%', '')}
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
      <div class="kpi-list">
        ${kpiListItem('Driving Score', safety, safety > 85 ? 'Excellent' : 'Good')}
        ${kpiListItem('Eco Score', eco, '+3 this week')}
        ${kpiListItem('Trips This Week', rint(8, 24), '')}
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
  async function exportCSV() {
    const rawFleet = await fleet();
    const reportData = getFilteredReportsData(rawFleet);
    const headers = ['Vehicle ID', 'Brand', 'Category', 'Driver', 'Battery', 'Range (km)', 'Revenue (INR)', 'Maintenance (INR)', 'Distance (km)'];
    const keys = ['id', 'brand', 'category', 'driver', 'battery', 'range', 'revenue', 'maintenance', 'distance'];
    const rows = reportData.map(row => keys.map(k => {
      let val = row[k];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    }).join(','));
    const csv = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `voltedge_report_${_reportsFilterState.from}_to_${_reportsFilterState.to}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
  async function exportPDF() {
    const rawFleet = await fleet();
    const reportData = getFilteredReportsData(rawFleet);
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>VoltEdge Report</title><style>
      body{font-family:sans-serif;padding:20px;background:#f8f9fa;color:#333}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      td,th{border:1px solid #dee2e6;padding:12px;font-size:13px;text-align:left}
      th{background:#2a5cff;color:white}
      tr:nth-child(even){background:#f1f3f5}
      h1{color:#2a5cff;margin-bottom:5px}
      .meta{font-size:12px;color:#666;margin-bottom:20px}
    </style></head><body>
      <h1>VoltEdge EV — Fleet Report</h1>
      <div class="meta">
        Generated: ${new Date().toLocaleString()}<br>
        Period: ${_reportsFilterState.from} to ${_reportsFilterState.to}<br>
        Vehicle: ${_reportsFilterState.vehicleId === 'All' ? 'All Vehicles' : _reportsFilterState.vehicleId}<br>
        Driver: ${_reportsFilterState.driver === 'All' ? 'All Drivers' : _reportsFilterState.driver}
      </div>
      <table>
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Brand</th>
            <th>Driver</th>
            <th>Battery</th>
            <th>Range</th>
            <th>Revenue</th>
            <th>Maintenance</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.map(c => `
            <tr>
              <td>${c.id}</td>
              <td>${c.brand}</td>
              <td>${c.driver}</td>
              <td>${c.battery}%</td>
              <td>${c.range} km</td>
              <td>₹${c.revenue.toLocaleString()}</td>
              <td>₹${c.maintenance.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <script>window.print()</script>
    </body></html>`);
    w.document.close();
  }

  window.VE = { exportCSV, exportPDF, logout };
})();
