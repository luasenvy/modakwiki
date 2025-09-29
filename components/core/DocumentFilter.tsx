"use client";

import { CheckIcon, MessageSquareHeart, ScrollText, Search } from "lucide-react";
import { SearchParams } from "next/dist/server/request/search-params";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/components/ui/shadcn-io/tags";
import { Toggle } from "@/components/ui/toggle";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Doctype, doctypeEnum } from "@/lib/schema/document";
import { Tag } from "@/lib/schema/tag";
import { getSearchParamsFromObject } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentFilterProps {
  lng: Language;
  searchParams: SearchParams;
  type?: Doctype;
}

export function DocumentFilter({
  lng: lngParam,
  searchParams,
  type: doctype = doctypeEnum.document,
}: DocumentFilterProps) {
  const router = useRouter();
  const { t } = useTranslation(lngParam);

  const [type, setType] = useState<Doctype>(doctype);

  const [searchKeyword, setSearchKeyword] = useState<string>(String(searchParams.search || ""));
  const [searchCategory, setSearchCategory] = useState<string>(String(searchParams.category || ""));
  const [searchTags, setSearchTags] = useState<string[]>(
    Array.isArray(searchParams.tags) ? searchParams.tags : [],
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const baseSearchParams = getSearchParamsFromObject(searchParams);

  const handleSearch = (value?: string) => {
    baseSearchParams.delete("page");
    baseSearchParams.delete("search");
    baseSearchParams.delete("category");
    baseSearchParams.delete("tags");

    baseSearchParams.append("page", "1");
    baseSearchParams.append("search", value ?? searchKeyword.trim());
    baseSearchParams.append("category", searchCategory);

    searchTags.forEach((tag) => baseSearchParams.append("tags", tag));

    router.push(`?${baseSearchParams}`);
  };

  const handleKeydownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e.currentTarget.value);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/category?${new URLSearchParams({ type })}`);

      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setCategories(await res.json());
    })();
  }, [type]);

  const getTags = useCallback(async () => {
    setSearchTags([]);
    if (!searchCategory) return setTags([]);

    const res = await fetch(`/api/tag?${new URLSearchParams({ type, category: searchCategory })}`);

    if (!res.ok) return toast.error(await statusMessage({ t, res }));
    setTags(await res.json());
  }, [searchCategory]);

  useEffect(() => {
    getTags();
  }, [getTags]);

  return (
    <div className="flex items-center gap-1">
      <Toggle
        variant="outline"
        pressed={type === doctypeEnum.document}
        className={cn("!min-w-20 rounded-none", {
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
        className={cn("!min-w-20 rounded-none", {
          "!border-rose-200 !bg-rose-50 !text-rose-800 shrink-0": type === doctypeEnum.post,
        })}
        onPressedChange={(pressed: boolean) => pressed && setType(doctypeEnum.post)}
        aria-label="Toggle post"
      >
        <MessageSquareHeart className="size-4" />
        {t("post")}
      </Toggle>

      <Select
        value={searchCategory}
        onValueChange={(value) => setSearchCategory(value === "all" ? "" : value)}
      >
        <SelectTrigger className="rounded-none">
          <SelectValue placeholder={t("Select a category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("All categories")}</SelectItem>
          {categories.map((id) => (
            <SelectItem key={id} value={id}>
              {id}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {searchCategory && (
        <Tags>
          <TagsTrigger className="rounded-none" i18n={{ selectATag: t("Select a tag") }}>
            {searchTags.map((tag) => (
              <TagsValue
                key={`tag-value-${tag}`}
                onRemove={() => setSearchTags((prev) => prev.filter((t) => t !== tag))}
              >
                {tag}
              </TagsValue>
            ))}
          </TagsTrigger>
          <TagsContent>
            <TagsInput placeholder={t("Search options...")} />
            <TagsList>
              <TagsEmpty>{t("No tags found.")}</TagsEmpty>
              <TagsGroup>
                {tags
                  .filter((tag) => !searchTags.includes(tag.id))
                  .map(({ id }) => (
                    <TagsItem
                      key={`tag-${id}`}
                      onSelect={(value) => {
                        if (searchTags.includes(value))
                          return setSearchTags((prev) => prev.filter((t) => t !== value));

                        setSearchTags((prev) => prev.concat(value));
                      }}
                      value={id}
                    >
                      {id}
                      {searchTags.includes(id) && (
                        <CheckIcon className="text-muted-foreground" size={14} />
                      )}
                    </TagsItem>
                  ))}
              </TagsGroup>
            </TagsList>
          </TagsContent>
        </Tags>
      )}

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
  );
}
