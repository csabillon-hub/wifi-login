const video = document.getElementById('webcam');
const faceBox = document.getElementById('face-box');
const laser = document.getElementById('laser');
const term = document.getElementById('term-log');
const fill = document.getElementById('fill');
const scanBtn = document.getElementById('scanBtn');
const aiSpeech = document.getElementById('ai-speech');
const aiEntity = document.getElementById('ai-entity');
let detector;

// --- AI PERSONALITY DATA ---
let visitCount = parseInt(localStorage.getItem('visit_count') || 0);
const userName = localStorage.getItem('user_name') || "User";
// Add to the top of script.js
let aiBehavior = localStorage.getItem('ai_behavior') || 'standard';

function toggleSettings() {
    document.getElementById('settings-panel').classList.toggle('open');
}

function updateTheme() {
    const theme = document.getElementById('theme-select').value;
    document.body.className = ''; 
    if (theme !== 'green') {
        document.body.classList.add('theme-' + theme);
    }
    localStorage.setItem('sys_theme', theme);

    // Clear the canvas so the new background style starts fresh
    const mCanvas = document.getElementById('matrix-canvas');
    if (mCanvas) {
        const ctx = mCanvas.getContext('2d');
        ctx.clearRect(0, 0, mCanvas.width, mCanvas.height);
    }
}

function updateBehavior() {
    aiBehavior = document.getElementById('behavior-select').value;
    localStorage.setItem('ai_behavior', aiBehavior);
    
    // AI reacts to personality change
    if(aiBehavior === 'hostile') {
        speak("Aggressive heuristics engaged. I am watching you.");
    } else if(aiBehavior === 'friendly') {
        speak("Safety protocols softened. Happy to assist.");
    } else {
        speak("Standard behavioral baseline restored.");
    }
}

// Modify your setupAI() greeting logic to check behavior
async function setupAI() {
    // ... existing visitCount logic ...
    
    let greeting = "";
    if (aiBehavior === 'hostile') {
        greeting = `Identify yourself immediately. I have no patience for intruders.`;
    } else if (aiBehavior === 'friendly') {
        greeting = `Hello again! Please look at the camera so I can let you in.`;
    } else {
        greeting = `Welcome back, ${userName}. Identity scan required.`;
    }

    aiSpeech.innerText = greeting.toUpperCase();
    speak(greeting);
    // ... rest of setupAI ...
}

// Ensure the theme is loaded on boot
window.onload = () => {
    const savedTheme = localStorage.getItem('sys_theme');
    if(savedTheme) {
        document.getElementById('theme-select').value = savedTheme;
        updateTheme();
    }
    const savedBehavior = localStorage.getItem('ai_behavior');
    if(savedBehavior) {
        document.getElementById('behavior-select').value = savedBehavior;
        aiBehavior = savedBehavior;
    }
};

// --- SPEECH ENGINE ---
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    const aiBehavior = localStorage.getItem('ai_behavior') || 'standard';

    // Hostile mode sounds deeper and more menacing
    msg.pitch = (aiBehavior === 'hostile') ? 0.2 : 0.4;
    msg.rate = (aiBehavior === 'hostile') ? 0.75 : 0.85;

    msg.onstart = () => aiEntity.classList.add('glitch-active');
    msg.onend = () => aiEntity.classList.remove('glitch-active');

    window.speechSynthesis.speak(msg);
}

// --- VOICE RECOGNITION ---
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = true;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
    const input = event.results[event.results.length - 1][0].transcript.toLowerCase();
    if (input.includes("who are you")) {
        // Trigger a quick "processing" glitch
    aiEntity.classList.add('glitch-active');
    setTimeout(() => aiEntity.classList.remove('glitch-active'), 500);
        speak("I am Master Control. I manage this sector of the grid.");
    } else if (input.includes("status")) {
        speak("All systems nominal. WiFi Gateway is active.");
    } else if (input.includes("hello")) {
        speak(`Greetings ${userName}. I am online.`);
    }
};

// --- BOOT LOGIC ---
function bootSystem() {
    if (!localStorage.getItem('wifi_ssid')) {
        document.getElementById('setup-screen').style.display = 'block';
    } else {
        navigator.mediaDevices.getUserMedia({video: { facingMode: "user" }})
        .then(s => { 
            video.srcObject = s; 
            video.onloadedmetadata = setupAI;
            recognition.start();
        });
    }
}

function saveSettings() {
    const name = document.getElementById('name-input').value.trim();
    const ssid = document.getElementById('ssid-input').value.trim();
    const pass = document.getElementById('pass-input').value.trim();
    
    if (name && ssid && pass) {
        localStorage.setItem('user_name', name);
        localStorage.setItem('wifi_ssid', ssid);
        localStorage.setItem('wifi_pass', pass);
        localStorage.setItem('visit_count', 0);
        speak(`Identity accepted. Ready for boot, ${name}.`);
        setTimeout(() => location.reload(), 1500);
    } else {
        speak("Configuration error. All fields are mandatory.");
    }
}

async function setupAI() {
    visitCount++;
    localStorage.setItem('visit_count', visitCount);
    
    const h = new Date().getHours();
    let greeting = `Welcome back, ${userName}. Identity scan required.`;
    if (visitCount === 1) greeting = `New user detected. I am Master Control. State your name for the record.`;
    
    aiSpeech.innerText = greeting.toUpperCase();
    speak(greeting);
    initNeuralMesh();

    try {
        const model = window.face_detection.SupportedModels.MediaPipeFaceDetector;
        detector = await window.face_detection.createDetector(model, { 
            runtime: 'mediapipe', 
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection' 
        });
        scanBtn.disabled = false;
        scanBtn.innerText = "IDENTIFY";
        renderFaceTracking();
    } catch(e) { scanBtn.disabled = false; scanBtn.innerText = "BYPASS"; }
}

function initNeuralMesh() {
    const canvas = document.getElementById('ai-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const points = [];
    for (let i = 0; i < 45; i++) {
        points.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, vx: (Math.random()-0.5), vy: (Math.random()-0.5) });
    }
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle = '#00ff41';
        points.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if(p.x<0 || p.x>canvas.width) p.vx*=-1;
            if(p.y<0 || p.y>canvas.height) p.vy*=-1;
            let dx = p.x - canvas.width/2; let dy = p.y - canvas.height/2;
            if(Math.hypot(dx, dy*0.6) > 90) { p.vx -= dx*0.01; p.vy -= dy*0.01; }
            for(let j=i+1; j<points.length; j++) {
                let p2 = points[j]; let d = Math.hypot(p.x-p2.x, p.y-p2.y);
                if(d < 55) {
                    ctx.globalAlpha = 1 - (d/55); ctx.beginPath();
                    ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
                }
            }
        });
        if(aiEntity.style.display !== 'none') requestAnimationFrame(animate);
    }
    animate();
}

// --- SCAN & AUTH ---
function identifyUser() {
    speak("Digitizing biometrics. Do not move.");
    aiEntity.style.opacity = '0'; 
    setTimeout(() => { aiEntity.style.display = 'none'; startScan(); }, 1000);
}

function startScan() {
    laser.style.display = 'block';
    let p = 0;
    const interval = setInterval(() => {
        p++; fill.style.width = p + '%';
        if(p>=100) { clearInterval(interval); laser.style.display = 'none'; triggerAuth(); }
    }, 40);
}

async function triggerAuth() {
    if (window.PublicKeyCredential) {
        try {
            const challenge = new Uint8Array(32); window.crypto.getRandomValues(challenge);
            const options = { publicKey: { challenge, rp: { name: "WiFi" }, user: { id: Uint8Array.from("1", c=>c.charCodeAt(0)), name: "u", displayName: "u" }, pubKeyCredParams: [{ alg: -7, type: "public-key" }], authenticatorSelection: { userVerification: "required" } } };
            await navigator.credentials.create(options);
            showSuccess();
        } catch (err) { triggerDenied(); }
    } else { showSuccess(); }
}

function triggerDenied() {
    const aiBehavior = localStorage.getItem('ai_behavior') || 'standard';
    let denialMessage = "Access Denied. Security alert triggered.";
    
    // Check for Hostile Behavior
    if (aiBehavior === 'hostile') {
        denialMessage = "Access denied! Did you really think it would be that easy? (Ha... Ha... Ha...). You don't belong here.";
        // Add an extra intense glitch
        aiEntity.classList.add('glitch-active');
        aiEntity.style.transform = "scale(1.2)";
    } else if (aiBehavior === 'friendly') {
        denialMessage = "I'm sorry, I couldn't verify your identity. Please try again.";
    }

    speak(denialMessage);

    // Show the red overlay
    const overlay = document.createElement('div');
    overlay.className = 'denied-overlay';
    overlay.innerText = 'ACCESS DENIED';
    document.getElementById('main-frame').appendChild(overlay);

    // Reset after 4 seconds to allow the mocking to finish
    setTimeout(() => {
        aiEntity.classList.remove('glitch-active');
        location.reload();
    }, 4000);
}

function showSuccess() {
    const ssid = localStorage.getItem('wifi_ssid');
    speak(`Access granted. Welcome to the grid, ${userName}.`);
    document.getElementById('main-frame').innerHTML = `
        <h2 style="color:#00ff41; font-size:14px;">NETWORK_SECURE</h2>
        <canvas id="netCanvas" style="width:100%; height:150px; border:1px solid #004400;"></canvas>
        <div id="qr-wrap" style="display:none; background:white; padding:10px; margin:10px auto; width:128px;"><div id="qrcode"></div></div>
        <div class="terminal" style="height:auto;">> SSID: ${ssid}<br>> WELCOME BACK, ${userName.toUpperCase()}</div>
        <button onclick="genQR()">GUEST ACCESS</button>
        <button onclick="wipeMemory()" style="margin-top:10px; border-color:#550000; color:#ff4444; font-size:9px;">WIPE_CONFIG</button>
    `;
    initNetMap();
}

function wipeMemory() {
    if(confirm("Wipe system memory?")) { localStorage.clear(); location.reload(); }
}

function genQR() {
    const ssid = localStorage.getItem('wifi_ssid');
    const pass = localStorage.getItem('wifi_pass');
    document.getElementById('qr-wrap').style.display = 'block';
    new QRCode(document.getElementById("qrcode"), { text: `WIFI:T:WPA;S:${ssid};P:${pass};;`, width: 128, height: 128 });
}

// Logic for face tracking box
async function renderFaceTracking() {
    if(detector) {
        const faces = await detector.estimateFaces(video);
        if(faces.length > 0) {
            const face = faces[0].box;
            faceBox.style.display = 'block';
            faceBox.style.width = face.width + 'px';
            faceBox.style.height = face.height + 'px';
            faceBox.style.left = (video.offsetWidth - face.xMax) + 'px';
            faceBox.style.top = face.yMin + 'px';
        } else { faceBox.style.display = 'none'; }
    }
    requestAnimationFrame(renderFaceTracking);
}

bootSystem();

function startMatrix() {
    const mCanvas = document.getElementById('matrix-canvas');
    if (!mCanvas) return;
    const mCtx = mCanvas.getContext('2d');

    mCanvas.width = window.innerWidth;
    mCanvas.height = window.innerHeight;

    // --- Rain Variables ---
    const fontSize = 16;
    const columns = Math.floor(mCanvas.width / fontSize);
    const drops = Array(columns).fill(1);

    // --- Tron Laser Variables ---
    const lasers = [];
    for(let i = 0; i < 20; i++) {
        lasers.push({
            x: Math.random() * mCanvas.width,
            y: Math.random() * mCanvas.height,
            speed: 15 + Math.random() * 20,
            width: 100 + Math.random() * 200
        });
    }

    function draw() {
        const currentTheme = localStorage.getItem('sys_theme') || 'green';

        // 1. Trail effect (darker for Red/Tron mode)
        mCtx.fillStyle = currentTheme === 'red' ? "rgba(0, 0, 0, 0.15)" : "rgba(0, 0, 0, 0.05)";
        mCtx.fillRect(0, 0, mCanvas.width, mCanvas.height);

     if (currentTheme === 'red') {
    // --- RED TRON LASER MODE ---
    mCtx.strokeStyle = "#ff0000"; // Pure Red
    mCtx.lineWidth = 3;
    
    // Add Neon Glow
    mCtx.shadowBlur = 15;
    mCtx.shadowColor = "#ff0000";
    
    lasers.forEach(l => {
        mCtx.beginPath();
        mCtx.moveTo(l.x, l.y);
        mCtx.lineTo(l.x + l.width, l.y);
        mCtx.stroke();

        // Move laser horizontally
        l.x += l.speed;
        
        // Reset laser if it goes off screen
        if (l.x > mCanvas.width) {
            l.x = -l.width;
            l.y = Math.random() * mCanvas.height;
            l.speed = 15 + Math.random() * 20; // Randomize speed on reset
        }
    });
    
    // Reset shadowBlur so it doesn't slow down the rest of the app
    mCtx.shadowBlur = 0;

} else {
    // --- MATRIX CODE MODE ---
    mCtx.shadowBlur = 0; // Ensure no glow for standard rain
    mCtx.fillStyle = currentTheme === 'blue' ? "#00f2ff" : "#00ff41";
    // ... rest of your green rain code ...
}
        if (currentTheme === 'green' || currentTheme === 'blue') {           

            drops.forEach((y, i) => {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                mCtx.fillText(text, i * fontSize, y * fontSize);

                if (y * fontSize > mCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            });
        }
    }

    setInterval(draw, 40);
}

// Ensure this runs only AFTER the page is ready
window.addEventListener('load', () => {
    startMatrix();
    bootSystem(); // Your existing boot function
});
let neuralSync = 100;
let isScanning = false;
let voiceKeyAuthorized = false;
const ACCESS_PHRASE = "Success"; // Your secret voice key

// --- 1. GHOST IN THE MACHINE LOGIC ---
function triggerGhostEvent() {
    const messages = ["I CAN SEE YOU", "ARE YOU ALONE?", "SYSTEM BLEED DETECTED", "HELP ME", "THE GRID IS LEAKING"];
    if (Math.random() > 0.95) { // 5% chance every check
        const msg = document.createElement('div');
        msg.className = 'ghost-msg';
        msg.style.left = Math.random() * 80 + '%';
        msg.style.top = Math.random() * 80 + '%';
        msg.innerText = messages[Math.floor(Math.random() * messages.length)];
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 4000);
    }
}
setInterval(triggerGhostEvent, 5000);

// --- 2. THE SYNC METER LOGIC ---
// Inside your renderFaceTracking() function, update it to this:
async function renderFaceTracking() {
    if(detector) {
        const faces = await detector.estimateFaces(video);
        const hud = document.getElementById('sync-hud');
        
        if(faces.length > 0) {
            const face = faces[0].box;
            faceBox.style.display = 'block';
            faceBox.style.width = face.width + 'px';
            faceBox.style.height = face.height + 'px';
            faceBox.style.left = (video.offsetWidth - face.xMax) + 'px';
            faceBox.style.top = face.yMin + 'px';

            // If scanning, check if face is centered
            if(isScanning) {
                const centerX = face.xMin + (face.width/2);
                const videoMid = video.offsetWidth / 2;
                const offset = Math.abs(centerX - videoMid);
                
                if(offset > 50) { // Too far from center
                    neuralSync -= 2;
                    aiSpeech.innerText = "SIGNAL LOSS: RE-CENTER FACE";
                } else {
                    neuralSync = Math.min(100, neuralSync + 1);
                }
                document.getElementById('sync-fill').style.height = neuralSync + '%';
            }
        } else if (isScanning) {
            neuralSync -= 5; // Rapid drop if no face seen
            document.getElementById('sync-fill').style.height = neuralSync + '%';
        }
    }
    requestAnimationFrame(renderFaceTracking);
}

// --- 3. THE VOICE KEY & AUTH SEQUENCE ---
function startScan() {
    isScanning = true;
    neuralSync = 100;
    document.getElementById('sync-hud').style.display = 'flex';
    laser.style.display = 'block';
    
    let p = 0;
    const interval = setInterval(() => {
        p++; 
        fill.style.width = p + '%';
        
        if(neuralSync < 20) {
            clearInterval(interval);
            triggerDenied("NEURAL_SYNC_FAILURE: CONNECTION_LOST");
        }

        if(p >= 100) {
            clearInterval(interval);
            laser.style.display = 'none';
            askForVoiceKey();
        }
    }, 50);
}

function askForVoiceKey() {
    isScanning = false;
    speak("Biometrics confirmed. Stand by for vocal sync. Speak the access phrase.");
    aiSpeech.innerText = "SAY: " + ACCESS_PHRASE.toUpperCase();
    
    // The recognition result handler will now look for the phrase
    recognition.onresult = (event) => {
        const input = event.results[event.results.length - 1][0].transcript.toLowerCase();
        log("VOCAL_KEY: " + input);
        
        if (input.includes(ACCESS_PHRASE)) {
            showSuccess();
        } else {
            triggerDenied("VOCAL_MATCH_FAILED");
        }
    };
}
