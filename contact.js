// Email chooser: mailto: links depend on the visitor having a default mail app,
// which many don't. Intercept them and offer webmail + copy fallbacks.
(function () {
  var menu, current, anchor;

  function build() {
    menu = document.createElement('div');
    menu.className = 'mail-menu';
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', 'Contact options');
    menu.hidden = true;
    menu.innerHTML =
      '<div class="mail-addr mono"></div>' +
      '<a class="mail-opt" data-kind="gmail" target="_blank" rel="noopener">Open in Gmail ↗</a>' +
      '<a class="mail-opt" data-kind="outlook" target="_blank" rel="noopener">Open in Outlook ↗</a>' +
      '<a class="mail-opt" data-kind="app">Use default mail app</a>' +
      '<button type="button" class="mail-opt" data-kind="copy">Copy address</button>';
    document.body.appendChild(menu);

    menu.addEventListener('click', function (e) {
      var opt = e.target.closest('.mail-opt');
      if (!opt) return;
      if (opt.dataset.kind === 'copy') {
        copy(current, opt);
      } else {
        close();
      }
    });
  }

  function open(link) {
    if (!menu) build();
    current = decodeURIComponent(link.getAttribute('href').slice(7).split('?')[0]);
    var to = encodeURIComponent(current);
    menu.querySelector('.mail-addr').textContent = current;
    menu.querySelector('[data-kind=gmail]').href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + to;
    menu.querySelector('[data-kind=outlook]').href = 'https://outlook.live.com/mail/0/deeplink/compose?to=' + to;
    menu.querySelector('[data-kind=app]').href = 'mailto:' + current;
    var copyBtn = menu.querySelector('[data-kind=copy]');
    copyBtn.textContent = 'Copy address';

    menu.hidden = false;
    anchor = link;
    place();
    menu.querySelector('.mail-opt').focus({ preventScroll: true });
  }

  function place() {
    if (!menu || menu.hidden) return;
    var r = anchor.getBoundingClientRect();
    var w = menu.offsetWidth, h = menu.offsetHeight;
    var left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var top = r.bottom + 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 8);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
  }

  function close() {
    if (menu) menu.hidden = true;
  }

  function copy(text, btn) {
    function done() { btn.textContent = 'Copied!'; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else {
      fallback(text);
      done();
    }
  }

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="mailto:"]');
    if (link && !link.closest('.mail-menu')) {
      e.preventDefault();
      open(link);
    } else if (menu && !menu.hidden && !e.target.closest('.mail-menu')) {
      close();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
  window.addEventListener('resize', place);
  window.addEventListener('scroll', place, { passive: true });
})();
