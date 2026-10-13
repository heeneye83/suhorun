/* 부산진구 수호런 — 명소(게임)·시즌·가게·쿠폰 설정
 * 새 명소 게임을 열거나 시즌을 바꿀 때는 이 파일만 고치면 됩니다.
 * 가게 이름은 각 게임 안의 가게 이름과 똑같아야 쿠폰이 연결됩니다.
 * 지금 들어 있는 가게·혜택·PIN 은 모두 시연용 예시입니다.
 */
window.SUHO = {
  // 정식 운영 때 서버 주소를 넣으면 쿠폰·응모 기록이 한곳(구글 시트)에 모입니다. 비워 두면 이 기기에만 저장.
  endpoint: '',
  sites: [
    {
      id: 'jeonpo', name: '전포 수호런', place: '전포카페거리', status: 'open', url: 'jeonpo/',
      color: '#c97a2a', thumb: 'common/img/jeonpo.webp',
      pitch: '가게를 구하면 그 가게 쿠폰이 쿠폰함에 쏙. 스탬프를 다 모으면 시즌 경품 응모까지.',
      who: '전포 가게 쿠폰 · 시즌 경품',
      season: { id: 's1-jeonpo', name: '시즌 1 · 전포카페거리 스탬프 투어', ends: '' },
      stores: [
        { name: '모카골목 로스터리', benefit: '핸드드립 1,000원 할인', pin: '1111', color: '#2f8f83' },
        { name: '전포 소금빵집', benefit: '소금빵 1개 더', pin: '2222', color: '#c8553d' },
        { name: '공구다방', benefit: '쌍화차 사이즈업', pin: '3333', color: '#3d5a80' },
        { name: '달빛 디저트바', benefit: '마카롱 1개 증정', pin: '4444', color: '#8a5cc4' },
        { name: '네온 LP카페', benefit: '라떼 500원 할인', pin: '5555', color: '#d94f8a' },
        { name: '전포 야식 떡볶이', benefit: '튀김 1개 서비스', pin: '6666', color: '#e0702c' },
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
