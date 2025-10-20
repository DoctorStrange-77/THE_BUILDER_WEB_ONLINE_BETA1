
(function(){
  const OPT_KEY = "fs_optin_v1";
  // Fullscreen behaviour is force-disabled. This function now always returns false
  // to ignore saved user preference and prevent any automatic fullscreen behavior.
  function isOptIn(){ return false; }
  function setOptIn(v){ localStorage.setItem(OPT_KEY, v ? "1" : "0"); }

  async function enterFullscreen(){
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      try { await el.requestFullscreen(); } catch(e){ /* ignore */ }
    }
  }

  // If user already opted in, arm a one-time listener to request FS on first gesture
  function armAutoFS(){
    const handler = async ()=>{
      await enterFullscreen();
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
    window.addEventListener("pointerdown", handler, { once:true });
    window.addEventListener("keydown", handler, { once:true });
  }

  function buildOverlay(){
    const style = document.createElement("style");
    style.textContent = `
    .fs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;
      align-items:center;justify-content:center;z-index:99999;font-family:system-ui,Segoe UI,Roboto,Arial}
    .fs-card{background:#111;border:1px solid #333;border-radius:16px;padding:28px;max-width:560px;
      color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.5);text-align:center}
    .fs-title{font-size:1.25rem;margin:0 0 10px}
    .fs-body{opacity:.9;margin-bottom:18px;line-height:1.4}
    .fs-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .fs-btn{padding:12px 16px;border-radius:999px;border:0;cursor:pointer;font-weight:600}
    .fs-primary{background:#ffd700;color:#111}
    .fs-ghost{background:transparent;color:#fff;border:1px solid #444}
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.className = "fs-overlay";
    overlay.innerHTML = `
      <div class="fs-card">
        <h3 class="fs-title">Apri a schermo intero?</h3>
        <p class="fs-body">Per un'esperienza migliore, The Builder può avviarsi in modalità <b>Schermo Intero</b>.<br>
        Per ragioni di sicurezza del browser serve un <i>click</i> iniziale.</p>
        <div class="fs-row">
          <button class="fs-btn fs-primary" id="fs-accept">Sì, avvia a schermo intero</button>
          <button class="fs-btn fs-ghost" id="fs-decline">No, continua normale</button>
        </div>
        <p class="fs-body" style="margin-top:14px;opacity:.7">Suggerimento: puoi sempre usare <b>F11</b> per entrare/uscire.</p>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#fs-accept").addEventListener("click", async ()=>{
      setOptIn(true);
      await enterFullscreen();
      overlay.remove();
      armAutoFS(); // arm handlers for future navigations
    });
    overlay.querySelector("#fs-decline").addEventListener("click", ()=>{
      setOptIn(false);
      overlay.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    // Only arm auto-FS if opted-in. Do not show overlay or request FS otherwise.
    if(isOptIn()){ armAutoFS(); }
  });

  // If FS gets exited but user is opted-in, re-arm on next gesture
  document.addEventListener("fullscreenchange", ()=>{
    if (isOptIn() && !document.fullscreenElement) {
      armAutoFS();
    }
  });
})();
