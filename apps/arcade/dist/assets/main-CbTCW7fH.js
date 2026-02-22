import"./modulepreload-polyfill-B5Qt9EMX.js";const r=[{id:"flappy-bird",title:"Flappy Bird",description:"WebGPU remake focused on deterministic gameplay and offline support.",href:"/flappy/",tags:["webgpu","arcade","offline"]}],a=document.querySelector("#app");if(!a)throw new Error("#app not found");a.innerHTML=`
  <h1>Offline Arcade</h1>
  <p class="lead">
    Play local-first game pages that continue working offline after first load.
    Add more pages and register them in <code>game-catalog</code>.
  </p>
  <section class="grid">
    ${r.map(e=>`
          <a class="card" href="${e.href}">
            <h2>${e.title}</h2>
            <p>${e.description}</p>
            <div class="tags">
              ${e.tags.map(i=>`<span class="tag">${i}</span>`).join("")}
            </div>
          </a>
        `).join("")}
  </section>
`;"serviceWorker"in navigator&&window.addEventListener("load",async()=>{await navigator.serviceWorker.register("/sw.js")});
