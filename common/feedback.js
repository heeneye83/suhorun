/* 수호런 공통 — 결과 화면('다시 하기/달리기/도전' 버튼 옆)에 익명 피드백 설문 버튼을 붙입니다.
 * 설문 주소는 common/sites.js 의 feedbackUrl 하나만 고치면 모든 게임에 반영됩니다.
 */
(function () {
  var url = (window.SUHO && window.SUHO.feedbackUrl) || '';
  if (!url) return;
  var LABEL = '익명 피드백 남기기 (3분)';

  function isRetry(b) {
    return (b.id === 'go' || b.id === 'again') && /^\s*다시/.test(b.textContent || '');
  }

  function attach(btn) {
    var row = btn.parentElement;
    if (!row || !row.parentElement) return;
    var host = row.parentElement;
    if (host.querySelector('[data-suho-fb]')) return;
    var wrap = document.createElement('div');
    wrap.setAttribute('data-suho-fb', '');
    wrap.style.cssText = 'text-align:center;margin:.8em 0 0';
    var a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '📝 ' + LABEL;
    a.style.cssText = 'display:inline-block;padding:.5em 1.1em;border-radius:999px;background:#fff;color:#3a230f;' +
      'border:2px solid #3a230f;font-weight:700;font-size:clamp(13px,1.6vw,18px);text-decoration:none;line-height:1.3;cursor:pointer';
    ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'].forEach(function (ev) {
      a.addEventListener(ev, function (e) { e.stopPropagation(); }, { passive: true });
    });
    wrap.appendChild(a);
    row.insertAdjacentElement('afterend', wrap);
  }

  function scan() {
    var bs = document.querySelectorAll('button#go, button#again');
    for (var i = 0; i < bs.length; i++) if (isRetry(bs[i])) attach(bs[i]);
  }

  function boot() {
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
