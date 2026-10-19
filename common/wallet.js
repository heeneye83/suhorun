/* 부산진구 수호런 — 쿠폰함 (모든 명소 게임이 함께 쓰는 쿠폰·응모·플레이 기록)
 * 서버 주소(SUHO.endpoint)가 없으면 이 기기(브라우저)에만 저장되고,
 * 있으면 같은 내용을 서버(구글 시트)로도 보내 한곳에서 관리합니다.
 */
(function () {
  'use strict';
  const KEY = 'suhorun.v1', OUTBOX = 'suhorun.outbox';
  const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const PREFIX = { jeonpo: 'JP', seomyeon: 'SM', choeup: 'CE', baegyang: 'BY' };
  const cfg = () => window.SUHO || { sites: [], endpoint: '' };
  const rid = (n) => { let s = ''; const a = new Uint32Array(n); (window.crypto || window.msCrypto).getRandomValues(a); for (const v of a) s += ABC[v % ABC.length]; return s; };
  const now = () => new Date().toISOString();

  function read(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  function load() {
    const d = read(KEY, null);
    if (d && Array.isArray(d.coupons)) { d.entries = d.entries || []; d.plays = d.plays || []; return d; }
    const fresh = { device: rid(10), coupons: [], entries: [], plays: [] }; write(KEY, fresh); return fresh;
  }
  function save(d) { write(KEY, d); }

  // ---- 서버로 보내기 (주소가 있을 때만, 실패하면 모아 뒀다가 다시 보냄) ----
  function post(body) {
    return fetch(cfg().endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(r => r.json());
  }
  function send(type, payload) {
    if (!cfg().endpoint) return;
    const box = read(OUTBOX, []); box.push({ type, payload, device: load().device }); write(OUTBOX, box); flush();
  }
  let flushing = false;
  function flush() {
    if (!cfg().endpoint || flushing) return;
    const box = read(OUTBOX, []); if (!box.length) return;
    flushing = true;
    post({ type: 'batch', items: box }).then(r => { if (r && r.ok) write(OUTBOX, read(OUTBOX, []).slice(box.length)); })
      .catch(() => { }).finally(() => { flushing = false; });
  }
  window.addEventListener('online', flush);

  const site = (id) => cfg().sites.find(s => s.id === id) || null;
  const storeOf = (siteId, name) => { const s = site(siteId); if (!s) return null;
    const st = (s.stores || []).find(x => x.name === name); if (st) return st;
    const ev = (s.eventStores || []).find(x => x.name === name); return ev ? Object.assign({ special: true }, ev) : null; };

  const W = {
    site, storeOf,
    sites: () => cfg().sites,
    device: () => load().device,
    remote: () => !!cfg().endpoint,

    /** 가게를 구했을 때: 그 가게 쿠폰을 시즌당 1장 발급 */
    issue(siteId, storeName) {
      const s = site(siteId), st = storeOf(siteId, storeName); if (!s || !st) return null;
      const d = load(), season = s.season.id;
      const had = d.coupons.find(c => c.site === siteId && c.season === season && c.store === storeName);
      if (had) return { coupon: had, isNew: false };
      const c = { code: `${PREFIX[siteId] || 'SR'}-${rid(4)}-${rid(4)}`, site: siteId, season, store: storeName, benefit: st.benefit,
        color: st.color, kind: st.special ? 'special' : 'perfect', issuedAt: now(), usedAt: null };
      d.coupons.push(c); save(d); send('coupon', c);
      return { coupon: c, isNew: true };
    },
    coupons(siteId) { const d = load(); return siteId ? d.coupons.filter(c => c.site === siteId) : d.coupons.slice(); },
    unused() { return load().coupons.filter(c => !c.usedAt).length; },

    /** 가게에서 사장님이 PIN 4자리를 넣어 사용 처리 */
    redeem(code, pin) {
      const d = load(), c = d.coupons.find(x => x.code === code);
      if (!c) return Promise.resolve({ ok: false, msg: '쿠폰을 찾을 수 없어요.' });
      if (c.usedAt) return Promise.resolve({ ok: false, msg: '이미 사용한 쿠폰이에요.' });
      const mark = () => { c.usedAt = now(); save(d); return { ok: true, msg: '사용 완료!' }; };
      if (cfg().endpoint) {
        return post({ type: 'redeem', code, pin, coupon: c, device: d.device })
          .then(r => r && r.ok ? mark() : { ok: false, msg: (r && r.msg) || '사용 처리에 실패했어요.' })
          .catch(() => ({ ok: false, msg: '인터넷 연결을 확인해 주세요.' }));
      }
      const st = storeOf(c.site, c.store);
      if (!st || String(pin) !== String(st.pin)) return Promise.resolve({ ok: false, msg: '가게 PIN이 맞지 않아요.' });
      const r = mark(); return Promise.resolve(r);
    },

    /** 시즌 경품 응모 (시즌당 1회) */
    entered(siteId) { const s = site(siteId); return !!(s && load().entries.find(e => e.site === siteId && e.season === s.season.id)); },
    enter(siteId, info) {
      const s = site(siteId); if (!s) return { ok: false, msg: '알 수 없는 게임이에요.' };
      const d = load();
      if (d.entries.find(e => e.site === siteId && e.season === s.season.id)) return { ok: false, msg: '이번 시즌에 이미 응모했어요.' };
      const e = { id: rid(8), site: siteId, season: s.season.id, name: String(info.name || '').slice(0, 20), phone: String(info.phone || '').replace(/[^0-9]/g, ''), at: now() };
      d.entries.push(e); save(d); send('entry', e);
      return { ok: true, entry: e };
    },

    /** 한 판 끝날 때 기록 (점수·도달 스테이지) */
    logPlay(siteId, info) {
      const s = site(siteId); const d = load();
      const p = { site: siteId, season: s ? s.season.id : '', score: info.score | 0, stage: info.stage | 0, clear: !!info.clear, stores: info.stores | 0, at: now() };
      d.plays.push(p); if (d.plays.length > 300) d.plays = d.plays.slice(-300); save(d); send('play', p);
    },

    /** 게임 안 스탬프 진행 (게임이 저장한 값 읽기) */
    stamps(siteId) {
      const s = site(siteId); if (!s || !s.stores) return null;
      const st = read('bjrun.stamps.' + s.season.id, null) || { got: {}, boss: {} };
      const got = s.stores.filter(x => st.got && st.got[x.name]).length;
      const guard = !!(st.boss && st.boss[String(s.lastStage == null ? 1 : s.lastStage)]);   // 마지막 보스 처치 = 수호 완료
      return { got, total: s.stores.length + 1, done: got + (guard ? 1 : 0), guard };
    },

    raw: load, flush,
  };
  window.SuhoWallet = W;
  flush();
})();
