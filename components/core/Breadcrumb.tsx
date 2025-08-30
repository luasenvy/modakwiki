"use client";

import { HomeIcon } from "lucide-react";
import { useEffect } from "react";
import { BreadcrumbItem, useSidebar } from "@/components/ui/sidebar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

interface BreadcrumbProps {
  breadcrumbs?: Array<BreadcrumbItem>;
  lng: Language;
}

export function Breadcrumb({ lng: lngParam, breadcrumbs = [] }: BreadcrumbProps) {
  const { setBreadcrumbs } = useSidebar();

  const { t } = useTranslation(lngParam);
  const lng = localePrefix(lngParam);

  const Home: BreadcrumbItem = { title: t("Home"), href: `${lng}/` };

  useEffect(() => {
    setBreadcrumbs([Home, ...breadcrumbs]);
  }, [breadcrumbs]);

  return null;
}
