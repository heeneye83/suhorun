/* 부산진구 수호런 — 명소(게임)·시즌·가게·쿠폰 설정
 * 새 명소 게임을 열거나 시즌을 바꿀 때는 이 파일만 고치면 됩니다.
 * 가게 이름은 각 게임 안의 가게 이름과 똑같아야 쿠폰이 연결됩니다.
 * 지금 들어 있는 가게·혜택·PIN 은 모두 시연용 예시입니다.
 */
window.SUHO = {
  // 정식 운영 때 서버 주소를 넣으면 쿠폰·응모 기록이 한곳(구글 시트)에 모입니다. 비워 두면 이 기기에만 저장.
  endpoint: '',
  // 퍼펙트 쿠폰은 1,000원 미만의 가벼운 혜택(사이즈업·샷 추가·토핑 추가·500원 할인), 주문할 때만 사용
  couponRule: '메뉴 주문 시 사용 · 가게당 1인 1회',
  sites: [
    {
      id: 'jeonpo', name: '전포 수호런', place: '전포카페거리', status: 'open', url: 'jeonpo/',
      color: '#c97a2a', thumb: 'common/img/jeonpo.webp',
      pitch: '탄원두 4마리를 한 대도 안 맞고 잡으면 퍼펙트! 그 가게 쿠폰이 쿠폰함에 쏙. 스탬프 7개를 모으면 쿠폰북 추첨까지.',
      who: '전포 가게 쿠폰 · 쿠폰북 추첨',
      season: { id: 's1-jeonpo', name: '시즌 1 · 전포카페거리 스탬프 투어', ends: '' },
      // 스탬프 7개(가게 6 + 수호 완료)를 모은 사람 중 추첨 → 큰 혜택은 당첨자 수만큼만 나감
      lastStage: 2,   // 마지막 스테이지(밤) 보스를 물리치면 '수호 완료' 도장
      grand: { name: '전포 쿠폰북', desc: '참여 가게 6곳 대표 메뉴 1개씩 무료', winners: 30 },
      stores: [
        { name: '모카골목 로스터리', benefit: '샷 추가', pin: '1111', color: '#2f8f83' },
        { name: '전포 소금빵집', benefit: '500원 할인', pin: '2222', color: '#c8553d' },
        { name: '공구다방', benefit: '음료 사이즈업', pin: '3333', color: '#3d5a80' },
        { name: '달빛 디저트바', benefit: '토핑 추가', pin: '4444', color: '#8a5cc4' },
        { name: '네온 LP카페', benefit: '500원 할인', pin: '5555', color: '#d94f8a' },
        { name: '전포 야식 떡볶이', benefit: '토핑 추가', pin: '6666', color: '#e0702c' },
      ],
      // 캡슐 뽑기 이벤트 가게: 구하는 가게가 아니라, 게임 중 가끔 나오는 뽑기 기계에서 낮은 확률로 나오는 스페셜 쿠폰
      eventStores: [
        { name: '전포 수제버거', benefit: '감자튀김 무료', pin: '7777', color: '#d9822b' },
        { name: '젤라또 전포', benefit: '젤라또 1스쿱 추가', pin: '8888', color: '#3fa99a' },
      ],
    },
    {
      id: 'seomyeon', name: '서면 수호런', place: '서면 1번가 · 2번가', status: 'open', url: 'seomyeon/',
      color: '#d94f8a', thumb: 'common/img/seomyeon.webp',
      pitch: '취객·쓰레기 봉지·헬창 건달까지! 서면 젊음의 거리와 지하상가, 빛 축제 거리를 달리며 빌런 4마리를 한 대도 안 맞고 잡으면 퍼펙트 쿠폰.',
      who: '서면 가게 쿠폰 · 쿠폰북 추첨',
      season: { id: 's1-seomyeon', name: '시즌 1 · 서면 1번가·2번가 스탬프 투어', ends: '' },
      lastStage: 2,   // 마지막 스테이지(밤) 보스를 물리치면 '수호 완료' 도장
      grand: { name: '서면 쿠폰북', desc: '참여 가게 6곳 대표 메뉴 1개씩 무료', winners: 30 },
      // 시연용 가상 가게 (제안서 승인 후 실제 협업 가게로 교체)
      stores: [
        { name: '젊음의 거리 호떡집', benefit: '꿀호떡 1개 추가', pin: '1111', color: '#c8553d' },
        { name: '2번가 타코야키', benefit: '500원 할인', pin: '2222', color: '#e0702c' },
        { name: '지하상가 보세 옷가게', benefit: '10% 할인', pin: '3333', color: '#d94f8a' },
        { name: '지하상가 금은방', benefit: '귀걸이 증정', pin: '4444', color: '#3d5a80' },
        { name: '상상마당 앞 푸드트럭', benefit: '츄러스 토핑 추가', pin: '5555', color: '#e0702c' },
        { name: '빛축제 핫초코', benefit: '사이즈업', pin: '6666', color: '#8a5cc4' },
      ],
      eventStores: [
        { name: '서면 수제버거', benefit: '감자튀김 무료', pin: '7777', color: '#d9822b' },
        { name: '서면 젤라또', benefit: '1스쿱 추가', pin: '8888', color: '#3fa99a' },
      ],
    },
    {
      id: 'choeup', name: '공원 수호런 (초읍-시민공원)', place: '시민공원 · 어린이대공원 · 초읍동', status: 'open', url: 'choeup/',
      color: '#4f9a5a', thumb: 'common/img/choeup.webp',
      pitch: '가족이 함께! 부산시민공원에서 초읍 어린이대공원, 성지곡 편백숲길까지 달리며 먼지뭉치·모기·너구리 장난꾸러기 4마리를 한 대도 안 맞고 잡으면 퍼펙트 쿠폰.',
      who: '아이와 함께 오는 가족 · 가게 쿠폰 · 쿠폰북 추첨',
      season: { id: 's1-choeup', name: '시즌 1 · 초읍 시민공원~어린이대공원 스탬프 투어', ends: '' },
      lastStage: 2,
      grand: { name: '초읍 쿠폰북', desc: '참여 가게 6곳 대표 메뉴 1개씩 무료', winners: 30 },
      // 시연용 가상 가게 (제안서 승인 후 실제 협업 가게로 교체)
      stores: [
        { name: '시민공원 푸드트럭', benefit: '핫도그 소스 추가', pin: '1111', color: '#e0702c' },
        { name: '공원 앞 김밥집', benefit: '500원 할인', pin: '2222', color: '#c8553d' },
        { name: '어린이대공원 솜사탕', benefit: '사이즈업', pin: '3333', color: '#d94f8a' },
        { name: '정문 앞 분식집', benefit: '떡꼬치 1개 추가', pin: '4444', color: '#e0702c' },
        { name: '숲속 찻집', benefit: '편백차 사이즈업', pin: '5555', color: '#8a5cc4' },
        { name: '초읍 샌드위치', benefit: '음료 할인', pin: '6666', color: '#c8553d' },
      ],
      eventStores: [
        { name: '초읍 아이스크림', benefit: '1스쿱 추가', pin: '7777', color: '#3fa99a' },
        { name: '초읍 도넛', benefit: '도넛 1개 추가', pin: '8888', color: '#d9822b' },
      ],
    },
    {
      id: 'shoe', name: '수제화 수호런', place: '부전동 · 범천동 수제화 장인 로드', status: 'open', url: 'shoe/',
      color: '#b9722f', thumb: 'common/img/shoe.webp',
      pitch: '한 땀 한 땀 구두를 만드는 장인의 골목을 지켜라! 실밥 도깨비·구두약 통·구둣골 골렘을 한 대도 안 맞고 잡으면 퍼펙트 쿠폰.',
      who: '수제화 공방·수선집 쿠폰 · 쿠폰북 추첨',
      season: { id: 's1-shoe', name: '시즌 1 · 부전·범천 수제화 장인 로드 스탬프 투어', ends: '' },
      lastStage: 2,
      grand: { name: '수제화 쿠폰북', desc: '참여 가게 6곳 대표 혜택 1개씩', winners: 30 },
      // 시연용 가상 가게 (제안서 승인 후 실제 협업 가게로 교체)
      stores: [
        { name: '부전 수제화 공방', benefit: '구두 굽 교체 할인', pin: '1111', color: '#8a5a2b' },
        { name: '단골 구두 수선집', benefit: '밑창 교체 500원 할인', pin: '2222', color: '#3d5a80' },
        { name: '범천 신발 공방', benefit: '맞춤 인솔 증정', pin: '3333', color: '#c8553d' },
        { name: '구두 케어 숍', benefit: '구두약 증정', pin: '4444', color: '#8a5cc4' },
        { name: '골드테마거리 세공점', benefit: '반지 세척 무료', pin: '5555', color: '#c99a1e' },
        { name: '신암 언덕 카페', benefit: '음료 사이즈업', pin: '6666', color: '#8a5cc4' },
      ],
      eventStores: [
        { name: '부전 구두 닦이 스튜디오', benefit: '구두 광택 무료', pin: '7777', color: '#6b4a2b' },
        { name: '범천 가죽 소품샵', benefit: '키링 증정', pin: '8888', color: '#c8553d' },
      ],
    },
  ],
};
