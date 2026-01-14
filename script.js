const video = document.getElementById('webcam');
const faceReticle = document.getElementById('face-reticle');
const aiLayer = document.getElementById('ai-layer');
const fill = document.getElementById('progress-inner');
const log = document.getElementById('term-log');

let detector, rainInterval, tronTrails = [];
let isSystemBooted = false;

// AI API Configuration Storage
let aiConfig = {
    apiKey: '',
    model: 'gpt-4o'
};

function authHold() {
    speak("Bio-signature verified.");
    
    // Forces the AI to stay in the tactical theme of your app
    const tacticalPrompt = `SYSTEM_ROLE: You are an advanced tactical OS. 
    USER_PROMPT: ${"The user has just bypassed security. Give them a brief status update."} 
    CONSTRAINT: Keep it under 20 words.`;
    
    callNeuralAI(tacticalPrompt);
}

function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.pitch = document.body.className.includes('terminator') ? 0.4 : 1.1;
    msg.rate = 0.9;
    log.innerText = "> " + text.toUpperCase();
    window.speechSynthesis.speak(msg);
}
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

// RESTORED: Zig-Zag Lasers (Tron) & Hex/Hieroglyphs
function startRain() {
    if(rainInterval) clearInterval(rainInterval);
    const cvs = document.getElementById('matrix-canvas'); const ctx = cvs.getContext('2d');
    cvs.width = window.innerWidth; cvs.height = window.innerHeight;
    
    tronTrails = Array(20).fill().map(() => ({
        x: Math.random() * cvs.width, y: Math.random() * cvs.height,
        dir: Math.floor(Math.random() * 4), length: 0
    }));

    const drops = Array(Math.floor(cvs.width/20)).fill(1);
    
    rainInterval = setInterval(() => {
        const theme = document.body.className;
        const glowColor = getComputedStyle(document.body).getPropertyValue('--glow');
        ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.strokeStyle = glowColor; ctx.fillStyle = glowColor;

        if(theme.includes('red')) { // ZIG-ZAG TRON
            tronTrails.forEach(t => {
                ctx.beginPath(); ctx.lineWidth = 5; ctx.shadowBlur = 8; ctx.shadowColor = glowColor;
                ctx.moveTo(t.x, t.y);
                const step = 15;
                if(t.dir === 0) t.y -= step; else if(t.dir === 1) t.x += step;
                else if(t.dir === 2) t.y += step; else if(t.dir === 3) t.x -= step;
                ctx.lineTo(t.x, t.y); ctx.stroke();
                if(Math.random() > 0.92 || t.x < 0 || t.x > cvs.width || t.y < 0 || t.y > cvs.height) {
                    t.dir = Math.floor(Math.random() * 4);
                    if(t.x < 0 || t.x > cvs.width || t.y < 0 || t.y > cvs.height) {
                        t.x = Math.random() * cvs.width; t.y = Math.random() * cvs.height;
                    }
                }
            });
            ctx.shadowBlur = 0;
        } else { // DATA FALL (Terminator Hex / Matrix)
            drops.forEach((y, i) => {
                const char = theme.includes('terminator') ? 
                    Math.floor(Math.random()*16).toString(16).toUpperCase() : 
                    String.fromCodePoint(0x13000 + Math.floor(Math.random()*90));
                ctx.font = theme.includes('terminator') ? "18px 'Share Tech Mono'" : "19px monospace";
                ctx.fillText(char, i*22, y*22);
                if(y*22 > cvs.height && Math.random() > 0.98) drops[i] = 0;
                drops[i]++;
            });
        }
    }, 45);
}

// RESTORED: Terminator Eye vs Neural Mesh
function initNeuralMesh() {
    const cvs = document.getElementById('ai-canvas'); const ctx = cvs.getContext('2d');
    cvs.width = 290; cvs.height = 290;
    const nodes = Array(80).fill().map(() => ({ x: Math.random()*290, y: Math.random()*290, vx: (Math.random()-0.5)*1.8, vy: (Math.random()-0.5)*1.8 }));

    function animate() {
        if(aiLayer.style.opacity === '0') return;
        ctx.clearRect(0,0,290,290);
        const theme = document.body.className;
        const glowColor = getComputedStyle(document.body).getPropertyValue('--glow');
        ctx.strokeStyle = glowColor;

        if (theme.includes('terminator')) {
            const centerX = 145, centerY = 145, time = Date.now() * 0.002;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(centerX, centerY, 60 + Math.sin(time)*2, 0, Math.PI * 2); ctx.stroke();
            ctx.lineWidth = 1;
            for(let i=0; i<8; i++) {
                const angle = (i / 8) * Math.PI * 2 + (time * 0.5);
                ctx.beginPath(); ctx.moveTo(centerX + Math.cos(angle)*30, centerY + Math.sin(angle)*30);
                ctx.lineTo(centerX + Math.cos(angle)*70, centerY + Math.sin(angle)*70); ctx.stroke();
            }
            const blink = Math.random() > 0.98 ? 0 : 1;
            const pulse = (Math.sin(time * 4) * 10) + 20;
            ctx.fillStyle = glowColor; ctx.shadowBlur = 15 * blink; ctx.shadowColor = glowColor;
            ctx.beginPath(); ctx.arc(centerX, centerY, pulse * blink, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        } else {
            ctx.lineWidth = 0.8;
            nodes.forEach((n) => {
                n.x += n.vx; n.y += n.vy;
                if(n.x<0 || n.x>290) n.vx*=-1; if(n.y<0 || n.y>290) n.vy*=-1;
                nodes.forEach(n2 => {
                    const d = Math.hypot(n.x-n2.x, n.y-n2.y);
                    if(d < 48) { ctx.globalAlpha = 1-(d/48); ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y); ctx.stroke(); }
                });
            });
            ctx.globalAlpha = 1.0;
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// NEW: Privacy-First Boot (No Camera on Load)
async function bootSystem() {
    startRain(); initNeuralMesh();
    document.getElementById('scanBtn').disabled = false;
    log.innerText = "> SYSTEM_STANDBY: AWAITING_UPLINK";
}

// NEW: Camera Access & Scan Trigger
async function executeScan() {
    if (!isSystemBooted) {
        log.innerText = "> REQUESTING_HARDWARE_ACCESS...";
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            detector = await face_detection.createDetector(face_detection.SupportedModels.MediaPipeFaceDetector, { runtime: 'mediapipe', solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_detection' });
            isSystemBooted = true;
            runDetection();
        } catch(e) { log.innerText = "> HARDWARE_DENIED"; return; }
    }

    aiLayer.style.opacity = '0';
    setTimeout(() => { aiLayer.style.display = 'none'; }, 800);
    document.getElementById('laser-scanner').style.display = 'block';
    speak("Scanning neural pathways.");
    let p = 0;
    const itv = setInterval(() => {
        p += 1.5; fill.style.width = p + '%';
        if(p >= 100) { clearInterval(itv); document.getElementById('scanBtn').style.display = 'none'; document.getElementById('authBtn').style.display = 'block'; speak("Uplink ready."); }
    }, 40);
}

async function runDetection() {
    if(detector) {
        const faces = await detector.estimateFaces(video);
        if(faces.length > 0) {
            const face = faces[0].box; const s = 290 / video.videoHeight;
            faceReticle.style.display = 'block';
            faceReticle.style.width = (face.width * s) + 'px'; faceReticle.style.height = (face.height * s) + 'px';
            faceReticle.style.left = (290 - (face.xMax * s)) + 'px'; faceReticle.style.top = (face.yMin * s) + 'px';
        } else { faceReticle.style.display = 'none'; }
    }
    requestAnimationFrame(runDetection);
}

function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('open');
    if(!panel.classList.contains('open')) {
        aiConfig.apiKey = document.getElementById('api-key').value;
        aiConfig.model = document.getElementById('model-select').value;
    }
}

function updateTheme() { document.body.className = 'theme-' + document.getElementById('theme-select').value; }

window.onload = bootSystem;

async function callNeuralAI(userPrompt) {
    const { apiKey, model } = aiConfig;

    if (!apiKey) {
        speak("API Key missing. Access denied.");
        return;
    }

    log.innerText = "> UPLINKING_TO_" + model.toUpperCase();
    let response;
    let aiText = "";

    try {
        if (model === 'gpt-4o') {
            // OPENAI FORMAT
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: userPrompt }]
                })
            });
            const data = await response.json();
            aiText = data.choices[0].message.content;

        } else if (model === 'claude-3') {
            // ANTHROPIC FORMAT
            response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'dangerouslyAllowBrowser': 'true' // Only for client-side testing
                },
                body: JSON.stringify({
                    model: "claude-3-opus-20240229",
                    max_tokens: 1024,
                    messages: [{ role: "user", content: userPrompt }]
                })
            });
            const data = await response.json();
            aiText = data.content[0].text;

        } else if (model === 'gemini-pro') {
            // GOOGLE GEMINI FORMAT
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }]
                })
            });
            const data = await response.json();
            aiText = data.candidates[0].content.parts[0].text;
        }

        speak(aiText);

    } catch (error) {
        log.innerText = "> UPLINK_INTERRUPTED";
        console.error("AI_ERROR:", error);
    }
}