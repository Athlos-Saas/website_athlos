/* ==========================================================================
   ATHLOS · Sitio informativo — interacciones y formulario
   Sin frameworks: nav móvil, reveal on scroll, contadores animados y
   envío de solicitudes a la tabla `demo_requests` de Supabase.
   El formulario tiene dos tipos de solicitud (columna `request_type`,
   migración 031): 'free_report' (analiza gratis un partido, exige
   `video_url`) y 'demo' (demo guiada).
   ========================================================================== */

(function () {
  'use strict';

  var config = window.ATHLOS_CONFIG || {};
  var CONTACT_EMAIL = config.CONTACT_EMAIL || 'hola@athlos.app';

  /* ---------- Nav: sombra al hacer scroll + menú móvil ---------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 8);
  });

  function setMenu(open) {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }

  navToggle.addEventListener('click', function () {
    setMenu(!navLinks.classList.contains('open'));
  });

  navLinks.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Redes sociales aún sin URL (href="#"): no saltar al inicio ---------- */
  document.querySelectorAll('[data-social-pending]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (link.getAttribute('href') === '#') event.preventDefault();
    });
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

  /* ---------- Formulario: partido gratis / demo ---------- */
  var form = document.getElementById('demoForm');
  var submitButton = document.getElementById('submitBtn');
  var formAlert = document.getElementById('formAlert');
  var formSuccess = document.getElementById('formSuccess');
  var videoField = document.getElementById('videoField');
  var videoInput = document.getElementById('video_url');
  var demoTitle = document.getElementById('demoTitle');
  var demoSub = document.getElementById('demoSub');
  var successTitle = document.getElementById('successTitle');
  var successText = document.getElementById('successText');

  // Textos por tipo de solicitud. Mantener alineado con el check de la
  // migración 031 (request_type in ('demo', 'free_report')).
  var COPY = {
    free_report: {
      title: 'Analiza gratis un partido',
      sub: 'Déjanos el enlace a tu video y te enviamos el reporte con distancias, velocidades, ' +
        'mapa de calor y red de pases. 1 partido gratis, sin tarjeta. ¿Prefieres una demo guiada? Elígela abajo.',
      button: 'Enviar mi partido gratis',
      successTitle: '¡Recibimos tu partido!',
      successText: 'Revisaremos el video y te escribiremos al correo que nos dejaste con tu reporte, ' +
        'o para pedirte algo más si el video no permite medir con fiabilidad.',
      subject: 'Análisis gratis de un partido — ',
    },
    demo: {
      title: 'Ve tus datos convertidos en decisiones',
      sub: 'Cuéntanos quién eres y te contactamos en 24–48 horas para agendar una demo con datos reales.',
      button: 'Solicitar acceso a la demo',
      successTitle: '¡Solicitud recibida!',
      successText: 'Te contactaremos en 24–48 horas para agendar tu demo.',
      subject: 'Solicitud de demo ATHLOS — ',
    },
  };

  // Misma forma que valida la migración 031 en SQL (12–500 caracteres,
  // http(s), dominio con al menos un punto, sin espacios ni < > " ').
  var VIDEO_URL_RE =
    /^https?:\/\/[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+(:[0-9]{2,5})?([/?#][^\s<>"']*)?$/i;

  function isValidVideoUrl(url) {
    return url.length >= 12 && url.length <= 500 && VIDEO_URL_RE.test(url);
  }

  var isSupabaseConfigured =
    config.SUPABASE_URL &&
    config.SUPABASE_ANON_KEY &&
    config.SUPABASE_URL.indexOf('TU-PROYECTO') === -1 &&
    typeof window.supabase !== 'undefined';

  var supabaseClient = isSupabaseConfigured
    ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null;

  function currentType() {
    var checked = form.querySelector('input[name="request_type"]:checked');
    return checked && checked.value === 'demo' ? 'demo' : 'free_report';
  }

  function applyType(type) {
    var copy = COPY[type];
    var isFree = type === 'free_report';
    videoField.hidden = !isFree;
    videoInput.required = isFree;
    if (!isFree) {
      videoInput.classList.remove('invalid');
      videoInput.removeAttribute('aria-invalid');
    }
    demoTitle.textContent = copy.title;
    demoSub.textContent = copy.sub;
    if (!submitButton.disabled) submitButton.textContent = copy.button;
  }

  function setType(type) {
    var radio = form.querySelector('input[name="request_type"][value="' + type + '"]');
    if (radio) radio.checked = true;
    applyType(type);
  }

  form.addEventListener('change', function (event) {
    if (event.target.name === 'request_type') applyType(currentType());
  });

  // Cualquier CTA con data-request-type preselecciona el tipo de solicitud
  // (y, si trae data-prefill, propone un mensaje cuando el campo está vacío).
  document.querySelectorAll('[data-request-type]').forEach(function (link) {
    link.addEventListener('click', function () {
      setType(link.dataset.requestType === 'demo' ? 'demo' : 'free_report');
      if (link.dataset.prefill && !form.message.value.trim()) {
        form.message.value = link.dataset.prefill;
      }
    });
  });

  applyType(currentType());

  function showAlert(message, kind) {
    formAlert.textContent = message;
    formAlert.classList.toggle('info', kind === 'info');
    formAlert.hidden = false;
  }

  function hideAlert() {
    formAlert.hidden = true;
  }

  function readForm() {
    var type = currentType();
    return {
      full_name: form.full_name.value.trim(),
      email: form.email.value.trim(),
      organization: form.organization.value.trim(),
      role: form.role.value || null,
      country: form.country.value.trim() || null,
      team_level: form.team_level.value || null,
      message: form.message.value.trim() || null,
      request_type: type,
      video_url: type === 'free_report' ? videoInput.value.trim() || null : null,
      source: 'website',
    };
  }

  function markField(input, ok) {
    input.classList.toggle('invalid', !ok);
    if (ok) input.removeAttribute('aria-invalid');
    else input.setAttribute('aria-invalid', 'true');
  }

  function validate(data) {
    var firstInvalid = null;
    ['full_name', 'email', 'organization'].forEach(function (fieldName) {
      var input = form[fieldName];
      var fieldOk = Boolean(data[fieldName]) && data[fieldName].length >= 2;
      if (fieldName === 'email') fieldOk = /.+@.+\..+/.test(data.email);
      markField(input, fieldOk);
      if (!fieldOk && !firstInvalid) firstInvalid = input;
    });
    if (data.request_type === 'free_report') {
      var videoOk = Boolean(data.video_url) && isValidVideoUrl(data.video_url);
      markField(videoInput, videoOk);
      if (!videoOk && !firstInvalid) firstInvalid = videoInput;
    }
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function mailtoFallback(data) {
    var body =
      'Tipo: ' + (data.request_type === 'free_report' ? 'Análisis gratis de un partido' : 'Demo guiada') +
      (data.video_url ? '\nVideo: ' + data.video_url : '') +
      '\nNombre: ' + data.full_name +
      '\nCorreo: ' + data.email +
      '\nOrganización: ' + data.organization +
      '\nRol: ' + (data.role || '-') +
      '\nPaís: ' + (data.country || '-') +
      '\nNivel: ' + (data.team_level || '-') +
      '\n\n' + (data.message || '');
    var href =
      'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(COPY[data.request_type].subject + data.organization) +
      '&body=' + encodeURIComponent(body);
    window.location.href = href;
  }

  function legacyPayload(data) {
    var legacy = {};
    Object.keys(data).forEach(function (key) {
      if (key !== 'request_type' && key !== 'video_url') legacy[key] = data[key];
    });
    if (data.request_type === 'free_report') {
      var prefix = '[Análisis gratis de un partido] Video: ' + (data.video_url || '-');
      legacy.message = (prefix + (data.message ? '\n\n' + data.message : '')).slice(0, 2000);
    }
    return legacy;
  }

  function showSuccess(type) {
    successTitle.textContent = COPY[type].successTitle;
    successText.textContent = COPY[type].successText;
    form.hidden = true;
    formSuccess.hidden = false;
    formSuccess.focus();
  }

  function resetButton() {
    submitButton.disabled = false;
    submitButton.textContent = COPY[currentType()].button;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    hideAlert();

    // Honeypot: si un bot lo llenó, fingimos éxito y no hacemos nada.
    if (form.website_url.value) {
      showSuccess(currentType());
      return;
    }

    var data = readForm();
    if (!validate(data)) {
      showAlert(
        data.request_type === 'free_report'
          ? 'Revisa los campos marcados: el enlace al video (https://…), nombre, correo y organización son obligatorios.'
          : 'Revisa los campos marcados: nombre, correo y organización son obligatorios.',
      );
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
        // Si la migración 031 aún no está aplicada, PostgREST no conoce las
        // columnas nuevas (PGRST204). Para no perder la solicitud, se reenvía
        // con el formato anterior y el tipo/enlace dentro del mensaje.
        if (result.error && result.error.code === 'PGRST204') {
          return supabaseClient.from('demo_requests').insert(legacyPayload(data));
        }
        return result;
      })
      .then(function (result) {
        if (result.error) {
          showAlert('No pudimos registrar tu solicitud (' + result.error.message + '). Intenta de nuevo o escríbenos a ' + CONTACT_EMAIL + '.');
          resetButton();
          return;
        }
        showSuccess(data.request_type);
      })
      .catch(function () {
        showAlert('Error de red. Intenta de nuevo en unos segundos.');
        resetButton();
      });
  });
})();
