/* 난이도 시뮬레이션: node sansa/tools/sim.js [판수]
 * perfect(실수 없음)·pro(가끔 늦음)·mid(종종 놓침)·low(자주 놓침) 봇이 난이도별로 몇 스테이지에서 산신령을 잡는지 봅니다. */
const S = require('../core.js');
const N = +process.argv[2] || 40;

const KINDS = {
  perfect: { miss: 0, jit: 0, sprintMin: 0 },
  pro: { miss: 0.03, jit: 0.03, sprintMin: 0 },
  mid: { miss: 0.10, jit: 0.07, sprintMin: 40 },
  low: { miss: 0.22, jit: 0.11, sprintMin: 90 },
};

function makeBot(kind, rnd) {
  const B = KINDS[kind];
  const plan = new Map();
  let wantDbl = false;
  return function tick(g) {
    const p = g.p, a = g.api;
    g.input.jumpHeld = true;
    if (p.rescue) return;
    const v = Math.max(p.v, 200);
    a.sprint(p.energy > B.sprintMin || p.haste > 0);
    // 다음 장애물
    let hz = null, hd = 1e9;
    for (let i = Math.max(0, g.obsIdx - 2); i < g.obs.length; i++) {
      const o = g.obs[i]; if (o.x + o.w < p.x - 22) continue; if (o.type === 'banana' && o.used) continue;
      hz = { k: o.type, o, d: o.x - (p.x + 22) }; hd = hz.d; break;
    }
    for (const q of g.pits) { if (q.x1 < p.x) continue; const d = q.x0 - p.x; if (d < hd) { hd = d; hz = { k: 'pit', o: q, d }; } break; }
    const grounded = p.y <= 0.5 && p.vy <= 0;
    if (wantDbl && !grounded && p.vy < 120 && p.jumps === 1) { a.jump(); wantDbl = false; }
    if (grounded) wantDbl = false;
    if (!hz || hz.d < -30) return;
    if (!plan.has(hz.o)) plan.set(hz.o, rnd() < B.miss);
    if (plan.get(hz.o)) return;
    const j = (rnd() - 0.5) * 2 * B.jit;
    if (!grounded) return;
    if (hz.k === 'block' && hz.d <= v * (0.17 + j)) a.jump();
    else if (hz.k === 'banana' && hz.d <= v * (0.12 + j)) a.jump();
    else if (hz.k === 'tall' && hz.d <= v * (0.24 + j)) { a.jump(); wantDbl = true; }
    else if (hz.k === 'pit' && hz.d <= v * (0.03 + j * 0.3)) { a.jump(); wantDbl = hz.o.x1 - hz.o.x0 > 200; }
    else if (hz.k === 'float' && hz.d <= v * (0.2 + j)) a.slide();
  };
}

const TALLY = {};
function run(kind, diff, seed) {
  const g = S.create({ difficulty: diff, seed, storeCount: 6 });
  const bot = makeBot(kind, S.rng(seed ^ 0x9e3779b9));
  let guard = 0;
  while (g.state !== 'win' && g.state !== 'timeout' && guard++ < 60 * 400) {
    bot(g); g.api.update(1 / 60);
    for (const e of g.events) if (e.type === 'hit' || e.type === 'slip' || e.type === 'fall') { const k = e.type + ':' + (e.id || ''); TALLY[k] = (TALLY[k] || 0) + 1; }
    g.events.length = 0;
  }
  return g.result;
}

if (require.main === module) {
  for (const diff of ['easy', 'normal', 'hard']) {
    for (const kind of Object.keys(KINDS)) {
      let win = 0, st = {}, tm = 0, hits = 0, falls = 0, slips = 0, cp = 0, bonks = 0;
      for (let s = 1; s <= N; s++) {
        const r = run(kind, diff, s * 7919);
        if (r.how === 'win') { win++; const k = Math.min(r.stage, 6); st[k] = (st[k] || 0) + 1; tm += r.time; }
        hits += r.hits; falls += r.falls; slips += r.slips; cp += r.coupons; bonks += r.bonks;
      }
      console.log(`${diff.padEnd(6)} ${kind.padEnd(7)} 잡음 ${String(win).padStart(3)}/${N}  스테이지(6=6이상) ${JSON.stringify(st)}  평균 ${win ? (tm / win).toFixed(0) : '-'}s  부딪힘 ${(hits / N).toFixed(1)}  미끄럼 ${(slips / N).toFixed(1)}  낙하 ${(falls / N).toFixed(1)}  밀친 친구 ${(bonks / N).toFixed(1)}  쿠폰 ${(cp / N).toFixed(1)}`);
    }
  }
  if (process.env.TALLY) console.log(TALLY);
}
module.exports = { run, makeBot };
