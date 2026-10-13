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
      id: 'seomyeon', name: '서면 수호런', place: '서면 1번가 · 2번가', status: 'soon',
      color: '#d94f8a', thumb: 'common/img/seomyeon.webp',
      pitch: '네온 가득한 서면 밤거리를 달리는 스테이지. 놀거리·먹거리 가게와 함께 준비 중이에요.',
      who: '서면에서 놀고 싶은 친구들',
    },
    {
      id: 'choeup', name: '초읍 수호런', place: '어린이대공원 · 초읍동', status: 'soon',
      color: '#4f9a5a', thumb: 'common/img/choeup.webp',
      pitch: '숲길과 호수를 달리는 가족 스테이지. 아이도 쉽게 할 수 있는 난이도로 준비 중이에요.',
      who: '아이와 함께 오는 가족',
    },
  ],
};
