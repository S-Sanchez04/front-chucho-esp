// js/api.js
// Funciones simples para interactuar con el carro.
// Manejan timeouts y errores básicos.

function normalizeIp(ip) {
  // Si viene vacío, devuelve null
  if (!ip) return null;
  return ip;
}

async function timeoutFetch(resource, options = {}) {
  const { timeout = 4000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(resource, { ...options, signal: controller.signal, mode: 'cors' });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

async function getHealth(ip) {
  ip = normalizeIp(ip);
  if (!ip) throw new Error("IP no definida");
  const url = `http://${ip}${window.APP_CONFIG.HEALTH_PATH}`;
  const res = await timeoutFetch(url, { timeout: 3000 });
  if (!res.ok) throw new Error("health request failed: " + res.status);
  return res.json();
}

async function sendMove(ip, direction, speed = 180, duration = 500) {
  ip = normalizeIp(ip);
  if (!ip) throw new Error("IP no definida");
  // El servidor del ESP espera los parámetros por query string (ej: ?direction=forward&speed=200&duration=1000)
  const params = new URLSearchParams({
    direction: String(direction),
    speed: String(Number(speed)),
    duration: String(Number(duration))
  });
  const url = `http://${ip}${window.APP_CONFIG.MOVE_PATH}?${params.toString()}`;
  const res = await timeoutFetch(url, { timeout: 4000 });
  if (!res.ok) {
    let text = await res.text().catch(() => "");
    throw new Error("move failed: " + res.status + " " + text);
  }
  // intenta parsear JSON si viene; si no, devuelve texto
  const text = await res.text().catch(() => "");
  try { return text ? JSON.parse(text) : {}; } catch (e) { return text; }
}
