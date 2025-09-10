"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

interface BreadcrumbProps {
  home?: boolean;
  breadcrumbs?: Array<BreadcrumbItem>;
  lng: Language;
}

export function Breadcrumb({ lng: lngParam, breadcrumbs = [], home }: BreadcrumbProps) {
  const { setBreadcrumbs } = useSidebar();

  const { t } = useTranslation(lngParam);
  const lng = localePrefix(lngParam);

  if (home) breadcrumbs = [{ title: t("Home"), href: `${lng}/` }, ...breadcrumbs];

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, [breadcrumbs]);

  return null;
}
