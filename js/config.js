// js/config.js
// Ajusta estos valores si necesitas
window.APP_CONFIG = {
  HEALTH_PATH: "/api/v1/health",
  MOVE_PATH: "/api/v1/move",
  // STREAM_PATH puede ser un path relativo (se concatenará con la IP del carro)
  // o una URL completa. Para mostrar un MJPEG sencillo desde tu IP Webcam,
  // puedes poner aquí la URL completa, por ejemplo:
  //   "http://10.104.125.187:8080/video"
  // Si lo dejas como path relativo, se usará `http://<ip><STREAM_PATH>`.
  STREAM_PATH: "http://10.104.125.187:8080/video",
  HEALTH_POLL_MS: 2000,
  SENSOR_POLL_MS: 5000,
  DEFAULT_PORT: 80,
  // Si quieres ver MQTT en el front usando WebSockets:
  // brokerWsUrl: "ws://192.168.1.100:9001" o null para desactivar
  brokerWsUrl: null
};
