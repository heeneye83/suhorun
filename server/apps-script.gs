/**
 * 부산진구 수호런 — 쿠폰·응모 통합 관리 서버 (Google Apps Script + 구글 시트, 무료)
 *
 * 설치 (한 번만)
 *  1. 구글 드라이브에서 새 스프레드시트를 만든다. (이름 예: 수호런 운영)
 *  2. 메뉴 [확장 프로그램] → [Apps Script] → 이 파일 내용을 전부 붙여 넣고 저장.
 *  3. 왼쪽 [프로젝트 설정] → [스크립트 속성]에 ADMIN_KEY 추가 (운영자 화면 비밀번호로 쓸 값).
 *  4. 위쪽 함수 목록에서 setup 을 골라 [실행] → 권한 허용. (시트 탭 4개가 만들어짐)
 *  5. 'stores' 탭에 참여 가게의 PIN 을 적는다. (setup 이 예시 가게를 넣어 둠)
 *  6. [배포] → [새 배포] → 유형: 웹 앱 / 실행 사용자: 나 / 액세스: 모든 사용자 → 배포.
 *  7. 나온 웹 앱 주소(https://script.google.com/macros/s/…/exec)를
 *     common/sites.js 의 endpoint 에 넣고 GitHub 에 다시 올린다.
 */

const SHEETS = {
  coupons: ['code', 'site', 'season', 'store', 'benefit', 'issuedAt', 'usedAt', 'device'],
  entries: ['id', 'site', 'season', 'name', 'phone', 'at', 'device'],
  plays: ['site', 'season', 'score', 'stage', 'clear', 'stores', 'at', 'device'],
  stores: ['site', 'store', 'benefit', 'pin'],
};

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(SHEETS[name]);
  });
  const st = ss.getSheetByName('stores');
  if (st.getLastRow() === 1) {
    [['jeonpo', '모카골목 로스터리', '핸드드립 1,000원 할인', '1111'], ['jeonpo', '전포 소금빵집', '소금빵 1개 더', '2222'],
     ['jeonpo', '공구다방', '쌍화차 사이즈업', '3333'], ['jeonpo', '달빛 디저트바', '마카롱 1개 증정', '4444'],
     ['jeonpo', '네온 LP카페', '라떼 500원 할인', '5555'], ['jeonpo', '전포 야식 떡볶이', '튀김 1개 서비스', '6666']]
      .forEach(r => st.appendRow(r));
    st.getRange('D:D').setNumberFormat('@');
  }
}

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sheet(name) { return SpreadsheetApp.getActive().getSheetByName(name); }
function rows(name) {
  const v = sheet(name).getDataRange().getValues(); const head = v.shift();
  return v.map(r => Object.fromEntries(head.map((h, i) => [h, r[i] instanceof Date ? r[i].toISOString() : r[i]])));
}
function add(name, o) { sheet(name).appendRow(SHEETS[name].map(k => o[k] == null ? '' : o[k])); }
function findRow(name, col, val) {
  const v = sheet(name).getRange(1, SHEETS[name].indexOf(col) + 1, sheet(name).getLastRow(), 1).getValues();
  for (let i = 1; i < v.length; i++) if (String(v[i][0]) === String(val)) return i + 1;
  return 0;
}

function save(type, p, device) {
  p = Object.assign({}, p, { device: device || p.device || '' });
  if (type === 'coupon') { if (!findRow('coupons', 'code', p.code)) add('coupons', p); }
  else if (type === 'entry') {
    const dup = rows('entries').some(e => e.site === p.site && e.season === p.season && String(e.phone) === String(p.phone));
    if (!dup) add('entries', p);
  }
  else if (type === 'play') add('plays', p);
}

function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents || '{}');
    if (b.type === 'batch') { (b.items || []).forEach(it => save(it.type, it.payload || {}, it.device)); return json({ ok: true }); }
    if (b.type === 'redeem') {
      if (b.coupon) save('coupon', b.coupon, b.device);       // 아직 안 올라간 쿠폰이면 먼저 등록
      const r = findRow('coupons', 'code', b.code);
      if (!r) return json({ ok: false, msg: '쿠폰을 찾을 수 없어요.' });
      const sh = sheet('coupons'), H = SHEETS.coupons, row = sh.getRange(r, 1, 1, H.length).getValues()[0];
      if (row[H.indexOf('usedAt')]) return json({ ok: false, msg: '이미 사용한 쿠폰이에요.' });
      const store = rows('stores').find(s => s.site === row[H.indexOf('site')] && s.store === row[H.indexOf('store')]);
      if (!store || String(store.pin) !== String(b.pin)) return json({ ok: false, msg: '가게 PIN이 맞지 않아요.' });
      sh.getRange(r, H.indexOf('usedAt') + 1).setValue(new Date().toISOString());
      return json({ ok: true });
    }
    return json({ ok: false, msg: 'unknown type' });
  } catch (err) { return json({ ok: false, msg: String(err) }); }
  finally { lock.releaseLock(); }
}

function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || (e.parameter.key || '') !== key) return json({ ok: false, msg: '운영자 비밀번호가 맞지 않아요.' });
  return json({ ok: true, coupons: rows('coupons'), entries: rows('entries'), plays: rows('plays') });
}
