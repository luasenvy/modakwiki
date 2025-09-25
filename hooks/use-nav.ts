"use client";

import {
  FilePlus2,
  FlameKindling,
  Image,
  Inbox,
  LucideIcon,
  ScrollText,
  SpellCheck,
  Tags,
  UserCheck,
} from "lucide-react";
import { create } from "zustand";
import { ScopeEnum, scopeEnum } from "@/lib/schema/user";

export interface NavItem {
  title: string;
  url: string;
  scope?: ScopeEnum;
  items?: Array<NavItem>;
  icon?: LucideIcon;
}

export const mainNavs: Array<NavItem> = [
  {
    title: "모닥위키",
    url: "/what-is-this",
    icon: FlameKindling,
  },
  {
    title: "위키",
    url: "#",
    items: [
      {
        title: "임의문서",
        url: "/w/random",
      },
      {
        title: "에세이",
        url: "/essay",
      },
    ],
  },
  {
    title: "편집자",
    scope: scopeEnum.editor,
    url: "#",
    items: [
      {
        title: "위키문법",
        url: "/editor/syntax",
        icon: SpellCheck,
      },
      {
        title: "작성요령",
        url: "/editor/tip",
        icon: ScrollText,
      },
      {
        title: "새 문서",
        url: "/editor/write",
        icon: FilePlus2,
      },
    ],
  },
  {
    title: "사이트관리",
    url: "#",
    scope: scopeEnum.admin,
    items: [
      {
        title: "태그관리",
        url: "/site/tag",
        icon: Tags,
      },
      {
        title: "사용자관리",
        url: "/site/user",
        icon: UserCheck,
      },
      {
        title: "이미지관리",
        url: "/site/image",
        icon: Image,
      },
    ],
  },
];

export const subNavs: Array<NavItem> = [
  {
    title: "문서함",
    url: "/me/documents",
    icon: Inbox,
    scope: scopeEnum.editor,
  },
];

interface NavItemsState {
  mainNavs: Array<NavItem>;
  setNavigations: (mainNavs: Array<NavItem>) => void;
  subNavs: Array<NavItem>;
  setSubNavigations: (subNavs: Array<NavItem>) => void;
}

export const useNavItems = create<NavItemsState>((set) => ({
  mainNavs,
  setNavigations: (mainNavs: Array<NavItem>) => set(() => ({ mainNavs })),
  subNavs,
  setSubNavigations: (subNavs: Array<NavItem>) => set(() => ({ subNavs })),
}));
