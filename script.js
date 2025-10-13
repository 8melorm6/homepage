// Initialisierung nach dem Laden des DOM
document.addEventListener("DOMContentLoaded", () => {
  // Kontaktformular-Demo
  const form = document.getElementById("kontaktForm");
  const meldung = document.getElementById("meldung");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      meldung.textContent = "Nachricht wurde lokal gesendet (Demo).";
      meldung.style.color = "#92fe9d";
      form.reset();
    });
  }

  // WebGL-Hintergrund (Vanta.js)
  if (typeof VANTA !== "undefined") {
    VANTA.WAVES({
    el: "body",
    mouseControls: true,
    touchControls: true,
    gyroControls: true,
    minHeight: 100.00,
    minWidth: 100.00,
    scale: 1.00,
    scaleMobile: 1.00,
    color: 0x0008a,      
    shininess: 30.00,     
    waveHeight: 25.00,    
    waveSpeed: 0.1,       
    zoom: 1
    });
  }
});
