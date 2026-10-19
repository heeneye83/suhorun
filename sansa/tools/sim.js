/* 난이도 시뮬레이션: node sansa/tools/sim.js [판수]
 * 숙련 봇(거의 실수 없음)과 평범한 봇(가끔 놓침)이 각 난이도에서 몇 스테이지에 산신령을 잡는지 봅니다. */
const S = require('../core.js');
const N = +process.argv[2] || 40;

function makeBot(kind, rnd) {
  const B = kind === 'perfect' ? { miss: 0, jit: 0.0, sprintMin: 0, useItems: false } : kind === 'pro'
    ? { miss: 0.0, jit: 0.02, sprintMin: 0, useItems: true, sprintLowAt: 0 }
    : kind === 'mid'
    ? { miss: 0.10, jit: 0.07, sprintMin: 45, useItems: false }
    : { miss: 0.22, jit: 0.11, sprintMin: 90, useItems: false };
  const plan = new Map();   // 장애물별로 이번에 실수할지 미리 정함
  return function tick(g) {
    const p = g.p, a = g.api;
    if (p.rescue) return;
    const v = Math.max(p.v, 200);
    // 스프린트: 에너지가 있으면 계속, 숙련 봇은 바닥나면 쉬었다가 다시
    a.sprint(p.energy > B.sprintMin || (p.haste > 0));
    // 다음 장애물
    let hz = null, hd = 1e9;
    for (let i = Math.max(0, g.obsIdx - 2); i < g.obs.length; i++) {
      const o = g.obs[i]; if (o.x + o.w < p.x - 10) continue; const d = o.x - (p.x + 22); if (d < hd) { hd = d; hz = { k: o.type, o, d }; } break;
    }
    for (const q of g.pits) { if (q.x1 < p.x) continue; const d = q.x0 - p.x; if (d < hd) { hd = d; hz = { k: 'pit', o: q, d }; } break; }
    const grounded = p.y <= 0.5 && p.vy <= 0;
    let act = false;
    if (hz && hz.d > -20) {
      const key = hz.o;
      if (!plan.has(key)) plan.set(key, rnd() < B.miss);
      const miss = plan.get(key), j = (rnd() - 0.5) * 2 * B.jit;
      if (!miss) {
        if ((hz.k === 'block' || hz.k === 'tall') && hz.d <= v * (0.19 + j) && grounded) { a.jump(); act = true; }
        if (hz.k === 'pit' && hz.d <= v * (0.035 + j * 0.3) && grounded) { a.jump(); act = true; }
        if (hz.k === 'hang' && hz.d <= v * (0.2 + j) && grounded) { a.slide(); act = true; }
      }
    }
    // 같이 달리는 친구 피하기 (앞에서 가까워지면 점프)
    if (!act && grounded && (!hz || hz.d > v * 0.38 || kind !== 'pro')) {
      for (const r of g.racers) {
        const d = (r.x - r.w * 0.36) - (p.x + 22); const closing = p.v - r.v;
        if (d > 0 && d < 400 && closing > 20 && d / closing < 0.2 + (rnd() - 0.5) * B.jit * 2 && rnd() > B.miss * 0.6) { a.jump(); act = true; break; }
      }
    }
    // 높이 떠 있는 아이템 먹으러 점프
    if (!act && B.useItems && grounded && (!hz || hz.d > v * 0.9)) {
      for (let i = g.itemIdx; i < g.items.length && g.items[i].x < p.x + 400; i++) {
        const it = g.items[i]; if (it.taken || it.y < 120) continue; const d = it.x - p.x;
        if (d > 0 && d < v * 0.2) { a.jump(); act = true; break; }
      }
    }
    if (!act && !grounded) { /* 길게 누르기 */ }
  };
}

const TALLY = {}; let TR = 0;
function run(kind, diff, seed) {
  const g = S.create({ difficulty: diff, seed, storeCount: 6 });
  const rnd = S.rng(seed ^ 0x9e3779b9), bot = makeBot(kind, rnd);
  g.api.jump(); g.api.jumpUp();
  let guard = 0;
  while (g.state !== 'win' && g.state !== 'timeout' && guard++ < 60 * 400) {
    bot(g); g.api.jump && 0; g.input.jumpHeld = true; g.api.update(1 / 60); for (const e of g.events) if (e.type === 'hit' && process.env.TRACE && kind==='pro' && seed===7919 && diff==='normal' && TR++<22) console.log('t',g.t.toFixed(1),e.kind,e.id,'py',g.p.y.toFixed(0),'slide',g.p.slideT.toFixed(2),'v',g.p.v|0,'energy',g.p.energy|0); for (const e of g.events) if (e.type === 'hit') TALLY[e.kind + ':' + e.id] = (TALLY[e.kind + ':' + e.id] || 0) + 1; g.events.length = 0;
  }
  return g.result;
}

const out = {};
for (const diff of ['easy', 'normal', 'hard']) {
  for (const kind of ['perfect', 'pro', 'mid', 'low']) {
    let win = 0, st = {}, tm = 0, hits = 0, falls = 0, cp = 0, wins = 0;
    for (let s = 1; s <= N; s++) {
      const r = run(kind, diff, s * 7919);
      if (r.how === 'win') { win++; st[r.stage] = (st[r.stage] || 0) + 1; tm += r.time; }
      hits += r.hits; falls += r.falls; cp += r.coupons;
    }
    console.log(`${diff.padEnd(6)} ${kind.padEnd(4)} 잡음 ${String(win).padStart(3)}/${N}  스테이지분포 ${JSON.stringify(st)}  평균시간 ${win ? (tm / win).toFixed(0) : '-'}s  부딪힘 ${(hits / N).toFixed(1)}  낙하 ${(falls / N).toFixed(1)}  쿠폰 ${(cp / N).toFixed(1)}`);
  }
}

if (process.env.TALLY) console.log(TALLY);
if (process.env.DUMP) { for (let s = 1; s <= 12; s++) { const r = run('pro', 'normal', s * 7919); console.log(s, r.how, 'stage', r.stage, 't', r.time.toFixed(0), 'hits', r.hits, 'falls', r.falls, 'dist', r.dist | 0, 'score', r.score); } }
