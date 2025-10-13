document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("kontaktForm");
  const meldung = document.getElementById("meldung");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    meldung.textContent = "Nachricht wurde lokal gesendet (Demo).";
    meldung.style.color = "#92fe9d";
    form.reset();
  });
});
