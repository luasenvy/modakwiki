"use client";

import { useEffect } from "react";
import { BreadcrumbItem, useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

interface BreadcrumbProps {
  breadcrumbs?: Array<BreadcrumbItem>;
  lng: Language;
}

export function Breadcrumb({ lng: lngParam, breadcrumbs = [] }: BreadcrumbProps) {
  const setBreadcrumbs = useBreadcrumbs((state) => state.setBreadcrumbs);

  const lng = localePrefix(lngParam);
  const { t } = useTranslation();

  useEffect(() => {
    setBreadcrumbs([{ title: t("Home"), href: `${lng}/` }, ...breadcrumbs]);
  }, [t, breadcrumbs]);

  return null;
}
