// js/config.js
// Ajusta estos valores si necesitas
window.APP_CONFIG = {
  HEALTH_PATH: "/api/v1/health",
  MOVE_PATH: "/api/v1/move",
  STREAM_PATH: "/stream",   // cambia si tu stream está en otro endpoint (ej: ":81/stream")
  HEALTH_POLL_MS: 2000,
  SENSOR_POLL_MS: 5000,
  DEFAULT_PORT: 80,
  // Si quieres ver MQTT en el front usando WebSockets:
  // brokerWsUrl: "ws://192.168.1.100:9001" o null para desactivar
  brokerWsUrl: null
};
