/* ==========================================================================
   Campo Scuola Giovani Alpini — Consenso cookie / risorse di terze parti
   --------------------------------------------------------------------------
   Blocco preventivo "rigoroso": nessuna risorsa di terze parti viene
   caricata prima del consenso.

   Categorie:
     - Necessari        -> sempre attivi (aspetto sito, sessione moduli,
                           memoria di questa scelta). Nessun consenso richiesto.
     - Funzionali/terze  -> Google Fonts (tipografia) + mappa Google Maps
                            (home e contatti). Connessione ai server di Google LLC.

   Stripe NON e' gestito qui: i pagamenti con carta avvengono per redirect su
   buy.stripe.com, fuori da questo dominio; nessuno script Stripe e' caricato
   dal sito. Se un domani si integra js.stripe.com sul dominio serve una nuova
   categoria in questo file e nella cookie.html.

   Il file e' incluso in <head> in modo sincrono di proposito: la Fase 1 deve
   girare prima del primo paint per iniettare i font senza sfarfallio quando il
   consenso e' gia' stato dato. La Fase 2 (banner, embed, footer) parte al
   DOMContentLoaded.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'cc_consent_v1';
  var VERSION = 1;

  var GFONTS_HREF = 'https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap';

  /* ---------- stato ---------- */

  function leggiConsenso() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (!v || v.ver !== VERSION || typeof v.funzionali !== 'boolean') return null;
      return v;
    } catch (e) {
      return null;
    }
  }

  function salvaConsenso(funzionali) {
    var v = { ver: VERSION, funzionali: !!funzionali, ts: new Date().toISOString() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
    } catch (e) { /* navigazione privata: la scelta vale solo per la sessione */ }
    return v;
  }

  /* ---------- Fase 1: font (sincrona, in <head>) ---------- */

  function iniettaFont() {
    if (document.getElementById('cc-gfonts')) return;
    var head = document.head || document.getElementsByTagName('head')[0];
    if (!head) return;

    var pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';

    var pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';

    var css = document.createElement('link');
    css.id = 'cc-gfonts';
    css.rel = 'stylesheet';
    css.href = GFONTS_HREF;

    head.appendChild(pre1);
    head.appendChild(pre2);
    head.appendChild(css);
  }

  var consensoIniziale = leggiConsenso();
  if (consensoIniziale && consensoIniziale.funzionali) {
    iniettaFont();
  }

  /* ---------- embed di terze parti (mappe) ---------- */

  function caricaEmbed(box) {
    if (box.getAttribute('data-cc-loaded')) return;
    var src = box.getAttribute('data-cc-src');
    if (!src) return;

    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.title = box.getAttribute('data-cc-title') || 'Contenuto esterno';
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    var h = box.getAttribute('data-cc-h');
    if (h) iframe.style.height = h + 'px';

    box.innerHTML = '';
    box.appendChild(iframe);
    box.setAttribute('data-cc-loaded', '1');
    box.removeAttribute('data-cc-placeholder');
  }

  function mostraSegnaposto(box) {
    if (box.getAttribute('data-cc-loaded')) return;
    if (box.getAttribute('data-cc-placeholder')) return;
    box.setAttribute('data-cc-placeholder', '1');

    var titolo = box.getAttribute('data-cc-title') || 'Contenuto esterno';
    var ph = document.createElement('div');
    ph.className = 'cc-ph';
    ph.innerHTML =
      '<p class="cc-ph-title">' + titolo + ' non caricato</p>' +
      '<p class="cc-ph-sub">Per mostrarlo servono i cookie funzionali (connessione ai server di Google).</p>' +
      '<div class="cc-ph-actions">' +
        '<button type="button" class="cc-btn cc-btn-sm cc-btn-ghost" data-cc-role="load-once">Carica solo qui</button>' +
        '<button type="button" class="cc-btn cc-btn-sm cc-btn-primary" data-cc-role="prefs">Gestisci cookie</button>' +
      '</div>';
    box.innerHTML = '';
    box.appendChild(ph);

    ph.querySelector('[data-cc-role="load-once"]').addEventListener('click', function () {
      caricaEmbed(box);
    });
    ph.querySelector('[data-cc-role="prefs"]').addEventListener('click', apriPreferenze);
  }

  function applicaEmbed(consentito) {
    var box = document.querySelectorAll('[data-cc-src]');
    for (var i = 0; i < box.length; i++) {
      if (consentito) caricaEmbed(box[i]);
      else mostraSegnaposto(box[i]);
    }
  }

  /* ---------- applica una scelta ---------- */

  function applica(nuovo, precedente) {
    if (nuovo.funzionali) {
      iniettaFont();
      applicaEmbed(true);
      return;
    }
    if (precedente && precedente.funzionali) {
      // Consenso ritirato: ricarico per rimuovere davvero font ed embed gia' in pagina.
      location.reload();
      return;
    }
    applicaEmbed(false);
  }

  /* ---------- UI: banner + pannello preferenze ---------- */

  var elBanner = null;
  var elPanel = null;

  function rimuovi(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function chiudiTutto() {
    rimuovi(elBanner); elBanner = null;
    rimuovi(elPanel); elPanel = null;
  }

  function decisione(funzionali) {
    var prima = leggiConsenso();
    var dopo = salvaConsenso(funzionali);
    chiudiTutto();
    applica(dopo, prima);
  }

  function mostraBanner() {
    if (elBanner || leggiConsenso()) return;
    elBanner = document.createElement('div');
    elBanner.className = 'cc-banner';
    elBanner.setAttribute('role', 'dialog');
    elBanner.setAttribute('aria-label', 'Informativa cookie');
    elBanner.innerHTML =
      '<div class="cc-banner-inner">' +
        '<div class="cc-banner-text">' +
          '<strong>Cookie e risorse di terze parti</strong>' +
          '<p>Usiamo solo strumenti tecnici necessari. Con il tuo consenso carichiamo anche ' +
          'Google Fonts e la mappa Google Maps (connessione ai server di Google). ' +
          'Nessun cookie di profilazione. I pagamenti con carta avvengono su Stripe, fuori da questo sito. ' +
          'Dettagli nella <a href="cookie.html">Cookie Policy</a>.</p>' +
        '</div>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-role="rifiuta">Rifiuta</button>' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-role="personalizza">Personalizza</button>' +
          '<button type="button" class="cc-btn cc-btn-primary" data-cc-role="accetta">Accetta tutti</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(elBanner);

    elBanner.querySelector('[data-cc-role="rifiuta"]').addEventListener('click', function () { decisione(false); });
    elBanner.querySelector('[data-cc-role="accetta"]').addEventListener('click', function () { decisione(true); });
    elBanner.querySelector('[data-cc-role="personalizza"]').addEventListener('click', apriPreferenze);
  }

  function apriPreferenze() {
    if (elPanel) return;
    var stato = leggiConsenso();
    var funzOn = stato ? stato.funzionali : false;

    elPanel = document.createElement('div');
    elPanel.className = 'cc-panel';
    elPanel.setAttribute('role', 'dialog');
    elPanel.setAttribute('aria-label', 'Preferenze cookie');
    elPanel.innerHTML =
      '<div class="cc-panel-card">' +
        '<div class="cc-panel-head">' +
          '<h2>Preferenze cookie</h2>' +
          '<button type="button" class="cc-panel-x" data-cc-role="chiudi" aria-label="Chiudi senza cambiare">&times;</button>' +
        '</div>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-head"><strong>Necessari</strong><span class="cc-lock">Sempre attivi</span></div>' +
          '<p>Strumenti tecnici e memoria locale: aspetto del sito, sessione dei moduli, ' +
          'memorizzazione di questa scelta. Non richiedono consenso.</p>' +
        '</div>' +
        '<div class="cc-cat">' +
          '<div class="cc-cat-head">' +
            '<strong>Funzionali e terze parti</strong>' +
            '<label class="cc-switch"><input type="checkbox" data-cc-role="toggle-funzionali"' + (funzOn ? ' checked' : '') + '><span></span></label>' +
          '</div>' +
          '<p>Google Fonts (tipografia del sito) e la mappa Google Maps in home e contatti. ' +
          'Comportano una connessione ai server di Google LLC. Senza consenso il sito usa i font di ' +
          'sistema e la mappa resta un segnaposto.</p>' +
        '</div>' +
        '<p class="cc-panel-note">I pagamenti con carta avvengono su Stripe, fuori da questo sito: ' +
        'vedi <a href="cookie.html">Cookie Policy</a>.</p>' +
        '<div class="cc-actions">' +
          '<button type="button" class="cc-btn cc-btn-ghost" data-cc-role="rifiuta-tutto">Rifiuta tutto</button>' +
          '<button type="button" class="cc-btn cc-btn-primary" data-cc-role="salva">Salva preferenze</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(elPanel);

    var chiudiPannello = function () { rimuovi(elPanel); elPanel = null; };

    elPanel.querySelector('[data-cc-role="chiudi"]').addEventListener('click', chiudiPannello);
    elPanel.addEventListener('click', function (e) {
      if (e.target === elPanel) chiudiPannello();
    });
    elPanel.querySelector('[data-cc-role="rifiuta-tutto"]').addEventListener('click', function () {
      decisione(false);
    });
    elPanel.querySelector('[data-cc-role="salva"]').addEventListener('click', function () {
      var on = elPanel.querySelector('[data-cc-role="toggle-funzionali"]').checked;
      decisione(on);
    });
  }

  /* ---------- Fase 2: DOM pronto ---------- */

  function faseDom() {
    var stato = leggiConsenso();
    applicaEmbed(!!(stato && stato.funzionali));

    if (!stato) mostraBanner();

    var trigger = document.querySelectorAll('.cc-prefs-link, [data-cc-open]');
    for (var i = 0; i < trigger.length; i++) {
      trigger[i].addEventListener('click', function (e) {
        e.preventDefault();
        apriPreferenze();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', faseDom);
  } else {
    faseDom();
  }

  /* ---------- API pubblica ---------- */

  window.CampoCookie = {
    apri: apriPreferenze,
    stato: leggiConsenso,
    reimposta: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      location.reload();
    }
  };
})();
