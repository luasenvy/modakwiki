"use client";

import { ChevronsDown, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Category } from "@/lib/schema/category";
import { Tag } from "@/lib/schema/tag";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  rows: Array<Category>;
}

export function CategoryList({ rows }: CategoryListProps) {
  const router = useRouter();

  const { t } = useTranslation();

  const firstInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<Tag[]>([]);
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
      body: JSON.stringify({ id: inputCategory }),
    };

    const res = await fetch("/api/category", options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    setInputCategory("");
    router.refresh();
  };

  const handleClickCreateTag = async () => {
    if (!selectedCategory || !inputTag) return;

    // Call your API or function to create the tag
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inputTag, category: selectedCategory }),
    };

    const res = await fetch(`/api/tag`, options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    setInputTag("");
    getTags();
  };

  const handleClickDeleteCategory = async (id: string) => {
    const options = { method: "DELETE" };

    const res = await fetch(`/api/category?${new URLSearchParams({ id })}`, options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    if (id === selectedCategory) setSelectedCategory("");
    router.refresh();
  };

  const handleClickDeleteTag = async (category: string, id: string) => {
    const options = { method: "DELETE" };

    const res = await fetch(
      `/api/tag?${new URLSearchParams({
        category,
        id,
      })}`,
      options,
    );

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    setInputTag("");
    getTags();
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
          {rows.map(({ id }) => (
            <CommandItem
              key={id}
              onSelect={setSelectedCategory}
              className={cn({ "!text-blue-500 underline": id === selectedCategory })}
            >
              {id}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto size-6">
                    <Trash className="size-3.5 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("This action cannot be undone. This will delete data permanently.")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                      {t("Cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickDeleteCategory(id);
                      }}
                    >
                      {t("Yes, I'm sure")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
                {tags.map(({ category, id }) => (
                  <CommandItem key={`tag-${category}-${id}`}>
                    {id}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="ml-auto size-6">
                          <Trash className="size-3.5 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("This action cannot be undone. This will delete data permanently.")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                            {t("Cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClickDeleteTag(category, id);
                            }}
                          >
                            {t("Yes, I'm sure")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
