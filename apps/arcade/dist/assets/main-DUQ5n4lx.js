import"./modulepreload-polyfill-B5Qt9EMX.js";const i=[{id:"flappy-bird",title:"Flappy Bird",description:"WebGPU remake focused on deterministic gameplay and offline support.",href:"/flappy/",tags:["webgpu","arcade","offline"]}],e=document.querySelector("#app");if(!e)throw new Error("#app not found");e.innerHTML=`
  <main class="shell">
    <header class="hero">
      <p class="eyebrow">Offline Games</p>
      <h1>Offline Arcade</h1>
      <p class="lead">
        Quick browser games that keep working after first load. Useful on flights, trains, and low-signal moments.
      </p>
    </header>
    <section class="grid">
    ${i.map(a=>`
          <a class="card" href="${a.href}">
            <h2>${a.title}</h2>
            <p>${a.description}</p>
            <div class="card-meta">
              <div class="tags">
                ${a.tags.map(s=>`<span class="tag">${s}</span>`).join("")}
              </div>
              <span class="cta">Play</span>
            </div>
          </a>
        `).join("")}
    </section>
  </main>
`;"serviceWorker"in navigator&&window.addEventListener("load",async()=>{await navigator.serviceWorker.register("/sw.js")});
