// js/app-dashboard.js
let ip = null;
let pollInterval = null;
let healthInterval = null;
let mqttClient = null;

function log(msg) {
  const el = document.getElementById("log");
  const t = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.textContent = `[${t}] ${msg}`;
  el.prepend(line);
}

function getQueryIp() {
  const p = new URLSearchParams(window.location.search);
  return p.get("ip") || localStorage.getItem("car_ip");
}

async function updateHealthOnce() {
  try {
    const data = await getHealth(ip);
    document.getElementById("healthStatus").textContent = data.status || "ok";
    document.getElementById("carIp").textContent = ip;
    // si el payload incluye distancia, mostrar
    if (data.distance_cm !== undefined) {
      document.getElementById("lastDistance").textContent = data.distance_cm;
    }
  } catch (err) {
    document.getElementById("healthStatus").textContent = "offline";
    console.warn(err);
  }
}

function setStreamSrc() {
  const img = document.getElementById("camFeed");
  // construye URL del stream; el usuario puede ajustar STREAM_PATH en config.js
  const configured = window.APP_CONFIG.STREAM_PATH;
  const candidates = [];
  if (configured) {
    // si el usuario puso una URL completa, úsala tal cual
    if (/^https?:\/\//i.test(configured)) {
      candidates.push(configured);
    } else {
      candidates.push(`http://${ip}${configured}`);
    }
  } else {
    // endpoints comunes para apps de IP webcam / mjpeg
    candidates.push(`http://${ip}/video`);
    candidates.push(`http://${ip}/stream`);
    candidates.push(`http://${ip}/shot.jpg`);
    // algunos servidores usan el puerto 8080 por defecto
    candidates.push(`http://${ip}:8080/video`);
    candidates.push(`http://${ip}:8080/`);
  }

  let tried = 0;
  img.alt = "Cargando feed...";

  function tryNext() {
    if (tried >= candidates.length) {
      img.src = "";
      img.alt = "No hay stream disponible (aún)";
      return;
    }
    const url = candidates[tried++];
    img.onload = () => {
      img.onerror = null;
      img.alt = "Feed cámara";
    };
    img.onerror = () => {
      // intenta siguiente candidato
      setTimeout(tryNext, 200);
    };
    img.src = url;
  }

  tryNext();
}

async function sendCommand(direction, speed, duration) {
  try {
    log(`Enviar: ${direction} speed=${speed} dur=${duration}`);
    const res = await sendMove(ip, direction, speed, duration);
    // Mostrar en logs la respuesta tal como venga del servidor:
    if (typeof res === 'string') {
      log("[Server]: " + res);
    } else {
      try {
        log("[Server]: " + JSON.stringify(res));
      } catch (e) {
        log("[Server]: (response) - no se pudo serializar");
      }
    }
  } catch (err) {
    log("Error enviando comando: " + (err.message || err));
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  ip = getQueryIp();
  if (!ip) {
    alert("No se encontró la IP del carro. Vuelve a la pantalla de conexión.");
    window.location.href = "index.html";
    return;
  }

  // UI refs
  const speedEl = document.getElementById("speed");
  const speedVal = document.getElementById("speedVal");
  const durationEl = document.getElementById("duration");
  const controlBtns = document.querySelectorAll(".control-btn");
  const btnManual = document.getElementById("btnManual");
  const btnDisconnect = document.getElementById("btnDisconnect");

  speedEl.addEventListener("input", () => { speedVal.textContent = speedEl.value; });

  controlBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.dir;
      const speed = Number(speedEl.value);
      const duration = Number(durationEl.value) || 500;
      sendCommand(dir, speed, duration);
    });
  });

  btnManual.addEventListener("click", () => {
    const dir = prompt("Dirección (forward/backward/left/right/stop):", "forward");
    if (!dir) return;
    const speed = Number(speedEl.value);
    const duration = Number(durationEl.value);
    sendCommand(dir, speed, duration);
  });

  btnDisconnect.addEventListener("click", () => {
    localStorage.removeItem("car_ip");
    window.location.href = "index.html";
  });

  // set stream
  setStreamSrc();

  // start polling health
  await updateHealthOnce();
  healthInterval = setInterval(updateHealthOnce, window.APP_CONFIG.HEALTH_POLL_MS || 2000);

  // opcional: si APP_CONFIG.brokerWsUrl está definido, conectar mqtt
  if (window.APP_CONFIG.brokerWsUrl) {
    try {
      mqttClient = createMqttClient(window.APP_CONFIG.brokerWsUrl, {
        onConnect() { log("MQTT conectado"); },
        onMessage(topic, msg) { log(`MQTT ${topic}: ${msg}`); }
      });
    } catch (e) { console.warn("mqtt error", e); }
  }

  log("Dashboard listo para " + ip);
});
