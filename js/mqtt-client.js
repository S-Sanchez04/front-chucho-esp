// js/mqtt-client.js
// Requiere mqtt.min.js (ej: <script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>)
// createMqttClient(brokerWsUrl, { onConnect, onMessage })
function createMqttClient(brokerWsUrl, handlers={}) {
  if (!brokerWsUrl) throw new Error("brokerWsUrl requerido");
  const client = mqtt.connect(brokerWsUrl);
  client.on("connect", () => {
    handlers.onConnect && handlers.onConnect();
    // ejemplo: suscribirse a topics de telemetría (puedes editar)
    client.subscribe("carro/+/sensors", (err) => {
      if (err) console.warn("subscribe err", err);
    });
  });
  client.on("message", (topic, payload) => {
    handlers.onMessage && handlers.onMessage(topic, payload.toString());
  });
  client.on("error", (e) => console.error("mqtt err", e));
  return client;
}
