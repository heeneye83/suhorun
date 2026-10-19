/* 산사 수호런 — 게임 규칙(코어). 화면과 분리돼 있어서 노드에서 봇으로 난이도를 시뮬레이션할 수 있습니다.
 * 좌표: x는 오른쪽으로 갈수록 커지는 트랙 위치(px), y는 땅에서 위로 올라간 높이(px).
 * 난이도는 DIFF, 조작 감각·속도는 P 만 고치면 됩니다.
 */
(function (root) {
  'use strict';

  const STAGE_LEN = 17000;                       // 한 스테이지 길이
  const KINDS = ['baegyang_a', 'samgwang_a', 'sky', 'baegyang_b', 'samgwang_b'];   // 백양산 2 · 삼광사 2 · 하늘 1
  const KIND_NAMES = {
    baegyang_a: '백양산 숲길', samgwang_a: '삼광사 마당', sky: '구름 하늘길',
    baegyang_b: '백양산 능선', samgwang_b: '삼광사 대웅전 앞',
  };
  const kindOf = (stage) => KINDS[(Math.max(1, stage) - 1) % KINDS.length];

  // ---- 조작 감각 · 속도 ----
  const P = {
    base: 440,            // 기본 달리기 속도 (px/s) — 다른 수호런보다 빠르게
    sprintMul: 1.45,      // 스프린트 배율
    gravity: 2800, jumpV: 870, cutG: 2.3,     // 점프 (손을 떼면 낮게 뜀)
    coyote: 0.09, buffer: 0.12,
    hitHalfW: 22, standH: 112, slideH: 40, slideT: 0.6,
    knockT: 0.30, knockV: 520, slowT: 1.2, slowMin: 0.55, invul: 1.0,   // 부딪히면: 뒤로 튕김 → 잠깐 느려짐 (라이프 없음)
    energyMax: 100, drain: 30, regen: 9, regenDelay: 0.5, drinkEnergy: 45, hasteT: 2.4,  // 스프린트 에너지 / 에너지 음료
    fallY: -140, pickY: -140, rescueT: 1.3,    // 구덩이·구름 밑으로 떨어지면 볼트가 끌어올림
    stageSpeed: 0.09, timeSpeed: 0.0016, timeSpeedCap: 0.30, maxMult: 1.55,   // 스테이지·시간이 지날수록 빨라짐
    catchDx: 50,
    countdown: 2.4,
  };

  // ---- 난이도: 제한 시간 안에 산신령을 못 잡으면 끝 ----
  const DIFF = {
    easy:   { name: '쉬움',   limit: 240, spiritF: 1.03, gap0: 2300, drinkP: 0.75, spacing: 1.15, hint: '산신령이 느긋해요' },
    normal: { name: '보통',   limit: 180, spiritF: 1.05,  gap0: 2600, drinkP: 0.60, spacing: 1.0,  hint: '잘 달리면 3스테이지 안에 잡을 수 있어요' },
    hard:   { name: '어려움', limit: 150, spiritF: 1.085, gap0: 2800, drinkP: 0.45, spacing: 0.9,  hint: '빈틈없이 달려야 잡아요' },
  };

  const RACERS = {
    dongja: { name: '동자승', f: 0.80, w: 48, h: 82 },
    young:  { name: '젊은승', f: 0.90, w: 52, h: 104 },
    old:    { name: '늙은승', f: 0.70, w: 52, h: 96 },
    turtle: { name: '거북이', f: 0.52, w: 86, h: 56 },
    rabbit: { name: '토끼',   f: 0.88, w: 52, h: 84 },
    deer:   { name: '사슴',   f: 0.97, w: 78, h: 104 },
    spirit: { name: '산신령', f: 1.0,  w: 60, h: 128 },
  };
  const FIELD = ['dongja', 'young', 'old', 'turtle', 'rabbit', 'deer'];

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mult = (stage, t) => Math.min(P.maxMult, (1 + P.stageSpeed * (stage - 1)) * (1 + Math.min(P.timeSpeedCap, P.timeSpeed * t)));

  function create(opts) {
    opts = opts || {};
    const cfg = DIFF[opts.difficulty] || DIFF.normal;
    const seed = (opts.seed == null ? (Math.random() * 1e9) | 0 : opts.seed) >>> 0;
    const rnd = rng(seed);
    const g = {
      cfg, seed, rnd, storeCount: opts.storeCount || 6,
      state: 'ready', readyT: P.countdown, t: 0, stage: 1,
      events: [],
      obs: [], pits: [], items: [], genX: 1300, pat: 0, couponSeq: 0,
      p: {
        x: 0, y: 0, vy: 0, v: 0, energy: P.energyMax, sprinting: false, sprintDelay: 0, haste: 0,
        slideT: 0, slideQueued: false, knock: 0, slow: 0, slowMin: P.slowMin, invul: 0, coyote: 0, jumpBuf: 0,
        rescue: null, grounded: true, jumping: false, hits: 0, falls: 0, coupons: 0, drinks: 0, couponSet: {},
      },
      input: { jumpHeld: false, sprint: false },
      racers: [],
      spirit: { id: 'spirit', x: cfg.gap0, y: 0, v: 0, surge: 0, breather: 0, nextSurge: 9 + rnd() * 5, hop: 0, phase: rnd() * 6 },
      obsIdx: 0, itemIdx: 0,
      result: null,
    };
    gen(g, 7000);
    for (let i = 0; i < FIELD.length; i++) g.racers.push(newRacer(g, FIELD[i], 520 + i * 430));
    g.api = api(g);
    return g;
  }

  // ------------------------------------------------------------------ 트랙 만들기
  function inPit(g, x, shrink) {
    const s = shrink == null ? 14 : shrink, a = g.pits;
    let lo = 0, hi = a.length - 1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1, q = a[m];
      if (x < q.x0 + s) hi = m - 1; else if (x > q.x1 - s) lo = m + 1; else return q;
    }
    return null;
  }

  function reward(g, x, y) {
    g.pat++; g.sc = (g.sc || 0) + 1;
    const r = g.rnd();
    let type = null;
    if (g.pat % 3 === 0) { if (r < g.cfg.drinkP) type = 'drink'; }                 // 에너지 음료: 3번째 장애물마다 기회
    else if (g.sc >= 3 && r < 0.85) { type = 'coupon'; g.sc = 0; }                  // 쿠폰: 서너 장애물에 하나꼴 (한 스테이지에 3~4장)
    if (!type) return;
    const it = { x, y, type, taken: false };
    if (type === 'coupon') it.store = g.couponSeq++ % g.storeCount;
    g.items.push(it);
  }

  function gen(g, until) {
    const rnd = g.rnd;
    while (g.genX < until) {
      const x = g.genX, stage = Math.floor(x / STAGE_LEN) + 1, kind = kindOf(stage);
      const m = mult(stage, 40 + stage * 30);     // 그 스테이지에서 쯤의 속도
      const sec = (s) => s * P.base * m * 1.12;    // s초 동안 달리는 거리
      const sky = kind === 'sky';
      const w = [['rocks', 3], ['pit', sky ? 6 : 3], ['hang', 2.2], ['flat', 0.8]];
      if (stage >= 2) w.push(['pitblock', 2], ['hangblock', 2], ['stack', 1.6]);
      if (stage >= 3) w.push(['dblpit', sky ? 3 : 1.6]);
      let tot = 0; for (const e of w) tot += e[1];
      let r = rnd() * tot, kindP = 'rocks';
      for (const e of w) { r -= e[1]; if (r <= 0) { kindP = e[0]; break; } }
      let len = 0;
      const blockAt = (cx, tall) => {
        const o = { x: cx, w: tall ? 64 : 56, h: tall ? 98 : 62, oy: 0, type: tall ? 'tall' : 'block', skin: (rnd() * 3) | 0 };
        g.obs.push(o); return o;
      };
      const hangAt = (cx) => { const o = { x: cx, w: 74, h: 400, oy: 50, type: 'hang', skin: (rnd() * 2) | 0 }; g.obs.push(o); return o; };
      const pitAt = (cx) => {
        const wd = (165 + rnd() * 55) * (1 + 0.05 * (stage - 1));
        g.pits.push({ x0: cx, x1: cx + wd }); return wd;
      };
      if (kindP === 'rocks') {
        const n = rnd() < 0.42 ? 2 : 1; let cx = x;
        for (let i = 0; i < n; i++) {
          const o = blockAt(cx, rnd() < 0.3);
          if (i === 0) reward(g, cx + o.w / 2, 170);
          cx += sec(0.8);
        }
        len = cx - x;
      } else if (kindP === 'pit') {
        const wd = pitAt(x + 40); reward(g, x + 40 + wd / 2, 150); len = wd + 120;
      } else if (kindP === 'hang') {
        const o = hangAt(x + 40); reward(g, x + 40 + o.w / 2, 30); len = 150;
      } else if (kindP === 'flat') {
        reward(g, x + 60, 52); reward(g, x + 60 + sec(0.9), 52); len = sec(1.0);
      } else if (kindP === 'pitblock') {
        const wd = pitAt(x + 40); blockAt(x + 40 + wd + sec(0.62), false); reward(g, x + 40 + wd / 2, 150); len = wd + sec(0.62) + 120;
      } else if (kindP === 'hangblock') {
        const o = hangAt(x + 40); blockAt(x + 40 + o.w + sec(0.6), rnd() < 0.4); reward(g, x + 40 + o.w / 2, 30); len = o.w + sec(0.6) + 130;
      } else if (kindP === 'stack') {
        const o1 = blockAt(x + 40, true); const o2 = blockAt(x + 40 + sec(0.72), false); reward(g, o1.x + o1.w / 2, 190); len = sec(0.72) + 150;
      } else if (kindP === 'dblpit') {
        const w1 = pitAt(x + 40); const x2 = x + 40 + w1 + sec(0.58); const w2 = pitAt(x2);
        reward(g, x2 + w2 / 2, 150); len = x2 + w2 - x + 120;
      }
      g.genX = x + len + sec((0.62 + rnd() * 0.75) * g.cfg.spacing);
    }
  }

  function clearSpot(g, x, pad) {
    for (const q of g.pits) if (q.x1 > x - pad && q.x0 < x + pad) return false;
    for (const o of g.obs) if (o.x + o.w > x - pad && o.x < x + pad) return false;
    return true;
  }

  function newRacer(g, id, x) {
    const d = RACERS[id];
    for (let k = 0; k < 14 && !clearSpot(g, x, 260); k++) x += 130;
    return { id, x, y: 0, vy: 0, w: d.w, h: d.h, f: d.f * (0.96 + g.rnd() * 0.08), hop: 0, slide: 0,
      mode: 'run', modeT: 1 + g.rnd() * 2, ph: g.rnd() * 6 };
  }

  // ------------------------------------------------------------------ 한 프레임
  function update(g, dt) {
    dt = Math.min(dt, 1 / 30);
    if (g.state === 'ready') { g.readyT -= dt; if (g.readyT <= 0) { g.state = 'run'; g.events.push({ type: 'go' }); } return; }
    if (g.state !== 'run') return;
    const p = g.p, inp = g.input;
    g.t += dt;
    const stage = Math.max(1, Math.floor(p.x / STAGE_LEN) + 1);
    if (stage !== g.stage) { g.stage = stage; g.events.push({ type: 'stage', stage, kind: kindOf(stage) }); }
    g.maxStage = Math.max(g.maxStage || 1, stage);
    const base = P.base * mult(stage, g.t);
    gen(g, p.x + 6000);

    p.invul = Math.max(0, p.invul - dt);
    p.haste = Math.max(0, p.haste - dt);
    if (p.rescue) updateRescue(g, dt, base); else updatePlayer(g, dt, base, stage);
    updateField(g, dt, base);

    // 아이템
    const items = g.items;
    while (g.itemIdx < items.length && items[g.itemIdx].x < p.x - 300) g.itemIdx++;
    const cy = p.y + (p.slideT > 0 ? 22 : 56);
    for (let i = g.itemIdx; i < items.length && items[i].x < p.x + 80; i++) {
      const it = items[i];
      if (it.taken) continue;
      if (Math.abs(it.x - p.x) < 46 && Math.abs(it.y - cy) < 54) {
        it.taken = true;
        if (it.type === 'coupon') { p.coupons++; p.couponSet[it.store] = true; g.events.push({ type: 'coupon', store: it.store, x: it.x, y: it.y }); }
        else { p.drinks++; p.energy = Math.min(P.energyMax, p.energy + P.drinkEnergy); p.haste = P.hasteT; g.events.push({ type: 'drink', x: it.x, y: it.y }); }
      }
    }

    // 산신령을 만지면 끝(잡았다!)
    if (Math.abs(g.spirit.x - p.x) < P.catchDx) { finish(g, 'win'); return; }
    if (g.t >= g.cfg.limit) { finish(g, 'timeout'); }
  }

  function updatePlayer(g, dt, base, stage) {
    const p = g.p, inp = g.input;
    p.coyote = Math.max(0, p.coyote - dt);
    p.jumpBuf = Math.max(0, p.jumpBuf - dt);
    p.knock = Math.max(0, p.knock - dt);
    p.slow = Math.max(0, p.slow - dt);
    p.sprintDelay = Math.max(0, p.sprintDelay - dt);
    p.slideT = Math.max(0, p.slideT - dt);

    // 스프린트
    let sprint = false;
    if (p.knock <= 0) {
      if (p.haste > 0) sprint = true;
      else if (inp.sprint && p.energy > 0) { sprint = true; p.energy = Math.max(0, p.energy - P.drain * dt); p.sprintDelay = P.regenDelay; }
    }
    if (!sprint && p.sprintDelay <= 0 && !(inp.sprint && p.energy > 0)) p.energy = Math.min(P.energyMax, p.energy + P.regen * dt);
    p.sprinting = sprint;

    let v;
    if (p.knock > 0) v = -P.knockV * (p.knock / P.knockT);
    else {
      const k = p.slow > 0 ? p.slowMin + (1 - p.slowMin) * (1 - p.slow / P.slowT) : 1;
      v = base * (sprint ? P.sprintMul : 1) * k;
    }
    p.v = v;
    p.x = Math.max(0, p.x + v * dt);

    // 점프 · 슬라이드
    const surf0 = surface(g, p.x, p.y);
    const grounded = surf0 > -Infinity && p.y <= surf0 + 0.5 && p.vy <= 0;
    if (grounded) p.coyote = P.coyote;
    if (p.jumpBuf > 0 && p.coyote > 0 && p.knock <= 0) {
      p.vy = P.jumpV; p.y = Math.max(p.y, surf0 > -Infinity ? surf0 : 0) + 0.01; p.coyote = 0; p.jumpBuf = 0; p.slideT = 0; p.jumping = true;
      g.events.push({ type: 'jump' });
    }
    if (p.slideReq) {
      p.slideReq = false;
      if (grounded && p.knock <= 0) { if (p.slideT <= 0) g.events.push({ type: 'slide' }); p.slideT = P.slideT; }
      else if (!grounded) { p.vy = Math.min(p.vy, -1000); p.slideQueued = true; }
    }

    // 중력 (뗀 점프는 낮게)
    let gr = P.gravity;
    if (p.vy > 0 && !inp.jumpHeld) gr *= P.cutG;
    p.vy -= gr * dt;
    const py0 = p.y;
    p.y += p.vy * dt;
    const surf = surface(g, p.x, py0);
    if (surf > -Infinity && p.y <= surf && p.vy <= 0) {
      p.y = surf; p.vy = 0; p.jumping = false;
      if (p.slideQueued) { p.slideQueued = false; p.slideT = P.slideT; g.events.push({ type: 'slide' }); }
    } else if (surf === -Infinity && p.y < P.fallY) {
      startRescue(g); return;
    }

    // 장애물 부딪힘
    const o = hitObstacle(g, p);
    if (o && p.invul <= 0) bump(g, 'obstacle', o);
    // 같이 달리는 친구들과 부딪힘
    if (p.invul <= 0) {
      const ph = p.slideT > 0 ? P.slideH : P.standH;
      for (const r of g.racers) {
        if (r.x + r.w * 0.5 < p.x - 8) continue;           // 뒤에서 앞질러 가는 친구는 뛰어넘어 감
        if (Math.abs(r.x - p.x) < r.w * 0.36 + P.hitHalfW && p.y < r.h * 0.66 - 14) { bump(g, 'racer', r); break; }
      }
    }
  }

  function surface(g, x, y) {
    let s = inPit(g, x) ? -Infinity : 0;
    const a = g.obs;
    for (let i = g.obsIdx; i < a.length && a[i].x < x + 40; i++) {
      const o = a[i];
      if (o.type === 'hang' || o.x + o.w < x - 14 || o.x > x + 14) continue;
      if (y >= o.h - 16 && o.h > s) s = o.h;
    }
    for (const r of g.racers) {                          // 같이 달리는 친구 머리 위도 밟고 지나갈 수 있다
      const top = r.h * 0.66;                 // 친구가 뛰어도 몸통 높이는 땅 기준
      if (Math.abs(r.x - x) < r.w * 0.36 + 14 && y >= top - 16 && top > s) s = top;
    }
    return s;
  }

  function hitObstacle(g, p) {
    const a = g.obs;
    while (g.obsIdx < a.length && a[g.obsIdx].x + a[g.obsIdx].w < p.x - 400) g.obsIdx++;
    const x0 = p.x - P.hitHalfW, x1 = p.x + P.hitHalfW, y0 = p.y, y1 = p.y + (p.slideT > 0 ? P.slideH : P.standH);
    for (let i = g.obsIdx; i < a.length && a[i].x < x1 + 10; i++) {
      const o = a[i];
      if (x1 <= o.x || x0 >= o.x + o.w) continue;
      if (o.type === 'hang') { if (y1 > o.oy) return o; }
      else if (y0 < o.h - 14) return o;
    }
    return null;
  }

  function bump(g, kind, o) {
    const p = g.p;
    p.knock = P.knockT; p.slow = P.slowT; p.slowMin = P.slowMin; p.invul = P.invul; p.slideT = 0; p.hits++;
    if (kind === 'obstacle' && o.type !== 'hang' && p.x > o.x - 24) p.x = Math.min(p.x, o.x - 24);
    if (kind === 'obstacle' && o.type === 'hang') p.x = Math.min(p.x, o.x - 24);
    g.events.push({ type: 'hit', kind, id: kind === 'racer' ? o.id : o.type, x: p.x, y: p.y + 60 });
  }

  function startRescue(g) {
    const p = g.p;
    const pit = inPit(g, p.x, -40) || inPit(g, p.x, 0);
    const x1 = (pit ? pit.x1 : p.x) + 80;
    p.rescue = { t: 0, x0: p.x, x1: Math.max(x1, p.x + 120), y0: P.pickY };
    p.y = P.pickY; p.vy = 0; p.knock = 0; p.slideT = 0; p.slideQueued = false; p.falls++;
    g.events.push({ type: 'fall', x: p.x });
  }

  function updateRescue(g, dt, base) {
    const p = g.p, r = p.rescue;
    r.t += dt;
    const T = P.rescueT, a = T * 0.34, b = T * 0.86;
    p.v = base * 0.6;
    if (r.t < a) { p.x = r.x0; p.y = P.pickY; }                                  // 볼트가 내려와 잡는다
    else if (r.t < b) {                                                          // 끌어올려 구덩이 건너편에 내려놓는다
      const k = (r.t - a) / (b - a), e = k * k * (3 - 2 * k);
      p.x = r.x0 + (r.x1 - r.x0) * e; p.y = P.pickY + (70 - P.pickY) * e;
    } else {
      p.x = r.x1; p.y = 70; p.vy = 0; p.rescue = null; p.invul = 1.0; p.slow = 0.7; p.slowMin = 0.8;
      g.events.push({ type: 'rescue', x: p.x });
    }
    if (r.t >= a && !r.said) { r.said = true; g.events.push({ type: 'grab' }); }
  }

  // ------------------------------------------------------------------ 같이 달리는 친구들 + 산신령
  function hopOver(r, v) { if (r.y <= 0.5) { r.vy = 760; r.hop = 1; } }
  function updateField(g, dt, base) {
    const p = g.p, rn = g.rnd;
    for (let i = 0; i < g.racers.length; i++) {
      const r = g.racers[i];
      r.modeT -= dt;
      let f = r.f;
      if (r.id === 'rabbit') {              // 토끼: 전속력으로 달리다 낮잠
        if (r.modeT <= 0) { r.mode = r.mode === 'dash' ? 'nap' : 'dash'; r.modeT = r.mode === 'dash' ? 1.4 : 1.3 + rn() * 0.6; }
        f *= r.mode === 'dash' ? 1.35 : 0.22;
      } else if (r.id === 'deer') f *= 1 + 0.06 * Math.sin(g.t * 1.3 + r.ph);
      r.v = base * f;
      r.x += r.v * dt;
      r.slide = Math.max(0, r.slide - dt);
      const lookA = 150 + r.v * 0.25;
      if (r.y <= 0.5) {
        for (let j = Math.max(0, g.obsIdx - 6); j < g.obs.length; j++) {
          const o = g.obs[j], d = o.x - (r.x + r.w * 0.5);
          if (d > lookA) break;
          if (d < -10) continue;
          if (o.type === 'hang') { r.slide = 0.55; } else { hopOver(r); break; }
        }
        if (r.y <= 0.5 && r.vy <= 0) {
          for (let j = 0; j < g.pits.length; j++) { const q = g.pits[j]; if (q.x1 < r.x - 50) continue; if (q.x0 - (r.x + r.w * 0.5) < lookA * 0.8 && q.x1 > r.x) { hopOver(r); break; } if (q.x0 > r.x + 400) break; }
        }
        // 뒤에서 달려와 나를 앞지르는 친구는 뛰어넘는다
        if (r.x < p.x && p.x - r.x < 130 && r.v > p.v) hopOver(r);
      }
      r.vy -= 2600 * dt; r.y += r.vy * dt; if (r.y < 0) { r.y = 0; r.vy = 0; }
      // 너무 뒤처지면 앞쪽에서 새로 달려 나온다
      if (r.x < p.x - 1400) {
        const front = g.spirit.x - p.x > 1700;
        const id = FIELD[(rn() * FIELD.length) | 0];
        g.racers[i] = newRacer(g, id, front ? p.x + 1900 + rn() * 1500 : g.spirit.x + 500 + rn() * 700);
        for (let k = 0; k < 10; k++) { const nx = g.racers[i]; if (g.racers.every((q) => q === nx || Math.abs(q.x - nx.x) > 200)) break; nx.x += 150; }
      }
    }
    // 산신령
    const s = g.spirit; s.t = (s.t || 0) + dt;
    s.nextSurge -= dt;
    if (s.nextSurge <= 0) { s.surge = 2.4; s.breather = 0; s.nextSurge = 12 + rn() * 6; g.events.push({ type: 'surge' }); }
    if (s.surge > 0) { s.surge -= dt; if (s.surge <= 0) s.breather = 3.2; }
    else if (s.breather > 0) s.breather -= dt;
    s.v = base * g.cfg.spiritF * (1 + 0.035 * Math.sin(g.t * 0.8 + s.phase)) * (s.surge > 0 ? 1.15 : s.breather > 0 ? 0.9 : 1);
    const gap = s.x - p.x;                           // 너무 멀어지면 산신령이 살짝 숨을 고른다 (끝없는 추격 방지)
    if (gap > 2300) s.v *= Math.max(0.86, 1 - (gap - 2300) / 9000);
    s.x += s.v * dt;
  }

  function finish(g, how) {
    const p = g.p;
    g.state = how;
    const left = Math.max(0, g.cfg.limit - g.t);
    const dist = Math.max(0, g.spirit.x - p.x);
    const score = Math.round(p.x / 10) + p.coupons * 200 + p.drinks * 60 + (how === 'win' ? 3000 + Math.round(left) * 25 : 0) - p.hits * 20;
    g.result = { how, time: g.t, left, stage: g.maxStage || 1, kind: kindOf(g.maxStage || 1), score: Math.max(0, score), coupons: p.coupons,
      couponSet: Object.keys(p.couponSet).map(Number), drinks: p.drinks, hits: p.hits, falls: p.falls, dist };
    g.events.push({ type: how });
  }

  function api(g) {
    return {
      jump() { g.p.jumpBuf = P.buffer; g.input.jumpHeld = true; },
      jumpUp() { g.input.jumpHeld = false; },
      slide() { g.p.slideReq = true; },
      sprint(on) { g.input.sprint = !!on; },
      update(dt) { update(g, dt); },
    };
  }

  const Sansa = { P, DIFF, RACERS, FIELD, KINDS, KIND_NAMES, STAGE_LEN, kindOf, create, update, mult, inPit, rng };
  if (typeof module !== 'undefined' && module.exports) module.exports = Sansa;
  root.Sansa = Sansa;
})(typeof window !== 'undefined' ? window : globalThis);
