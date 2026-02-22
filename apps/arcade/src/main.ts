import { games } from "@offline-arcade/game-catalog";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("#app not found");
}

app.innerHTML = `
  <h1>Offline Arcade</h1>
  <p class="lead">
    Play local-first game pages that continue working offline after first load.
    Add more pages and register them in <code>game-catalog</code>.
  </p>
  <section class="grid">
    ${games
      .map(
        (game) => `
          <a class="card" href="${game.href}">
            <h2>${game.title}</h2>
            <p>${game.description}</p>
            <div class="tags">
              ${game.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </a>
        `
      )
      .join("")}
  </section>
`;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    await navigator.serviceWorker.register("/sw.js");
  });
}
