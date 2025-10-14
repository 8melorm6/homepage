// Initialisierung nach dem Laden des DOM
document.addEventListener("DOMContentLoaded", () => {
  // --- Kontaktformular-Demo ---
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

  // --- WebGL-Hintergrund (Vanta.js) ---
  if (typeof VANTA !== "undefined") {
    VANTA.WAVES({
      el: "body",
      mouseControls: true,
      touchControls: true,
      gyroControls: true,
      minHeight: 100.0,
      minWidth: 100.0,
      scale: 1.0,
      scaleMobile: 1.0,
      color: 0x0008a,
      shininess: 30.0,
      waveHeight: 25.0,
      waveSpeed: 0.1,
      zoom: 1
    });
  }

// --- Drag & Drop + Positionsspeicherung ---
const cards = document.querySelectorAll(".card");

// Bildschirmbreite abrufen, um Karten nebeneinander zu verteilen
const screenWidth = window.innerWidth;
const spacing = screenWidth / (cards.length + 1);
const startY = 250; // alle auf gleicher Höhe

cards.forEach((card, index) => {
  const id = card.dataset.id;
  const saved = JSON.parse(localStorage.getItem(`card-pos-${id}`));

  // Wenn noch keine Position gespeichert, automatisch verteilen
  if (saved) {
    card.style.left = saved.x + "px";
    card.style.top = saved.y + "px";
  } else {
    card.style.left = spacing * (index + 1) - card.offsetWidth / 2 + "px";
    card.style.top = startY + "px";
  }

  let offsetX, offsetY;
  let moved = false;

  card.addEventListener("mousedown", (e) => {
    offsetX = e.clientX - card.offsetLeft;
    offsetY = e.clientY - card.offsetTop;
    card.classList.add("dragging");
    moved = false;

    function onMouseMove(ev) {
      moved = true;
      const x = Math.max(0, Math.min(window.innerWidth - card.offsetWidth, ev.clientX - offsetX));
      const y = Math.max(0, Math.min(window.innerHeight - card.offsetHeight, ev.clientY - offsetY));
      card.style.left = x + "px";
      card.style.top = y + "px";
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      card.classList.remove("dragging");

      // Position speichern
      localStorage.setItem(`card-pos-${id}`, JSON.stringify({
        x: card.offsetLeft,
        y: card.offsetTop
      }));

      // Klick blockieren nach Drag
      if (moved) {
        card.dataset.blockClick = "true";
        setTimeout(() => delete card.dataset.blockClick, 100);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // Nur Klick, wenn kein Drag
  card.addEventListener("click", (e) => {
    if (card.dataset.blockClick === "true") {
      e.preventDefault();
      return;
    }
    if (id === "berechnungen") window.location.href = "/berechnungen/index.html";
    if (id === "subnetting") window.location.href = "/subnetz/subnetz.html";
    if (id === "handel") window.location.href = "/handelskalkulation/kalkulation.html";
  });
});

// --- Visueller Hinweis: Karten sind verschiebbar ---
const hintBox = document.getElementById("drag-hint");

// Hinweistext immer einblenden
hintBox.classList.add("visible");

// Karten kurz hervorheben
cards.forEach(card => card.classList.add("hint"));

// Nach 6 Sekunden: Hinweis und Animation entfernen
setTimeout(() => {
  hintBox.classList.remove("visible");
  cards.forEach(card => card.classList.remove("hint"));
}, 6000);

});
