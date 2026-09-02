// Campo Scuola Giovani Alpini — interattività: menu mobile, scroll reveal, lightbox, accordion, calendario/galleria filtri

/* ==========================================================================
   CONFIGURAZIONE — Google Sheet "Eventi" (calendario + "Prossimi eventi")
   ==========================================================================
   Cristian gestisce i turni del campo e gli eventi sociali direttamente nel
   Google Sheet, senza toccare il codice. Il sito legge il foglio pubblicato
   in formato CSV (nessuna API key, nessun backend) — guida completa in
   guida-calendario-google-sheets.md (creazione foglio, colonne, pubblicazione,
   come recuperare l'ID sotto).

   COME ATTIVARLO: sostituisci il valore con l'ID del foglio — la stringa
   lunga nell'URL tra /d/ e /edit, es.
   https://docs.google.com/spreadsheets/d/QUESTO_ID_QUI/edit
   Finché resta il segnaposto, calendario e "Prossimi eventi" mostrano il
   messaggio "Eventi temporaneamente non disponibili..." invece di un errore
   tecnico: il sito continua a funzionare anche a foglio non ancora collegato.
   ========================================================================== */
const SHEET_ID = '1lE9JO5gxCgeuWCWZtiLsfXqlDXFxUUt5vcG2TnaWdRU';

/* ==========================================================================
   SPONSOR — elenco per la sfera interattiva in sponsor.html
   ==========================================================================
   Un elemento per sponsor, nell'ordine del banner ufficiale del campo.
   file: nome del logo dentro foto/sito/sponsor/ (es. 'ana.svg') oppure null
         -> se null, la sfera mostra una tile col nome (nessun logo di terzi).
   url:  sito ufficiale, opzionale. Se presente, la modale mostra "Visita il sito".
   Loghi e conferma degli sponsor: da validare con il Gruppo Alpini
   (vedi analisi-sfera-sponsor.md e ricerca-web.md).
   ========================================================================== */
const SPONSOR = [
  { name: 'ANA — Associazione Nazionale Alpini', file: 'ana.png', url: 'https://www.ana.it/' },
  { name: 'Ospedale da Campo G.I.M.C.', file: 'ospedale-da-campo-gimca.png', url: 'https://www.ana.it/ospedale-da-campo/' },
  { name: 'Protezione Civile Regione Lombardia', file: 'protezione-civile-lombardia.png', url: 'https://www.protezionecivile.regione.lombardia.it/' },
  { name: 'Comune di Almenno San Bartolomeo', file: 'comune-almenno-san-bartolomeo.png', url: 'https://www.comune.almennosanbartolomeo.bg.it/' },
  { name: 'Humanitas Gavazzeni', file: 'humanitas-gavazzeni.png', url: 'https://www.gavazzeni.it/' },
  { name: 'Azienda Ospedaliera Papa Giovanni XXIII', file: 'asst-papa-giovanni-xxiii.png', url: 'https://www.asst-pg23.it/' },
  { name: 'S.Pellegrino', file: 'sanpellegrino.svg', url: 'https://www.sanpellegrino.com/' },
  { name: 'Tino Sana Making Interiors', file: 'tino-sana.svg', url: 'https://www.tinosana.com/' },
  { name: 'Fondazione Credito Bergamasco', file: 'fondazione-credito-bergamasco.png', url: 'https://www.fondazionecreberg.it/' },
  { name: 'Hotel dei Cavalieri Milano Duomo', file: 'hotel-dei-cavalieri-milano.png', url: 'https://www.hoteldeicavalieri.com/' },
  { name: "L'Artigiana Srl", file: 'lartigiana.png', url: '' },
  { name: 'Genesi', file: 'genesi.png', url: '' },
  { name: 'Rotanodari', file: 'rotanodari.svg', url: 'https://www.impresarotanodari.it/' },
  { name: 'LP Grafica — Stampa in Grande', file: 'lp-grafica.svg', url: 'https://www.lpgrafica.it/' },
  { name: 'SEICI', file: 'seici.png', url: 'https://seicielettrica.it/' },
  { name: 'Info360', file: null, url: '' },
  { name: 'PM Plastic Materials', file: 'pm-plastic-materials.png', url: 'https://pmflex.com/' },
  { name: 'Egidas — Soluzioni per la Sicurezza', file: 'egidas.png', url: 'https://www.egidas.it/' },
  { name: 'A.N.C.R. Federazione di Palermo', file: 'ancr-federazione-palermo.png', url: '' },
  { name: 'Codognola Lorenzo & F.lli', file: 'codognola-lorenzo.png', url: '' },
  { name: 'Terre degli Almenno — Pro Loco Almenno', file: 'terre-degli-almenno-pro-loco.png', url: '' },
  { name: 'Pelletterie 2F', file: 'pelletterie-2f.png', url: 'https://www.pelletterie2f.it/' },
  { name: 'Museo del Falegname Tino Sana', file: 'museo-del-falegname-tino-sana.png', url: 'https://www.museotinosana.it/' },
  { name: 'Geco', file: 'geco.png', url: '' },
  { name: 'Piorota Foto', file: 'piorota-foto.png', url: 'https://www.piorota.it/' },
  { name: 'C.A. Scavi di Camisa Alessio', file: 'ca-scavi-camisa-alessio.png', url: '' },
];

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initAccordion();
  initGalleryFilters();
  initBookCarousels();   // <-- caroselli "a carte impilate" per edizione (galleria)
  initLightbox();
  initCalendarSingle();
  initUpcomingEvents();   // <-- card "Prossimi eventi" in index.html
  initForms();
  initFormsBackend();
  initAccessoBozze();
  initHeroCarousel();
  initPdfDownload();
  initPdfDownloadAps();
  initMerchPills();
  initTimelineScroll();
  initSponsorSphere();
  initIscrizioniChiuse();
  initResponsabiliAccordion();
});

/* --- Carosello video drone nell'header hero (index) ---
   Le clip hanno durate molto diverse (da 0,3 s a 14 s), quindi l'avanzamento e' legato
   all'evento 'ended' del video e non a un setInterval: un intervallo unico taglierebbe
   le clip lunghe e resterebbe bloccato su quella corta.
   Sulle altre pagine .hero-slide non esiste e la funzione esce subito. */
function initHeroCarousel() {
  const slides = [...document.querySelectorAll('.hero-slide')].filter(s => s.tagName === 'VIDEO');
  if (slides.length < 2) return;

  // Se l'utente ha chiesto meno animazioni resta il fermo immagine: i video non partono
  // e non consumano banda (hanno gia' preload="none" tranne il primo).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slides.forEach(v => v.classList.remove('is-active'));
    return;
  }

  let current = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));

  // Tutte le clip tranne la prima hanno preload="none" per non scaricare 12 MB all'apertura.
  // Quella dopo viene scaldata quando la corrente parte, cosi' al cambio i dati ci sono gia'.
  const precarica = i => {
    const v = slides[i];
    if (v.preload === 'none') { v.preload = 'auto'; v.load(); }
  };

  const mostra = i => {
    const clip = slides[i];
    precarica((i + 1) % slides.length);

    clip.classList.add('is-active');
    slides.forEach((v, j) => {
      if (j === i) return;
      v.classList.remove('is-active');
      v.pause();
    });

    if (clip.currentTime) clip.currentTime = 0;
    const p = clip.play();
    if (p && p.catch) p.catch(() => {
      // play() rifiutata quasi sempre perche' i dati non sono ancora arrivati.
      // Si riprova una volta sola appena il browser dichiara di poter partire:
      // saltare subito alla clip dopo farebbe perdere un video a ogni giro.
      clip.addEventListener('canplay', () => {
        const p2 = clip.play();
        if (p2 && p2.catch) p2.catch(avanza);
      }, { once: true });
    });
  };

  const avanza = () => {
    current = (current + 1) % slides.length;
    mostra(current);
  };

  slides.forEach(v => {
    v.addEventListener('ended', avanza);
    // Un file che non parte proprio (rete, codec) non deve bloccare l'header.
    v.addEventListener('error', avanza);
  });

  mostra(current);
}

/* --- Navbar sticky + hamburger mobile --- */
function initNavbar() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.classList.remove('is-open');
    });
  });
}

/* --- Avviso "iscrizioni non ancora aperte" ---------------------------------
   Finche' le iscrizioni sono chiuse (vedi i commenti ISCRIZIONI-NASCOSTE nel
   sito), ogni bottone "Iscriviti"/"Iscrizione" porta l'attributo
   [data-iscrizioni-avviso]: il click non naviga, mostra un toast temporaneo.
   Senza JavaScript il link resta valido e apre iscrizioni.html, che gia'
   comunica la stessa cosa. Per riattivare le iscrizioni: togliere l'attributo
   dai bottoni e ripristinare i link commentati. */
function initIscrizioniChiuse() {
  const bottoni = document.querySelectorAll('[data-iscrizioni-avviso]');
  if (!bottoni.length) return;

  let toast = null;
  let timer = null;

  function mostraToast() {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'iscrizioni-toast';
      toast.setAttribute('role', 'alert');
      toast.innerHTML =
        '<strong>Iscrizioni non ancora aperte</strong>' +
        '<span>Le iscrizioni al Campo Scuola 2027 non sono ancora aperte. ' +
        'Appena il Gruppo Alpini le apre lo comunichiamo qui e sui canali social.</span>';
      toast.addEventListener('click', nascondiToast);
      document.body.appendChild(toast);
    }
    void toast.offsetWidth; // reflow: riparte la transizione anche a toast gia' presente
    toast.classList.add('is-visible');
    clearTimeout(timer);
    timer = setTimeout(nascondiToast, 6000);
  }

  function nascondiToast() {
    if (toast) toast.classList.remove('is-visible');
  }

  bottoni.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      mostraToast();
    });
  });
}

/* --- Responsabili: image-accordion (modello prompt-responsabili) ---
   Desktop: l'espansione e' gestita in CSS via :hover. Qui aggiungiamo il click
   (utile a tastiera e touch) che fissa un pannello aperto tramite la classe
   .is-open, chiudendo gli altri. Su mobile (<= 860px) i pannelli sono impilati e
   parte aperto il primo. */
function initResponsabiliAccordion() {
  const acc = document.querySelector('.resp-accordion');
  if (!acc) return;
  const panels = Array.from(acc.querySelectorAll('.resp-panel'));
  if (!panels.length) return;

  const mobile = window.matchMedia('(max-width: 860px)');

  function apri(target) {
    panels.forEach(p => {
      const aperto = p === target;
      p.classList.toggle('is-open', aperto);
      const btn = p.querySelector('.resp-panel-info');
      if (btn) btn.setAttribute('aria-expanded', aperto ? 'true' : 'false');
    });
  }

  function reset() {
    // su mobile lascia aperto il primo, su desktop nessuno (ci pensa :hover)
    if (mobile.matches) apri(panels[0]);
    else apri(null);
  }

  panels.forEach(panel => {
    const btn = panel.querySelector('.resp-panel-info');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (panel.classList.contains('is-open') && mobile.matches) return; // gia' aperto su mobile: non richiudere
      apri(panel.classList.contains('is-open') ? null : panel);
    });
  });

  reset();
  if (mobile.addEventListener) mobile.addEventListener('change', reset);
}

/* --- Fade-in / slide-up al passaggio in viewport --- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}

/* --- Accordion FAQ --- */
function initAccordion() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  if (!triggers.length) return;

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const panel = item.querySelector('.accordion-panel');
      const isOpen = item.classList.contains('is-open');

      // chiudi le altre nella stessa categoria (comportamento accordion classico)
      const group = item.closest('.faq-category') || document;
      group.querySelectorAll('.accordion-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          other.querySelector('.accordion-panel').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        panel.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
}

/* --- Filtri galleria per edizione/anno --- */
function initGalleryFilters() {
  const filters = document.querySelectorAll('.gallery-filters .filter-btn');
  // Ambito ristretto alla sezione dei filtri. Sulla pagina galleria ci sono
  // anche i .gallery-item dei caroselli per edizione (initBookCarousels) e, su
  // altre pagine, le thumbnail merch: un querySelectorAll globale, al primo clic
  // su un filtro diverso da "Tutte le foto", metteva display:none a TUTTE quelle
  // foto (nessun data-edizione => non combaciano mai), svuotando i caroselli e
  // azzerando la navigazione della lightbox.
  const scope = document.querySelector('.gallery-filters')?.closest('section') || document;
  const items = scope.querySelectorAll('.gallery-item');
  if (!filters.length || !items.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      items.forEach(item => {
        const match = filter === 'tutti' || item.dataset.edizione === filter;
        item.style.display = match ? '' : 'none';
      });
    });
  });
}

/* --- MESI in italiano: a livello di modulo perché serve sia al calendario
   sia alle card "Prossimi eventi" della homepage, non solo a initCalendarSingle(). --- */
const MESI = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

/* ==========================================================================
   EVENTI DA GOOGLE SHEET — sorgente dati condivisa per calendario.html
   e per la sezione "Prossimi eventi" di index.html.
   Un fetch indipendente per pagina (vedi initCalendarSingle/initUpcomingEvents
   più sotto): niente cache/condivisione fra pagine diverse, non serve.
   ========================================================================== */

/* Sfugge caratteri HTML pericolosi prima di inserire testo libero del foglio
   (titolo, descrizione...) dentro un template literal innerHTML: un "&" o "<"
   scritto da Cristian nel titolo non deve spaccare il rendering della pagina. */
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* Parser CSV minimale ma conforme RFC4180: gestisce campi tra virgolette con
   virgole o ritorni a capo al loro interno e "" come virgoletta letterale.
   Un semplice split(',') romperebbe titolo/descrizione che contengono virgole. */
function parseCSV(testo) {
  const righe = [];
  let riga = [];
  let campo = '';
  let dentroVirgolette = false;
  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (dentroVirgolette) {
      if (c === '"') {
        if (testo[i + 1] === '"') { campo += '"'; i++; }
        else { dentroVirgolette = false; }
      } else {
        campo += c;
      }
    } else if (c === '"') {
      dentroVirgolette = true;
    } else if (c === ',') {
      riga.push(campo); campo = '';
    } else if (c === '\r') {
      // ignorato: la riga si chiude su '\n'
    } else if (c === '\n') {
      riga.push(campo); campo = '';
      righe.push(riga); riga = [];
    } else {
      campo += c;
    }
  }
  if (campo.length || riga.length) { riga.push(campo); righe.push(riga); }
  return righe.filter(r => r.some(v => v.trim() !== '')); // scarta righe vuote
}

/* Le colonne Data del CSV esportato da Google possono arrivare in formati
   diversi a seconda di come Cristian ha impostato il foglio: ISO "2026-06-25"
   (il caso più comune con l'export CSV), "25/06/2026" o — se il locale del
   foglio è US anziché Italia — "6/25/2026" (mese/giorno invertiti: la guida
   chiede di impostare il locale su Italia, ma questo parser resta comunque
   difensivo). Più raramente compare il letterale Date(anno,mese0based,giorno)
   usato dalla Visualization API per colonne senza formato esplicito.
   Ritorna null se il valore non è interpretabile: la riga viene scartata. */
function parseDataFlessibile(valoreGrezzo) {
  const v = (valoreGrezzo || '').trim();
  if (!v) return null;

  // Caso 1: ISO aaaa-mm-gg — nessuna ambiguità, priorità massima.
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) {
    const [, anno, mese, giorno] = m.map(Number);
    return new Date(anno, mese - 1, giorno);
  }

  // Caso 2: gg/mm/aaaa oppure mm/dd/aaaa. Le due forme sono indistinguibili
  // quando entrambe le componenti sono <=12 (mitigato solo dalla guida, che
  // chiede locale Italia); quando UNA supera 12 non può essere un mese, quindi
  // si scambia automaticamente indipendentemente da quale posizione occupi.
  m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    let [, a, b, anno] = m.map(Number);
    let giorno = a, mese = b;
    if (mese > 12 && giorno <= 12) { giorno = b; mese = a; }
    return new Date(anno, mese - 1, giorno);
  }

  // Caso 3 (raro con l'export CSV, ma capita con colonne senza formato Data):
  // il letterale Date(anno,mese0based,giorno) della Visualization API.
  m = v.match(/^Date\((\d+),\s*(\d+),\s*(\d+)/);
  if (m) {
    const [, anno, mese, giorno] = m.map(Number);
    return new Date(anno, mese, giorno);
  }

  // Caso 4: fallback generico per qualunque altro formato interpretabile da Date().
  const fallback = new Date(v);
  if (!isNaN(fallback.getTime())) {
    return new Date(fallback.getFullYear(), fallback.getMonth(), fallback.getDate());
  }
  return null;
}

/* Genera un'etichetta leggibile in italiano quando la colonna "etichetta_date"
   è vuota nel foglio. Riusa MESI. */
function formattaEtichettaData(dataInizio, dataFine) {
  const gI = dataInizio.getDate(), mI = dataInizio.getMonth(), aI = dataInizio.getFullYear();
  if (!dataFine || dataFine.getTime() === dataInizio.getTime()) {
    return `${gI} ${MESI[mI].toLowerCase()} ${aI}`;
  }
  const gF = dataFine.getDate(), mF = dataFine.getMonth(), aF = dataFine.getFullYear();
  if (mI === mF && aI === aF) {
    return `${gI}–${gF} ${MESI[mI].toLowerCase()} ${aF}`; // stesso mese: "25–27 giugno 2026"
  }
  return `${gI} ${MESI[mI].toLowerCase()} – ${gF} ${MESI[mF].toLowerCase()} ${aF}`; // mesi diversi
}

/* Interpreta la colonna checkbox "pubblicato": il gviz CSV la esporta come
   stringa TRUE/FALSE, ma si resta tolleranti a varianti scritte a mano. */
function toBooleano(valoreGrezzo) {
  const v = (valoreGrezzo || '').trim().toUpperCase();
  return v === 'TRUE' || v === 'VERO' || v === 'SÌ' || v === 'SI' || v === '1' || v === 'X';
}

/* Classe modificatrice di .tag per tipo evento (vedi style.css: .tag-info e
   .tag-warning). '' = solo .tag base (verde, "Campo Scuola"). */
function tagClassForTipo(tipo) {
  switch ((tipo || '').trim()) {
    case 'Evento Sociale': return 'tag-accent';
    case 'Riunione': return 'tag-info';
    case 'Scadenza': return 'tag-warning';
    default: return '';
  }
}

/* Classe di colore per la cella giorno nella griglia mensile. */
function dayCellClassForTipo(tipo) {
  switch ((tipo || '').trim()) {
    case 'Evento Sociale': return 'evt-sociale';
    case 'Riunione': return 'evt-riunione';
    case 'Scadenza': return 'evt-scadenza';
    default: return 'evt-campo';
  }
}

/* Recupera gli eventi dal Google Sheet pubblicato e li restituisce pronti per
   il rendering: solo pubblicati, ordinati per data_inizio crescente.
   IMPORTANTE: il rilevatore d'errore principale è la VALIDAZIONE DELLE
   INTESTAZIONI qui sotto, non `res.ok`. Un foglio non condiviso o una scheda
   "Eventi" rinominata fanno rispondere Google con HTTP 200 e una pagina di
   errore HTML/JSON al posto del CSV atteso: senza il controllo sulle
   intestazioni quella pagina verrebbe "parsata" silenziosamente in righe
   spazzatura invece di far scattare il messaggio di errore gentile. */
function fetchEventiFromSheet(sheetId) {
  if (!sheetId || sheetId === 'INSERISCI_QUI_ID_FOGLIO_GOOGLE') {
    return Promise.reject(new Error('SHEET_ID non configurato'));
  }
  // Nessun parametro "sheet=": il foglio ha una sola scheda, quindi l'export
  // CSV usa sempre quella di default (gid=0), qualunque sia il suo nome —
  // niente vincolo su come Cristian chiama la scheda.
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Risposta HTTP ' + res.status);
      return res.text();
    })
    .then(testoCsv => {
      const righe = parseCSV(testoCsv);
      if (righe.length < 2) throw new Error('Foglio "Eventi" vuoto o senza intestazioni');

      const intestazioni = righe[0].map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
      const idx = nome => intestazioni.indexOf(nome);
      const iDataInizio = idx('data_inizio');
      const iDataFine = idx('data_fine');
      const iTitolo = idx('titolo');
      const iDescrizione = idx('descrizione');
      const iTipo = idx('tipo');
      const iEtichetta = idx('etichetta_date');
      const iPubblicato = idx('pubblicato');
      if (iDataInizio === -1 || iTitolo === -1 || iTipo === -1 || iPubblicato === -1) {
        throw new Error('Intestazioni del foglio "Eventi" non riconosciute');
      }

      return righe.slice(1)
        .map(cella => {
          const dataInizio = parseDataFlessibile(cella[iDataInizio]);
          const titolo = (cella[iTitolo] || '').trim();
          if (!dataInizio || !titolo) return null; // riga incompleta: scartata

          let dataFine = iDataFine > -1 ? parseDataFlessibile(cella[iDataFine]) : null;
          if (!dataFine || dataFine < dataInizio) dataFine = dataInizio; // vuota o incoerente

          const tipo = (cella[iTipo] || '').trim();
          const etichettaCsv = iEtichetta > -1 ? (cella[iEtichetta] || '').trim() : '';
          return {
            dataInizio, dataFine, titolo,
            descrizione: iDescrizione > -1 ? (cella[iDescrizione] || '').trim() : '',
            tipo,
            etichettaDate: etichettaCsv || formattaEtichettaData(dataInizio, dataFine),
            pubblicato: toBooleano(cella[iPubblicato]),
          };
        })
        .filter(Boolean)
        .filter(e => e.pubblicato)
        .sort((a, b) => a.dataInizio - b.dataInizio);
    });
}

/* --- Stati di caricamento ed errore condivisi fra griglia calendario, lista
   attività e card "Prossimi eventi" (vedi style.css: .skeleton,
   .skeleton-line, .calendar-error). --- */
function mostraScheletroGriglia(grid, giorni) {
  grid.innerHTML = '';
  giorni.forEach(g => {
    const el = document.createElement('span');
    el.className = 'weekday';
    el.textContent = g;
    grid.appendChild(el);
  });
  for (let i = 0; i < 35; i++) {
    const el = document.createElement('span');
    el.className = 'day-cell skeleton';
    grid.appendChild(el);
  }
}
function mostraScheletroLista(lista, righeQty) {
  lista.innerHTML = '';
  for (let i = 0; i < (righeQty || 3); i++) {
    const row = document.createElement('div');
    row.className = 'calendar-row skeleton-row';
    row.innerHTML = `
      <div class="skeleton" style="height:2.6rem;border-radius:var(--radius-sm);"></div>
      <div><div class="skeleton-line w-60"></div><div class="skeleton-line w-40"></div></div>
    `;
    lista.appendChild(row);
  }
}
function mostraScheletroCard(container) {
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-body">
        <div class="skeleton" style="width:56px;height:56px;border-radius:var(--radius-sm);margin-bottom:0.5rem;"></div>
        <div class="skeleton-line w-40"></div>
        <div class="skeleton-line" style="width:80%;height:1.1em;margin:0.3rem 0;"></div>
        <div class="skeleton-line w-60"></div>
      </div>
    `;
    container.appendChild(card);
  }
}
function mostraErroreEventi(container) {
  container.innerHTML = '<p class="calendar-error">Eventi temporaneamente non disponibili. Riprova più tardi.</p>';
}

/* --- Calendario interattivo a singolo mese con navigazione ---
   Un solo mese alla volta, navigabile con le frecce entro l'anno in corso.
   Sotto il calendario compaiono solo le attività del mese visualizzato.
   Gli eventi arrivano dal Google Sheet pubblico (vedi fetchEventiFromSheet). */
function initCalendarSingle() {
  const grid = document.getElementById('cal-grid');
  const monthLabel = document.getElementById('cal-month-label');
  const prevBtn = document.getElementById('cal-prev');
  const nextBtn = document.getElementById('cal-next');
  const activitiesList = document.getElementById('activities-list');
  const activitiesLabel = document.getElementById('activities-month-label');
  const activitiesEmpty = document.getElementById('activities-empty');
  if (!grid || !monthLabel || !prevBtn || !nextBtn || !activitiesList) return;

  const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let eventi = []; // popolato dopo il fetch, vuoto finché carica

  function eventoForDate(date) {
    return eventi.find(e => date >= e.dataInizio && date <= e.dataFine);
  }

  function render() {
    monthLabel.textContent = `${MESI[viewMonth]} ${viewYear}`;
    activitiesLabel.textContent = `Attività di ${MESI[viewMonth]} ${viewYear}`;
    prevBtn.disabled = viewMonth === 0;
    nextBtn.disabled = viewMonth === 11;

    grid.innerHTML = '';
    GIORNI.forEach(g => {
      const el = document.createElement('span');
      el.className = 'weekday';
      el.textContent = g;
      grid.appendChild(el);
    });

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    let leading = firstOfMonth.getDay() - 1;
    if (leading < 0) leading = 6;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < leading; i++) {
      const el = document.createElement('span');
      el.className = 'day-cell empty';
      grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const el = document.createElement('span');
      el.className = 'day-cell';
      const evento = eventoForDate(date);
      if (evento) {
        el.classList.add('has-evento', dayCellClassForTipo(evento.tipo));
        el.title = `${evento.titolo} · ${evento.etichettaDate}`;
      }
      el.textContent = String(d);
      if (date.toDateString() === today.toDateString()) el.classList.add('today');
      grid.appendChild(el);
    }

    const totalCells = leading + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
      const el = document.createElement('span');
      el.className = 'day-cell empty';
      grid.appendChild(el);
    }

    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    const items = eventi.filter(e => e.dataInizio <= monthEnd && e.dataFine >= monthStart);

    activitiesList.innerHTML = '';
    if (!items.length) {
      activitiesEmpty.style.display = '';
    } else {
      activitiesEmpty.style.display = 'none';
      items.forEach(evento => {
        const row = document.createElement('div');
        row.className = 'calendar-row';
        // Il pulsante "Info" resta solo per i tipi diversi da Campo Scuola
        // (i turni hanno già tutte le info su questo sito), come nel comportamento originale.
        const infoBtn = evento.tipo !== 'Campo Scuola'
          ? '<a href="contatti.html" class="btn btn-outline btn-sm">Info</a>' : '';
        row.innerHTML = `
          <div class="event-date"><span class="day">${evento.dataInizio.getDate()}</span><span class="month">${MESI[evento.dataInizio.getMonth()].slice(0, 3)}</span></div>
          <div><span class="tag ${tagClassForTipo(evento.tipo)}">${escapeHtml(evento.tipo)}</span><h4>${escapeHtml(evento.titolo)}</h4><p>${escapeHtml(evento.etichettaDate)}${evento.descrizione ? ' — ' + escapeHtml(evento.descrizione) : ''}</p></div>
          ${infoBtn}
        `;
        activitiesList.appendChild(row);
      });
    }
  }

  prevBtn.addEventListener('click', () => { if (viewMonth > 0) { viewMonth--; render(); } });
  nextBtn.addEventListener('click', () => { if (viewMonth < 11) { viewMonth++; render(); } });

  // Stato di caricamento subito, poi fetch dal Google Sheet.
  mostraScheletroGriglia(grid, GIORNI);
  mostraScheletroLista(activitiesList);
  activitiesEmpty.style.display = 'none';

  fetchEventiFromSheet(SHEET_ID)
    .then(datiEventi => { eventi = datiEventi; render(); })
    .catch(err => {
      console.warn('[calendario] impossibile caricare gli eventi dal foglio Google:', err);
      mostraErroreEventi(grid);
      mostraErroreEventi(activitiesList);
      activitiesEmpty.style.display = 'none';
    });
}

/* --- "Prossimi eventi" in homepage: stesso Google Sheet del calendario, ma
   filtrato ai soli eventi futuri/in corso e limitato a 3 card.
   Fetch indipendente da quello di initCalendarSingle() — pagine diverse,
   nessuno stato condiviso: un fetch per pagina, coerente coi vincoli tecnici. */
function initUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;

  mostraScheletroCard(container);

  fetchEventiFromSheet(SHEET_ID)
    .then(eventi => {
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);
      // "data >= oggi" è calcolato sulla data di FINE effettiva: un turno già
      // iniziato ma non ancora concluso resta "in programma", non sparisce
      // a metà evento.
      const prossimi = eventi.filter(e => e.dataFine >= oggi).slice(0, 3);

      container.innerHTML = '';
      if (!prossimi.length) {
        container.innerHTML = '<p class="calendar-error" style="grid-column:1/-1;">Nessun evento in programma. Resta aggiornato!</p>';
        return;
      }
      prossimi.forEach(evento => {
        const card = document.createElement('div');
        // NIENTE classe "reveal": la card nasce dopo il fetch, quando
        // initScrollReveal() ha già osservato solo gli elementi presenti al
        // caricamento pagina. Con "reveal" senza "is-visible" resterebbe
        // invisibile per sempre (osservatore mai agganciato a questo nodo).
        card.className = 'card';
        card.innerHTML = `
          <div class="card-body">
            <div class="event-date"><span class="day">${evento.dataInizio.getDate()}</span><span class="month">${MESI[evento.dataInizio.getMonth()].slice(0, 3)}</span></div>
            <span class="tag ${tagClassForTipo(evento.tipo)}">${escapeHtml(evento.tipo)}</span>
            <h3>${escapeHtml(evento.titolo)}</h3>
            <p>${escapeHtml(evento.etichettaDate)}${evento.descrizione ? '. ' + escapeHtml(evento.descrizione) : ''}</p>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.warn('[prossimi-eventi] impossibile caricare gli eventi dal foglio Google:', err);
      container.innerHTML = '<p class="calendar-error" style="grid-column:1/-1;">Eventi temporaneamente non disponibili. Riprova più tardi.</p>';
    });
}

/* --- Lightbox galleria --- */
function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  const items = document.querySelectorAll('.gallery-item');
  if (!lightbox || !items.length) return;

  const contentText = lightbox.querySelector('.lightbox-content .placeholder');
  const lightboxImg = lightbox.querySelector('.lightbox-content .lightbox-img');
  const caption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let visibleItems = [];
  let currentIndex = 0;

  function refreshVisibleItems(group) {
    visibleItems = Array.from(items).filter(item =>
      item.style.display !== 'none' && (item.dataset.group || '') === group
    );
  }

  function openAt(item) {
    refreshVisibleItems(item.dataset.group || '');
    currentIndex = visibleItems.indexOf(item);
    render();
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function render() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    const label = item.dataset.caption || item.querySelector('.placeholder')?.textContent.trim() || '';
    const imgSrc = item.dataset.img || item.querySelector('img')?.getAttribute('src') || '';
    if (imgSrc && lightboxImg) {
      lightboxImg.src = imgSrc;
      lightboxImg.alt = label;
      lightboxImg.style.display = '';
      if (contentText) contentText.style.display = 'none';
    } else {
      if (lightboxImg) lightboxImg.style.display = 'none';
      if (contentText) { contentText.style.display = ''; contentText.textContent = label; }
    }
    if (caption) caption.textContent = label;
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => openAt(item));
  });

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  prevBtn?.addEventListener('click', () => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    render();
  });
  nextBtn?.addEventListener('click', () => {
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    render();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prevBtn?.click();
    if (e.key === 'ArrowRight') nextBtn?.click();
  });
}

/* --- Timeline "il-campo": barra sticky + linea con gradiente che si riempie con lo scroll.
   Riadattamento statico del componente Timeline di Aceternity (che usa framer-motion
   useScroll/useTransform): qui il progresso si ricava dalla posizione del contenitore
   rispetto al viewport ad ogni scroll/resize, riproducendo lo stesso offset
   ["start 10%", "end 50%"] dell'originale. Esce subito se .timeline non e' in pagina. */
function initTimelineScroll() {
  const container = document.querySelector('.timeline');
  const line = document.querySelector('.timeline-line');
  const fill = document.querySelector('.timeline-line-fill');
  if (!container || !line || !fill) return;

  function update() {
    const totalHeight = container.offsetHeight;
    line.style.height = totalHeight + 'px';

    const rect = container.getBoundingClientRect();
    const vh = window.innerHeight;
    const startLine = vh * 0.1;
    const endLine = vh * 0.5;
    const denom = startLine - endLine + rect.height;
    let progress = denom !== 0 ? (startLine - rect.top) / denom : 0;
    progress = Math.max(0, Math.min(1, progress));

    fill.style.height = (progress * totalHeight) + 'px';
    fill.style.opacity = Math.max(0, Math.min(1, progress / 0.1));
  }

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

/* --- Sfera 3D degli sponsor (sponsor.html) ---
   Port in JS puro del componente React SphereImageGrid (vedi ../prompt-sponsor.txt
   e analisi-sfera-sponsor.md): distribuzione a sfera di Fibonacci, rotazione 3D
   ricalcolata ogni frame e proiettata in left/top/scale/opacity, drag con inerzia,
   auto-rotazione, click -> modale. Esce subito se la sfera non e' in pagina o se
   l'utente ha chiesto meno animazioni (in quel caso resta la griglia #sponsor-list). */
function initSponsorSphere() {
  const root = document.getElementById('sponsor-sphere');
  if (!root) return;
  if (!Array.isArray(SPONSOR) || SPONSOR.length === 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const list = document.getElementById('sponsor-list');

  // --- Parametri (equivalenti al CONFIG del componente modello) ---
  const DRAG_SENSITIVITY = 0.28;   // gradi di rotazione per pixel trascinato
  const MOMENTUM_DECAY   = 0.95;   // quanto rallenta l'inerzia a ogni frame
  const MAX_SPEED        = 6;      // gradi/frame massimi
  const AUTO_SPEED       = 0.18;   // gradi/frame di auto-rotazione sull'asse Y
  const BASE_SCALE       = 0.16;   // diametro orb come frazione del lato sfera
  const RADIUS_RATIO     = 0.42;   // raggio sfera come frazione del lato
  const FADE_START       = -0.15;  // z normalizzato: inizio dissolvenza sul retro
  const FADE_END         = -0.55;  // z normalizzato: orb completamente nascosto

  const DEG = Math.PI / 180;
  const norm = (a) => { while (a > 180) a -= 360; while (a < -180) a += 360; return a; };
  const clamp = (v) => Math.max(-MAX_SPEED, Math.min(MAX_SPEED, v));

  // --- Stato rotazione / inerzia / drag (condiviso con drag e modale) ---
  let rotX = -12, rotY = 15;
  let velX = 0, velY = 0;
  let dragging = false, dragged = false;
  let lastX = 0, lastY = 0;

  // --- Posizioni base sulla sfera unitaria (lattice di Fibonacci / golden angle) ---
  // uy = 1 - (2i+1)/n: campiona i centri delle n fasce equi-area, quindi nessun
  // orb cade esattamente sul polo (dove la sola auto-rotazione yaw non lo muoverebbe).
  const n = SPONSOR.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const base = SPONSOR.map((s, i) => {
    const uy = 1 - (2 * i + 1) / n;                 // ~0.94 .. ~-0.94, mai +/-1
    const r = Math.sqrt(Math.max(0, 1 - uy * uy));
    const phi = golden * i;
    return { ux: Math.cos(phi) * r, uy: uy, uz: Math.sin(phi) * r, data: s };
  });

  // --- Costruzione dei nodi DOM ---
  root.innerHTML = '';
  const nodes = base.map((p) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'sponsor-orb';
    el.setAttribute('aria-label', p.data.name);
    if (p.data.file) {
      const img = document.createElement('img');
      img.src = 'foto/sito/sponsor/' + p.data.file;
      img.alt = p.data.name;
      img.loading = 'lazy';
      img.draggable = false;
      img.addEventListener('error', () => {
        el.classList.add('sponsor-orb--text');
        el.textContent = p.data.name;
      });
      el.appendChild(img);
    } else {
      el.classList.add('sponsor-orb--text');
      el.textContent = p.data.name;
    }
    el.addEventListener('click', (e) => {
      // e.detail === 0 -> click sintetico da tastiera (Enter/Spazio): sempre valido.
      // e.detail >= 1 -> click da puntatore: ignora se e' la coda di un drag.
      if (dragged && e.detail !== 0) { e.preventDefault(); return; }
      // Il preventDefault sul mousedown del contenitore impedisce il focus
      // nativo dell'orb col mouse: lo forziamo qui cosi' openModal registra
      // l'orb come elemento da rimettere a fuoco alla chiusura.
      el.focus();
      openModal(p.data);
    });
    root.appendChild(el);
    return el;
  });

  // Sfera attiva: la sfera diventa la rappresentazione accessibile (ogni orb e' un
  // <button> con aria-label); l'elenco esce da vista, dal tab order e dall'albero
  // di accessibilita' per non creare tab stop doppi/invisibili. Resta nel DOM come
  // fallback statico per no-JS e prefers-reduced-motion (la guardia in cima esce
  // prima di arrivare qui in quei casi).
  root.removeAttribute('aria-hidden');
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Sponsor e partner — sfera interattiva. Trascina per ruotare.');
  if (list) {
    list.classList.add('is-hidden-visually');
    list.setAttribute('aria-hidden', 'true');
    list.querySelectorAll('a').forEach((a) => { a.tabIndex = -1; });
  }

  // --- Loop di rendering ---
  function frame() {
    if (!dragging) {
      velX *= MOMENTUM_DECAY;
      velY *= MOMENTUM_DECAY;
      if (Math.abs(velX) < 0.01) velX = 0;
      if (Math.abs(velY) < 0.01) velY = 0;
      // Durante il drag e' pointerMove a muovere la rotazione (1x, alla giusta
      // sensibilita'); qui solo auto-rotazione + inerzia post-rilascio, come nel
      // componente modello dove il momentum e' gated da !isDragging.
      rotX = norm(rotX + clamp(velX));
      rotY = norm(rotY + AUTO_SPEED + clamp(velY));
    }

    const side = root.clientWidth || 1;
    const radius = side * RADIUS_RATIO;
    const diameter = side * BASE_SCALE;
    const cx = side / 2, cy = side / 2;
    const sinX = Math.sin(rotX * DEG), cosX = Math.cos(rotX * DEG);
    const sinY = Math.sin(rotY * DEG), cosY = Math.cos(rotY * DEG);

    for (let i = 0; i < nodes.length; i++) {
      const p = base[i];
      // rotazione attorno a Y (drag orizzontale)
      let x = p.ux * cosY + p.uz * sinY;
      let z = -p.ux * sinY + p.uz * cosY;
      let y = p.uy;
      // rotazione attorno a X (drag verticale)
      const ry = y * cosX - z * sinX;
      const rz = y * sinX + z * cosX;
      y = ry; z = rz;

      const depthScale = 0.55 + (z + 1) / 2 * 0.6;   // retro piccolo, fronte grande
      let opacity = 1;
      if (z < FADE_START) opacity = Math.max(0, (z - FADE_END) / (FADE_START - FADE_END));
      const size = diameter * depthScale;

      const el = nodes[i];
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = (cx + x * radius) + 'px';
      el.style.top = (cy + y * radius) + 'px';
      el.style.opacity = opacity.toFixed(3);
      el.style.zIndex = String(1000 + Math.round(z * 1000));
      el.style.pointerEvents = opacity < 0.15 ? 'none' : 'auto';
    }
    rafId = requestAnimationFrame(frame);
  }
  let rafId = requestAnimationFrame(frame);

  // --- Modale: dettaglio di un singolo sponsor ---
  let modal = null;
  let lastFocus = null;   // orb da cui e' partita l'apertura, per ripristinare il focus

  function ensureModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'sponsor-modal';
    modal.innerHTML =
      '<div class="sponsor-modal-content" role="dialog" aria-modal="true" aria-labelledby="sponsor-modal-name">' +
        '<button type="button" class="sponsor-modal-close" aria-label="Chiudi">&times;</button>' +
        '<div class="sponsor-modal-figure"></div>' +
        '<h3 class="sponsor-modal-name" id="sponsor-modal-name"></h3>' +
        '<a class="sponsor-modal-link" target="_blank" rel="noopener">Visita il sito</a>' +
      '</div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.querySelector('.sponsor-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  function openModal(sponsor) {
    ensureModal();
    lastFocus = document.activeElement;
    const fig = modal.querySelector('.sponsor-modal-figure');
    if (sponsor.file) {
      const img = document.createElement('img');
      img.src = 'foto/sito/sponsor/' + sponsor.file;
      img.alt = sponsor.name;
      fig.innerHTML = '';
      fig.appendChild(img);
    } else {
      fig.innerHTML = '';
      const span = document.createElement('span');
      span.className = 'sponsor-orb--text';
      span.textContent = sponsor.name;
      fig.appendChild(span);
    }
    modal.querySelector('.sponsor-modal-name').textContent = sponsor.name;
    const link = modal.querySelector('.sponsor-modal-link');
    if (sponsor.url) {
      link.href = sponsor.url;
      link.style.display = '';
    } else {
      link.removeAttribute('href');
      link.style.display = 'none';
    }
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.sponsor-modal-close').focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  // --- Drag: mouse e touch, con inerzia al rilascio ---
  function pointerDown(px, py) {
    dragging = true;
    dragged = false;
    velX = 0; velY = 0;
    lastX = px; lastY = py;
    root.classList.add('is-grabbing');
  }
  function pointerMove(px, py) {
    if (!dragging) return;
    const dx = px - lastX;
    const dy = py - lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
    velY = clamp(dx * DRAG_SENSITIVITY);
    velX = clamp(-dy * DRAG_SENSITIVITY);
    rotX = norm(rotX + velX);
    rotY = norm(rotY + velY);
    lastX = px; lastY = py;
  }
  function pointerUp() {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-grabbing');
  }

  root.addEventListener('mousedown', (e) => { e.preventDefault(); pointerDown(e.clientX, e.clientY); });
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);
  window.addEventListener('blur', pointerUp);   // rete di sicurezza: mouseup perso fuori dalla finestra

  root.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    pointerDown(t.clientX, t.clientY);
  }, { passive: true });
  root.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    pointerMove(t.clientX, t.clientY);
  }, { passive: true });
  root.addEventListener('touchend', pointerUp);
  root.addEventListener('touchcancel', pointerUp);
}

/* --- Selettore taglia + consegna merch: ricompone l'href del bottone Stripe ---
   Ogni .btn-stripe porta un data-stripe-template con due segnaposto:
     {size}  -> taglia (S/M/L...) oppure variante Maschio/Femmina della Mascotte
     {ship}  -> 'spedizione' | 'ritiro', scelto nella riga .ship-pills (presente su
                ogni card, default "Spedizione")
   client_reference_id finale, che Stripe riporta in dashboard e nel dettaglio ordine
   (cosi il venditore sa cosa preparare e come consegnare):
     taglia-M-spedizione · taglia-unica-ritiro · variante-Femmina-spedizione
   La scelta consegna la conferma comunque il cliente dentro il checkout Stripe (il
   Payment Link espone le due opzioni "Ritiro a mano - gratis" / "Spedizione 4€"):
   questa riga la anticipa e la fa arrivare al venditore prima del redirect.
   Le card senza .size-pills ne .ship-pills escono subito e tengono l'href statico. */
function aggiornaLinkStripe(card) {
  const link = card.querySelector('.btn-stripe');
  const template = link?.dataset.stripeTemplate;
  if (!link || !template) return;
  const size = card.querySelector('.size-pills button.is-active')?.dataset.size;
  const ship = card.querySelector('.ship-pills button.is-active')?.dataset.ship;
  let href = template;
  if (size) href = href.replace('{size}', size);
  if (ship) href = href.replace('{ship}', ship);
  link.href = href;
}

function initMerchPills() {
  document.querySelectorAll('.merch-card').forEach(card => {
    const groups = card.querySelectorAll('.size-pills, .ship-pills');
    if (!groups.length) return;

    groups.forEach(group => {
      const pills = group.querySelectorAll('button');
      pills.forEach(pill => {
        pill.addEventListener('click', () => {
          pills.forEach(p => p.classList.remove('is-active'));
          pill.classList.add('is-active');
          aggiornaLinkStripe(card);
        });
      });
    });

    aggiornaLinkStripe(card); // allinea l'href allo stato iniziale delle pill
  });
}

/* --- Form frontend-only: mostra conferma senza inviare dati da nessuna parte.
   Aggancio generico per eventuali form dimostrativi con `data-frontend-only`.
   Oggi NESSUN form lo usa: contatti.html invia davvero (data-form-backend="contatti")
   e i due moduli di iscrizioni.html passano da initFormsBackend(). Si tiene come
   ripiego per prototipi rapidi. --- */
function initForms() {
  document.querySelectorAll('form[data-frontend-only]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector('.form-success');
      if (success) {
        success.classList.add('is-visible');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
    });
  });
}

/* ==========================================================================
   INVIO REALE AL BACKEND — Google Apps Script -> Google Sheet
   ==========================================================================
   Usato dai form con `data-form-backend="<tipo>"`:
     iscrizione -> BACKEND_URL          -> tab "Iscrizioni - backend" (iscrizioni.html)
     aps        -> BACKEND_URL          -> tab "Modulo APS - backend"  (iscrizioni.html)
     contatti   -> BACKEND_URL_CONTATTI -> solo mail, script separato   (contatti.html)

   COME ATTIVARLO: incolla in BACKEND_URL l'URL /exec della web app Apps Script
   (istruzioni complete in `apps-script/LEGGIMI-deploy.md`). Finche' resta vuoto
   i form mostrano la conferma dimostrativa e NON inviano nulla: il sito pubblicato
   continua a funzionare anche senza backend.

   Il modulo di contatto ha un backend a se' (cartella `apps-script-contatti/`,
   istruzioni in `apps-script-contatti/LEGGIMI.md`): NON scrive su nessun foglio,
   inoltra solo una mail. Il suo URL /exec va in BACKEND_URL_CONTATTI. Vuoto =
   il form di contatti.html resta in modalita' dimostrativa.

   NOTA CORS (la trappola di questo pattern): si invia `Content-Type: text/plain`
   con dentro una stringa JSON. Con `application/json` il browser manderebbe prima
   una richiesta OPTIONS di preflight, che Apps Script non sa gestire: la POST non
   partirebbe proprio. `text/plain` e' una "richiesta semplice", niente preflight,
   e la risposta resta leggibile (a differenza di `mode: 'no-cors'`).
   ========================================================================== */

const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzsdh_ypDvQ2A--L7AZ7nFLlkEmpreel2-I99rRST_q56A_gNtZKT4M5QTrXXVioTIxFQ/exec'; // <-- incolla qui l'URL .../exec dopo il deploy
const BACKEND_URL_CONTATTI = 'https://script.google.com/macros/s/AKfycbx-4jhLmFgFcKkcpWd15NBU2COkkBPbK3a6maggW3eTDxGAfgUT57bRm4E0a8KjA6ON/exec'; // web app "apps-script-contatti" (modulo di contatto, solo mail)
const MAX_MB_FILE = 5;  // deve restare allineato a MAX_BYTE_FILE in Code.gs
const CAMPI_NON_INVIATI = ['turno-org', 'tenda-org']; // read-only, li compila l'organizzazione

/* Come si scrive "spuntato" in una casella di controllo. UNA costante e non due
   letterali sparsi: raccogliCampi() la scrive nel foglio, ripristinaCampi() la
   rilegge — se le due stringhe divergessero, al ripristino di una bozza ogni
   checkbox tornerebbe vuota senza che nulla segnali un errore. */
const VALORE_SI = 'Sì';
const VALORE_NO = 'No';

/* Anti-abuso lato invio, in coppia col backend (Code.gs). Due segnali, nessuno
   dei quali ostacola una persona vera:
   - honeypot: un campo di testo fuori schermo (name="fax") che un umano non vede
     e non compila; se arriva valorizzato, e' un bot che riempie tutti gli input.
   - tempo di compilazione: la pagina scrive l'istante di rendering in un campo
     nascosto (name="modulo-reso-il"); un invio a meno di pochi secondi non e'
     umano. Entrambi i campi finiscono da soli in raccogliCampi() -> `campi`. */
const CAMPO_HONEYPOT = 'fax';
const CAMPO_TS_MODULO = 'modulo-reso-il';

function timbraModulo(form) {
  const ts = form.querySelector('[name="' + CAMPO_TS_MODULO + '"]');
  if (ts) ts.value = String(Date.now());
}

function initFormsBackend() {
  document.querySelectorAll('form[data-form-backend]').forEach(form => {
    timbraModulo(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      inviaForm(form);
    });
  });
}

/* Raccoglie i campi testuali del form in un oggetto piatto { name: valore }.
   Non si usa `new FormData(form)` perche' omette del tutto le checkbox non
   spuntate e i gruppi radio non selezionati: nel foglio vogliamo un "No"
   esplicito, non una cella vuota ambigua. */
function raccogliCampi(form) {
  const campi = {};
  Array.from(form.elements).forEach(el => {
    if (!el.name || el.disabled) return;
    if (el.type === 'file' || el.type === 'submit' || el.type === 'button') return;
    if (CAMPI_NON_INVIATI.includes(el.name)) return;

    if (el.type === 'checkbox') {
      campi[el.name] = el.checked ? VALORE_SI : VALORE_NO;
    } else if (el.type === 'radio') {
      if (el.checked) campi[el.name] = el.value;
      else if (!(el.name in campi)) campi[el.name] = '';
    } else {
      campi[el.name] = el.value;
    }
  });
  return campi;
}

/* Il file e' di un tipo che il backend sa salvare? Immagini (qualunque formato,
   compresi i TIFF degli scanner multifunzione) e PDF.
   Il tipo dichiarato dal browser non e' affidabile — su alcune piattaforme e' vuoto
   per PDF e HEIC — quindi si ripiega sull'estensione. Stesso criterio di
   _mimeAccettabile() in Code.gs: se i due divergono, il genitore riesce a caricare
   un file che poi il server scarta. */
function tipoFileAmmesso(file) {
  const mime = (file.type || '').toLowerCase();
  if (mime === 'application/pdf' || mime.startsWith('image/')) return true;
  return /\.(pdf|jpe?g|png|webp|heic|heif|tiff?|bmp|gif)$/i.test(file.name || '');
}

/* Legge un <input type="file"> e lo restituisce in base64, pronto per il JSON.
   Ritorna null se il campo e' vuoto; lancia un errore se il file e' troppo grande o
   di tipo non gestito (meglio bloccare qui che far fallire la POST dopo un upload
   lungo da mobile, o peggio farla riuscire scartando l'allegato in silenzio). */
function leggiFile(input) {
  const file = input.files && input.files[0];
  if (!file) return Promise.resolve(null);

  if (file.size > MAX_MB_FILE * 1024 * 1024) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return Promise.reject(new Error(
      `Il file "${file.name}" pesa ${mb} MB: il limite è ${MAX_MB_FILE} MB. ` +
      `Comprimilo (o rifai la foto a risoluzione più bassa) e riprova.`
    ));
  }

  if (!tipoFileAmmesso(file)) {
    return Promise.reject(new Error(
      `Il file "${file.name}" non è in un formato che possiamo accettare. ` +
      `Servono una foto (JPG, PNG, HEIC…) oppure un PDF.`
    ));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({
      campo: input.name,
      nome: file.name,
      mime: file.type || 'application/octet-stream',
      // readAsDataURL restituisce "data:<mime>;base64,<dati>": teniamo solo i dati
      dati: String(reader.result).split(',')[1] || '',
    });
    reader.onerror = () => reject(new Error(`Non sono riuscito a leggere il file "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

function inviaForm(form) {
  const tipo = form.dataset.formBackend;
  // Il modulo di contatto ha un backend separato (solo mail); iscrizione e aps
  // vanno sul backend del foglio.
  const endpoint = tipo === 'contatti' ? BACKEND_URL_CONTATTI : BACKEND_URL;
  // La coda del messaggio d'errore cambia col modulo: i moduli d'iscrizione hanno
  // un PDF da scaricare come ripiego, il modulo di contatto di contatti.html no.
  const codaErrore = tipo === 'contatti'
    ? ' Riprova, oppure scrivici direttamente a camposcuolaasb24@gmail.com.'
    : ' I dati che hai scritto sono ancora qui: puoi riprovare, oppure scaricare il PDF ' +
      'e mandarlo a camposcuolaasb24@gmail.com.';
  const success = form.querySelector('.form-success') || form.parentElement.querySelector('.form-success');
  const errore = form.querySelector('.form-error') || form.parentElement.querySelector('.form-error');
  const bottone = form.querySelector('button[type="submit"]');
  const testoBottone = bottone ? bottone.textContent : '';

  const mostraErrore = (messaggio) => {
    if (!errore) { alert(messaggio); return; }
    errore.textContent = messaggio;
    errore.classList.add('is-visible');
    errore.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const mostraSuccesso = () => {
    if (errore) errore.classList.remove('is-visible');
    if (success) {
      success.classList.add('is-visible');
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    form.reset();
    timbraModulo(form); // reset() ha riportato modulo-reso-il a "": ritimbra per un eventuale secondo invio
  };

  // Backend non ancora configurato: il sito si comporta come prima (demo), senza rompersi.
  if (!endpoint) {
    console.warn('[' + tipo + '] backend non configurato: invio dimostrativo, nessun dato trasmesso.');
    mostraSuccesso();
    return;
  }

  if (errore) errore.classList.remove('is-visible');
  if (bottone) { bottone.disabled = true; bottone.textContent = 'Invio in corso…'; }

  const inputFile = Array.from(form.querySelectorAll('input[type="file"]'));

  Promise.all(inputFile.map(leggiFile))
    .then(letti => {
      const payload = {
        formType: tipo,
        campi: raccogliCampi(form),
        file: letti.filter(Boolean),
      };
      // Se il genitore ha fatto l'accesso, il token viaggia con l'invio: serve al
      // backend per chiudere la bozza corrispondente (e non riproporla piu').
      // Facoltativo: senza accesso il payload e' identico a prima.
      const token = bozzeApi && bozzeApi.tokenAttivo();
      if (token) payload.token = token;
      return fetch(endpoint, {
        method: 'POST',
        // text/plain = richiesta semplice, nessun preflight (vedi nota CORS sopra)
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
    })
    .then(res => res.json())
    .then(risposta => {
      if (risposta && risposta.status === 'ok') {
        // L'iscrizione e' registrata, ma il server puo' aver rifiutato uno o piu'
        // allegati. Va detto: altrimenti il genitore crede di aver consegnato tutto
        // e l'organizzazione si ritrova senza un certificato sanitario.
        const scartati = (risposta.scartati || []);
        // Pratica conclusa: si spegne l'autosalvataggio di questo modulo, cosi'
        // un salvataggio in ritardo non riapre una bozza gia' chiusa.
        if (bozzeApi) bozzeApi.concludi(form);
        mostraSuccesso();
        if (scartati.length) {
          const elenco = scartati.map(s => `«${s.nome}» (${s.motivo})`).join('; ');
          mostraErrore(
            `Iscrizione registrata, ma ${scartati.length === 1 ? 'un allegato non è stato accettato' : `${scartati.length} allegati non sono stati accettati`}: ${elenco}. ` +
            `Rimandalo/i via email a camposcuolaasb24@gmail.com indicando nome e cognome dell'allievo.`
          );
        }
      } else {
        mostraErrore(
          'Invio non riuscito: ' + ((risposta && risposta.messaggio) || 'errore sconosciuto dal server') +
          '.' + codaErrore
        );
      }
    })
    .catch(err => {
      mostraErrore(
        (err && err.message ? err.message : 'Invio non riuscito.') + codaErrore
      );
    })
    .finally(() => {
      if (bottone) { bottone.disabled = false; bottone.textContent = testoBottone; }
    });
}

/* ==========================================================================
   ACCESSO GENITORE (email + codice) E SALVATAGGIO AUTOMATICO DELLA BOZZA
   ==========================================================================
   PERCHE' ESISTE: per inviare il modulo il genitore deve scaricare il PDF,
   stamparlo, firmarlo a mano, scansionarlo e RICARICARE la pagina per allegare la
   scansione. Senza salvataggio, quel reload azzera 68 campi.

   COME FUNZIONA: accesso facoltativo con email + codice a 6 cifre (niente
   password da ricordare per un modulo che si compila una volta all'anno). Il
   token di sessione, non l'email, e' l'identita' della bozza: un secondo accesso
   con la stessa email apre una bozza indipendente (utile per un altro figlio).

   REGOLA NON NEGOZIABILE: il modulo resta compilabile e INVIABILE senza accesso.
   Se il backend non e' configurato, se le email non partono o se la sessione
   scade, qui non si rompe niente: si spegne solo il salvataggio automatico.
   ========================================================================== */

/* ⚠ INTERRUTTORE — metti `true` SOLO DOPO aver ridistribuito Code.gs.
   Finche' e' `false` il blocco di accesso non compare affatto e il sito si
   comporta esattamente come prima (nessun token viaggia con l'invio).
   Perche' serve: il sito si pubblica su GitHub Pages in un momento, la web app
   Apps Script si ridistribuisce in un altro (passo umano). Nel mezzo, un
   genitore che provasse ad accedere riceverebbe dal backend vecchio un errore
   incomprensibile ("formType non riconosciuto: undefined") — verificato in QA.
   COME ACCERTARSI CHE SI PUO' ACCENDERE: apri l'URL /exec nel browser; il JSON
   deve dire `"login": "attivo"` (vedi anche verificaTabLogin() in Code.gs).
   Per provarlo in locale prima del deploy: aggiungi `?bozze=prova` all'URL. */
const SALVATAGGIO_BOZZE_ATTIVO = false;

const CHIAVE_SESSIONE = 'camposcuola-sessione-2026';
const AUTOSAVE_DEBOUNCE_MS = 2500;      // si salva alla prima pausa di digitazione
const AUTOSAVE_INTERVALLO_MIN_MS = 8000; // ...ma non piu' di una volta ogni 8 secondi

/* Ponte verso il resto del file (usato da inviaForm): resta null sulle pagine
   senza modulo, o se il salvataggio non e' disponibile. */
let bozzeApi = null;

/* Copia inversa di raccogliCampi(): riscrive nel form i valori di una bozza.
   I campi file NON si ripristinano mai — un <input type="file"> non e'
   valorizzabile da JavaScript (giustamente: sarebbe un modo per far caricare a
   un utente un file che non ha scelto). La scansione firmata va riallegata. */
function ripristinaCampi(form, dati) {
  let ripristinati = 0;
  Array.from(form.elements).forEach(el => {
    if (!el.name || el.disabled || el.type === 'file') return;
    if (el.type === 'submit' || el.type === 'button') return;
    if (CAMPI_NON_INVIATI.includes(el.name)) return;   // read-only dell'organizzazione
    if (!(el.name in dati)) return;

    const valore = dati[el.name];
    if (el.type === 'checkbox') {
      el.checked = valore === VALORE_SI;
    } else if (el.type === 'radio') {
      el.checked = (el.value === valore);
    } else {
      el.value = valore === undefined || valore === null ? '' : valore;
    }
    ripristinati++;
  });
  return ripristinati;
}

function initAccessoBozze() {
  const box = document.querySelector('[data-accesso-bozze]');
  const moduli = Array.from(document.querySelectorAll('form[data-bozza]'));
  if (!box || !moduli.length) return;

  // Senza backend, o prima che il Code.gs aggiornato sia stato ridistribuito, il
  // blocco non si mostra affatto: meglio nessuna offerta che una che non funziona.
  const inProva = /[?&]bozze=prova\b/.test(location.search);
  if (!BACKEND_URL || !(SALVATAGGIO_BOZZE_ATTIVO || inProva)) {
    console.warn('[bozze] salvataggio progressi non attivo ' +
      (BACKEND_URL ? '(SALVATAGGIO_BOZZE_ATTIVO = false: Code.gs non ancora ridistribuito?)'
                   : '(BACKEND_URL non configurato)') + '.');
    return;
  }

  const passi = {};
  box.querySelectorAll('[data-accesso-passo]').forEach(el => { passi[el.dataset.accessoPasso] = el; });
  const messaggio = box.querySelector('[data-accesso-messaggio]');
  const formEmail = box.querySelector('[data-accesso-form="email"]');
  const formCodice = box.querySelector('[data-accesso-form="codice"]');
  const campoEmail = box.querySelector('#accesso-email');
  const campoCodice = box.querySelector('#accesso-codice');
  const etichettaDestinatario = box.querySelector('[data-accesso-destinatario]');
  const etichettaEmailAttiva = box.querySelector('[data-accesso-email-attiva]');
  const etichettaSalvataggio = box.querySelector('[data-accesso-salvataggio]');
  const bloccoRipristino = box.querySelector('[data-accesso-ripristino]');
  const testoRipristino = box.querySelector('[data-accesso-ripristino-testo]');
  const btnRiprendi = box.querySelector('[data-accesso-riprendi]');
  const btnIniziaVuoto = box.querySelector('[data-accesso-inizia-vuoto]');
  const btnEsci = box.querySelector('[data-accesso-esci]');
  const btnAltroFiglio = box.querySelector('[data-accesso-altro-figlio]');

  let sessione = null;      // { token, email, scadeIl }
  let emailInVerifica = '';
  let suggerita = null;     // bozza di un'altra sessione, da proporre
  const stato = new Map();  // form -> { attivo, timer, ultimoInvio, conclusa }

  box.hidden = false;

  // --- utilita' di interfaccia ---
  const mostraPasso = (nome) => {
    Object.keys(passi).forEach(k => { passi[k].hidden = k !== nome; });
    box.dataset.accessoStato = nome;
  };
  const avvisa = (testo, tipo) => {
    if (!messaggio) return;
    messaggio.textContent = testo || '';
    messaggio.hidden = !testo;
    messaggio.className = 'accesso-messaggio' + (tipo ? ' is-' + tipo : '');
  };
  const oraLeggibile = (iso) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const dueCifre = (n) => String(n).padStart(2, '0');
    const oggi = new Date();
    const stessoGiorno = d.toDateString() === oggi.toDateString();
    const ora = dueCifre(d.getHours()) + ':' + dueCifre(d.getMinutes());
    return stessoGiorno ? ora : `${dueCifre(d.getDate())}/${dueCifre(d.getMonth() + 1)} alle ${ora}`;
  };

  // --- sessione in localStorage ---
  const leggiSessione = () => {
    try {
      const grezzo = localStorage.getItem(CHIAVE_SESSIONE);
      if (!grezzo) return null;
      const s = JSON.parse(grezzo);
      if (!s || !s.token) return null;
      // Scadenza gia' passata: si butta subito, senza disturbare il server.
      if (s.scadeIl && new Date(s.scadeIl).getTime() < Date.now()) return null;
      return s;
    } catch (err) { return null; }
  };
  const scriviSessione = (s) => {
    try { localStorage.setItem(CHIAVE_SESSIONE, JSON.stringify(s)); } catch (err) { /* modalita' privata */ }
  };
  const dimenticaSessione = () => {
    try { localStorage.removeItem(CHIAVE_SESSIONE); } catch (err) { /* niente */ }
    sessione = null;
    stato.forEach(s => { s.attivo = false; clearTimeout(s.timer); });
    stato.clear();
  };

  // --- chiamate al backend (stesso trucco CORS dell'invio: text/plain) ---
  const chiama = (payload, opzioni) => fetch(BACKEND_URL, Object.assign({
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }, opzioni || {})).then(res => res.json());

  /* Sessione non piu' valida: si spegne il salvataggio e si torna al banner.
     I dati a schermo NON si toccano — il genitore puo' comunque inviare. */
  const sessioneCaduta = (risposta) => {
    dimenticaSessione();
    mostraPasso('email');
    avvisa((risposta && risposta.messaggio) ||
      'L\'accesso non è più valido. Rifai l\'accesso per continuare a salvare.', 'attenzione');
  };
  const loginNonDisponibile = (risposta) => {
    console.warn('[bozze] login non disponibile: ' + (risposta && risposta.messaggio));
    dimenticaSessione();
    box.hidden = true;   // niente da offrire: meglio non mostrare nulla che un errore
  };
  const gestisciErrore = (risposta) => {
    const codice = risposta && risposta.codice;
    if (codice === 'login-non-disponibile') { loginNonDisponibile(risposta); return 'spento'; }
    if (codice === 'sessione-scaduta' || codice === 'sessione-non-valida' || codice === 'sessione-assente') {
      sessioneCaduta(risposta); return 'caduta';
    }
    return 'altro';
  };

  // --- passo 1: chiedi il codice ---
  timbraModulo(formEmail); // istante di rendering, per il controllo anti-bot lato backend
  formEmail.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = (campoEmail.value || '').trim();
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email)) {
      avvisa('Controlla l\'indirizzo email: non sembra valido.', 'attenzione');
      campoEmail.focus();
      return;
    }
    const btn = formEmail.querySelector('button[type="submit"]');
    const testo = btn.textContent;
    btn.disabled = true; btn.textContent = 'Invio del codice…';
    avvisa('');
    const hp = formEmail.querySelector('[name="' + CAMPO_HONEYPOT + '"]');
    const ts = formEmail.querySelector('[name="' + CAMPO_TS_MODULO + '"]');
    chiama({
      azione: 'richiedi-otp',
      email,
      honeypot: hp ? hp.value : '',
      resoIl: ts ? ts.value : '',
    })
      .then(r => {
        if (r && r.status === 'ok') {
          emailInVerifica = email.toLowerCase();
          if (etichettaDestinatario) etichettaDestinatario.textContent = emailInVerifica;
          mostraPasso('codice');
          avvisa('');
          if (campoCodice) campoCodice.focus();
        } else if (gestisciErrore(r) === 'altro') {
          avvisa((r && r.messaggio) || 'Non è stato possibile inviare il codice.', 'attenzione');
        }
      })
      .catch(() => avvisa('Non è stato possibile contattare il server. ' +
        'Puoi compilare e inviare il modulo anche senza accedere.', 'attenzione'))
      .finally(() => { btn.disabled = false; btn.textContent = testo; });
  });

  // --- passo 2: verifica il codice ---
  formCodice.addEventListener('submit', (e) => {
    e.preventDefault();
    const codice = (campoCodice.value || '').replace(/\D/g, '');
    if (codice.length !== 6) {
      avvisa('Il codice è di 6 cifre.', 'attenzione');
      return;
    }
    const btn = formCodice.querySelector('button[type="submit"]');
    const testo = btn.textContent;
    btn.disabled = true; btn.textContent = 'Verifica…';
    chiama({ azione: 'verifica-otp', email: emailInVerifica, codice })
      .then(r => {
        if (r && r.status === 'ok') {
          campoCodice.value = '';
          suggerita = r.bozzaSuggerita || null;
          apriSessione({ token: r.token, email: r.email, scadeIl: r.scadeIl });
        } else if (gestisciErrore(r) === 'altro') {
          avvisa((r && r.messaggio) || 'Codice non valido.', 'attenzione');
        }
      })
      .catch(() => avvisa('Non è stato possibile contattare il server.', 'attenzione'))
      .finally(() => { btn.disabled = false; btn.textContent = testo; });
  });

  // --- sessione attiva ---
  function apriSessione(nuova) {
    sessione = nuova;
    scriviSessione(nuova);
    mostraPasso('attivo');
    if (etichettaEmailAttiva) etichettaEmailAttiva.textContent = nuova.email || '';
    if (etichettaSalvataggio) etichettaSalvataggio.textContent = 'nessun salvataggio ancora';
    avvisa('');
    proponiRipristino();
    moduli.forEach(form => {
      stato.set(form, { attivo: true, timer: null, ultimoInvio: 0, conclusa: false });
      caricaBozza(form, null);
      ascolta(form);
    });
  }

  /* Bozza di un'altra sessione (tipicamente: iniziata dal telefono, ripresa dal
     PC). NON si ripristina da sola: il genitore potrebbe voler ricominciare. */
  function proponiRipristino() {
    if (!bloccoRipristino) return;
    if (!suggerita || !suggerita.token) { bloccoRipristino.hidden = true; return; }
    const quando = oraLeggibile(suggerita.aggiornataIl);
    const chi = suggerita.nomeAllievo ? ` per ${suggerita.nomeAllievo}` : '';
    const quale = suggerita.tipoModulo === 'aps' ? 'del modulo socio A.P.S.' : 'del modulo d\'iscrizione';
    if (testoRipristino) {
      testoRipristino.textContent =
        `Hai una compilazione ${quale}${chi} salvata ${quando ? 'il ' + quando : 'di recente'}. La riprendo?`;
    }
    bloccoRipristino.hidden = false;
  }

  if (btnRiprendi) {
    btnRiprendi.addEventListener('click', () => {
      if (!suggerita) return;
      const form = moduli.find(f => f.dataset.formBackend === suggerita.tipoModulo) || moduli[0];
      caricaBozza(form, suggerita.token);
      suggerita = null;
      bloccoRipristino.hidden = true;
    });
  }
  if (btnIniziaVuoto) {
    btnIniziaVuoto.addEventListener('click', () => {
      suggerita = null;
      bloccoRipristino.hidden = true;
    });
  }
  if (btnEsci) {
    btnEsci.addEventListener('click', () => {
      dimenticaSessione();
      mostraPasso('email');
      avvisa('Accesso chiuso. I dati che hai scritto restano a schermo: puoi inviare il modulo comunque.', 'ok');
    });
  }
  if (btnAltroFiglio) {
    btnAltroFiglio.addEventListener('click', () => {
      dimenticaSessione();
      moduli.forEach(f => f.reset());
      mostraPasso('email');
      avvisa('Modulo svuotato. Fai un nuovo accesso per salvare la seconda iscrizione ' +
        '(la precedente resta al sicuro dove l\'hai lasciata).', 'ok');
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // --- ripristino dei campi salvati ---
  function caricaBozza(form, tokenBozza) {
    if (!sessione) return;
    const payload = { azione: 'recupera-bozza', token: sessione.token, formType: form.dataset.formBackend };
    if (tokenBozza) payload.tokenBozza = tokenBozza;
    chiama(payload)
      .then(r => {
        if (!r || r.status !== 'ok') { gestisciErrore(r); return; }
        const s = stato.get(form);
        if (r.completata && s) {
          s.attivo = false; s.conclusa = true;
          avvisa('Questa iscrizione risulta già inviata: il salvataggio automatico è spento.', 'ok');
          return;
        }
        if (r.avviso) avvisa(r.avviso, 'attenzione');
        if (!r.campi) return;
        const quanti = ripristinaCampi(form, r.campi);
        if (etichettaSalvataggio && r.aggiornataIl) {
          etichettaSalvataggio.textContent = 'ultimo salvataggio ' + oraLeggibile(r.aggiornataIl);
        }
        avvisa(`Ho ripristinato ${quanti} campi salvati in precedenza. ` +
          'La scansione del modulo firmato va riallegata: gli allegati non si salvano.', 'ok');
      })
      .catch(() => { /* rete assente: il modulo resta usabile, niente allarmi */ });
  }

  // --- salvataggio automatico ---
  function ascolta(form) {
    const salvaConAttesa = () => {
      const s = stato.get(form);
      if (!s || !s.attivo) return;
      clearTimeout(s.timer);
      s.sporco = true;   // ci sono modifiche non ancora confermate dal server
      const attesa = Math.max(AUTOSAVE_DEBOUNCE_MS, AUTOSAVE_INTERVALLO_MIN_MS - (Date.now() - s.ultimoInvio));
      // Se il tetto di frequenza non e' ancora passato NON si rinuncia al
      // salvataggio (perderebbe le ultime modifiche in silenzio): si aspetta il
      // tempo che manca. E' la correzione alla bozza del § 1.6 dell'analisi,
      // che con un `return` secco scartava l'ultimo salvataggio.
      s.timer = setTimeout(() => salvaBozza(form), attesa);
    };
    form.addEventListener('input', salvaConAttesa);
    form.addEventListener('change', salvaConAttesa);   // select, date picker, checkbox
  }

  function salvaBozza(form, opzioni) {
    const s = stato.get(form);
    if (!sessione || !s || !s.attivo) return Promise.resolve();
    clearTimeout(s.timer);
    s.ultimoInvio = Date.now();
    return chiama({
      azione: 'salva-bozza',
      token: sessione.token,
      formType: form.dataset.formBackend,
      campi: raccogliCampi(form),
    }, (opzioni && opzioni.keepalive) ? { keepalive: true } : null)
      .then(r => {
        if (r && r.status === 'ok') {
          // L'orario mostrato e' quello CONFERMATO DAL SERVER, mai quello del
          // tentativo: un salvataggio fallito non deve poter sembrare riuscito
          // (stesso errore gia' fatto e corretto qui con "Documenti mancanti").
          s.sporco = false;
          if (etichettaSalvataggio) etichettaSalvataggio.textContent = 'salvato alle ' + oraLeggibile(r.salvatoIl);
          return;
        }
        const codice = r && r.codice;
        if (codice === 'bozza-conclusa') {
          s.attivo = false; s.conclusa = true;
          return;
        }
        if (codice === 'occupato') {
          // Autosalvataggio, non un'azione chiesta dal genitore: si riprova al
          // prossimo ciclo senza mostrare nulla. L'orario resta quello vecchio,
          // e si vede da solo che non e' recente.
          console.warn('[bozze] server occupato, riprovo al prossimo salvataggio');
          return;
        }
        if (gestisciErrore(r) === 'altro') {
          console.warn('[bozze] salvataggio non riuscito: ' + (r && r.messaggio));
        }
      })
      .catch(() => { /* rete assente: si riprova al prossimo input */ });
  }

  /* Momento critico: il genitore scarica il PDF per stamparlo e firmarlo, poi
     RICARICA la pagina. Qui si forza un salvataggio, senza aspettare il debounce:
     e' esattamente il punto in cui perdere i dati sarebbe piu' doloroso. */
  const btnPdf = document.getElementById('btn-scarica-pdf');
  if (btnPdf) btnPdf.addEventListener('click', () => moduli.forEach(f => salvaBozza(f)));

  // Ultimo tentativo quando la pagina viene chiusa/nascosta: `keepalive` fa
  // sopravvivere la richiesta alla chiusura della scheda. Best-effort: se non
  // arriva, l'ultimo salvataggio confermato resta quello mostrato nella striscia.
  window.addEventListener('pagehide', () => {
    moduli.forEach(f => {
      const s = stato.get(f);
      if (s && s.attivo && s.sporco) salvaBozza(f, { keepalive: true });
    });
  });

  // --- ponte per inviaForm ---
  bozzeApi = {
    tokenAttivo: () => (sessione ? sessione.token : null),
    concludi: (form) => {
      const s = stato.get(form);
      if (s) { s.attivo = false; s.conclusa = true; clearTimeout(s.timer); }
      if (etichettaSalvataggio) etichettaSalvataggio.textContent = 'iscrizione inviata';
      if (btnAltroFiglio) btnAltroFiglio.hidden = false;
    },
  };

  // --- avvio: c'e' gia' una sessione da un caricamento precedente? ---
  const salvata = leggiSessione();
  if (salvata) {
    // Ripristino silenzioso: e' il caso del reload dopo la firma del PDF.
    apriSessione(salvata);
  } else {
    mostraPasso('email');
  }
}

/* --- Caricamento on-demand di jsPDF + html2canvas (solo pagina Iscrizioni) ---
   Non sono piu' in <head>: si scaricano da cdn.jsdelivr.net soltanto quando l'utente
   clicca "Scarica modulo compilato". E' un'azione esplicita e funzionale, quindi non
   passa dal banner cookie; in cambio nessuna richiesta a terze parti parte al semplice
   caricamento della pagina. Memoizzata: lo scarico avviene una volta sola. */
let promessaLibreriePdf = null;
function caricaLibreriePdf() {
  if (promessaLibreriePdf) return promessaLibreriePdf;
  // integrity = hash SRI del file alla versione fissata: se la CDN restituisse un
  // file diverso (compromissione, cache avvelenata) il browser lo scarta invece
  // di eseguirlo. crossOrigin 'anonymous' e' obbligatorio perche' SRI valga su
  // una risorsa di terze parti. Se cambi la versione qui sopra, rigenera l'hash:
  //   curl -sSL <url> | openssl dgst -sha384 -binary | openssl base64 -A
  const caricaScript = (src, integrity) => new Promise((risolvi, rifiuta) => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; }
    s.async = false; // gli script creati via JS sono async per default: qui serve ordine deterministico
    s.onload = () => risolvi();
    s.onerror = () => rifiuta(new Error('risorsa non raggiungibile: ' + src));
    document.head.appendChild(s);
  });
  promessaLibreriePdf = caricaScript(
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
      'sha384-en/ztfPSRkGfME4KIm05joYXynqzUgbsG5nMrj/xEFAHXkeZfO3yMK8QQ+mP7p1/')
    .then(() => caricaScript(
      'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H'))
    .catch((err) => { promessaLibreriePdf = null; throw err; });
  return promessaLibreriePdf;
}

/* --- Generazione PDF pre-compilato via html2canvas + jsPDF (pulsante "Scarica modulo compilato") ---
   Cattura le 4 sezioni .mod-pdfpage COSI' COME SONO A SCHERMO (stesso HTML/CSS della
   riproduzione fedele del cartaceo, con i dati appena digitati) invece di ricostruire un
   recap testuale a parte: garantisce "stesso identico formato e stile" per costruzione.
   Due correzioni rispetto alla prima versione (2026-07-26, segnalate dall'utente):
   1) PAGINE A4 VERE: una .mod-pdfpage può essere alta più di un foglio A4 (es. la pagina
      Regolamento supera i 750mm equivalenti) — non si scala più tutto in un'unica pagina
      fuori misura (non stampabile), si affetta il canvas catturato in tante pagine da
      210x297mm quante servono, tutte identiche come dimensione fisica.
   2) VALORI NON PIU' TAGLIATI: html2canvas non renderizza in modo affidabile il testo
      DENTRO i controlli nativi (<input>/<select>/<textarea>) — è un suo limite noto, il
      valore digitato può apparire troncato o mal posizionato. Prima di catturare, ogni
      pagina viene quindi clonata fuori schermo sostituendo ogni campo con un <div> di
      solo testo (classe .mod-print-value) che contiene il valore REALE già scritto dal
      genitore: un div di testo normale, html2canvas lo cattura sempre per intero, con
      wrap invece di troncamento se il valore è lungo.
   Requisito: va servito da http(s) (anche in locale, es. `py -3 -m http.server`), non
   aperto come file:// — altrimenti html2canvas non riesce a leggere le immagini in img/. */
function initPdfDownload() {
  const btn = document.getElementById('btn-scarica-pdf');
  const form = document.getElementById('modulo-iscrizione');
  if (!btn || !form) return;

  const LARGHEZZA_MM = 210;
  const ALTEZZA_MM = 297; // A4 vero: ogni pagina del PDF ha sempre queste dimensioni fisse

  const formattaData = (iso) => {
    if (!iso) return '';
    const parti = iso.split('-');
    return parti.length === 3 ? `${parti[2]}/${parti[1]}/${parti[0]}` : iso;
  };

  /* Copia "stampabile" di una .mod-pdfpage: stessa struttura/CSS, ma ogni input/select/
     textarea diventa un <div> col valore corrente gia' risolto a testo. Costruita FUORI
     dal form live (mai smontare i campi che il genitore sta ancora compilando). */
  const clonaStampabile = (pagina) => {
    const clone = pagina.cloneNode(true);
    const originali = pagina.querySelectorAll('input, select, textarea');
    const copie = clone.querySelectorAll('input, select, textarea');
    originali.forEach((originale, i) => {
      const copia = copie[i];
      const sostituto = document.createElement('div');
      sostituto.className = 'mod-print-value';
      if (originale.type === 'checkbox') {
        sostituto.textContent = originale.checked ? '☑' : '☐';
      } else if (originale.type === 'radio') {
        sostituto.textContent = originale.checked ? '●' : '○';
      } else if (originale.type === 'file') {
        sostituto.textContent = (originale.files && originale.files[0]) ? '✓ ' + originale.files[0].name : '';
      } else if (originale.tagName === 'SELECT') {
        const scelta = originale.options[originale.selectedIndex];
        sostituto.textContent = scelta ? scelta.textContent.trim() : '';
      } else if (originale.type === 'date') {
        sostituto.textContent = formattaData(originale.value);
      } else {
        sostituto.textContent = originale.value || '';
      }
      copia.replaceWith(sostituto);
    });
    return clone;
  };

  btn.addEventListener('click', async () => {
    const pagineOriginali = Array.from(form.querySelectorAll('.mod-pdfpage'));
    if (!pagineOriginali.length) return;

    const testoOriginale = btn.textContent;
    btn.disabled = true;
    try {
      btn.textContent = 'Preparazione…';
      await caricaLibreriePdf();
    } catch (err) {
      console.error('[iscrizioni] caricamento librerie PDF fallito:', err);
      alert(
        'Non sono riuscito a caricare i componenti per generare il PDF (' + (err && err.message ? err.message : 'errore di rete') + '). ' +
        'Controlla la connessione e riprova, oppure usa Stampa (Ctrl+P) > Salva come PDF dal browser: mostra lo stesso modulo.'
      );
      btn.disabled = false;
      btn.textContent = testoOriginale;
      return;
    }

    const { jsPDF } = window.jspdf;

    const palco = document.createElement('div');
    palco.style.cssText = 'position:fixed; left:-99999px; top:0; margin:0;';
    document.body.appendChild(palco);

    const doc = new jsPDF({ unit: 'mm', format: [LARGHEZZA_MM, ALTEZZA_MM] });
    let primaPaginaPdf = true;

    // Cattura una .mod-pdfpage (clonata e "appiattita" a testo) e la affetta in tante
    // pagine A4 quante servono per contenerla senza tagliare né rimpicciolire nulla.
    const catturaESpezza = (pagina, indice) => {
      btn.textContent = `Generazione pagina ${indice + 1}/${pagineOriginali.length}…`;
      const stampabile = clonaStampabile(pagina);
      palco.appendChild(stampabile);

      return window.html2canvas(stampabile, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        .then((canvas) => {
          palco.removeChild(stampabile);
          const pxPerMm = canvas.width / LARGHEZZA_MM;
          const altezzaPaginaPx = Math.round(ALTEZZA_MM * pxPerMm);
          const numPagine = Math.max(1, Math.ceil(canvas.height / altezzaPaginaPx));

          for (let p = 0; p < numPagine; p++) {
            const alto = Math.min(altezzaPaginaPx, canvas.height - p * altezzaPaginaPx);
            const fetta = document.createElement('canvas');
            fetta.width = canvas.width;
            fetta.height = alto;
            fetta.getContext('2d').drawImage(canvas, 0, p * altezzaPaginaPx, canvas.width, alto, 0, 0, canvas.width, alto);
            const immagine = fetta.toDataURL('image/jpeg', 0.92);
            if (!primaPaginaPdf) doc.addPage([LARGHEZZA_MM, ALTEZZA_MM]);
            primaPaginaPdf = false;
            doc.addImage(immagine, 'JPEG', 0, 0, LARGHEZZA_MM, alto / pxPerMm);
          }
        });
    };

    // Una pagina alla volta (non in parallelo): tiene basso il picco di memoria e
    // garantisce che finiscano nel PDF nello stesso ordine in cui sono a schermo.
    pagineOriginali.reduce((precedente, pagina, indice) => precedente.then(() => catturaESpezza(pagina, indice)), Promise.resolve())
      .then(() => {
        document.body.removeChild(palco);
        const data = Object.fromEntries(new FormData(form));
        const cognome = (data['cognome-allievo'] || 'allievo').replace(/[^a-z0-9]/gi, '_') || 'allievo';
        doc.save(`iscrizione-camposcuola-2026-${cognome}.pdf`);
      })
      .catch((err) => {
        if (palco.parentNode) document.body.removeChild(palco);
        console.error('[iscrizioni] generazione PDF fallita:', err);
        alert(
          'Non sono riuscito a generare il PDF (' + (err && err.message ? err.message : 'errore sconosciuto') + '). ' +
          'Riprova, oppure usa Stampa (Ctrl+P) > Salva come PDF dal browser: mostra lo stesso modulo.'
        );
      })
      .finally(() => {
        btn.disabled = false;
        btn.textContent = testoOriginale;
      });
  });
}

/* --- Generazione PDF pre-compilato via jsPDF per il modulo APS (pulsante "Scarica modulo compilato") --- */
function initPdfDownloadAps() {
  const btn = document.getElementById('btn-scarica-pdf-aps');
  const form = document.getElementById('modulo-aps');
  if (!btn || !form) return;

  btn.addEventListener('click', async () => {
    const testoOriginale = btn.textContent;
    btn.disabled = true;
    try {
      btn.textContent = 'Preparazione…';
      await caricaLibreriePdf();
    } catch (err) {
      console.error('[APS] caricamento librerie PDF fallito:', err);
      alert(
        'Non sono riuscito a caricare i componenti per generare il PDF (' + (err && err.message ? err.message : 'errore di rete') + '). ' +
        'Controlla la connessione e riprova, oppure usa Stampa (Ctrl+P) > Salva come PDF dal browser.'
      );
      btn.disabled = false;
      btn.textContent = testoOriginale;
      return;
    }
    btn.disabled = false;
    btn.textContent = testoOriginale;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const data = Object.fromEntries(new FormData(form));
    const marginX = 15;
    let y = 18;

    const checkPageBreak = (needed = 6) => {
      if (y > 297 - needed) { doc.addPage(); y = 18; }
    };
    const addSectionTitle = (text) => {
      checkPageBreak(10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(31, 77, 52);
      doc.text(text.toUpperCase(), marginX, y);
      doc.setDrawColor(200, 137, 47);
      doc.line(marginX, y + 1.5, 195, y + 1.5);
      y += 6;
    };
    const addRow = (label, value) => {
      const text = value && String(value).trim() ? String(value) : '—';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(text, 128);
      checkPageBreak(5 * lines.length);
      doc.setTextColor(90, 99, 85);
      doc.text(label + ':', marginX, y);
      doc.setTextColor(34, 40, 31);
      doc.text(lines, marginX + 55, y);
      y += 5 * lines.length;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(31, 77, 52);
    doc.text('Richiesta di ammissione a Socio Ordinario — A.P.S.', marginX, y);
    y += 7;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(90, 99, 85);
    doc.text('Campo Scuola Almenno San Bartolomeo A.P.S. — copia generata dal sito, non un invio ufficiale', marginX, y);
    y += 9;

    addSectionTitle('1. Dati del maggiorenne o del genitore');
    addRow('Cognome e nome', data['aps-cognome-genitore']);
    addRow('Luogo di nascita', [data['aps-luogo-nascita-genitore'], data['aps-prov-nascita-genitore']].filter(Boolean).join(' / '));
    addRow('Data di nascita', data['aps-data-nascita-genitore']);
    addRow('Residenza', data['aps-residenza-genitore']);
    addRow('Telefono', data['aps-telefono-genitore']);
    addRow('Mail', data['aps-email-genitore']);
    addRow('Potesta genitoriale sul minore', data['aps-potesta-genitoriale'] ? 'Si' : 'No');
    y += 2;

    addSectionTitle('2. Dati del minore (aspirante socio)');
    addRow('Cognome e nome', data['aps-cognome-minore']);
    addRow('Luogo di nascita', [data['aps-luogo-nascita-minore'], data['aps-prov-nascita-minore']].filter(Boolean).join(' / '));
    addRow('Data di nascita', data['aps-data-nascita-minore']);
    addRow('Residenza', data['aps-residenza-minore']);
    addRow('Telefono', data['aps-telefono-minore']);
    addRow('Mail', data['aps-email-minore']);
    y += 2;

    addSectionTitle('3. Richiesta di ammissione a socio');
    addRow('Richiesta ammissione (quota 10 EUR)', data['aps-richiesta-ammissione'] ? 'Si' : 'No');
    addRow('Luogo', data['aps-luogo-firma-1']);
    addRow('Data firma', data['aps-data-firma-1']);
    addRow('Firma digitale', data['aps-firma-1']);
    y += 2;

    addSectionTitle('4. Informativa privacy e consensi');
    addRow('Sottoscritto da', data['aps-nome-sottoscritto-privacy']);
    addRow('Titolare responsabilita genitoriale', data['aps-titolare-responsabilita'] ? 'Si' : 'No');
    addRow('Nome minore (privacy)', data['aps-nome-minore-privacy']);
    addRow('Consenso marketing', data['aps-consenso-marketing']);
    addRow('Luogo', data['aps-luogo-firma-2']);
    addRow('Data firma', data['aps-data-firma-2']);
    addRow('Firma digitale', data['aps-firma-2']);

    checkPageBreak(10);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text('Copia generata dal sito — da rileggere, stampare, firmare e inviare a camposcuolaasb24@gmail.com. Non sostituisce il modulo ufficiale.', marginX, 290);

    const cognome = (data['aps-cognome-minore'] || 'socio').replace(/[^a-z0-9]/gi, '_') || 'socio';
    doc.save(`ammissione-socio-aps-${cognome}.pdf`);
  });
}

/* --- Caroselli "a carte impilate" per le edizioni del libro (galleria.html) ---
   Port in JS puro del componente React CarouselStacked (vedi prompt-galleria):
   la griglia .grid-4 di ogni .gallery-edition diventa un mazzo di carte
   sovrapposte — carta centrale in primo piano, le altre sfalsate ai lati con
   x / y / rotazione / scala / opacita' in funzione della distanza dal centro.
   Si sfoglia trascinando (overlay .ec-drag) o con le frecce / i puntini; il
   wrap e' infinito.

   Come la sfera sponsor (initSponsorSphere): la griglia statica in galleria.html
   resta il fallback per no-JS e prefers-reduced-motion — la guardia qui sotto
   esce prima di toccarla. Le foto restano gli stessi nodi .gallery-item, quindi
   la lightbox (initLightbox) funziona senza modifiche: un tap breve fa un click
   reale sulla carta in primo piano e apre la foto; le frecce della lightbox
   scorrono tutte e 10 le foto dell'edizione (stesso data-group). */
function initBookCarousels() {
  const editions = document.querySelectorAll('.book-gallery-section .gallery-edition');
  if (!editions.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Parametri per fascia di larghezza — equivalenti a getCarouselConfig() del
  // componente modello. visN = quante carte per lato restano visibili.
  function configFor(w) {
    if (w < 640)  return { xStep: 96,  yMul: 16, rotMul: 5, scaleStep: 0.11, visN: 2, dragUnit: 120, distDiv: 120, velDiv: 500 };
    if (w < 1024) return { xStep: 150, yMul: 24, rotMul: 6, scaleStep: 0.10, visN: 2, dragUnit: 160, distDiv: 160, velDiv: 650 };
    return               { xStep: 200, yMul: 32, rotMul: 7, scaleStep: 0.09, visN: 3, dragUnit: 200, distDiv: 200, velDiv: 800 };
  }
  let cfg = configFor(window.innerWidth);

  const svgArrow = (d) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${d}"/></svg>`;

  const instances = [];

  editions.forEach((edition) => {
    const grid = edition.querySelector('.grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.gallery-item'));
    if (cards.length < 2) return;
    const total = cards.length;

    const titolo = edition.querySelector('h3')?.textContent.trim() || 'Foto edizione';
    const anno = (titolo.match(/\d{4}/) || [''])[0];

    // --- Struttura ---
    const carousel = document.createElement('div');
    carousel.className = 'edition-carousel';
    carousel.setAttribute('role', 'group');
    carousel.setAttribute('aria-roledescription', 'carosello');
    carousel.setAttribute('aria-label', titolo);

    const stage = document.createElement('div');
    stage.className = 'ec-stage';

    cards.forEach((card) => {
      card.classList.add('ec-card');
      // La lightbox mostra data-caption: le foto del libro non ce l'hanno, cosi'
      // resterebbe vuota. Usa il titolo dell'edizione come didascalia.
      if (!card.dataset.caption) card.dataset.caption = titolo;
      if (anno && !card.querySelector('.ec-badge')) {
        const b = document.createElement('span');
        b.className = 'ec-badge';
        b.textContent = anno;
        card.appendChild(b);
      }
      stage.appendChild(card);
    });

    const drag = document.createElement('div');
    drag.className = 'ec-drag';
    drag.setAttribute('aria-hidden', 'true');

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'ec-btn ec-prev';
    prev.setAttribute('aria-label', 'Foto precedente');
    prev.innerHTML = svgArrow('M15 18l-6-6 6-6');

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'ec-btn ec-next';
    next.setAttribute('aria-label', 'Foto successiva');
    next.innerHTML = svgArrow('M9 18l6-6-6-6');

    stage.appendChild(drag);
    stage.appendChild(prev);
    stage.appendChild(next);

    // Puntini decorativi: fuori dal tab order (2 frecce a carosello bastano;
    // 16 caroselli x 10 puntini sarebbero ~160 tab stop prima del footer).
    const dots = document.createElement('div');
    dots.className = 'ec-dots';
    dots.setAttribute('aria-hidden', 'true');
    const dotEls = cards.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'ec-dot';
      d.tabIndex = -1;
      d.dataset.i = String(i);
      dots.appendChild(d);
      return d;
    });

    const counter = document.createElement('p');
    counter.className = 'ec-counter';
    counter.setAttribute('aria-live', 'polite');
    counter.textContent = '1 / ' + total;

    carousel.appendChild(stage);
    carousel.appendChild(dots);
    carousel.appendChild(counter);
    grid.replaceWith(carousel);

    // --- Stato ---
    let progress = 0;        // indice continuo della carta centrale (cresce/decresce senza limiti: il wrap e' nel render)
    let raf = 0;
    let lastIndex = 0;       // indice assestato gia' riflesso in contatore/puntini
    let dragging = false;
    let startX = 0, startProgress = 0, lastX = 0, lastT = 0, vel = 0;

    dotEls[0].classList.add('is-active');

    const wrap = (d) => {
      d = ((d % total) + total) % total;   // 0..total
      if (d > total / 2) d -= total;       // -total/2 .. total/2
      return d;
    };
    const modIndex = (p) => ((Math.round(p) % total) + total) % total;

    function setWillChange(on) {
      for (let i = 0; i < total; i++) cards[i].style.willChange = on ? 'transform, opacity' : '';
    }

    function render() {
      const side = cfg.visN;
      for (let i = 0; i < total; i++) {
        const off = wrap(i - progress);
        const a = Math.abs(off);
        const el = cards[i];
        if (a > side + 0.5) {
          el.style.opacity = '0';
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';
        const x = off * cfg.xStep;
        const y = a < 0.05 ? 0 : a * cfg.yMul;
        const rot = a < 0.05 ? 0 : off * cfg.rotMul;
        const scale = Math.max(0.4, 1 - a * cfg.scaleStep);
        let opacity = 1;
        if (a > side - 0.5) opacity = Math.max(0, side - a + 0.5);
        el.style.transform =
          `translate(-50%, -50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
        el.style.zIndex = String(Math.round(100 - a * 10));
      }
      // Contatore/puntini solo al cambio dell'indice assestato: un aria-live
      // aggiornato a ogni pointermove verrebbe "gridato" dagli screen reader.
      const idx = modIndex(progress);
      if (idx !== lastIndex) {
        lastIndex = idx;
        counter.textContent = (idx + 1) + ' / ' + total;
        for (let k = 0; k < total; k++) dotEls[k].classList.toggle('is-active', k === idx);
      }
    }

    function animateTo(target) {
      cancelAnimationFrame(raf);
      const from = progress;
      const t0 = performance.now();
      const dur = 460;
      setWillChange(true);
      function stepFrame(now) {
        const k = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);         // ease-out cubico
        progress = from + (target - from) * e;
        render();
        if (k < 1) { raf = requestAnimationFrame(stepFrame); }
        else { progress = modIndex(target); render(); setWillChange(false); }
      }
      raf = requestAnimationFrame(stepFrame);
    }

    const stepBy = (n) => animateTo(Math.round(progress) + n);

    prev.addEventListener('click', () => stepBy(-1));
    next.addEventListener('click', () => stepBy(1));
    dotEls.forEach((d) => d.addEventListener('click', () => animateTo(Number(d.dataset.i))));

    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); stepBy(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
    });

    // --- Trascinamento su overlay trasparente (la "drag surface" del componente
    //     modello). Tutte le carte hanno pointer-events:none via CSS: ogni evento
    //     puntatore arriva qui. Tap breve -> click() reale sulla carta in primo
    //     piano -> handler della lightbox esistente. Niente race drag/click. ---
    drag.addEventListener('pointerdown', (e) => {
      dragging = true;
      cancelAnimationFrame(raf);
      setWillChange(true);
      startX = lastX = e.clientX;
      lastT = performance.now();
      startProgress = progress;
      vel = 0;
      try { drag.setPointerCapture(e.pointerId); } catch (_) {}
      drag.classList.add('is-grabbing');
    });

    drag.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      vel = ((e.clientX - lastX) / dt) * 1000;    // px/s
      lastX = e.clientX;
      lastT = now;
      progress = startProgress - (e.clientX - startX) / cfg.dragUnit;
      render();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      drag.classList.remove('is-grabbing');
      try { drag.releasePointerCapture(e.pointerId); } catch (_) {}
      const dx = e.clientX - startX;
      if (Math.abs(dx) < 4) {                     // tap: apri la foto in primo piano
        setWillChange(false);
        const front = cards[modIndex(progress)];
        if (front) front.click();
        return;
      }
      let shift = Math.round((-dx / cfg.distDiv) + (-vel / cfg.velDiv));
      shift = Math.max(-3, Math.min(3, shift));
      animateTo(Math.round(startProgress) + shift);
    }
    drag.addEventListener('pointerup', endDrag);
    drag.addEventListener('pointercancel', endDrag);

    instances.push(render);
    render();
  });

  if (!instances.length) return;

  let resizeT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      cfg = configFor(window.innerWidth);
      instances.forEach((render) => render());
    }, 150);
  });
}
