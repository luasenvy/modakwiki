"use client";

import { useEffect } from "react";
import { BreadcrumbItem, useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

interface BreadcrumbProps {
  home?: boolean;
  breadcrumbs?: Array<BreadcrumbItem>;
  lng: Language;
}

export function Breadcrumb({ lng: lngParam, breadcrumbs = [], home }: BreadcrumbProps) {
  const setBreadcrumbs = useBreadcrumbs((state) => state.setBreadcrumbs);

  const { t } = useTranslation(lngParam);
  const lng = localePrefix(lngParam);

  if (home) breadcrumbs = [{ title: t("Home"), href: `${lng}/` }, ...breadcrumbs];

  useEffect(() => {
    setBreadcrumbs(breadcrumbs);
  }, [breadcrumbs]);

  return null;
}
