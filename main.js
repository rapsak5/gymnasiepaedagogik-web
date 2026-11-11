/* gymnasiepædagogik.dk: små animationer. Siden virker fuldt uden dette script. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('no-motion');

  // Overskrift ord for ord
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement('span');
            s.className = 'w'; s.style.setProperty('--i', i++); s.textContent = part;
            frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName.toLowerCase() !== 'svg') {
          walk(n);
        }
      });
    })(el);
    return i;
  }
  var h1 = document.querySelector('.split');
  if (h1 && !reduce) splitWords(h1);
  requestAnimationFrame(function () { document.querySelector('.hero').classList.add('drawn'); });

  document.querySelectorAll('.note').forEach(function (n, i) { n.style.setProperty('--n', i); });

  // Scroll-reveal
  var targets = document.querySelectorAll('main section h2, main section .kicker, main section > .inner > p, .card, .panel li, .panel, .rule, .process, .span-fig .roles, .span-fig .room, .pocket, .lesson, .checklist li, details, .faq .qa, .source, .tldr .callout, .cta, main section h3:not(.card h3):not(.panel h3):not(.qa h3):not(.source h3)');
  targets.forEach(function (el) {
    el.classList.add('reveal');
    var sib = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.tagName === el.tagName; }) : [];
    var idx = sib.indexOf(el);
    if (sib.length > 1 && idx > -1) el.style.setProperty('--d', Math.min(idx, 6) * 90 + 'ms');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  // Header: fremdrift, skygge, aktivt menupunkt, til toppen
  var header = document.querySelector('header.site');
  var bar = document.querySelector('.progress');
  var totop = document.querySelector('.totop');
  var links = Array.prototype.slice.call(document.querySelectorAll('nav a[href^="#"]'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.setProperty('--p', h > 0 ? Math.min(1, y / h) : 0);
    header.classList.toggle('scrolled', y > 8);
    if (totop) totop.classList.toggle('show', y > window.innerHeight * 1.2);
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) current = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (totop) totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  // Sedlerne følger musen en smule
  var wrap = document.querySelector('.notes .wrap');
  var hero = document.querySelector('.hero');
  if (wrap && hero && !reduce && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      wrap.style.setProperty('--mx', (x * -18).toFixed(1) + 'px');
      wrap.style.setProperty('--my', (y * -14).toFixed(1) + 'px');
    });
    hero.addEventListener('pointerleave', function () { wrap.style.setProperty('--mx', '0px'); wrap.style.setProperty('--my', '0px'); });
  }

  // Skiftere: tommelfingerreglen og skriveprocessen
  function switcher(box, from, to, texts) {
    if (!box) return;
    var btns = box.querySelectorAll('.toggle button');
    var out = box.querySelector('.outcome');
    var touched = false;
    function set(state) {
      box.setAttribute('data-state', state);
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === state ? 'true' : 'false'); });
      if (out && texts) out.innerHTML = '<span>' + texts[state] + '</span>';
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { touched = true; set(b.getAttribute('data-v')); }); });
    if ('IntersectionObserver' in window && !reduce) {
      set(from);
      var ro = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { ro.disconnect(); setTimeout(function () { if (!touched) set(to); }, 1400); }
      }, { threshold: 0.5 });
      ro.observe(box);
    } else { set(to); }
  }
  switcher(document.querySelector('[data-rule]'), 'for', 'med', { 'for': 'Eleven lærer mindre.', 'med': 'Eleven lærer mere.' });
  switcher(document.querySelector('[data-process]'), 'hjem', 'time');

  // Menu på mobil
  var mbtn = document.querySelector('.menubtn'), sheet = document.getElementById('menu');
  if (mbtn && sheet) {
    function openMenu(o) {
      mbtn.setAttribute('aria-expanded', o ? 'true' : 'false');
      sheet.hidden = !o;
      mbtn.querySelector('use').setAttribute('href', o ? '#i-close' : '#i-menu');
    }
    mbtn.addEventListener('click', function () { openMenu(sheet.hidden); });
    sheet.addEventListener('click', function (e) { if (e.target.closest('a')) openMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') openMenu(false); });
  }
})();
