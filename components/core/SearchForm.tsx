"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SidebarGroup, SidebarGroupContent, SidebarInput } from "@/components/ui/sidebar";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { localePrefix } from "@/lib/url";

interface SearchFormProps extends React.ComponentProps<"form"> {
  lng: Language;
}

export function SearchForm({ lng: lngParam, ...props }: SearchFormProps) {
  const router = useRouter();
  const defaultTerm = useSearchParams().get("term") ?? "";

  const { t } = useTranslation(lngParam);

  const lng = localePrefix(lngParam);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const term = new FormData(e.currentTarget).get("search") as string;
    if (!term) return;

    router.push(`${lng}/search?${new URLSearchParams({ term })}`);
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            name="search"
            placeholder={t("Search the document")}
            className="pl-8"
            defaultValue={defaultTerm}
          />
          <Search className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-2 size-4 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}
