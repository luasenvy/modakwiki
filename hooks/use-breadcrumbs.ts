import { create } from "zustand";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbsState {
  breadcrumbs: Array<BreadcrumbItem>;
  setBreadcrumbs: (breadcrumbs: Array<BreadcrumbItem>) => void;
}

export const useBreadcrumbs = create<BreadcrumbsState>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs: Array<BreadcrumbItem>) => set(() => ({ breadcrumbs })),
}));
