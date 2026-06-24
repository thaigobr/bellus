/* ============================================================
   Bellus Eventos — comportamento do site institucional
   ============================================================ */
(function () {
  "use strict";

  // ── Integração Supabase (chave publishable: segura para o navegador) ──
  var SUPABASE_FN_URL =
    "https://nngvxucybligmanbedrs.supabase.co/functions/v1/create-lead-bellus";
  var SUPABASE_ANON_KEY = "sb_publishable_UhC5LHa4Ob5vSY4K5xrM5Q_LG3pllu-";
  var WHATSAPP = "5521981636666";
  // Mensagem do botão de WhatsApp: identifica que veio do site e conduz ao formulário.
  var WA_MSG = "Olá! Vim pelo site da Bellus e gostaria de confirmar a disponibilidade da nossa data. Vou preencher o formulário de vocês no site para receber a proposta personalizada e deixar tudo organizado.";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Nav: estado ao rolar ───────────────────────────────
  var nav = document.getElementById("nav");
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ── Botão de WhatsApp da nav: aplica a mensagem que conduz ao formulário ──
  var navCta = document.querySelector(".nav__cta");
  if (navCta) navCta.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(WA_MSG);

  // ── Vídeo de fundo do hero: pausa se o usuário pediu menos movimento ──
  var heroVid = document.querySelector(".hero__video");
  if (heroVid && reduceMotion) { heroVid.removeAttribute("autoplay"); heroVid.pause(); }

  // ── Revelar seções ao entrar na viewport ───────────────
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  // ── Títulos: digitação (máquina de escrever, 1x por seção) + linha que cresce nos dois sentidos do scroll ──
  function typeTitle(el) {
    var tokens = el.innerHTML.split(/(<br\s*\/?>)/i);
    var units = [];
    tokens.forEach(function (t) {
      if (!t) return;
      if (/^<br/i.test(t)) units.push(t);
      else for (var k = 0; k < t.length; k++) units.push(t.charAt(k));
    });
    if (!units.length) return;
    el.style.minHeight = el.offsetHeight + "px";
    var i = 0, buf = "";
    function step() {
      if (i >= units.length) { el.innerHTML = buf; el.style.minHeight = ""; return; }
      buf += units[i]; i++;
      el.innerHTML = buf + '<span class="tw-caret" aria-hidden="true"></span>';
      setTimeout(step, 35);
    }
    el.innerHTML = '<span class="tw-caret" aria-hidden="true"></span>';
    step();
  }
  var titleEls = document.querySelectorAll(".section__title, .hero__title, .manifesto__lead");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    titleEls.forEach(function (el) { el.classList.add("is-inview"); });
  } else {
    var titleIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        if (e.isIntersecting) {
          el.classList.add("is-inview");
          if (!el.dataset.typed) { el.dataset.typed = "1"; typeTitle(el); }
        } else {
          el.classList.remove("is-inview");
        }
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    titleEls.forEach(function (el) { titleIO.observe(el); });
  }

  // ── FAQ: abre um e fecha os outros (acordeão) ───────────
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // ── Pó dourado em canvas (seções escuras), sincronizado ao SCROLL ──
  // Porta do ParticlesCanvas do app de proposta: parallax por profundidade,
  // embers, SEM loop ocioso (só desenha ao rolar/redimensionar), pausa fora da tela.
  // Opcional via atributos: data-density (default 160), data-fade-bottom (0..1).
  function initParticles(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var reduced = reduceMotion;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0, height = 0, visible = true, ticking = false;
    var particles = [];
    var density = parseFloat(canvas.getAttribute("data-density")) || 160;

    function seed() {
      var rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(density, Math.max(70, (width * height) / 7000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        var ember = Math.random() < 0.12;
        particles.push({
          bx: Math.random(),
          by: Math.random(),
          r: ember ? 1.6 + Math.random() * 1.4 : 0.4 + Math.random() * 1.4,
          depth: 0.12 + Math.random() * 0.9,
          alpha: ember ? 0.55 + Math.random() * 0.3 : 0.22 + Math.random() * 0.45,
          hue: 38 + Math.random() * 8,
          sat: 45 + Math.random() * 18,
          light: 58 + Math.random() * 22,
          seed: Math.random() * Math.PI * 2,
          drift: 6 + Math.random() * 18,
          ember: ember,
        });
      }
    }

    function sectionProgress() {
      var rect = canvas.getBoundingClientRect();
      return window.innerHeight - rect.top;
    }

    function draw() {
      var progress = reduced ? 0 : sectionProgress();
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var travel = progress * p.depth * 0.35;
        var y = (p.by * height - travel) % height;
        if (y < 0) y += height;
        var x = p.bx * width + Math.sin(p.seed + progress * 0.0016) * p.drift;
        ctx.beginPath();
        if (p.ember) { ctx.shadowColor = "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, 0.9)"; ctx.shadowBlur = 6; }
        else { ctx.shadowBlur = 0; }
        ctx.fillStyle = "hsla(" + p.hue + ", " + p.sat + "%, " + p.light + "%, " + p.alpha + ")";
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function onScroll() {
      if (reduced || !visible) return;
      if (!ticking) { ticking = true; requestAnimationFrame(function () { draw(); ticking = false; }); }
    }

    seed(); draw();
    var to;
    window.addEventListener("resize", function () { clearTimeout(to); to = setTimeout(function () { seed(); draw(); }, 200); }, { passive: true });
    if (!reduced) window.addEventListener("scroll", onScroll, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) draw();
      }, { threshold: 0 }).observe(canvas);
    }

    var fb = parseFloat(canvas.getAttribute("data-fade-bottom"));
    if (!isNaN(fb)) {
      var g = "linear-gradient(to bottom, #000 " + Math.round(fb * 100) + "%, transparent 100%)";
      canvas.style.webkitMaskImage = g;
      canvas.style.maskImage = g;
    }
  }
  document.querySelectorAll("[data-particles]").forEach(initParticles);

  // ── Portfólio: clique para tocar (pôster limpo, sem chrome do YouTube no repouso) ──
  document.querySelectorAll(".pf-play[data-yt]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-yt");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      f.title = "Prévia Bellus Eventos";
      f.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      f.setAttribute("allowfullscreen", "");
      btn.appendChild(f);
      btn.classList.add("is-playing");
    });
  });

  // ── Formulário de disponibilidade → Supabase ────────────
  var form = document.getElementById("lead-form");
  var feedback = document.getElementById("lead-feedback");
  var submitBtn = document.getElementById("lead-submit");

  // Data mínima = hoje (impede marcar data passada) + máscara de WhatsApp p/ preenchimento correto.
  var hojeD = new Date();
  var HOJE_ISO = hojeD.getFullYear() + "-" + String(hojeD.getMonth() + 1).padStart(2, "0") + "-" + String(hojeD.getDate()).padStart(2, "0");
  var dataInput = form ? form.querySelector('[name="dataCasamento"]') : null;
  if (dataInput) dataInput.min = HOJE_ISO;
  var waInput = form ? form.querySelector('[name="whatsapp"]') : null;
  function maskPhone(v) {
    var d = (v || "").replace(/\D/g, "").slice(0, 11);
    if (!d) return "";
    if (d.length <= 2) return "(" + d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }
  if (waInput) waInput.addEventListener("input", function () { waInput.value = maskPhone(waInput.value); });

  function setFeedback(msg, kind) {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = "form__feedback" + (kind ? " is-" + kind : "");
  }

  function waFallbackLink(data) {
    var parts = [
      "Olá! Vim pelo site da Bellus e preenchi o formulário para consultar a disponibilidade. Seguem os meus dados:",
      "Nome: " + (data.nome || ""),
      data.nomeParceiro ? "Par: " + data.nomeParceiro : "",
      "Data: " + (data.dataCasamento || ""),
      data.cidade ? "Cidade: " + data.cidade : "",
      data.local ? "Local: " + data.local : "",
    ].filter(Boolean);
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(parts.join("\n"));
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(form);
      var data = {
        nome: (fd.get("nome") || "").toString().trim(),
        nomeParceiro: (fd.get("nomeParceiro") || "").toString().trim(),
        whatsapp: (fd.get("whatsapp") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        dataCasamento: (fd.get("dataCasamento") || "").toString().trim(),
        cidade: (fd.get("cidade") || "").toString().trim(),
        local: (fd.get("local") || "").toString().trim(),
        convidados: (fd.get("convidados") || "").toString().trim(),
        mensagem: (fd.get("mensagem") || "").toString().trim(),
      };

      if (data.nome.length < 2) return setFeedback("Por favor, informe o seu nome.", "error");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return setFeedback("E-mail inválido. Confira o endereço, ex.: nome@email.com.", "error");
      var waDig = data.whatsapp.replace(/\D/g, "");
      if (waDig.length < 10 || waDig.length > 11) return setFeedback("Informe um WhatsApp válido com DDD, ex.: (21) 90000-0000.", "error");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dataCasamento)) return setFeedback("Informe a data do casamento.", "error");
      if (data.dataCasamento < HOJE_ISO) return setFeedback("A data do casamento precisa ser hoje ou no futuro.", "error");

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Enviando...";
      setFeedback("", null);

      fetch(SUPABASE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body };
          });
        })
        .then(function (r) {
          if (r.ok && r.body && r.body.success) {
            form.reset();
            if (window.fbq) fbq("track", "Lead");
            setFeedback("Recebemos os seus dados. Em breve falamos com você pelo WhatsApp.", "ok");
          } else {
            var msg = (r.body && r.body.error) || "Não foi possível enviar agora.";
            setFeedback(msg + " Você também pode falar direto no WhatsApp.", "error");
          }
        })
        .catch(function () {
          window.location.href = waFallbackLink(data);
          setFeedback("Sem conexão com o servidor. Abrindo o WhatsApp...", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  // ── Avaliações do Google (via edge function com cache) ──────
  var REVIEWS_URL =
    "https://nngvxucybligmanbedrs.supabase.co/functions/v1/google-reviews";
  var reviewsList = document.getElementById("reviews-list");
  var reviewsSummary = document.getElementById("reviews-summary");
  var reviewsSection = document.getElementById("avaliacoes");

  function escHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function starRow(n) {
    var full = Math.round(n || 5), s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }
  function renderReviews(data) {
    if (!data || !data.reviews || !data.reviews.length || !reviewsList) return;
    if (reviewsSummary) {
      var score = Number(data.rating != null ? data.rating : 5).toFixed(1).replace(".", ",");
      var link = data.url || "https://www.google.com/maps";
      reviewsSummary.innerHTML =
        '<a class="reviews__badge" href="' + escHtml(link) + '" target="_blank" rel="noopener">' +
        '<span class="reviews__stars">' + starRow(data.rating) + "</span>" +
        '<span class="reviews__score">' + score + "</span>" +
        '<span class="reviews__count">' +
        (data.total ? "· " + data.total + " avaliações no Google" : "· no Google") +
        "</span></a>";
    }
    reviewsList.innerHTML = data.reviews.slice(0, 3).map(function (rv) {
      var letter = ((rv.author || "?").trim().charAt(0) || "?").toUpperCase();
      return '<figure class="review reveal is-visible">' +
        '<div class="review__head"><span class="review__avatar" aria-hidden="true">' +
        escHtml(letter) + "</span>" +
        '<div><figcaption class="review__name">' + escHtml(rv.author) + "</figcaption>" +
        '<span class="review__stars">' + starRow(rv.rating) + "</span></div></div>" +
        '<blockquote class="review__text">' + escHtml(rv.text) + "</blockquote></figure>";
    }).join("");
    if (reviewsSection) reviewsSection.hidden = false;
  }
  if (reviewsList) {
    fetch(REVIEWS_URL, { headers: { apikey: SUPABASE_ANON_KEY } })
      .then(function (r) { return r.json(); })
      .then(renderReviews)
      .catch(function () { /* falhou: secao continua escondida */ });
  }
})();
