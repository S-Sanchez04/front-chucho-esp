// js/app-index.js
document.addEventListener("DOMContentLoaded", () => {
  const ipInput = document.getElementById("ipInput");
  const btnTest = document.getElementById("btnTest");
  const btnOpen = document.getElementById("btnOpen");
  const result = document.getElementById("result");

  function setResult(msg, ok=true) {
    result.textContent = msg;
    result.style.color = ok ? "" : "crimson";
  }

  btnTest.addEventListener("click", async () => {
    const ip = ipInput.value.trim();
    if (!ip) { setResult("Ingresa la IP del carro", false); return; }
    setResult("Probando conexión...");
    try {
      const health = await getHealth(ip);
      setResult("OK — " + JSON.stringify(health));
      // guardar ip para abrir directamente
      localStorage.setItem("car_ip", ip);
    } catch (err) {
      console.error(err);
      setResult("Error al conectar: " + (err.message || err), false);
    }
  });

  btnOpen.addEventListener("click", () => {
    const ip = ipInput.value.trim();
    if (!ip) { setResult("Ingresa la IP del carro", false); return; }
    // guardar ip y abrir dashboard con query
    localStorage.setItem("car_ip", ip);
    window.location.href = `dashboard.html?ip=${encodeURIComponent(ip)}`;
  });

  // si hay ip guardada, auto-completa
  const saved = localStorage.getItem("car_ip");
  if (saved) ipInput.value = saved;
});
