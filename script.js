/* ============================================================
   Лендинг «Шкафы для санузла на заказ» — скрипты
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Шапка: фон при скролле + бургер-меню ---------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('navBurger');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
    }
  });

  /* ---------- 2. Активный пункт меню при скролле (scrollspy) ---------- */
  var spy = document.querySelectorAll('.nav__link');
  var sections = [];
  spy.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var sec = document.getElementById(id);
    if (sec) sections.push({ id: id, el: sec, link: a });
  });

  function onScrollSpy() {
    var pos = window.scrollY + 140;
    var current = sections[0] ? sections[0].id : null;
    sections.forEach(function (s) { if (s.el.offsetTop <= pos) current = s.id; });
    sections.forEach(function (s) { s.link.classList.toggle('active', s.id === current); });
  }
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  /* ---------- 3. Появление блоков при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 0.08) + 's';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- 4. Параллакс героя ---------- */
  var parallax = document.querySelector('[data-parallax]');
  if (parallax) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight) parallax.style.transform = 'translateY(' + (y * 0.28) + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- 5. Счётчики в блоке отличий ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var dur = 1200, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCounter(en.target); io2.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { io2.observe(c); });
  }

  /* ---------- 6. Калькулятор стоимости ---------- */
  var cType = document.getElementById('cType');
  var cWidth = document.getElementById('cWidth');
  var cWidthOut = document.getElementById('cWidthOut');
  var cMaterial = document.getElementById('cMaterial');
  var cDrawers = document.getElementById('cDrawers');
  var cLight = document.getElementById('cLight');
  var cMount = document.getElementById('cMount');
  var cPrice = document.getElementById('cPrice');
  var cDeadline = document.getElementById('cDeadline');

  // Базовые цены за «типовой модуль» (примерные). ЗАМЕНИТЬ на реальный прайс.
  var BASE = { tumba: 19000, penal: 24000, sm: 23000, complex: 49000 };
  var MAT = { ldsp: 1, mdf: 1.35, emal: 1.6 };

  function money(n) {
    return Math.round(n).toLocaleString('ru-RU');
  }

  function recalc() {
    var type = cType.value;
    var w = parseInt(cWidth.value, 10) || 60;
    var mat = MAT[cMaterial.value];
    var drawers = parseInt(cDrawers.value, 10) || 0;

    var widthCoef = Math.max(0.7, w / 60);   // ширина относительно типовых 60 см
    var base = BASE[type] * widthCoef * mat;

    base += drawers * 1900;                  // выдвижные ящики (furnitura Blum-класса)
    if (cLight.checked) base += 4500;        // зеркальный фасад + подсветка
    if (cMount.checked) base += 3200;        // установка своей бригадой

    var from = Math.round((base * 0.9) / 100) * 100;
    var to = Math.round((base * 1.18) / 100) * 100;
    cPrice.textContent = money(from) + ' – ' + money(to);

    var days = type === 'complex' ? 30 : 20;
    if (cLight.checked || drawers >= 2) days += 0;
    cDeadline.textContent = days;

    return { base: money(from) };
  }

  ['input', 'change'].forEach(function (ev) {
    cWidth.addEventListener(ev, function () { cWidthOut.value = cWidth.value; recalc(); });
  });
  [cType, cMaterial, cDrawers, cLight, cMount].forEach(function (el) {
    el.addEventListener('change', recalc);
  });
  recalc();

  /* ---------- 7. Кнопка «Зафиксировать цену» → к форме заявки ---------- */
  var fixBtn = document.getElementById('cFixPrice');
  var leadMsg = document.getElementById('lMsg');
  fixBtn.addEventListener('click', function () {
    var p = cPrice.textContent;
    var days = cDeadline.textContent;
    var typeLabel = cType.options[cType.selectedIndex].text;
    var width = cWidth.value;
    var matLabel = cMaterial.options[cMaterial.selectedIndex].text;
    leadMsg.value = 'Хочу зафиксировать цену и дату в договоре.\n' +
      'Что нужно: ' + typeLabel + ', ширина ' + width + ' см, ' + matLabel + '.\n' +
      'Расчёт по сайту: ' + p + ' ₽, срок ~' + days + ' раб. дней.';
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    document.getElementById('lName').focus();
  });

  /* ---------- 8. Форма заявки ---------- */
  var form = document.getElementById('leadForm');
  var fName = document.getElementById('lName');
  var fPhone = document.getElementById('lPhone');
  var fWebsite = document.getElementById('lWebsite');
  var msg = document.getElementById('formMsg');

  function validate() {
    if (!/^[А-ЯЁа-яёA-Za-z\s-]{2,}$/.test(fName.value.trim())) {
      return 'Укажите имя';
    }
    var p = fPhone.value.replace(/[^\d+]/g, '');
    if (p.length < 10) {
      return 'Укажите телефон: минимум 10 цифр';
    }
    return null;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('err');

    // honeypot: если заполнено — это бот, "принимаем" без отправки
    if (fWebsite.value) { msg.textContent = 'Спасибо! Заявка отправлена.'; form.reset(); return; }

    var err = validate();
    if (err) {
      msg.textContent = err;
      msg.classList.add('err');
      return;
    }

    var lead = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: fName.value.trim(),
      phone: fPhone.value.trim(),
      channel: document.getElementById('lChannel').value,
      message: leadMsg.value.trim()
    };

    // 1) Заявка сохраняется локально. Для прод-версии подключите отправку на сервер:
    // fetch('/api/lead', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(lead) })
    //   .then(...)  + уведомление менеджеру (e-mail / Telegram-бот / мессенджер)
    try {
      var leads = JSON.parse(localStorage.getItem('leads') || '[]');
      leads.push(lead);
      localStorage.setItem('leads', JSON.stringify(leads));
    } catch (er) { /* если localStorage недоступен — просто показываем успех */ }

    msg.textContent = 'Спасибо, ' + lead.name + '! Заявка принята. Перезвоним в течение 15 минут в рабочее время.';
    form.reset();
  });

  /* ---------- 9. Маска телефона (лёгкая) ---------- */
  fPhone.addEventListener('input', function () {
    var v = fPhone.value.replace(/[^\d+]/g, '');
    fPhone.value = v.slice(0, 12);
  });
})();