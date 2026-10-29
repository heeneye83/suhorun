/* 부산진구 수호런 — 명소(게임)·시즌·가게·쿠폰 설정
 * 새 명소 게임을 열거나 시즌을 바꿀 때는 이 파일만 고치면 됩니다.
 * 가게 이름은 각 게임 안의 가게 이름과 똑같아야 쿠폰이 연결됩니다.
 * 지금 들어 있는 가게·혜택·PIN 은 모두 시연용 예시입니다.
 */
window.SUHO = {
  // 정식 운영 때 서버 주소를 넣으면 쿠폰·응모 기록이 한곳(구글 시트)에 모입니다. 비워 두면 이 기기에만 저장.
  endpoint: '',
  // 첫 화면 '피드백 남기기' 버튼이 열 구글폼 주소. 비워 두면 버튼에 '준비 중'으로 표시됩니다.
  feedbackUrl: '',
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
      id: 'choeup', name: '공원 수호런 (시민공원-초읍)', place: '시민공원 · 어린이대공원 · 초읍동', status: 'open', url: 'choeup/',
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
      id: 'shoe', name: '신발거리 수호런 (범천 좀비 레이스)', place: '부전동 · 범천동 수제화 장인 로드', status: 'open', url: 'shoe/', genre: '레이스',
      color: '#b9722f', thumb: 'common/img/shoe.webp',
      pitch: '좀비가 덮친 수제화 골목! 구두 장인 할아버지를 업고 6개 스테이지를 달려 공방까지 구출하라. 폭주족 좀비의 바나나를 피하고, 로큰롤 킹의 선물상자에서 이벤트 쿠폰을 노려요.',
      who: '수제화 공방·수선집 쿠폰 · 쿠폰북 추첨',
      season: { id: 's1-shoe', name: '시즌 1 · 부전·범천 수제화 장인 로드 스탬프 투어', ends: '' },
      lastStage: 6,
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
    {
      id: 'baegyang', name: '산사 수호런 (백양산-삼광사)', place: '백양산 · 삼광사', status: 'open', url: 'sansa/', genre: '레이스',
      color: '#c46a8a', thumb: 'common/img/baegyang.webp',
      pitch: '백양산 산신령이 달아난다! 동자승·젊은승·늙은승·거북이·토끼·사슴과 함께 삼광사 마당과 구름 하늘길을 달려 산신령을 따라잡아요. 달리며 쿠폰 3장을 먹고, 산신령을 잡으면 마스터 쿠폰 1장 더!',
      who: '산책·등산 가족 · 삼광사 입구 식당·카페 · 쿠폰북 추첨',
      season: { id: 's1-baegyang', name: '시즌 1 · 백양산·삼광사 스탬프 투어', ends: '' },
      lastStage: 3,   // 3스테이지 안에 산신령을 잡으면 '수호 완료' 도장
      grand: { name: '산사 쿠폰북', desc: '참여 가게 3곳 대표 메뉴 + 마스터 쿠폰 가게 혜택', winners: 30 },
      // 산사 맵은 단순하게: 달리며 먹는 쿠폰 3장 + 산신령을 잡으면(마스터) 1장 더
      // 시연용 가상 가게 (제안서 승인 후 실제 협업 가게로 교체)
      stores: [
        { name: '삼광사 입구 두부집', benefit: '반찬 한 가지 추가', pin: '1111', color: '#e0702c' },
        { name: '백양산 등산로 카페', benefit: '음료 사이즈업', pin: '2222', color: '#3d5a80' },
        { name: '연등 찻집', benefit: '떡 1조각 추가', pin: '3333', color: '#d94f8a' },
      ],
      // 마스터 쿠폰: 산신령을 잡은 사람에게만
      eventStores: [
        { name: '산채비빔밥 식당', benefit: '500원 할인 (마스터 쿠폰)', pin: '4444', color: '#4f9a5a', master: true },
      ],
    },
    {
      id: 'bujeon', name: '시장 수호런 (부전시장-부전도서관)', place: '부전시장 · 부전도서관', status: 'open', url: 'bujeon/', genre: '레이스',
      color: '#e0702c', thumb: 'common/img/bujeon.webp',
      pitch: '악덕 건물주와 단속반이 몰려왔다! 부전시장 아주머니를 업고 농산물·수산물·먹자골목을 지나 부전도서관 앞 구조 헬기까지. 킥보드 빌런의 바나나를 피하고, 품바 엿장수의 선물상자에서 이벤트 쿠폰을 노려요.',
      who: '시장 상인 · 장보러 온 주민 · 쿠폰북 추첨',
      season: { id: 's1-bujeon', name: '시즌 1 · 부전시장 스탬프 투어', ends: '' },
      lastStage: 6,
      grand: { name: '부전시장 쿠폰북', desc: '참여 가게 6곳 대표 혜택 1개씩', winners: 30 },
      // 시연용 가상 가게 (제안서 승인 후 실제 협업 가게로 교체) — 스테이지를 지날 때마다 한 곳씩 스탬프
      stores: [
        { name: '부전시장 정문 과일가게', benefit: '귤 한 봉지 덤', pin: '1111', color: '#e0702c' },
        { name: '농산물 골목 채소가게', benefit: '대파 한 단 덤', pin: '2222', color: '#4f9a5a' },
        { name: '수산물 골목 생선가게', benefit: '손질 무료', pin: '3333', color: '#3d5a80' },
        { name: '먹자골목 어묵집', benefit: '어묵 1개 추가', pin: '4444', color: '#c8553d' },
        { name: '부전역 앞 떡집', benefit: '500원 할인', pin: '5555', color: '#d94f8a' },
        { name: '도서관 앞 북카페', benefit: '음료 사이즈업', pin: '6666', color: '#8a5cc4' },
      ],
      eventStores: [
        { name: '부전떡갈비', benefit: '떡갈비 1개 추가', pin: '7777', color: '#b9722f' },
        { name: '시장 국밥집', benefit: '공깃밥 무료', pin: '8888', color: '#6b4a2b' },
      ],
    },
    {
      id: 'gaegeum', name: '골목 수호런 (개금골목시장)', place: '개금동 · 개금골목시장', status: 'open', url: 'gaegeum/',
      color: '#c8553d', thumb: 'common/img/gaegeum.webp', cta: '수사 시작하기', genre: '추리',
      pitch: '장터 잔치 날 11시 30분, "정오에 폭탄이 터진다"는 협박 편지! 30분 안에 상인회 사무실, 장날 골목, 지하 창고를 뒤져 시한폭탄을 해체하고, 편지를 쓴 사람과 폭탄을 놓은 사람을 각각 밝혀내는 방탈출 추리.',
      who: '시장 상인 · 장보러 온 주민 · 추리 게임 팬',
      season: { id: 's1-gaegeum', name: '시즌 1 · 골목시장 방탈출', ends: '' },
      lastStage: 4,
      // 시연용 가상 가게 — 방을 하나 풀 때마다 한 곳씩 쿠폰, 진실 엔딩(힌트 없이)이면 상인회 마스터 쿠폰
      stores: [
        { name: '골목밀면', benefit: '곱빼기 무료', pin: '1111', color: '#3d5a80' },
        { name: '개금손만두', benefit: '만두 2알 추가', pin: '2222', color: '#d9a22b' },
        { name: '맛난순대', benefit: '간 서비스', pin: '3333', color: '#c8553d' },
      ],
      eventStores: [
        { name: '개금골목 상인회', benefit: '장바구니 5천 원 할인', pin: '7777', color: '#8a5a2b' },
      ],
    },
    {
      id: 'gukbap', name: '국밥 수호런 (서면 돼지국밥골목)', place: '부전동 · 서면시장 돼지국밥골목', status: 'open', url: 'gukbap/',
      color: '#b9722f', thumb: 'common/img/gukbap.webp', cta: '수사 시작하기', genre: '추리',
      pitch: '축제 날 새벽, 70년 된 육수 장부가 사라졌다! 주방 금고, 밤의 국밥골목, 옥상 장독대를 뒤져 범인과 증거, 동기를 짚어 내는 방탈출 추리. 동기까지 맞히면 피란 시절 두 사람이 함께 만든 국밥의 진실이 드러나요.',
      who: '국밥집 · 서면을 찾는 관광객 · 추리 게임 팬',
      season: { id: 's1-gukbap', name: '시즌 1 · 국밥골목 방탈출', ends: '' },
      lastStage: 4,
      // 시연용 가상 가게 — 방을 하나 풀 때마다 한 곳씩 쿠폰, 진실 엔딩(힌트 없이)이면 상인회 마스터 쿠폰
      stores: [
        { name: '피란돼지국밥', benefit: '수육 한 접시 서비스', pin: '1111', color: '#b9722f' },
        { name: '골목 솥단지국밥', benefit: '순대 추가 무료', pin: '2222', color: '#3d5a80' },
        { name: '서면 등불국밥', benefit: '공깃밥 무료', pin: '3333', color: '#d9822b' },
      ],
      eventStores: [
        { name: '국밥골목 상인회', benefit: '국밥 한 그릇 무료', pin: '7777', color: '#8a5a2b' },
      ],
    },
    {
      id: 'olympic', name: '수호 올림픽 (아케이드)', place: '서면 · 부전시장 · 시민공원', status: 'open', url: 'olympic/', genre: '아케이드',
      color: '#2f8fe0', thumb: 'common/img/olympic.webp', cta: '경기 시작하기',
      pitch: '좌우 연타로 겨루는 다섯 종목! 서면 100m 달리기, 부전시장 어묵 꼬치, 국밥골목 토렴, 시민공원 풍선 불기와 원반 던지기. 혼자서 볼트와, 휴대폰 하나로 둘이서도 대결해요.',
      who: '누구나 · 가족 · 행사 부스',
      season: { id: 's1-olympic', name: '시즌 1 · 수호 올림픽', ends: '' },
      lastStage: 5,
      // 시연용 가상 가게 — 금메달 1개·3개·5개마다 쿠폰
      stores: [
        { name: '수호분식', benefit: '떡볶이 사리 추가', pin: '1111', color: '#e0702c' },
        { name: '부전시장 어묵집', benefit: '어묵 1개 추가', pin: '2222', color: '#c8553d' },
        { name: '시민공원 매점', benefit: '음료 500원 할인', pin: '3333', color: '#4f9a5a' },
      ],
      eventStores: [
        { name: '수호 올림픽 조직위', benefit: '기념 스티커 증정', pin: '7777', color: '#2f8fe0' },
      ],
    },
    {
      id: 'gaya', name: '대학가 수호런 (가야동)', place: '가야동 · 동의대 앞 대학가', status: 'soon', genre: '추리',
      color: '#3d5a80',
      pitch: '밀면집과 카페, 자취방 골목이 이어지는 동의대 앞 대학가에서 벌어지는 방탈출 추리를 준비 중이에요.',
      who: '대학생 · 대학가 가게',
    },
  ],
};
