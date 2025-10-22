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
      waveSpeed: 0.3,
      zoom: 0.5
    });
  }

  // --- Drag & Drop + Positionsspeicherung (Desktop + Touch) ---
  const cards = document.querySelectorAll(".card");
  const screenWidth = window.innerWidth;
  // Definiert den Breakpoint: Mobilgeräte sind Bildschirme bis 768px
  const isMobile = screenWidth <= 768; 
  const spacing = screenWidth / (cards.length + 1);
  const startY = 250;

  cards.forEach((card, index) => {
    const id = card.dataset.id;
    const saved = JSON.parse(localStorage.getItem(`card-pos-${id}`));

    // --- POSITIONIERUNG ---
    // Absolute Positionierung nur auf Desktop anwenden
    if (!isMobile) {
      if (saved) {
        card.style.left = saved.x + "px";
        card.style.top = saved.y + "px";
      } else {
        // Anfangspositionen für Desktop (nebeneinander)
        card.style.left = spacing * (index + 1) - card.offsetWidth / 2 + "px";
        card.style.top = startY + "px";
      }
    } else {
      // Auf Mobilgeräten gespeicherte Position löschen, damit die Karten gestapelt werden
      localStorage.removeItem(`card-pos-${id}`);
    }

    let offsetX, offsetY, moved = false;

    // --- DRAG-LOGIK (NUR FÜR DESKTOP/GROSSE BILDSCHIRME) ---
    if (!isMobile) {
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
        // e.preventDefault() hier weglassen, um Scrollen zu erlauben, es wird in touchmove behandelt
        startDrag(touch.clientX, touch.clientY);
      }, { passive: false });

      card.addEventListener("touchmove", e => {
        e.preventDefault(); // Hier preventDefault, um das Ziehen zu ermöglichen und das Standard-Scrollen zu verhindern
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
      }, { passive: false });

      card.addEventListener("touchend", endDrag);
    } // Ende Drag-Logik

    // --- Klickverhalten ---
    card.addEventListener("click", (e) => {
      // Klick blockieren nur, wenn Drag & Drop aktiv ist und es eine Bewegung gab
      if (!isMobile && card.dataset.blockClick === "true") {
        e.preventDefault();
        return;
      }
      if (id === "berechnungen") window.location.href = "/berechnungen/index.html";
      if (id === "subnetting") window.location.href = "/subnetz/subnetz.html";
      if (id === "handel") window.location.href = "/handelskalkulation/kalkulation.html";
      if (id === "classbook") window.location.href = "/classbook/login_calendar.html";
      if (id === "manage") window.location.href = "/classbook/manage_login.php";
    });
  });

  // --- Visueller Hinweis: Karten sind verschiebbar ---
  const hintBox = document.getElementById("drag-hint");

  if (hintBox) {
    // Hinweis und Animation nur auf Desktop/großen Bildschirmen anzeigen
    if (!isMobile) {
      hintBox.classList.add("visible");
      cards.forEach(card => card.classList.add("hint"));
      setTimeout(() => {
        hintBox.classList.remove("visible");
        cards.forEach(card => card.classList.remove("hint"));
      }, 6000);
    } else {
      // Auf Mobilgeräten den Hinweis ausblenden (optional: Element entfernen)
      hintBox.style.display = 'none';
    }
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

  // --- Dynamisches Partikel-Logo (Farbübergang zwischen L- und R-Farbe) ---
  if (typeof THREE !== "undefined") {
    const logoEl = document.querySelector(".logo");
    if (logoEl) {
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "-15px";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "80px";
      container.style.pointerEvents = "none";
      logoEl.appendChild(container);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);

      const geometry = new THREE.BufferGeometry();
      const count = 250;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 3;
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      // Ausgangsfarben (RGB-Werte)
      const colorStart = new THREE.Color("#56b0ff");
      const colorEnd = new THREE.Color("#77e3b2");
      const material = new THREE.PointsMaterial({ color: colorStart.clone(), size: 0.05 });

      const points = new THREE.Points(geometry, material);
      scene.add(points);
      camera.position.z = 2.5;

      let hover = false;
      let t = 0;

      function animate() {
        requestAnimationFrame(animate);
        points.rotation.y += hover ? 0.02 : 0.005;
        points.rotation.x += hover ? 0.015 : 0.002;

        // sanfter Farbverlauf zwischen Blau und Grün
        t += 0.01;
        const factor = (Math.sin(t) + 1) / 2; // 0 → 1 → 0
        const blended = colorStart.clone().lerp(colorEnd, factor);
        material.color = blended;

        renderer.render(scene, camera);
      }
      animate();

      logoEl.addEventListener("mouseenter", () => { hover = true; });
      logoEl.addEventListener("mouseleave", () => { hover = false; });
    }
  }

});