/* ============================================================
   Bellus · Google tag (GA4) + Consent Mode v2 + banner LGPD
   Um arquivo para todo o ecossistema: detecta o domínio.
   - belluseventos.com.br  -> G-0W1X9CX8L7
   - noivadossonhos.com.br -> G-JW39CTRMND
   Eventos: espelha o Meta Pixel (Lead, InitiateCheckout, Purchase,
   ViewContent) e captura cliques de WhatsApp em qualquer página.
   ============================================================ */
(function () {
  "use strict";
  var MID = location.hostname.indexOf("noivadossonhos") >= 0 ? "G-JW39CTRMND" : "G-0W1X9CX8L7";
  var KEY = "bellus-consent"; // 'all' | 'essential'
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}

  // ── Consent Mode v2: padrão = analytics liberado, anúncios negados ──
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var adsGranted = saved === "all";
  var anGranted = saved !== "essential";
  gtag("consent", "default", {
    analytics_storage: anGranted ? "granted" : "denied",
    ad_storage: adsGranted ? "granted" : "denied",
    ad_user_data: adsGranted ? "granted" : "denied",
    ad_personalization: adsGranted ? "granted" : "denied",
    wait_for_update: 500
  });

  // ── Google tag ──
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + MID;
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", MID);

  // ── Espelha eventos do Meta Pixel no GA4 (sem tocar no pixel) ──
  var MAP = { Lead: "generate_lead", InitiateCheckout: "begin_checkout", Purchase: "purchase", ViewContent: "view_proposta" };
  function wrapFbq() {
    var orig = window.fbq;
    if (!orig || orig.__gaWrapped) return false;
    var wrapped = function () {
      try {
        var a = arguments;
        if ((a[0] === "track" || a[0] === "trackCustom") && MAP[a[1]]) {
          var p = a[2] || {};
          gtag("event", MAP[a[1]], { value: p.value || undefined, currency: p.currency || undefined });
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    for (var k in orig) { if (Object.prototype.hasOwnProperty.call(orig, k)) wrapped[k] = orig[k]; }
    wrapped.__gaWrapped = true;
    window.fbq = wrapped;
    return true;
  }
  if (!wrapFbq()) {
    var tries = 0;
    var t = setInterval(function () { if (wrapFbq() || ++tries > 40) clearInterval(t); }, 250);
  }

  // ── Clique em WhatsApp (qualquer página, qualquer link wa.me) ──
  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]') : null;
    if (a) gtag("event", "whatsapp_click", { link_url: a.href });
  }, true);

  // ── Banner de consentimento (LGPD), só se ainda não escolheu ──
  function saveChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    var g = v === "all" ? "granted" : "denied";
    gtag("consent", "update", {
      analytics_storage: v === "essential" ? "denied" : "granted",
      ad_storage: g, ad_user_data: g, ad_personalization: g
    });
    var b = document.getElementById("bellus-ck");
    if (b) { b.style.opacity = "0"; setTimeout(function () { b.remove(); }, 350); }
  }
  function banner() {
    if (saved) return;
    var d = document.createElement("div");
    d.id = "bellus-ck";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-label", "Aviso de cookies");
    d.innerHTML =
      '<style>#bellus-ck{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;width:min(560px,calc(100vw - 24px));background:#141414;color:#f4f1eb;border:1px solid rgba(202,170,114,.35);border-radius:12px;padding:14px 16px;font:400 13px/1.5 Montserrat,system-ui,sans-serif;box-shadow:0 18px 50px -18px rgba(0,0,0,.6);display:flex;gap:14px;align-items:center;flex-wrap:wrap;transition:opacity .3s}#bellus-ck p{margin:0;flex:1;min-width:200px}#bellus-ck a{color:#caaa72}#bellus-ck .ck-b{display:flex;gap:8px}#bellus-ck button{font:600 11px/1 Montserrat,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;border-radius:8px;border:1px solid rgba(244,241,235,.35);background:transparent;color:#f4f1eb;cursor:pointer}#bellus-ck button.ok{background:#8f734d;border-color:#8f734d;color:#fff}</style>' +
      '<p>Usamos cookies para medir o uso do site e melhorar a sua experiência.</p>' +
      '<div class="ck-b"><button type="button" id="ck-ess">Só essenciais</button><button type="button" class="ok" id="ck-ok">Aceitar</button></div>';
    document.body.appendChild(d);
    document.getElementById("ck-ok").addEventListener("click", function () { saveChoice("all"); });
    document.getElementById("ck-ess").addEventListener("click", function () { saveChoice("essential"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", banner);
  else banner();
})();
