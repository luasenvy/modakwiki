"use client";

import { ChevronsDown, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { statusMessage } from "@/lib/fetch/react";
import { useTranslation } from "@/lib/i18n/react";
import { Tag } from "@/lib/schema/tag";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  rows: Array<Tag>;
}

export function CategoryList({ rows }: CategoryListProps) {
  const router = useRouter();

  const { t } = useTranslation();

  const firstInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [inputCategory, setInputCategory] = useState<string>("");
  const [inputTag, setInputTag] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingTags, setLoadingTags] = useState<boolean>(false);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const getTags = useCallback(async () => {
    setTags([]);

    if (!selectedCategory) return;

    setLoadingTags(true);
    const res = await fetch(`/api/tag?category=${selectedCategory}`);

    if (!res.ok) return statusMessage({ t, status: res.status });

    setTags(await res.json());
    setLoadingTags(false);
  }, [selectedCategory]);

  useEffect(() => {
    getTags();
  }, [selectedCategory]);

  const handleClickCreateCategory = async () => {
    if (!inputCategory) return;

    // Call your API or function to create the tag
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: inputCategory }),
    };

    const res = await fetch("/api/tag", options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    setInputCategory("");
    router.refresh();
  };

  const handleClickCreateTag = async () => {
    if (!selectedCategory || !inputTag) return;

    // Call your API or function to create the tag
    const options = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: selectedCategory, tags: inputTag }),
    };

    const res = await fetch(`/api/tag`, options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    setInputTag("");
    getTags();
  };

  const handleClickDeleteCategory = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };
  const handleClickDeleteTag = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Command className="max-h-[calc(40dvh_-_(var(--spacing)_*_20))] rounded-lg border shadow-md">
        <CommandInput
          ref={firstInputRef}
          value={inputCategory}
          onValueChange={setInputCategory}
          placeholder={t("Type a category or search...")}
        />
        <CommandList>
          <CommandEmpty className="flex flex-col items-center space-y-2 p-4">
            {inputCategory ? (
              <>
                <p className="text-muted-foreground text-sm">
                  "{inputCategory}" {t("Category is not exists")}{" "}
                </p>
                <Button size="sm" onClick={handleClickCreateCategory}>
                  {t("Create New")}
                </Button>
              </>
            ) : (
              t("No results found.")
            )}
          </CommandEmpty>
          {rows.map(({ category }) => (
            <CommandItem
              key={category}
              onSelect={setSelectedCategory}
              className={cn({
                "!text-blue-500 underline": category === selectedCategory,
              })}
            >
              {category}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                onClick={handleClickDeleteCategory}
              >
                <Trash className="size-3.5" />
              </Button>
            </CommandItem>
          ))}
        </CommandList>
      </Command>

      {selectedCategory && (
        <>
          <ChevronsDown className="size-4" />
          {loadingTags ? (
            <Spinner className="m-auto" variant="ring" size={32} />
          ) : (
            <Command className="max-h-[calc(40dvh_-_(var(--spacing)_*_20))] rounded-lg border shadow-md">
              <CommandInput
                value={inputTag}
                onValueChange={setInputTag}
                placeholder={t("Type a tag or search...")}
              />
              <CommandList>
                <CommandEmpty className="flex flex-col items-center space-y-2 p-4">
                  {inputTag ? (
                    <>
                      <p className="text-muted-foreground text-sm">
                        "{inputTag}" {t("Tag is not exists")}{" "}
                      </p>
                      <Button size="sm" onClick={handleClickCreateTag}>
                        {t("Create New")}
                      </Button>
                    </>
                  ) : (
                    t("No results found.")
                  )}
                </CommandEmpty>
                {tags.map((tag) => (
                  <CommandItem key={tag}>
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      onClick={handleClickDeleteTag}
                    >
                      <Trash className="size-3.5" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          )}
        </>
      )}
    </div>
  );
}
