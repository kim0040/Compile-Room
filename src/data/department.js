export const departmentOverview = {
  vision:
    "IT 핵심 분야의 이론과 실무를 겸비한 스마트 인재 양성을 목표로, 웹 응용·정보보안·모바일 및 유비쿼터스 컴퓨팅을 주력으로 합니다.",
  strengths: [
    "사회 맞춤형 실용 교과(웹 응용, 빅데이터, 지능형 SW)와 ABEEK 인증 기반 교육",
    "산학융합 인턴십, 캡스톤, 프로젝트형 수업을 통한 취업 연계",
    "다양한 동아리와 전문가 특강, 최신 기자재 및 실무형 교수진",
  ],
  careers: [
    "소프트웨어/웹 응용 개발자",
    "데이터 및 빅데이터 엔지니어",
    "보안/네트워크 관리자",
    "IoT·임베디드·AI 연구 개발자",
  ],
};

export const yearlyCurriculum = [
  {
    year: 1,
    title: "기초 역량",
    summary:
      "논리적 사고와 글쓰기, 글로벌 의사소통, 컴퓨팅 사고, 이산수학·선형대수 등 기초 학문과 함께 C, 파이썬 기반 기초 SW 역량을 다집니다.",
    required: [
      "컴퓨터개론",
      "컴퓨터프로그램개발의이해",
      "C프로그래밍",
      "소프트웨어프로젝트Ⅰ·Ⅱ",
    ],
    recommended: [
      "이산수학",
      "선형대수학",
      "데이터과학입문",
      "컴퓨팅사고와SW코딩",
    ],
  },
  {
    year: 2,
    title: "핵심 전공 토대",
    summary:
      "자료구조·알고리즘·운영체제·컴퓨터구조 등 필수 전공을 중심으로 서버/자바/웹 프로그래밍 실습을 통해 개발 역량을 확장합니다.",
    required: ["자료구조", "컴퓨터구조", "알고리즘"],
    recommended: [
      "운영체제",
      "서버관리",
      "자바프로그래밍",
      "웹프로그래밍(JSP/HTML5)",
    ],
  },
  {
    year: 3,
    title: "심화·트랙 선택",
    summary:
      "데이터베이스·네트워크 필수 이수 후 빅데이터, 모바일, 임베디드, AI 등 희망 트랙을 선택해 프로젝트 기반 학습을 수행합니다.",
    required: ["데이터베이스", "컴퓨터네트워크"],
    recommended: [
      "객체지향설계",
      "모바일프로그래밍",
      "임베디드시스템",
      "빅데이터/기계학습",
      "소프트웨어공학",
      "웹응용",
      "인공지능",
    ],
  },
  {
    year: 4,
    title: "캡스톤/진로 준비",
    summary:
      "산업체 연계 캡스톤디자인을 수행하며, 분산처리·IoT·정보보호·해킹대응 등 심화 과목과 연구 프로젝트를 통해 진로를 확정합니다.",
    required: ["캡스톤디자인"],
    recommended: [
      "분산처리",
      "사물인터넷",
      "정보보호",
      "컴퓨터공학특강",
      "해킹및보안",
    ],
  },
];

export const graduationChecklist = [
  "총 130학점 이상 이수 (전공 70학점 이상, 교양 30학점 이상 권장)",
  "전공필수(자료구조, 알고리즘, 컴퓨터구조, 운영체제, 데이터베이스, 네트워크, 캡스톤) 모두 이수",
  "졸업인증: 공학교육인증 또는 졸업논문/프로젝트(P/F) 통과",
  "졸업전 진로설계 및 비교과 프로그램(현장실습/인턴십) 최소 1회 참여 권장",
];

export const departmentResources = [
  {
    title: "2025-2학기 수강 편람",
    description: "학과 교과목별 개요, 학점, 선수 조건을 확인하세요.",
    href: "/docs/2025-2-syllabus.html",
    label: "수강 편람 열기",
  },
  {
    title: "전주대학교 학칙 (2025.07)",
    description: "학사 제도 및 기본 규정을 확인할 수 있는 공식 문서입니다.",
    href: "/docs/jj-univ-regulation.html",
    label: "학칙 보기",
  },
  {
    title: "학칙 시행세칙 (2025.04)",
    description: "세부 학사 운영, 졸업/수강/휴학 등 절차를 안내합니다.",
    href: "/docs/jj-univ-detailed-rules.html",
    label: "시행세칙 보기",
  },
];

export const personalizedTips = {
  general: [
    "사이버캠퍼스에서 PBL/팀 프로젝트 자료를 미리 확인하면 수업 준비에 도움이 됩니다.",
    "전공동아리/학회(알고리즘, 보안, 웹/앱 등) 가입 시 포트폴리오 활동을 쌓을 수 있습니다.",
    "학과 행정실(063-220-2372) 및 SNS 채널(Instagram/Youtube/Facebook/네이버 블로그)에서 실시간 공지 확인이 가능합니다.",
  ],
  byYear: {
    1: [
      "소프트웨어프로젝트Ⅰ·Ⅱ 과제를 GitHub에 정리해 두면 이후 포트폴리오로 활용하기 좋습니다.",
      "논리적사고와글쓰기, 글로벌의사소통 수업은 발표·팀워크 역량을 키우기에 좋습니다.",
    ],
    2: [
      "자료구조/알고리즘은 코딩테스트의 핵심입니다. 백준·프로그래머스 문제를 병행하세요.",
      "운영체제·서버관리 수업 실습 로그를 포트폴리오 문서로 남기면 DevOps/Infra 직무 준비에 도움이 됩니다.",
    ],
    3: [
      "데이터베이스/빅데이터 프로젝트를 Cloud(AWS/GCP) 환경에서 구성해보면 실무 감각을 올릴 수 있습니다.",
      "캡스톤 전 단계로 팀 프로젝트(웹응용, 모바일프로그래밍)를 Git으로 관리해 협업 경험을 쌓으세요.",
    ],
    4: [
      "캡스톤디자인 결과물을 포트폴리오 영상/데모로 제작해 취업 면접 시 활용하세요.",
      "졸업 전 공학인증/졸업논문 P/F 일정과 요구 서류를 학과 공지에서 반드시 확인하세요.",
    ],
  },
};

export function parseYearFromClassYear(classYear) {
  if (!classYear) return null;
  const match = classYear.match(/\d{2}/);
  if (!match) return null;
  const year = Number(match[0]);
  if (Number.isNaN(year)) return null;
  if (year >= 0 && year <= 99) {
    const fullYear = year >= 90 ? 1900 + year : 2000 + year;
    const grade = Math.min(
      4,
      Math.max(1, new Date().getFullYear() - fullYear + 1),
    );
    return { numeric: fullYear, grade };
  }
  return null;
}

export const syllabusHighlights = [
  {
    title: "전공필수 트랙",
    items: [
      "자료구조·알고리즘·운영체제·컴퓨터구조·네트워크·데이터베이스·캡스톤디자인 필수 이수",
      "캡스톤과 소프트웨어프로젝트 과목을 통해 산업체 수요 기반 프로젝트 경험 확보",
    ],
  },
  {
    title: "선택 심화 트랙",
    items: [
      "웹/모바일/임베디드/AI/보안 등 트랙형 선택과목 다수 개설 (웹응용, 모바일프로그래밍, 해킹및보안 등)",
      "PBL(문제중심학습) 기반 수업으로 Git/GitHub 협업 필수",
    ],
  },
  {
    title: "비교과 & 인증",
    items: [
      "ABEEK 공학교육인증 과목 구성(수학·기초과학·전문응용) 반영",
      "산학협력 프로그램(오픈소스 컨트리뷰션, 현장실습)과 연계되는 교과 다수",
    ],
  },
];

export const regulationHighlights = [
  "전공필수 미이수시 졸업·재수강 제한이 있으므로 학년별 로드맵 준수 필요",
  "학기당 최대 21학점, 계절학기 6학점까지 신청 가능 (평점 우수자 예외 규정 포함)",
  "휴학은 통산 4학기(군휴학 제외)까지 가능하며 복학 시 전공 이수체계 확인 필수",
  "성적평가는 절대평가 기반이나 핵심교양·전공필수는 상대평가 비율을 준수",
];

export const detailedRuleHighlights = [
  "졸업요건: 130학점 + 졸업인증제(캡스톤/논문) + 비교과(현장실습·인턴) 권장",
  "복수전공/부전공 신청 시 전공심화 트랙 교과 상호 인정 규정 제공",
  "학사경고 2회 누적 시 지도교수 면담 및 학습설계 의무화",
  "전과는 2학년 1학기 이전/평점 3.0 이상 권장, 컴공 → 타 전공 이동 시에도 전공필수 이수 확인 필요",
];

export const yearCourses = {
  1: [
    {
      name: "데이터과학입문",
      englishName: "Introduction to Data Science",
      description:
        "데이터 과학의 개요, 활용 및 발전 방향을 소개하고 주요 알고리즘을 라이브러리로 실습해 소프트웨어 기술을 학습합니다.",
    },
    {
      name: "선형대수학",
      englishName: "Linear Algebra",
      description:
        "연립방정식, 행렬, 벡터공간 등 공학 전반에서 필수적인 수학 기초 이론을 다집니다.",
    },
    {
      name: "이산수학",
      englishName: "Discrete Mathematics",
      description:
        "집합, 관계, 함수, 알고리즘 분석 등 컴퓨터공학의 이론 기반이 되는 수학을 학습합니다.",
    },
    {
      name: "컴퓨터프로그램개발의이해",
      englishName: "Understanding Computer Programming",
      description:
        "컴퓨터공학 분야별 학습과정과 진로를 소개하며 공학 전반에 대한 이해도를 넓힙니다.",
    },
    {
      name: "C프로그래밍",
      englishName: "C Programming",
      description:
        "배열, 포인터, 입출력, 기초 자료구조 등 C언어 기반 프로그래밍 기법을 익힙니다.",
    },
    {
      name: "소프트웨어프로젝트Ⅰ(PBL)",
      englishName: "Software ProjectⅠ (PBL)",
      description:
        "파이썬 등 언어로 현실 문제를 해결하며 프로그래밍 실습과 협업 능력을 기릅니다.",
    },
    {
      name: "소프트웨어프로젝트Ⅱ",
      englishName: "Software ProjectⅡ",
      description:
        "C 프로그램 개발도구 활용법과 프로젝트 중심 문제 해결 능력을 강화합니다.",
    },
    {
      name: "컴퓨터개론",
      englishName: "An Introduction to Computer",
      description:
        "하드웨어·소프트웨어·운영체제·정보통신 개념 등 컴퓨터의 기본 원리와 발전 방향을 이해합니다.",
    },
  ],
  2: [
    {
      name: "알고리즘",
      englishName: "Computer Algorithms",
      description:
        "탐색, 정렬, 네트워크 등 문제에 대한 알고리즘을 설계·분석하고 직접 구현합니다.",
    },
    {
      name: "자료구조",
      englishName: "Data Structure",
      description:
        "배열, 스택, 큐, 리스트, 트리, 그래프 등 자료구조의 이론과 응용 방법을 학습합니다.",
    },
    {
      name: "컴퓨터구조",
      englishName: "Computer Architecture",
      description:
        "논리회로, 레지스터, 메모리, 명령어, 제어장치 등 컴퓨터 구조 전반을 다룹니다.",
    },
    {
      name: "서버관리",
      englishName: "Server Management",
      description:
        "Windows/Unix/Linux 서버 관리와 보안 개념을 실습하며 운영 능력을 배양합니다.",
    },
    {
      name: "소프트웨어프로젝트Ⅲ",
      englishName: "Software ProjectⅢ",
      description:
        "자료구조와 알고리즘을 활용한 실전 문제 해결 프로젝트를 수행합니다.",
    },
    {
      name: "소프트웨어프로젝트Ⅳ",
      englishName: "Software ProjectⅣ",
      description:
        "자바 기반 프로젝트 설계·관리를 통해 팀 협업과 프로젝트 목표 설정 능력을 기릅니다.",
    },
    {
      name: "운영체제",
      englishName: "Operating System",
      description:
        "프로세스, 스케줄링, 메모리, 입출력, 분산 시스템 등 OS 설계/구현 핵심 개념을 학습합니다.",
    },
    {
      name: "웹프로그래밍",
      englishName: "Web Programming",
      description:
        "웹 서버/DB 연동, JSP, PHP, ASP, XML, HTML5 등 최신 웹 프로그래밍 기법을 실습합니다.",
    },
    {
      name: "자바프로그래밍",
      englishName: "Java Programming",
      description:
        "객체지향 개념과 클래스를 바탕으로 구조적 소프트웨어 개발 능력을 배양합니다.",
    },
  ],
  3: [
    {
      name: "데이터베이스",
      englishName: "Data Base",
      description:
        "DB 기본 개념부터 관계형 모델, SQL, 정규화, 객체지향 DB, 회복·병행제어까지 다룹니다.",
    },
    {
      name: "컴퓨터네트워크",
      englishName: "Computer Networks",
      description:
        "데이터링크, LAN, TCP/IP, 보안 등 네트워크 구조와 프로토콜을 학습합니다.",
    },
    {
      name: "객체지향설계",
      englishName: "Object Oriented Design",
      description:
        "JAVA 기반 모델링과 구현, 팀 프로젝트 실습으로 객체지향 응용 역량을 강화합니다.",
    },
    {
      name: "기계학습",
      englishName: "Machine Learning",
      description:
        "머신러닝·딥러닝·SVM·부스팅 등 최신 알고리즘 이론과 실습을 수행합니다.",
    },
    {
      name: "모바일프로그래밍",
      englishName: "Mobile Programming",
      description:
        "모바일 플랫폼과 앱 개발 환경을 학습하고 실제 애플리케이션을 구현합니다.",
    },
    {
      name: "빅데이터",
      englishName: "Big Data",
      description:
        "대용량 데이터 분석·가치 추출·활용 기술 등 빅데이터 전반을 학습합니다.",
    },
    {
      name: "소프트웨어공학",
      englishName: "Software Engineering",
      description:
        "소프트웨어 개발 수명주기와 품질·재사용·생산성 향상 기법 등 공학적 개발 방법론을 익힙니다.",
    },
    {
      name: "웹응용",
      englishName: "Web Application",
      description:
        "동적 웹 문서 작성, PHP/JSP 연동, 웹 프로젝트 실습으로 고급 웹 개발 역량을 기릅니다.",
    },
    {
      name: "인공지능",
      englishName: "Artificial Intelligence",
      description:
        "논리·탐색, 지식표현, 학습, 자연어/영상 이해 등 AI 이론과 실전 응용을 학습합니다.",
    },
    {
      name: "임베디드시스템",
      englishName: "Embedded System",
      description:
        "임베디드 리눅스, 디바이스 드라이버, 시스템 제어 프로그래밍을 실습합니다.",
    },
  ],
  4: [
    {
      name: "캡스톤디자인",
      englishName: "Capstone Design",
      description:
        "산업체 연계 작품을 직접 설계·제작·평가하며 창의력과 실무 능력을 배양합니다.",
    },
    {
      name: "분산처리",
      englishName: "Distributed Processing",
      description:
        "하둡·스파크 등 플랫폼을 활용한 분산 데이터 처리 및 대규모 데이터 분석 기술을 학습합니다.",
    },
    {
      name: "사물인터넷",
      englishName: "Internet of Things",
      description:
        "센서와 오픈소스 하드웨어를 기반으로 IoT 구조와 응용 기술을 실습합니다.",
    },
    {
      name: "정보보호",
      englishName: "Information Security",
      description:
        "암호화, 키분배, 해킹, 포렌식, 방화벽, VPN 등 정보보안 이론과 실습을 다룹니다.",
    },
    {
      name: "컴퓨터공학특강",
      englishName: "Topics in Computer Engineering",
      description:
        "AI, 모바일, 클라우드, 빅데이터, IoT 등 최신 기술 분야의 특강을 제공합니다.",
    },
    {
      name: "해킹및보안",
      englishName: "Hacking and Security",
      description:
        "해킹·바이러스 유형, 침해사고 예방·대응·포렌식 등 실무형 보안 트레이닝을 수행합니다.",
    },
  ],
};
