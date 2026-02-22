(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const i of r.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function a(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(e){if(e.ep)return;e.ep=!0;const r=a(e);fetch(e.href,r)}})();const c=[{id:"flappy-bird",title:"Flappy Bird",description:"WebGPU remake focused on deterministic gameplay and offline support.",href:"/flappy/",tags:["webgpu","arcade","offline"]}],n=document.querySelector("#app");if(!n)throw new Error("#app not found");n.innerHTML=`
  <h1>Offline Arcade</h1>
  <p class="lead">
    Play local-first game pages that continue working offline after first load.
    Add more pages and register them in <code>game-catalog</code>.
  </p>
  <section class="grid">
    ${c.map(t=>`
          <a class="card" href="${t.href}">
            <h2>${t.title}</h2>
            <p>${t.description}</p>
            <div class="tags">
              ${t.tags.map(o=>`<span class="tag">${o}</span>`).join("")}
            </div>
          </a>
        `).join("")}
  </section>
`;"serviceWorker"in navigator&&window.addEventListener("load",async()=>{await navigator.serviceWorker.register("/sw.js")});
