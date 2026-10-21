/* 수호런 추리게임 오프닝 — 그림 몇 장과 글이 넘어가며 이야기를 소개하고, 기기의 한국어 음성으로 읽어 줌
 * SuhoOpening.play(host, slides, {onDone, onSlide})
 *   slides: [{img, text, who?, yr?, pitch?, rate?}]  who가 있으면 대사, 없으면 내레이션
 */
(function () {
  'use strict';
  const KEY = 'suho.voice';
  let voiceOn = true;
  try { voiceOn = localStorage.getItem(KEY) !== 'off'; } catch (e) { }
  const synth = window.speechSynthesis || null;
  let koVoice = null;
  function pickVoice() {
    if (!synth) return null;
    const vs = synth.getVoices().filter(v => /^ko/i.test(v.lang));
    const pref = ['Google 한국의', 'Yuna', 'SunHi', 'Heami', 'InJoon', 'Microsoft', 'Google'];
    for (const p of pref) { const v = vs.find(x => x.name.includes(p)); if (v) return v; }
    return vs[0] || null;
  }
  if (synth) { koVoice = pickVoice(); synth.onvoiceschanged = () => { koVoice = pickVoice(); }; }

  const css = `
  .op{position:absolute;inset:0;z-index:12;background:#000;overflow:hidden;cursor:pointer;-webkit-user-select:none;user-select:none}
  .op .opimg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .9s}
  .op .opimg.on{opacity:1;animation:opkb 12s ease-out forwards}
  @keyframes opkb{from{transform:scale(1.1) translate(1.5%,1%)}to{transform:scale(1) translate(0,0)}}
  .op .shade{position:absolute;inset:0;background:linear-gradient(transparent 45%,rgba(0,0,0,.82));pointer-events:none}
  .op .cap{position:absolute;left:6%;right:6%;bottom:7%;color:#fff6e6;font-family:'Gowun Dodum','Noto Sans KR',sans-serif;font-size:2.6cqw;line-height:1.6;word-break:keep-all;text-shadow:0 .2cqw .6cqw #000;min-height:9cqw}
  .op .cap b{display:block;font-family:'Jua',sans-serif;font-weight:400;color:#ffcf5a;font-size:2.1cqw;margin-bottom:.3cqw}
  .op .yr{position:absolute;left:4%;top:5%;font-family:'Jua',sans-serif;font-size:2.6cqw;color:#f4e6c4;text-shadow:0 .2cqw .6cqw #000;opacity:0;transition:opacity .8s}
  .op .yr.on{opacity:1}
  .op .ctl{position:absolute;right:2%;top:3%;display:flex;gap:1cqw}
  .op .ctl button{font-family:'Jua',sans-serif;font-size:1.7cqw;color:#fff6e6;background:rgba(0,0,0,.45);border:.15cqw solid rgba(255,246,230,.45);border-radius:999px;padding:.4cqw 1.4cqw;cursor:pointer}
  .op .dots{position:absolute;left:50%;bottom:2.4%;transform:translateX(-50%);display:flex;gap:.8cqw}
  .op .dots i{width:.9cqw;height:.9cqw;border-radius:50%;background:rgba(255,246,230,.3)}
  .op .dots i.on{background:#ffcf5a}
  .op .tap{position:absolute;right:6%;bottom:3%;font-size:1.4cqw;color:rgba(255,246,230,.7);font-family:'Gowun Dodum',sans-serif}
  .op .title{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2cqw;text-align:center;opacity:0;transition:opacity 1s}
  .op .title.on{opacity:1}
  .op .title small{font-size:1.8cqw;letter-spacing:.35em;color:#d9c4a6;font-family:'Gowun Dodum',sans-serif}
  .op .title h2{margin:0;font-family:'Jua',sans-serif;font-weight:400;font-size:7cqw;color:#ffcf5a;text-shadow:0 .5cqw 0 #3a230f}
  `;
  let styled = false;

  function speak(text, o, done) {
    if (!synth || !voiceOn) { done && done(false); return; }
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[“”"…]/g, ' '));
      u.lang = 'ko-KR'; if (koVoice) u.voice = koVoice;
      u.rate = o.rate || .98; u.pitch = o.pitch || 1; u.volume = 1;
      let fired = false; const fin = () => { if (!fired) { fired = true; done && done(true); } };
      u.onend = fin; u.onerror = fin;
      synth.speak(u);
      setTimeout(fin, 1500 + text.length * 260);   // 음성이 끝났다는 신호가 안 와도 넘어가도록
    } catch (e) { done && done(false); }
  }

  function play(host, slides, opt) {
    opt = opt || {};
    if (!styled) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); styled = true; }
    const el = document.createElement('div'); el.className = 'op';
    el.innerHTML = `<div class="imgs"></div><div class="shade"></div><div class="yr"></div><div class="title"></div><div class="cap"></div>
      <div class="ctl"><button data-v>${voiceOn ? '🔊 음성' : '🔇 음성'}</button><button data-s>건너뛰기 ▶▶</button></div>
      <div class="dots">${slides.map(() => '<i></i>').join('')}</div><div class="tap">눌러서 넘기기</div>`;
    host.appendChild(el);
    const imgs = slides.map(s => { const i = document.createElement('img'); i.className = 'opimg'; i.src = s.img || ''; i.alt = ''; el.querySelector('.imgs').appendChild(i); return i; });
    let k = -1, timer = null, typing = null, ended = false, token = 0;
    const cap = el.querySelector('.cap'), yr = el.querySelector('.yr'), ttl = el.querySelector('.title');
    function finish() {
      if (ended) return; ended = true; clearTimeout(timer); clearInterval(typing); try { synth && synth.cancel(); } catch (e) { }
      el.style.transition = 'opacity .6s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 650);
      opt.onDone && opt.onDone();
    }
    function next() {
      clearTimeout(timer); clearInterval(typing);
      k++; if (k >= slides.length) { finish(); return; }
      const s = slides[k], my = ++token;
      imgs.forEach((im, i) => { im.classList.toggle('on', i === k); if (i === k) { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; } });
      el.querySelectorAll('.dots i').forEach((d, i) => d.classList.toggle('on', i <= k));
      yr.textContent = s.yr || ''; yr.classList.toggle('on', !!s.yr);
      ttl.innerHTML = s.title ? `<small>${s.title[0]}</small><h2>${s.title[1]}</h2>` : ''; ttl.classList.toggle('on', !!s.title);
      if (opt.onSlide) opt.onSlide(k, s);
      const full = s.text || '';
      cap.innerHTML = (s.who ? `<b>${s.who}</b>` : '') + '<span></span>';
      const sp = cap.querySelector('span'); let n = 0;
      typing = setInterval(() => { n += 1; sp.textContent = full.slice(0, n); if (n >= full.length) clearInterval(typing); }, 45);
      const auto = () => { if (my === token && !ended) timer = setTimeout(next, 1100); };
      if (full) speak(full, s, (spoken) => { if (my !== token) return; if (spoken) auto(); else timer = setTimeout(next, 2600 + full.length * 85); });
      else timer = setTimeout(next, 3200);
    }
    el.addEventListener('click', e => {
      if (e.target.closest('[data-s]')) { finish(); return; }
      if (e.target.closest('[data-v]')) {
        voiceOn = !voiceOn; try { localStorage.setItem(KEY, voiceOn ? 'on' : 'off'); } catch (er) { }
        e.target.textContent = voiceOn ? '🔊 음성' : '🔇 음성'; if (!voiceOn) try { synth && synth.cancel(); } catch (er) { }
        return;
      }
      // 글자가 아직 찍히는 중이면 한 번에 다 보여 주고, 다 보였으면 다음 장
      const sp = cap.querySelector('span'), full = (slides[k] || {}).text || '';
      if (sp && sp.textContent.length < full.length) { clearInterval(typing); sp.textContent = full; return; }
      try { synth && synth.cancel(); } catch (er) { }
      next();
    });
    next();
    return { skip: finish };
  }
  window.SuhoOpening = { play, voiceAvailable: () => !!synth };
})();
