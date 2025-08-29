"use client";

import {
  File,
  FilePenLine,
  FilePlus2,
  Inbox,
  LucideIcon,
  ScrollText,
  SpellCheck,
} from "lucide-react";
import { create } from "zustand";

export interface NavItem {
  title: string;
  url: string;
  items?: Array<NavItem>;
  icon?: LucideIcon;
}

export const mainNavs: Array<NavItem> = [
  {
    title: "Getting Started",
    url: "#",
    items: [
      {
        title: "모닥위키",
        url: "/what-is-this",
      },
    ],
  },
  {
    title: "문서",
    url: "#",
    items: [
      {
        title: "임의문서",
        url: "#",
      },
      {
        title: "변경내역",
        url: "#",
      },
    ],
  },
  {
    title: "에디터",
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
];

export const subNavs: Array<NavItem> = [
  {
    title: "내 문서",
    url: "/me/docs",
    icon: Inbox,
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
