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

// --- SPEECH ENGINE ---
function speak(text) {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    const theme = document.body.className;

    // Tactical pitch adjustment based on theme
    msg.pitch = theme.includes('terminator') ? 0.3 : 0.6;
    msg.rate = 0.85;

    log.innerText = "> " + text.toUpperCase();
    window.speechSynthesis.speak(msg);
}

// --- BACKGROUND: ZIG-ZAGS & HIEROGLYPHS ---
function startRain() {
    if(rainInterval) clearInterval(rainInterval);
    const cvs = document.getElementById('matrix-canvas'); 
    const ctx = cvs.getContext('2d');
    cvs.width = window.innerWidth; cvs.height = window.innerHeight;
    
    tronTrails = Array(25).fill().map(() => ({
        x: Math.random() * cvs.width, 
        y: Math.random() * cvs.height,
        dir: Math.floor(Math.random() * 4)
    }));

    const drops = Array(Math.floor(cvs.width/20)).fill(1);
    
    rainInterval = setInterval(() => {
        const theme = document.body.className;
        const glowColor = getComputedStyle(document.body).getPropertyValue('--glow');
        ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.strokeStyle = glowColor; ctx.fillStyle = glowColor;

        if(theme.includes('red')) { // TRON ZIG-ZAG
            tronTrails.forEach(t => {
                ctx.beginPath(); ctx.lineWidth = 4; ctx.shadowBlur = 10; ctx.shadowColor = glowColor;
                ctx.moveTo(t.x, t.y);
                const step = 15;
                if(t.dir === 0) t.y -= step; else if(t.dir === 1) t.x += step;
                else if(t.dir === 2) t.y += step; else if(t.dir === 3) t.x -= step;
                ctx.lineTo(t.x, t.y); ctx.stroke();
                if(Math.random() > 0.92) t.dir = Math.floor(Math.random() * 4);
                if(t.x < 0 || t.x > cvs.width || t.y < 0 || t.y > cvs.height) {
                    t.x = Math.random() * cvs.width; t.y = Math.random() * cvs.height;
                }
            });
            ctx.shadowBlur = 0;
        } else { // DATA FALL (Terminator Hex / Matrix Hieroglyphs)
            drops.forEach((y, i) => {
                const char = theme.includes('terminator') ? 
                    Math.floor(Math.random()*16).toString(16).toUpperCase() : 
                    String.fromCodePoint(0x13000 + Math.floor(Math.random()*90));
                ctx.font = theme.includes('terminator') ? "18px 'Share Tech Mono'" : "19px serif";
                ctx.fillText(char, i*22, y*22);
                if(y*22 > cvs.height && Math.random() > 0.98) drops[i] = 0;
                drops[i]++;
            });
        }
    }, 45);
}

// --- AI WINDOW: TERMINATOR EYE VS NEURAL MESH ---
function initNeuralMesh() {
    const cvs = document.getElementById('ai-canvas'); 
    const ctx = cvs.getContext('2d');
    cvs.width = 290; cvs.height = 290;
    const nodes = Array(80).fill().map(() => ({ x: Math.random()*290, y: Math.random()*290, vx: (Math.random()-0.5)*1.8, vy: (Math.random()-0.5)*1.8 }));

   function animate() {
    // Note: Removed the "return if opacity 0" so it keeps calculating in the background
    ctx.clearRect(0,0,290,290);
    const theme = document.body.className;
    
    // If successful, override the color to a "Verified" Cyan
    let glowColor = successGlow ? "#00ffff" : getComputedStyle(document.body).getPropertyValue('--glow');
    
    ctx.strokeStyle = glowColor;
    ctx.shadowBlur = successGlow ? 15 : 0; // Add a glow effect during success
    ctx.shadowColor = glowColor;

    if (theme.includes('terminator')) {
        // ... (Your Terminator Eye code here)
    } else {
        ctx.lineWidth = 0.8;
        nodes.forEach((n) => {
            n.x += n.vx; n.y += n.vy;
            if(n.x<0 || n.x>290) n.vx*=-1; if(n.y<0 || n.y>290) n.vy*=-1;
            nodes.forEach(n2 => {
                const d = Math.hypot(n.x-n2.x, n.y-n2.y);
                if(d < 48) { 
                    ctx.globalAlpha = 1-(d/48); 
                    ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n2.x, n2.y); ctx.stroke(); 
                }
            });
        });
    }
    requestAnimationFrame(animate);
}
    animate();
}

// --- SYSTEM CONTROLS ---
async function bootSystem() {
    startRain(); 
    initNeuralMesh();
    document.getElementById('scanBtn').disabled = false;
    log.innerText = "> SYSTEM_STANDBY: AWAITING_BIO_SCAN";
}

let successGlow = false; // Tracks if the user was recently accepted

async function executeScan() {
    if (!isSystemBooted) {
        log.innerText = "> INITIALIZING_OPTICAL_HARDWARE...";
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            await video.play();
            
            const model = window.faceDetection || window.face_detection;
            detector = await model.createDetector(model.SupportedModels.MediaPipeFaceDetector, { runtime: 'tfjs' });
            
            isSystemBooted = true;
            runDetection();
        } catch(e) { 
            log.innerText = "> HARDWARE_FAILURE"; 
            return; 
        }
    }
   // 1. Reveal Camera, Hide AI Box
    aiLayer.style.opacity = '0';
    // Use a timeout to display: none after the fade so it doesn't block the video
    setTimeout(() => { if(aiLayer.style.opacity === '0') aiLayer.style.display = 'none'; }, 800);
    
    document.getElementById('laser-scanner').style.display = 'block';
    speak("Scanning neural pathways.");

    // 2. Progress Bar
    let p = 0;
    fill.style.width = '0%';
    const itv = setInterval(() => {
        p += 1.5;
        fill.style.width = p + '%';
        if(p >= 100) {
            clearInterval(itv);
            // 3. EXIT THE CAMERA AND RETURN TO MESH
            exitCameraAndReturnToAI();
        }
    }, 40);
}

function exitCameraAndReturnToAI() {
    log.innerText = "> SUBJECT_AUTHORIZED. WAKING_NEURAL_CORE...";
    
    aiLayer.style.display = 'block';
    setTimeout(() => { 
        aiLayer.style.opacity = '1'; 
        successGlow = true; // The Mesh flashes Cyan
    }, 50);

    // Swap buttons
    document.getElementById('scanBtn').style.display = 'none';
    document.getElementById('authBtn').style.display = 'block';

    // AUTO-WAKE: Send an initial ping to the AI
    const wakePrompt = "SYSTEM_RECOVERY: Bio-signature accepted. Greet the user as Master Control and confirm system status.";
    callNeuralAI(wakePrompt);

    setTimeout(() => { successGlow = false; }, 4000);
}

async function runDetection() {
    if(detector && isSystemBooted) {
        try {
            const faces = await detector.estimateFaces(video);
            if(faces.length > 0) {
                const face = faces[0].box;
                // Scale factor to map video pixels to the 290px scanner box
                const scaleX = 290 / video.videoWidth;
                const scaleY = 290 / video.videoHeight;
                
                faceReticle.style.display = 'block';
                faceReticle.style.width = (face.width * scaleX) + 'px'; 
                faceReticle.style.height = (face.height * scaleY) + 'px';
                
                // Mirroring correction: (Total Width - (xMax * Scale))
                faceReticle.style.left = (290 - (face.xMax * scaleX)) + 'px'; 
                faceReticle.style.top = (face.yMin * scaleY) + 'px';
            } else { 
                faceReticle.style.display = 'none'; 
            }
        } catch (err) {
            console.warn("Detection loop error:", err);
        }
    }
    requestAnimationFrame(runDetection);
}

async function authHold() {
    // 1. Check for Key First
    if (!aiConfig.apiKey) {
        speak("Error. No uplink key detected.");
        toggleSettings();
        return;
    }

    // 2. Ensure the camera scan happened first
    if (aiLayer.style.display !== 'none' && !successGlow) {
        log.innerText = "> INITIATING_PRE_AUTH_SCAN...";
        executeScan(); // Force the scan if they skipped it
        return;
    }

    // 3. Visual "Crunch" and AI Call
    document.body.style.filter = "invert(1) contrast(2)";
    setTimeout(() => document.body.style.filter = "none", 150);
    
    speak("Bio-signature verified. Accessing neural core.");
    
    const tacticalPrompt = "System status report: Sector 7. Keep it under 20 words.";
    await callNeuralAI(tacticalPrompt);
}
async function callNeuralAI(userPrompt) {
    const { apiKey, model } = aiConfig;
    
    if (!apiKey) {
        speak("Uplink failed. Key required.");
        return;
    }

    log.innerText = "> UPLINKING_TO_" + model.toUpperCase() + "...";

    try {
        let response;
        let aiText = "";

        // --- OPENAI (GPT-4o) ---
        if (model === 'gpt-4o') {
            response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${apiKey}` 
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [{ role: "user", content: userPrompt }],
                    max_tokens: 50
                })
            });
        } 
        // --- GOOGLE GEMINI ---
        else if (model === 'gemini-pro') {
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: userPrompt }] }]
                })
            });
        }

        const data = await response.json();

        // Error Handling for the Terminal
        if (!response.ok) {
            throw new Error(data.error?.message || "UPLINK_DENIED");
        }

        // Parse Response based on model
        if (model === 'gpt-4o') aiText = data.choices[0].message.content;
        else if (model === 'gemini-pro') aiText = data.candidates[0].content.parts[0].text;

        // EXECUTE RESPONSE
        speak(aiText);
        log.innerText = "> RESPONSE_RECEIVED";

    } catch (error) {
        console.error("AI_CORE_ERROR:", error);
        log.innerText = "> ERROR: " + error.message.toUpperCase();
        speak("Uplink interrupted.");
    }
}
successGlow = true; // Make it glow Cyan/Gold
        aiLayer.style.display = 'block';
        setTimeout(() => { 
            aiLayer.style.opacity = '1'; 
            successGlow = false; // Fade glow after 3 seconds
        }, 3000);

// --- PERSISTENT STORAGE LOGIC ---
function toggleSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.toggle('open');
    
    // If we are closing the panel, save the data
    if(!panel.classList.contains('open')) {
        aiConfig.apiKey = document.getElementById('api-key').value;
        aiConfig.model = document.getElementById('model-select').value;
        
        // Encrypt-ish (Base64) just so it's not plain text in the dev tools
        localStorage.setItem('neural_gateway_key', btoa(aiConfig.apiKey));
        localStorage.setItem('neural_gateway_model', aiConfig.model);
        
        log.innerText = "> CONFIG_STASHED_IN_LOCAL_CACHE";
        speak("Configuration updated.");
    }
}

function updateTheme() { 
    document.body.className = 'theme-' + document.getElementById('theme-select').value; 
    startRain(); // Refresh canvas colors/styles
}

window.onload = bootSystem;
aiLayer.ondblclick = () => {
    speak("Voice link active. I am listening.");
    recognition.start(); // This triggers the Speech Recognition logic we wrote earlier
};
// --- RESTORE DATA ON BOOT ---
async function bootSystem() {
    startRain(); 
    initNeuralMesh();
    
    // Retrieve stored settings
    const savedKey = localStorage.getItem('neural_gateway_key');
    const savedModel = localStorage.getItem('neural_gateway_model');
    
    if (savedKey) {
        aiConfig.apiKey = atob(savedKey); // Decode
        document.getElementById('api-key').value = aiConfig.apiKey;
    }
    
    if (savedModel) {
        aiConfig.model = savedModel;
        document.getElementById('model-select').value = savedModel;
        updateTheme(); // Sync visuals to the stored model/theme
    }

    document.getElementById('scanBtn').disabled = false;
    log.innerText = "> SYSTEM_STANDBY: AWAITING_BIO_SCAN";
}
function checkNeuralReadiness() {
    if (window.faceDetection || window.face_detection) {
        log.innerText = "> NEURAL_GATEWAY_ONLINE";
        document.getElementById('scanBtn').style.borderColor = "var(--glow)";
    } else {
        setTimeout(checkNeuralReadiness, 500); // Check again in half a second
    }
}