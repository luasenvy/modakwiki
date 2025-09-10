"use client";

import debounce from "lodash.debounce";
import { ChevronsDown, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components/mdx/Alert";
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
import { Input } from "@/components/ui/input";
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
  const [categories, setCategories] = useState<Array<Category>>(rows);
  const [tags, setTags] = useState<Tag[]>([]);
  const [inputCategory, setInputCategory] = useState<string>("");
  const [inputTag, setInputTag] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingTags, setLoadingTags] = useState<boolean>(false);
  const [changeCategoryName, setChangeCategoryName] = useState<string>("");
  const [changeTagName, setChangeTagName] = useState<string>("");

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

  const handleClickEditNameTag = async (id: string, category: string, name: string) => {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, category, name }),
    };
    const res = await fetch("/api/tag", options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    const index = tags.findIndex(({ id: _id }) => id === _id);
    if (index < 0) return router.refresh();

    setTags((prev) => prev.toSpliced(index, 1, { ...prev[index], id: name }));
  };

  const handleClickEditNameCategory = async (id: string, name: string) => {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    };
    const res = await fetch("/api/category", options);

    if (!res.ok) return statusMessage({ t, status: res.status, options });

    const index = categories.findIndex(({ id: _id }) => id === _id);
    if (index < 0) return router.refresh();

    setCategories((prev) => prev.toSpliced(index, 1, { ...prev[index], id: name }));
    setSelectedCategory(name);
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
          {categories.map(({ id }) => (
            <CommandItem
              key={id}
              onSelect={setSelectedCategory}
              className={cn("group", { "!text-blue-500 underline": id === selectedCategory })}
            >
              {id}
              <div className={cn("ml-auto hidden items-center gap-1 group-hover:flex")}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-5">
                      <Edit className="size-3.5 text-orange-500" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("Change name")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("You can change the category name here.")}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4">
                      <Input
                        name={`category-name-${id}`}
                        defaultValue={id}
                        onChange={debounce((e) => setChangeCategoryName(e.target.value), 110)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        {t("Cancel")}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickEditNameCategory(id, changeCategoryName);
                        }}
                      >
                        {t("Save")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-5">
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
              </div>
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
                  <CommandItem className="group" key={`tag-${category}-${id}`}>
                    {id}
                    <div className={cn("ml-auto hidden items-center gap-1 group-hover:flex")}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-5">
                            <Edit className="size-3.5 text-orange-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("Change name")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("You can change the tag name here.")}
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <div className="py-4">
                            <Input
                              id={`tag-name-${id}`}
                              defaultValue={id}
                              onChange={debounce((e) => setChangeTagName(e.target.value), 110)}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>

                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                              {t("Cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickEditNameTag(id, category, changeTagName);
                              }}
                            >
                              {t("Save")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-auto size-5">
                            <Trash className="size-3.5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("Are you absolutely sure?")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t(
                                "This action cannot be undone. This will delete data permanently.",
                              )}
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
                    </div>
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
