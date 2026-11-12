/* Canteen Management page (canteen-management.html):
   - before / after switch (paper coupons vs IN4 Canteen)
   - meal pricing explorer: price and employee / employer split per meal,
     using the sample rates shown in the meal pricing screen
   - hero: "lunch served today" goes up by one each time a slip prints */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- before / after switch ---- */
  var sw = document.querySelector('.cm-switch');
  if (sw) {
    var tabs = [].slice.call(sw.querySelectorAll('[role="tab"]'));
    var select = function (i, focus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      sw.setAttribute('data-side', i === 0 ? 'old' : 'new');
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select(i ? 0 : 1, true); }
      });
    });
  }

  /* ---- meal pricing explorer ---- */
  var ex = document.querySelector('[data-cm-explorer]');
  if (ex) {
    /* sample rates from the meal pricing screen: price, diner share, employer share */
    var RATES = {
      emp:   { b: [10, 5, 5],  l: [20, 10, 10], d: [15, 8, 7] },
      guest: { b: [10, 0, 10], l: [20, 0, 20],  d: [15, 0, 15] }
    };
    var state = { meal: 'l', who: 'emp' };
    var $ = function (s) { return ex.querySelector(s); };
    var render = function () {
      var r = RATES[state.who][state.meal];
      var a = r[0] ? Math.round(r[1] / r[0] * 100) : 0;
      $('[data-cm-price]').textContent = '₹' + r[0];
      $('[data-cm-a]').textContent = '₹' + r[1];
      $('[data-cm-b]').textContent = '₹' + r[2];
      $('[data-cm-who-label]').textContent = state.who === 'emp' ? 'Employee pays' : 'Guest pays';
      $('[data-cm-bar-a]').style.setProperty('--w', a + '%');
      $('[data-cm-bar-b]').style.setProperty('--w', (100 - a) + '%');
      $('[data-cm-bar-a]').style.display = a ? '' : 'none';
    };
    var group = function (attr) {
      var btns = [].slice.call(ex.querySelectorAll('[data-' + attr + ']'));
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          btns.forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
          state[attr] = b.getAttribute('data-' + attr);
          render();
        });
        b.addEventListener('keydown', function (e) {
          var n = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
          if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + btns.length) % btns.length;
          if (n !== null) { e.preventDefault(); btns[n].click(); btns[n].focus(); }
        });
      });
    };
    group('meal');
    group('who');
    render();
  }

  /* ---- hero: count a meal each time a slip prints (6s loop, slip out at ~3.6s) ---- */
  var count = document.querySelector('[data-cm-count]');
  var hero = document.querySelector('.cm-hero');
  if (count && hero && !reduce) {
    var n = +count.textContent || 186;
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[e.length - 1].isIntersecting; }).observe(hero);
    }
    setTimeout(function () {
      setInterval(function () {
        if (!visible || document.visibilityState !== 'visible') return;
        n += 1;
        count.textContent = n;
      }, 6000);
    }, 3600);
  }
})();
