import {
  BookHeart,
  Bot,
  ChartLine,
  CodeXml,
  GraduationCap,
  Guitar,
  HandHeart,
  Handshake,
  IdCard,
  LucideIcon,
  MapPinned,
  Medal,
} from "lucide-react";
import { create } from "zustand";

export interface Navigation {
  name: string;
  href?: string;
  desc?: string;
  icon?: LucideIcon;
  className?: React.HTMLAttributes<HTMLDivElement>["className"];
  onlyDev?: boolean;
  primary?: boolean;
  promotion?: boolean;
  children?: Array<Navigation>;
}

export const navigations: Array<Navigation> = [
  {
    name: "책방",
    children: [
      {
        name: "주간인기글",
        href: "/hot/weekly",
        desc: "최고의 글을 만나보세요. 많은 이들이 찾아본 글들이 모여있습니다.",
        icon: Medal,
        primary: true,
      },
      {
        name: "시리즈",
        href: "/series",
        desc: "연작들을 모아놓은 공간입니다.",
        icon: BookHeart,
      },
      {
        name: "프로그래밍",
        href: "/bbs/w",
        desc: "프로그래밍과 관련된 다양한 이야기들을 만나보세요.",
        icon: CodeXml,
      },
      {
        name: "자유주제",
        href: "/bbs/b",
        desc: "좋아하는 것들에 대해서 이야기해요.",
        icon: Guitar,
      },
    ],
  },
  {
    name: "커뮤니티",
    children: [
      {
        name: "사이버 힐링",
        href: "/bbs/h",
        desc: "마음이 따뜻해지는 글들을 모았습니다.",
        icon: HandHeart,
      },
      {
        name: "AI 포토북",
        href: "/photobook",
        desc: "고품질의 AI 이미지를 무료로 사용해 보세요.",
        icon: Bot,
      },
    ],
  },
  {
    name: "프로모션",
    promotion: true,
    children: [
      {
        name: "국내여행지도",
        href: "/promotion/travel-map",
        desc: "공공데이터에서 제공하는 표준정보기반 여행지 정보를 확인할 수 있습니다.",
        icon: MapPinned,
        primary: true,
      },
      {
        name: "평생학습강좌 검색기",
        href: "/promotion/senior",
        desc: "공공데이터에서 제공하는 표준정보기반 평생학습강좌를 찾아보세요.",
        icon: GraduationCap,
      },
    ],
  },
  {
    name: "팀",
    href: "/team",
    icon: Handshake,
  },
  {
    name: "역할",
    href: "/role",
    icon: IdCard,
  },
  {
    name: "사이트 현황",
    href: "/rank",
    icon: ChartLine,
    className: "hidden lg:block",
    onlyDev: true,
  },
];

interface NavigationsState {
  navigations: Array<Navigation>;
  setNavigations: (navigations: Array<Navigation>) => void;
}

export const useNavigations = create<NavigationsState>((set) => ({
  navigations,
  setNavigations: (navigations: Array<Navigation>) => set(() => ({ navigations })),
}));
