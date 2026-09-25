/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'angelini-rossetti', // usato per localStorage lang
    whatsapp: {
      number: '', // nessun WhatsApp: si prenota al telefono o in direct su Instagram
      message: '',
      ids: [],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [],
      1: [],
      2: [['09:00', '19:00']],
      3: [['09:00', '19:00']],
      4: [['09:00', '19:00']],
      5: [['09:00', '19:00']],
      6: [['09:00', '19:00']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1700,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "m.top": "Angelini Rossetti, back to the top",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.menu": "Open the menu",
      "m.prec": "Turn the page back",
      "m.succ": "Turn the page forward",
      "m.lettere": "Letters",
      "m.numeri": "Numbers",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "i.cosa": "Hairdressers · Make-up artists · Piazza Frattini 15",
      "i.skip": "Skip",
      "n.posto": "The place",
      "n.a": "Colour",
      "n.b": "Cut and make-up",
      "n.c": "The line",
      "n.dove": "Hours and map",
      "n.chiama": "Call",
      "h.eti": "Hairdressers · Make-up artists · Piazza Frattini 15, Milan",
      "h.t": "We listen to&nbsp;hair.",
      "h.p": "For more than twenty years, in Piazza Frattini, Mino and Giuliano have been cutting, colouring and doing make-up with the music on. Here music isn't background: <strong>you choose the playlist.</strong>",
      "h.voto": "4.6 from 132 Google reviews",
      "h.chiama": "Call to book",
      "h.ig": "Message us on Instagram",
      "j.pa": "A · Colour",
      "j.pb": "B · Cut and make-up",
      "j.pc": "C · The line",
      "j.pd": "D · The line",
      "j.vai": "Read the selection",
      "j.istr": "Tap a strip, or a letter and a number.",
      "s.A1": "the original blondes",
      "s.A2": "light and harmony",
      "s.A3": "luminous browns",
      "s.A4": "two colours",
      "s.A5": "pink, violet, red",
      "s.A6": "cool blondes",
      "s.B1": "the cut",
      "s.B2": "cut and beard",
      "s.B3": "molecular",
      "s.B4": "waves, straight, curls",
      "s.B5": "for a night out",
      "s.B6": "photo and video",
      "s.C1": "reconstruction",
      "s.C2": "fragile hair",
      "s.C3": "curls",
      "s.C4": "colour masks",
      "s.C5": "anti-yellow",
      "s.C6": "straight hair",
      "s.D1": "organic line",
      "s.D2": "scalp",
      "s.D3": "sun and sea",
      "s.D4": "styling",
      "s.D5": "sea water",
      "s.D6": "for sporty people",
      "t.A5": "Custom colours",
      "t.B2": "Men",
      "t.B3": "Reconstruction",
      "t.B4": "Blow-dry",
      "t.B5": "Make-up",
      "t.B6": "Sets and shoots",
      "t.A5b": "Custom colours",
      "t.B2b": "Men",
      "t.B3b": "Molecular reconstruction",
      "t.B4b": "Blow-dry and styling",
      "t.B5b": "Make-up",
      "t.B6b": "Sets and shoots",
      "p.eti": "The place",
      "p.t": "We didn't want to create just a salon.",
      "p.s": "We wanted to create a place people would want to live in.",
      "f.sala": "The red room: mint-green and red barber chairs, the green cabinet, the guitar, the Union Jack and the “Rock Star Hair” record clock",
      "p.cap1": "The red room: the barber chairs, the green cabinet, the guitar.",
      "p.r1": "For more than twenty years we've been opening this door with the same idea: making every person feel at home.",
      "p.r2": "Music isn't background, it's part of the experience. You choose the playlist for your time with us; stop for a coffee, a beer or a chat.",
      "p.r3": "Every vintage object tells a story: the barber chairs, the guitar, the gilded mirrors. The most beautiful things are the ones that keep living over time.",
      "p.r4": "In Milan there's a window with our sign on it: that's where it all began.",
      "f.mg": "Mino and Giuliano in the mint-green barber chair: one holding a can of hairspray, the other a chrome hairdryer",
      "p.mg": "Mino and Giuliano",
      "p.mg2": "“Hair is what we do. Emotions are what we want to leave you with.”",
      "p.mgf": "Mino and Giuliano, from their manifesto",
      "f.verde": "The green room: three gilded mirrors, the ring light and the chairs",
      "p.cap2": "The green room, with the gilded mirrors.",
      "a.t": "Colour",
      "a.s": "Experts in blondes and made-to-measure colour",
      "d.A1": "“The Originals. Signed Angelini Rossetti.” Our luminous blonde, built one step at a time, respecting the hair.",
      "d.A2": "The finest threads of light, also “the originals”: they brighten the face without harsh lines. Microvele means harmony.",
      "d.A3": "The brown that lights up the face, often together with a Velvet Cut: softness, light and a natural look in every detail.",
      "d.A4": "Two colours on the same head, designed together with the cut.",
      "d.A5": "Full, bold colour: fuchsia, violet, fire red. We design it for the person wearing it, and keep it alive with the masks from our line.",
      "d.A6": "Cool, platinum, metallic blonde. Even starting from brown: first we work out together whether it can be done, then we go one step at a time.",
      "f.biondo": "Very light blonde, long and wavy, seen from behind in front of the backdrop with the logo",
      "c.biondo": "blonde",
      "f.microvele": "Hair up at the nape: brown base with fine blonde threads",
      "c.microvele": "microvele",
      "f.castano": "Brown lightening to honey-coloured ends, in waves",
      "c.castano": "brown and honey",
      "f.platino": "Straight platinum-silver hair held in a hand",
      "c.platino": "platinum",
      "f.rosa": "Long fuchsia-pink bob",
      "c.rosa": "fuchsia",
      "f.viola": "Long violet and plum hair in curls, seen from behind",
      "c.viola": "violet",
      "f.rosso": "Layered fire-red bob, from the side",
      "c.rosso": "fire red",
      "f.miele": "Honey blonde in waves, seen from behind",
      "c.miele": "honey blonde",
      "a.q": "“Blonde wouldn't be blonde without them.”",
      "a.qf": "Emily Sab, Google review",
      "a.cta": "Want to know whether a blonde is possible on your hair too? Send us “BLONDE” on Instagram:",
      "b.t": "Cut, care and make-up",
      "b.s": "Hairdressers and make-up artists, for women and men",
      "d.B1": "Our cut: it follows the face and the colour, with movement in the right place.",
      "d.B2": "Cut and beard, in the barber chairs of the red room.",
      "d.B3": "It works deep into the fibre and gives hair a healthier, fuller, shinier look. In the salon, with our Hard Music line.",
      "d.B4": "Soft waves, straight, defined curls: the right blow-dry for your hair.",
      "d.B5": "We're hairdressers and make-up artists: make-up for a night out or an event, together with colour and styling.",
      "d.B6": "We also work on set: hair and make-up for photo shoots and videos.",
      "f.lavoro": "In the salon: cutting long curly hair, the client seen from behind",
      "b.cap1": "In the salon: a cut on curls.",
      "f.set": "On set: blow-drying long hair, the girl bent forward",
      "b.cap2": "On set: hair and make-up for the photos.",
      "l.t": "The line",
      "l.q": "Our products speak about us too: they carry the names of songs that have been with us along the way.",
      "d.C1": "Keratin reconstruction: shampoo, mask and lotion, to keep it going at home.",
      "d.C2": "For weak or fragile hair that tends to fall out: energising shampoo and a lotion with essential oils.",
      "d.C3": "For curls: anti-frizz shampoo and mask, perfect-curl fluid.",
      "d.C4": "Colour masks to refresh your colour between appointments: violet, red, copper, chocolate, gold, neutral. And colour protection.",
      "d.C5": "Anti-yellow shampoo and mask for blonde, grey and white hair: they take away yellow tones.",
      "d.C6": "Fluid and mask for straight or straightened hair, against frizz.",
      "d.D1": "The organic line: shampoo, conditioner and volume spray, with organic olive oil and safflower oil.",
      "d.D2": "For a stressed scalp: clay treatment, purifying shampoo and thermal serum.",
      "d.D3": "Sun and sea: shower shampoo, restructuring cream and two-phase spray with UV filter.",
      "d.D4": "For styling: hairspray and modelling paste.",
      "d.D5": "Texturising sea water: waves and volume, like after a day at the beach.",
      "d.D6": "For people who work out and wash often: shower shampoo and restructuring cream.",
      "f.C1": "The black bottles with red bands of the Hard Music line",
      "f.C2": "Bottle and lotion spray of the Soft Music line",
      "f.C3": "The black bottles with orange bands of the Slash Curl line",
      "f.C4": "The six Bowie Color masks: violet, red, copper, chocolate, gold, neutral",
      "f.C5": "Rebel Yellow shampoo and mask, black bottles with violet bands",
      "f.C6": "Beat Smooth fluid and mask, cream-coloured bottles",
      "f.D1": "Shampoo, conditioner and spray of the Natural Sound line",
      "f.D2": "Purifying shampoo and thermal serum of the Chill Out Music line",
      "f.D3": "The black tubes and the spray of the Summer Rock line",
      "f.D4": "The hairspray and the tin of modelling paste",
      "f.D5": "The black and aqua-green Vinyl Wave bottle",
      "f.D6": "Shower shampoo and cream of the Dynamic Groove line",
      "l.piede": "Ask us in the salon which one suits you.",
      "r.eti": "4.6 from 132 Google reviews",
      "r.t": "What people say",
      "rc.1": "Truly exceptional! Especially on curly hair! For many years now I've been going to Mino and Giuliano to look after my hair, and not only are they skilled and up to date on colour, shading and styling (no stiff or old-fashioned hairdos), they're also really good at cutting, especially on my curly/wavy hair, which always has a flawless cut until my next appointment at the hairdresser. Absolutely recommended!!!",
      "rc.f1": "Antinea Consoli · a week ago · 5 stars",
      "rc.2": "I've been a client for over 15 years and that says it all. I've always found great professionalism, skill and attention to the client. Every time I leave the salon satisfied: they understand perfectly what I want and the result is always flawless.<br>Beyond their skill, what makes them special is their friendliness, courtesy, helpfulness and the welcoming atmosphere that makes you feel at home.",
      "rc.f2": "Giusy · a month ago · 5 stars",
      "rc.3": "Thank you Giuliano, you didn't know me and you understood me right away. I only gave you a hint about colour and in a couple of hours you transformed me. Brilliant, trust him and he won't let you down",
      "rc.f3": "Stefania Del prete · 3 months ago · 5 stars",
      "rc.4": "They're number one for cool blonde. After 2 minutes they understood exactly what I wanted! Incredibly kind and professional! Best in town!",
      "rc.f4": "Manuela Rovere · 3 years ago · 5 stars",
      "rc.5": "A unique place, unmatched staff. Mino and Giuliano know how to \"play\" with colours like painters on canvas 😊 top-quality products and men's/women's cuts always with a certain \"je ne sais quoi\" that makes them unique. And let's not forget the background music, which always has its reason 😜",
      "rc.f5": "Olga Goglio · 4 years ago · 5 stars",
      "r.piede": "Public reviews on Google, copied word for word (translated in this English version).",
      "o.eti": "Hours and map",
      "o.cap": "Opening hours",
      "o.lun": "Monday",
      "o.chiuso": "closed",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.chiuso2": "closed",
      "o.p": "On the square with the Frattini stop of the M4 line. Our sign is on the window.",
      "o.pren": "We recommend booking: call us or send us a direct message on Instagram.",
      "o.tel": "Phone",
      "o.igp": "(bookings by direct message)",
      "o.pag": "Payments",
      "o.pagv": "Credit and debit cards, contactless",
      "o.chiama": "Call the salon",
      "o.btn": "Directions",
      "o.mappa": "Map: Angelini Rossetti, Piazza Pietro Frattini 15, Milan",
      "z.cosa": "hairdressers and make-up artists",
      "z.orari": "Tuesday to Saturday 9–19 · Sunday and Monday closed",
      "z.cred": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from their website and their Instagram (the manifesto of 30 July 2026), their Google listing and PagineGialle; public reviews on Google (September 2026); photographs from the Google listing, their Instagram and their website.",
      "x.nav": "Quick actions",
      "x.chiama": "Call",
      "x.mappa": "Map",
      "x.orari": "Hours"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «la selezione» (#208 Angelini Rossetti) ──
  // Il juke-box da tavolo del salone. Stato finale in HTML/CSS (vale senza JS e con reduced-motion): pagine del salone
  // aperte (A | B), tasti A e 1 abbassati, striscia A1 accesa, display «A1 · Velvet Blonde». Con GSAP e senza
  // reduced-motion il JS, sotto l'intro, riporta il juke-box a prima della scelta (in vista le pagine della linea C | D,
  // niente di acceso, tasti su, display vuoto); a fine intro (o quando il juke-box entra in vista) volta la pagina destra
  // sul dorso, abbassa A e poi 1, e la striscia di Velvet Blonde si accende. Poi sceglie il visitatore: una striscia, oppure
  // una lettera e un numero; le frecce voltano pagina. La scheda sotto copia la descrizione dalla voce della pagina (#sel-XX),
  // così segue la lingua.
  var juke = document.getElementById('juke');
  var testoApertura = document.querySelectorAll('.apertura__testo > *');
  var anima = hasGsap && !reducedMotion;
  var introFinita = false;
  if (anima) gsap.set(testoApertura, { opacity: 0, y: 22 });
  function entrataApertura() {
    if (anima) gsap.to(testoApertura, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.08 });
  }
  var parti = function () {};
  if (juke) {
    var fin = document.getElementById('jukeFinestra');
    var pagine = {};
    Array.prototype.forEach.call(fin.children, function (p) { if (p.classList.contains('juke__pagina')) pagine[p.getAttribute('data-lettera')] = p; });
    var tastiL = {}, tastiN = {};
    juke.querySelectorAll('.tasto[data-lettera]').forEach(function (t) { tastiL[t.getAttribute('data-lettera')] = t; });
    juke.querySelectorAll('.tasto[data-numero]').forEach(function (t) { tastiN[t.getAttribute('data-numero')] = t; });
    var elSel = document.getElementById('jukeSel'), elNome = document.getElementById('jukeNome');
    var schedaSel = document.getElementById('schedaSel'), schedaNome = document.getElementById('schedaNome');
    var schedaD = document.getElementById('schedaD'), schedaVai = document.getElementById('schedaVai');
    var COPPIA = { A: 'AB', B: 'AB', C: 'CD', D: 'CD' }, SX = { AB: 'A', CD: 'C' }, DX = { AB: 'B', CD: 'D' };
    var aperto = 'AB', corrente = 'A1', inAttesa = null, occupato = false;

    var striscia = function (sel) {
      var l = sel.charAt(0);
      return pagine[l] ? pagine[l].querySelector('.striscia[data-sel="' + sel + '"]') : null;
    };
    var nomeDi = function (sel) { var s = striscia(sel); return s ? s.querySelector('.striscia__t').textContent.trim() : ''; };
    var mostraCoppia = function (c) {
      aperto = c;
      Object.keys(pagine).forEach(function (l) { pagine[l].classList.toggle('is-su', COPPIA[l] === c); });
    };
    var tastiSu = function () {
      [tastiL, tastiN].forEach(function (g) {
        Object.keys(g).forEach(function (k) { g[k].classList.remove('is-giu'); g[k].setAttribute('aria-pressed', 'false'); });
      });
    };
    var giu = function (t) { if (t) { t.classList.add('is-giu'); t.setAttribute('aria-pressed', 'true'); } };
    var spegni = function () {
      fin.querySelectorAll('.striscia.is-accesa').forEach(function (s) { s.classList.remove('is-accesa'); s.setAttribute('aria-pressed', 'false'); });
      fin.classList.remove('ha-selezione');
      document.querySelectorAll('.sel.is-scelta').forEach(function (s) { s.classList.remove('is-scelta'); });
    };
    var scheda = function (sel) {
      var voce = document.getElementById('sel-' + sel), d = voce && voce.querySelector('.sel__d');
      schedaSel.textContent = sel;
      schedaNome.textContent = nomeDi(sel);
      if (d) schedaD.innerHTML = d.innerHTML;
      schedaVai.setAttribute('href', '#sel-' + sel);
    };
    var accendi = function (sel) {
      var s = striscia(sel);
      if (!s) return;
      spegni();
      s.classList.add('is-accesa');
      s.setAttribute('aria-pressed', 'true');
      fin.classList.add('ha-selezione');
      corrente = sel;
      document.getElementById('jukeScheda').classList.remove('juke__scheda--attesa');
      elSel.textContent = sel;
      elNome.textContent = nomeDi(sel);
      scheda(sel);
      var voce = document.getElementById('sel-' + sel);
      if (voce) voce.classList.add('is-scelta');
      // la lampadina dietro la striscia si scalda: due guizzi e resta accesa
      if (anima) gsap.fromTo(s, { opacity: 0.45 }, { keyframes: [{ opacity: 1, duration: 0.06 }, { opacity: 0.62, duration: 0.07 }, { opacity: 1, duration: 0.08 }, { opacity: 0.8, duration: 0.06 }, { opacity: 1, duration: 0.18 }], clearProps: 'opacity' });
    };
    var clonaPagina = function (l) {
      var c = pagine[l].cloneNode(true);
      c.classList.add('is-su');
      c.classList.remove('juke__pagina--sx', 'juke__pagina--dx');
      c.removeAttribute('data-lettera');
      c.querySelectorAll('[id]').forEach(function (x) { x.removeAttribute('id'); });
      c.querySelectorAll('button').forEach(function (b) { b.setAttribute('tabindex', '-1'); b.removeAttribute('aria-pressed'); b.classList.remove('is-accesa'); });
      return c;
    };
    // volta la pagina verso la coppia c. In avanti: la pagina destra gira sul dorso e va a sinistra (davanti la vecchia
    // destra, dietro la nuova sinistra). All'indietro: la sinistra gira verso destra.
    var volta = function (c, avanti, dopo) {
      if (c === aperto) { if (dopo) dopo(); return; }
      var da = aperto;
      if (!anima) { mostraCoppia(c); if (dopo) dopo(); return; }
      occupato = true;
      var foglio = document.createElement('div');
      foglio.className = 'juke__foglio ' + (avanti ? 'juke__foglio--avanti' : 'juke__foglio--indietro');
      foglio.setAttribute('aria-hidden', 'true');
      var fronte = document.createElement('div'), retro = document.createElement('div'), ombra = document.createElement('span');
      fronte.className = 'juke__faccia juke__faccia--fronte';
      retro.className = 'juke__faccia juke__faccia--retro';
      ombra.className = 'juke__ombra';
      fronte.appendChild(clonaPagina(avanti ? DX[da] : SX[da]));
      fronte.appendChild(ombra);
      retro.appendChild(clonaPagina(avanti ? SX[c] : DX[c]));
      foglio.appendChild(fronte);
      foglio.appendChild(retro);
      fin.appendChild(foglio);
      // sotto il foglio: resta ferma la pagina che non gira, compare quella nuova che il foglio scopre
      Object.keys(pagine).forEach(function (l) {
        var su = avanti ? (l === SX[da] || l === DX[c]) : (l === SX[c] || l === DX[da]);
        pagine[l].classList.toggle('is-su', su);
      });
      gsap.fromTo(ombra, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'sine.in', yoyo: true, repeat: 1 });
      gsap.fromTo(foglio, { rotationY: 0 }, {
        rotationY: avanti ? -180 : 180, duration: 0.95, ease: 'power2.inOut',
        onComplete: function () { mostraCoppia(c); foglio.remove(); occupato = false; if (dopo) dopo(); },
      });
    };
    var dopoUnPo = function (s, f) { if (anima) gsap.delayedCall(s, f); else f(); };

    // scelta del visitatore: la striscia
    fin.addEventListener('click', function (e) {
      var s = e.target.closest('.striscia');
      if (!s || occupato || s.closest('.juke__foglio')) return;
      var sel = s.getAttribute('data-sel');
      tastiSu();
      giu(tastiL[sel.charAt(0)]);
      elSel.textContent = sel.charAt(0) + '–';
      dopoUnPo(0.22, function () { giu(tastiN[sel.charAt(1)]); accendi(sel); inAttesa = null; });
    });
    // oppure una lettera (volta pagina se serve) e poi un numero
    Object.keys(tastiL).forEach(function (l) {
      tastiL[l].addEventListener('click', function () {
        if (occupato) return;
        tastiSu();
        giu(tastiL[l]);
        inAttesa = l;
        elSel.textContent = l + '–';
        elNome.textContent = '';
        volta(COPPIA[l], true);
      });
    });
    Object.keys(tastiN).forEach(function (n) {
      tastiN[n].addEventListener('click', function () {
        if (occupato) return;
        var l = inAttesa || corrente.charAt(0);
        volta(COPPIA[l], true, function () {
          tastiSu();
          giu(tastiL[l]);
          giu(tastiN[n]);
          accendi(l + n);
          inAttesa = null;
        });
      });
    });
    var frecce = { jukePrec: false, jukeSucc: true };
    Object.keys(frecce).forEach(function (id) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', function () { if (!occupato) volta(aperto === 'AB' ? 'CD' : 'AB', frecce[id]); });
    });
    // cambio lingua: la scheda e il display rileggono i testi tradotti
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () { if (fin.classList.contains('ha-selezione')) { elNome.textContent = nomeDi(corrente); scheda(corrente); } });
    });

    if (anima) {
      // sotto l'intro: il juke-box prima della scelta (la scheda aspetta, attenuata)
      document.getElementById('jukeScheda').classList.add('juke__scheda--attesa');
      spegni();
      tastiSu();
      mostraCoppia('CD');
      elSel.textContent = '––';
      elNome.textContent = '';
      var partita = false;
      parti = function () {
        if (partita) return;
        partita = true;
        gsap.delayedCall(0.35, function () {
          volta('AB', true, function () {
            giu(tastiL.A);
            elSel.textContent = 'A–';
            gsap.delayedCall(0.42, function () { giu(tastiN['1']); accendi('A1'); });
          });
        });
      };
      // si guarda la finestra con le strisce, non la cupola: su mobile la cupola spunta già sotto il testo
      var inVista = function () { var r = fin.getBoundingClientRect(); return r.top < window.innerHeight * 0.85 && r.bottom > 0; };
      if (hasST) ScrollTrigger.create({ trigger: fin, start: 'top 85%', once: true, onEnter: function () { if (introFinita) parti(); } });
      window.__arInVista = inVista;
    } else {
      scheda('A1');
    }
  }
  window.bespokeHeroEntrance = function () {
    introFinita = true;
    entrataApertura();
    if (juke && anima && window.__arInVista && window.__arInVista()) parti();
  };

  // lo stato degli orari anche in «Orari e dove»
  var st1 = document.getElementById('orarioStato'), st2 = document.getElementById('orarioStato2');
  if (st1 && st2) {
    var copiaStato = function () { st2.textContent = st1.textContent; };
    copiaStato();
    new MutationObserver(copiaStato).observe(st1, { childList: true, characterData: true, subtree: true });
  }
})();
