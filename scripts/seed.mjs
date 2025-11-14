import crypto from "crypto";
import { PrismaClient, MaterialType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "compileroom123";
const CHAT_RAW_KEY =
  process.env.CHAT_ENCRYPTION_KEY ||
  process.env.AUTH_SECRET ||
  "compile-room-default-secret-key-32chars!";
const CHAT_KEY_BUFFER = Buffer.from(CHAT_RAW_KEY, "utf8");
const VERSION_PREFIX = Buffer.from("CR02");
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function deriveSeedKey(salt) {
  return crypto.pbkdf2Sync(CHAT_KEY_BUFFER, salt, 120000, 32, "sha256");
}

function encryptChat(text) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveSeedKey(salt);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([VERSION_PREFIX, salt, iv, authTag, encrypted]).toString(
    "base64",
  );
}

const sampleUsers = [
  {
    key: "hyunmin",
    name: "김현민",
    email: "hyunmin@compileroom.com",
    profileImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDgRqqNMlC0G5vLBK0RvIX9ob_TZsRI5ibAZKMMDrnB8kvtIJELumnQxKOZxH0MturYGRXSEHyWcXa3AzcQJPaoPQqutCU0DiJl2D8tj1w6RYs2zpbp6T_Ln9QWy8Ruarz9rvFE8QieYp2afoxZpm6XrYLr5aR0zjcdLkRWVCjDFA9s-_Kdsx967bi5IPPXYadXQy089sreIfFTF-1vQVmHJFs6vKRwt7NTSvKwtbylSh6liEDnrrl36LaRC-Ds7hBYBl3a10yivAo",
    classYear: "22학번",
    currentGrade: 4,
  },
  {
    key: "junhyeok",
    name: "최준혁",
    email: "junhyeok@compileroom.com",
    profileImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC0MUMFOL9pXAgC1FDCa_zxukazCXFDLlxF70WP2nwF5BtSh_1Hkj1UNVi4cth0j5CApa2DDp6Cg1X1a4f8UqCOVAX0cCetyYL-fHeB9ZlSaZ1f5lDXcNlzhX_NYc8xjb3y6uW4QHVIW0bQE93HqCNJf5BW298A4nf9iGJGFvMmdl2S5WGj9_gXi4YIFrtz9HqCUQagmVPz3tV0Dp8lkxI1wzFaXEluk0B2B41KwC64UQS12nOVv4R9ThKZSKmnd2y-DY_Z1PBkDEx",
    classYear: "22학번",
    currentGrade: 3,
  },
  {
    key: "eunwoo",
    name: "이은우",
    email: "eunwoo@compileroom.com",
    profileImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCzUtWPpd-p7l0FvvVKUt83pl3Ndmf1Qpr5VzCAMTLf4r_ILX1a7AnS2bwkILNoppIvsUvfPackNk6uvhU5M1y7NDHjf3ZVhMr7xR7ZTrvOUNuVK31g8D5oXpeSXvKcj8g6CrW31wX7lSSIf6AeywVWNwGUSxuovlXyhqdpTqo-S5cyJ8B_ldcVVrAMTF1XNM0XgqqG2ilqEmtgYDtp_adO8eF-41dIGYScKPwoUUYOkWxx",
    classYear: "22학번",
    currentGrade: 3,
  },
  {
    key: "chanho",
    name: "정찬호",
    email: "chanho@compileroom.com",
    profileImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBw0-oFP0z1oPVdcVhNdaX3kwxaF7yMgb_CjXojVbE3T37kDM0c9imrOf8NVDutlBRBGwSU-lhj36udzfRIi3QViASbY7qdfb1h3BR11zMR6A5kAyKyg7HO0EgMlFaGkkooNmvO9gM_jtiB5y2-PVZjeoOxNvnRzjrqXn4U_8ZzKXeBQog1TzXdW4cnszvtiIwy3dzpFPLQOx3fWLwDzNiDXChQ6VW58zk3xHj_",
    classYear: "22학번",
    currentGrade: 2,
  },
];

const sampleRooms = [
  {
    key: "general",
    name: "전체 채팅방",
    description: "전공 공지와 자유 대화를 위한 기본 채널입니다.",
    isPrivate: false,
    isDefault: true,
    ownerKey: "hyunmin",
  },
  {
    key: "study",
    name: "알고리즘 스터디",
    description: "주 2회 오프라인 스터디 공지방",
    isPrivate: true,
    password: "study123",
    ownerKey: "junhyeok",
  },
];

const sampleRoomMembers = [
  { roomKey: "general", userKey: "junhyeok" },
  { roomKey: "general", userKey: "eunwoo" },
  { roomKey: "general", userKey: "chanho" },
  { roomKey: "study", userKey: "eunwoo" },
];

const sampleMaterials = [
  {
    key: "algorithm-final",
    authorKey: "hyunmin",
    title: "알고리즘 기말고사 대비 문제",
    description:
      "2024 알고리즘 기말 대비 핵심 문제 PDF 입니다. 난이도별 해설 포함.",
    subject: "알고리즘",
    type: MaterialType.EXAM,
    fileName: "algorithms.pdf",
    fileUrl: "/mock/algorithms.pdf",
    fileType: "application/pdf",
    heroImageUrl: "/mock/detail-preview.png",
    downloadCount: 0,
    favoriteCount: 0,
    category: "전공",
  },
  {
    key: "ds-mid",
    authorKey: "junhyeok",
    title: "자료구조 중간 예상문제",
    description:
      "연결 리스트, 힙, 그래프 집중 공략 문제와 풀이입니다. 정답 체크리스트 포함.",
    subject: "자료구조",
    type: MaterialType.EXAM,
    fileName: "data-structures.pdf",
    fileUrl: "/mock/data-structures.pdf",
    fileType: "application/pdf",
    heroImageUrl: "/mock/main-preview.png",
    downloadCount: 0,
    favoriteCount: 0,
    category: "전공",
  },
  {
    key: "oop-lab-week5",
    authorKey: "eunwoo",
    title: "OOP 5주차 실습 가이드",
    description:
      "SOLID 원칙과 리팩터링 예제를 정리했습니다. 실습 코드 템플릿 포함.",
    subject: "객체지향프로그래밍",
    type: MaterialType.ASSIGNMENT,
    fileName: "oop-week5.pdf",
    fileUrl: "/mock/algorithms.pdf",
    fileType: "application/pdf",
    downloadCount: 0,
    favoriteCount: 0,
    category: "전공",
  },
  {
    key: "ml-tutorial",
    authorKey: "chanho",
    title: "머신러닝 프로젝트 스타터 팩",
    description:
      "데이터 전처리부터 간단한 CNN 학습까지 포함한 튜토리얼입니다.",
    subject: "머신러닝",
    type: MaterialType.SUMMARY,
    fileName: "ml-tutorial.pdf",
    fileUrl: "/mock/data-structures.pdf",
    fileType: "application/pdf",
    downloadCount: 0,
    favoriteCount: 0,
    category: "교양",
  },
];

const sampleComments = [
  {
    materialKey: "algorithm-final",
    authorKey: "junhyeok",
    content: "이 자료로 모의고사 봤는데 정확도가 엄청 높았어요. 감사합니다!",
  },
  {
    materialKey: "algorithm-final",
    authorKey: "eunwoo",
    content: "5번 문제 해설이 약간 헷갈려서 수정 의견 남깁니다.",
  },
  {
    materialKey: "ds-mid",
    authorKey: "hyunmin",
    content: "질문 있으면 댓글이나 채팅방에 남겨주세요!",
  },
];

const samplePosts = [
  {
    title: "자료구조 스터디 계획 공유",
    content:
      "해시, 힙, 그래프 순으로 진행합니다. 참고 슬라이드는 드라이브에 업로드했습니다.",
    authorKey: "junhyeok",
    tags: "스터디,자료구조",
    category: "전공",
    viewCount: 0,
    isExample: true,
  },
  {
    title: "운영체제 중간 대비 핵심 요점",
    content:
      "프로세스 상태 전이, 세마포어, 뮤텍스 사례 위주로 정리했어요. 시험 전에 숙지 필수!",
    authorKey: "hyunmin",
    tags: "운영체제,시험",
    category: "전공",
    viewCount: 0,
    isExample: true,
  },
];

const sampleChatMessages = [
  {
    roomKey: "general",
    authorKey: "eunwoo",
    content: "혹시 머신러닝 팀플 발표 자료 공유 가능한가요?",
  },
  {
    roomKey: "general",
    authorKey: "chanho",
    content: "슬랙 공유한 PDF가 최신이에요! 확인해 주세요.",
  },
  {
    roomKey: "study",
    authorKey: "junhyeok",
    content: "오늘은 그래프 탐색 심화까지 진행할 예정입니다.",
  },
];

async function main() {
  await prisma.comment.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.chatRoomMember.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.post.deleteMany();
  await prisma.material.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const userMap = new Map();
  for (const user of sampleUsers) {
    const record = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        classYear: user.classYear,
        currentGrade: user.currentGrade ?? null,
        passwordHash,
      },
    });
    userMap.set(user.key, record);
  }

  const roomMap = new Map();
  for (const room of sampleRooms) {
    const record = await prisma.chatRoom.create({
      data: {
        name: room.name,
        description: room.description,
        isPrivate: room.isPrivate ?? false,
        isDefault: room.isDefault ?? false,
        passwordHash: room.password
          ? await bcrypt.hash(room.password, 10)
          : null,
        ownerId: userMap.get(room.ownerKey).id,
      },
    });
    roomMap.set(room.key, record);
    await prisma.chatRoomMember.create({
      data: {
        roomId: record.id,
        userId: record.ownerId,
        role: "owner",
      },
    });
  }

  for (const membership of sampleRoomMembers) {
    const room = roomMap.get(membership.roomKey);
    const user = userMap.get(membership.userKey);
    if (!room || !user) continue;
    await prisma.chatRoomMember.upsert({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        roomId: room.id,
        userId: user.id,
      },
    });
  }

  const materialMap = new Map();
  for (const material of sampleMaterials) {
    const record = await prisma.material.create({
      data: {
        title: material.title,
        description: material.description,
        subject: material.subject,
        type: material.type,
        fileName: material.fileName,
        fileUrl: material.fileUrl,
        heroImageUrl: material.heroImageUrl,
        fileType: material.fileType,
        downloadCount: material.downloadCount,
        favoriteCount: material.favoriteCount,
        category: material.category ?? "전공",
        authorId: userMap.get(material.authorKey).id,
      },
    });
    materialMap.set(material.key, record);
  }

  for (const comment of sampleComments) {
    await prisma.comment.create({
      data: {
        content: comment.content,
        authorId: userMap.get(comment.authorKey).id,
        materialId: materialMap.get(comment.materialKey).id,
      },
    });
  }

  for (const post of samplePosts) {
    await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        tags: post.tags,
        category: post.category ?? "전공",
        viewCount: post.viewCount ?? 0,
        isExample: !!post.isExample,
        authorId: userMap.get(post.authorKey).id,
      },
    });
  }

  for (const message of sampleChatMessages) {
    const room = roomMap.get(message.roomKey);
    const author = userMap.get(message.authorKey);
    if (!room || !author) continue;
    await prisma.chatMessage.create({
      data: {
        content: encryptChat(message.content),
        roomId: room.id,
        authorId: author.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seed data inserted");
  })
  .catch(async (error) => {
    console.error("❌ Failed to seed database", error);
    await prisma.$disconnect();
    process.exit(1);
  });
