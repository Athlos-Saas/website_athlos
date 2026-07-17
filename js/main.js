/* ==========================================================================
   ATLOS · Sitio informativo — interacciones y formulario de demo
   Sin frameworks: nav móvil, reveal on scroll, contadores animados y
   envío de solicitudes a la tabla `demo_requests` de Supabase.
   ========================================================================== */

(function () {
  'use strict';

  var config = window.ATLOS_CONFIG || {};

  /* ---------- Nav: sombra al hacer scroll + menú móvil ---------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  });

  navToggle.addEventListener('click', function () {
    var isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') navLinks.classList.remove('open');
  });

  /* ---------- Reveal on scroll ---------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll('.reveal').forEach(function (element) {
    revealObserver.observe(element);
  });

  /* ---------- Contadores animados ---------- */
  function animateCounter(element) {
    var target = parseFloat(element.dataset.count);
    var decimals = parseInt(element.dataset.decimals || '0', 10);
    var suffix = element.dataset.suffix || '';
    var duration = 1400;
    var start = performance.now();

    function frame(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (target * eased).toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 },
  );
  document.querySelectorAll('[data-count]').forEach(function (element) {
    counterObserver.observe(element);
  });

  /* ---------- Año del footer ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Formulario de demo ---------- */
  var form = document.getElementById('demoForm');
  var submitButton = document.getElementById('submitBtn');
  var formAlert = document.getElementById('formAlert');
  var formSuccess = document.getElementById('formSuccess');

  var isSupabaseConfigured =
    config.SUPABASE_URL &&
    config.SUPABASE_ANON_KEY &&
    config.SUPABASE_URL.indexOf('TU-PROYECTO') === -1 &&
    typeof window.supabase !== 'undefined';

  var supabaseClient = isSupabaseConfigured
    ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null;

  function showAlert(message, kind) {
    formAlert.textContent = message;
    formAlert.classList.toggle('info', kind === 'info');
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.hidden = true;
  }

  function readForm() {
    return {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      organization: form.organization.value.trim(),
      role: form.role.value || null,
      country: form.country.value.trim() || null,
      team_level: form.team_level.value || null,
      message: form.message.value.trim() || null,
      source: 'website',
    };
  }

  function validate(data) {
    var isValid = true;
    ['full_name', 'email', 'organization'].forEach(function (fieldName) {
      var input = form[fieldName];
      var fieldOk = Boolean(data[fieldName]) && data[fieldName].length >= 2;
      if (fieldName === 'email') fieldOk = /.+@.+\..+/.test(data.email);
      input.classList.toggle('invalid', !fieldOk);
      if (!fieldOk) isValid = false;
    });
    return isValid;
  }

  function mailtoFallback(data) {
    var body =
      'Nombre: ' + data.full_name +
      '\nCorreo: ' + data.email +
      '\nOrganización: ' + data.organization +
      '\nRol: ' + (data.role || '-') +
      '\nPaís: ' + (data.country || '-') +
      '\nNivel: ' + (data.team_level || '-') +
      '\n\n' + (data.message || '');
    var href =
      'mailto:' + (config.CONTACT_EMAIL || 'hola@atlos.app') +
      '?subject=' + encodeURIComponent('Solicitud de demo ATLOS — ' + data.organization) +
      '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideAlert();

    // Honeypot: si un bot lo llenó, fingimos éxito y no hacemos nada.
    if (form.website_url.value) {
      form.hidden = true;
      formSuccess.hidden = false;
      return;
    }

    var data = readForm();
    if (!validate(data)) {
      showAlert('Revisa los campos marcados: nombre, correo y organización son obligatorios.');
      return;
    }

    if (!supabaseClient) {
      // Sin Supabase configurado: abrir el correo como respaldo.
      mailtoFallback(data);
      showAlert(
        'Se abrió tu cliente de correo para enviar la solicitud. ' +
          '(Para captura automática, configura js/config.js con tu proyecto de Supabase).',
        'info',
      );
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Enviando…';

    supabaseClient
      .from('demo_requests')
      .insert(data)
      .then(function (result) {
        if (result.error) {
          showAlert('No pudimos registrar tu solicitud (' + result.error.message + '). Intenta de nuevo o escríbenos a ' + (config.CONTACT_EMAIL || 'hola@atlos.app') + '.');
          submitButton.disabled = false;
          submitButton.textContent = 'Solicitar acceso a la demo';
          return;
        }
        form.hidden = true;
        formSuccess.hidden = false;
      })
      .catch(function () {
        showAlert('Error de red. Intenta de nuevo en unos segundos.');
        submitButton.disabled = false;
        submitButton.textContent = 'Solicitar acceso a la demo';
      });
  });
})();
