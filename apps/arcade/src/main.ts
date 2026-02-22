import { games } from "@offline-arcade/game-catalog";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app not found");
}

app.innerHTML = `
  <main class="shell">
    <header class="hero">
      <p class="eyebrow">Offline Games</p>
      <h1>Offline Arcade</h1>
      <p class="lead">
        Quick browser games that keep working after first load. Useful on flights, trains, and low-signal moments.
      </p>
    </header>
    <section class="grid">
    ${games
      .map(
        (game) => `
          <a class="card" href="${game.href}">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <div class="card-meta">
              <div class="tags">
                ${game.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
              </div>
              <span class="cta">Play</span>
            </div>
          </a>
        `
      )
      .join("")}
    </section>
  </main>
`;

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("/sw.js");
  });
}
