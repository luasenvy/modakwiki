"use client";

import { CheckIcon, Search } from "lucide-react";
import { SearchParams } from "next/dist/server/request/search-params";
import { useRouter, useSearchParams } from "next/navigation";
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
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Tag } from "@/lib/schema/tag";
import { getSearchParamsFromObject, localePrefix } from "@/lib/url";

interface DocumentFilterProps {
  lng: Language;
  searchParams: SearchParams;
}

export function DocumentFilter({ lng: lngParam, searchParams }: DocumentFilterProps) {
  const router = useRouter();
  const { t } = useTranslation(lngParam);
  const lng = localePrefix(lngParam);

  const [searchKeyword, setSearchKeyword] = useState<string>(String(searchParams.search || ""));
  const [searchCategory, setSearchCategory] = useState<string>(String(searchParams.category || ""));
  const [searchTags, setSearchTags] = useState<string[]>(
    Array.isArray(searchParams.tags) ? searchParams.tags : [],
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const baseSearchParams = getSearchParamsFromObject(searchParams);

  const handleSearch = (value?: string) => {
    const trimmed = value ?? searchKeyword.trim();

    if (!trimmed.length && !searchCategory.length && !searchTags.length)
      return toast.error(t("Please input search keywords"));

    baseSearchParams.delete("page");
    baseSearchParams.delete("search");
    baseSearchParams.delete("category");
    baseSearchParams.delete("tags");

    baseSearchParams.append("page", "1");
    baseSearchParams.append("search", trimmed);
    baseSearchParams.append("category", searchCategory);

    searchTags.forEach((tag) => baseSearchParams.append("tags", tag));

    router.push(`${lng}/essay?${baseSearchParams}`);
  };

  const handleKeydownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(e.currentTarget.value);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/category");

      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setCategories(await res.json());
    })();
  }, []);

  const getTags = useCallback(async () => {
    if (!searchCategory) return setTags([]);

    const res = await fetch(`/api/tag?${new URLSearchParams({ category: searchCategory })}`);

    if (!res.ok) return toast.error(await statusMessage({ t, res }));

    setTags(await res.json());
  }, [searchCategory]);

  useEffect(() => {
    getTags();
  }, [getTags]);

  return (
    <div className="flex items-center gap-1">
      <Select value={searchCategory} onValueChange={(value) => setSearchCategory(value)}>
        <SelectTrigger className="rounded-none">
          <SelectValue placeholder={t("Select a category")} />
        </SelectTrigger>
        <SelectContent>
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
        className="rounded-none"
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
