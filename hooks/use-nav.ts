"use client";

import {
  CircleUserRound,
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
    title: "WhatIsThis",
    url: "/what-is-this",
    icon: FlameKindling,
  },
  {
    title: "Wiki",
    url: "#",
    items: [
      { title: "Random", url: "/random" },
      { title: "Weekly", url: "/weekly" },
      { title: "Recent", url: "/list?sort=created" },
    ],
  },
  {
    title: "Editor",
    scope: scopeEnum.editor,
    url: "#",
    items: [
      {
        title: "Syntax",
        url: "/editor/syntax",
        icon: SpellCheck,
      },
      {
        title: "Instructions",
        url: "/editor/tip",
        icon: ScrollText,
      },
      {
        title: "New document",
        url: "/editor/write",
        icon: FilePlus2,
      },
    ],
  },
  {
    title: "Site",
    url: "#",
    scope: scopeEnum.admin,
    items: [
      {
        title: "Tag",
        url: "/site/tag",
        icon: Tags,
      },
      {
        title: "User",
        url: "/site/user",
        icon: UserCheck,
      },
      {
        title: "Image",
        url: "/site/image",
        icon: Image,
      },
    ],
  },
];

export const subNavs: Array<NavItem> = [
  {
    title: "Profile",
    url: "/me/profile",
    icon: CircleUserRound,
    scope: scopeEnum.editor,
  },
  {
    title: "Documents",
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
