"use client";

import { MessageSquareHeart, ScrollText, Search } from "lucide-react";
import { SearchParams } from "next/dist/server/request/search-params";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Doctype, doctypeEnum } from "@/lib/schema/document";
import { getSearchParamsFromObject } from "@/lib/url";
import { cn } from "@/lib/utils";

interface SeriesFilterProps {
  lng: Language;
  searchParams: SearchParams;
  type?: Doctype;
}

export function SeriesFilter({
  lng: lngParam,
  searchParams,
  type: doctype = doctypeEnum.document,
}: SeriesFilterProps) {
  const router = useRouter();
  const { t } = useTranslation(lngParam);

  const [type, setType] = useState<Doctype>(doctype);

  const [searchKeyword, setSearchKeyword] = useState<string>("");

  const baseSearchParams = getSearchParamsFromObject(searchParams);

  const handleSearch = (value?: string) => {
    baseSearchParams.delete("type");
    baseSearchParams.delete("page");
    baseSearchParams.delete("search");

    baseSearchParams.append("type", type);
    baseSearchParams.append("page", "1");
    baseSearchParams.append("search", value ?? searchKeyword.trim());

    router.push(`?${baseSearchParams}`);
  };

  const handleKeydownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e.currentTarget.value);
    }
  };

  useEffect(() => {
    if (searchParams.search) setSearchKeyword(String(searchParams.search));
  }, [searchParams.search]);

  return (
    <div className="space-y-1">
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-1 max-lg:col-span-2">
          <Toggle
            variant="outline"
            pressed={type === doctypeEnum.document}
            className={cn("!min-w-20 grow rounded-none", {
              "!border-blue-200 !bg-blue-50 !text-blue-800 shrink-0": type === doctypeEnum.document,
            })}
            onPressedChange={(pressed: boolean) => pressed && setType(doctypeEnum.document)}
            aria-label="Toggle wkdoc"
          >
            <ScrollText className="size-4" />
            {t("document")}
          </Toggle>

          <Toggle
            variant="outline"
            pressed={type === doctypeEnum.post}
            className={cn("!min-w-20 grow rounded-none", {
              "!border-rose-200 !bg-rose-50 !text-rose-800 shrink-0": type === doctypeEnum.post,
            })}
            onPressedChange={(pressed: boolean) => pressed && setType(doctypeEnum.post)}
            aria-label="Toggle post"
          >
            <MessageSquareHeart className="size-4" />
            {t("post")}
          </Toggle>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Input
          name="searchKeyword"
          className="grow rounded-none"
          placeholder={t("Please input search keywords")}
          defaultValue={searchKeyword}
          onBlur={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeydownInput}
        />

        <Button
          type="button"
          className="rounded-none"
          variant="outline"
          onClick={() => handleSearch()}
        >
          <Search className="size-5" />
        </Button>
      </div>
    </div>
  );
}
