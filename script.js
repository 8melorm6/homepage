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

  // --- Drag & Drop + Positionsspeicherung (Desktop + Touch) ---
  const cards = document.querySelectorAll(".card");
  const screenWidth = window.innerWidth;
  const spacing = screenWidth / (cards.length + 1);
  const startY = 250;

  cards.forEach((card, index) => {
    const id = card.dataset.id;
    const saved = JSON.parse(localStorage.getItem(`card-pos-${id}`));

    // Wenn keine Position gespeichert, Karten nebeneinander verteilen
    if (saved) {
      card.style.left = saved.x + "px";
      card.style.top = saved.y + "px";
    } else {
      card.style.left = spacing * (index + 1) - card.offsetWidth / 2 + "px";
      card.style.top = startY + "px";
    }

    let offsetX, offsetY, moved = false;

    const startDrag = (clientX, clientY) => {
      offsetX = clientX - card.offsetLeft;
      offsetY = clientY - card.offsetTop;
      card.classList.add("dragging");
      moved = false;
    };

    const moveDrag = (clientX, clientY) => {
      moved = true;
      const x = Math.max(0, Math.min(window.innerWidth - card.offsetWidth, clientX - offsetX));
      const y = Math.max(0, Math.min(window.innerHeight - card.offsetHeight, clientY - offsetY));
      card.style.left = x + "px";
      card.style.top = y + "px";
    };

    const endDrag = () => {
      card.classList.remove("dragging");
      localStorage.setItem(`card-pos-${id}`, JSON.stringify({
        x: card.offsetLeft,
        y: card.offsetTop
      }));
      if (moved) {
        card.dataset.blockClick = "true";
        setTimeout(() => delete card.dataset.blockClick, 100);
      }
    };

    // --- Maussteuerung ---
    card.addEventListener("mousedown", e => {
      startDrag(e.clientX, e.clientY);

      const onMove = ev => moveDrag(ev.clientX, ev.clientY);
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        endDrag();
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

    // --- Touchsteuerung ---
    card.addEventListener("touchstart", e => {
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    card.addEventListener("touchmove", e => {
      e.preventDefault();
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    card.addEventListener("touchend", endDrag);

    // --- Klickverhalten ---
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

  if (hintBox) {
    hintBox.classList.add("visible");
    cards.forEach(card => card.classList.add("hint"));
    setTimeout(() => {
      hintBox.classList.remove("visible");
      cards.forEach(card => card.classList.remove("hint"));
    }, 6000);
  }

  // --- Datum und Uhrzeit ---
  const datetimeEl = document.getElementById("datetime");
  function updateDateTime() {
    const now = new Date();
    const options = { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    datetimeEl.textContent = now.toLocaleString("de-DE", options);
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  // --- Wetteranzeige ---
  const weatherEl = document.getElementById("weather");
  const apiKey = "4e0b983a4bbe2545d6ed08b59967c6e3";

  function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=de`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.weather && data.main) {
          const temp = Math.round(data.main.temp);
          const desc = data.weather[0].description;
          const icon = data.weather[0].icon;
          const city = data.name;
          weatherEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}.png" alt="" style="vertical-align:middle;width:22px;height:22px;"> ${city}: ${temp}°C, ${desc}`;
        } else {
          weatherEl.textContent = "Wetterdaten nicht verfügbar";
        }
      })
      .catch(() => {
        weatherEl.textContent = "Keine Verbindung zur API";
      });
  }

  // Standort ermitteln
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => { weatherEl.textContent = "Standortzugriff verweigert"; }
    );
  } else {
    weatherEl.textContent = "Geolocation nicht unterstützt";
  }

});
