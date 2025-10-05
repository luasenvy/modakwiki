"use client";

import debounce from "lodash.debounce";
import {
  ChevronsDown,
  ChevronsRight,
  Edit,
  MessageSquareHeart,
  ScrollText,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
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
import { Toggle } from "@/components/ui/toggle";
import { useBreakpoints } from "@/hooks/use-breakpoints";
import { statusMessage } from "@/lib/fetch/react";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/react";
import { Doctype, doctypeEnum } from "@/lib/schema/document";
import { Tag } from "@/lib/schema/tag";
import { cn } from "@/lib/utils";

interface CategoryListProps {
  lng: Language;
}

export function CategoryList({ lng: lngParam }: CategoryListProps) {
  const router = useRouter();

  const { t } = useTranslation(lngParam);

  const firstInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<Doctype>(doctypeEnum.document);

  const [series, setSeries] = useState<Array<string>>([]);
  const [pages, setPages] = useState<Tag[]>([]);
  const [inputCategory, setInputCategory] = useState<string>("");
  const [inputTag, setInputTag] = useState<string>("");
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [loadingPages, setLoadingPages] = useState<boolean>(false);
  const [changeSeriesName, setChangeSeriesName] = useState<string>("");

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const getPages = useCallback(async () => {
    setPages([]);

    if (!selectedSeries) return;

    setLoadingPages(true);
    const res = await fetch(
      `/api/series/pages?${new URLSearchParams({ type, series: selectedSeries })}`,
    );

    if (!res.ok) return toast.error(await statusMessage({ t, res }));

    setPages(await res.json());
    setLoadingPages(false);
  }, [selectedSeries]);

  useEffect(() => {
    getPages();
  }, [selectedSeries]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/series?${new URLSearchParams({ type })}`);
      if (!res.ok) return toast.error(await statusMessage({ t, res }));

      setSeries(await res.json());
      setSelectedSeries("");
    })();
  }, [type]);

  const handleClickCreateCategory = async () => {
    if (!inputCategory) return;

    // Call your API or function to create the tag
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inputCategory, type }),
    };

    const res = await fetch("/api/category", options);

    if (!res.ok) return await statusMessage({ t, res, options });

    setSeries((prev) => [...prev, inputCategory]);
    setInputCategory("");
  };

  const handleClickCreateTag = async () => {
    if (!selectedSeries || !inputTag) return;

    // Call your API or function to create the tag
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: inputTag, category: selectedSeries, type }),
    };

    const res = await fetch(`/api/tag`, options);

    if (!res.ok) return await statusMessage({ t, res, options });

    setInputTag("");
    setPages((prev) => [...prev, { id: inputTag, category: selectedSeries, type }]);
  };

  const handleClickEditNameCategory = async (id: string, name: string) => {
    const options = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name, type }),
    };
    const res = await fetch("/api/category", options);

    if (!res.ok) return await statusMessage({ t, res, options });

    const index = series.findIndex((_id) => id === _id);
    if (index < 0) return router.refresh();

    setSeries((prev) => prev.toSpliced(index, 1, name));
    setSelectedSeries(name);
  };

  const handleClickDeleteCategory = async (id: string) => {
    const options = { method: "DELETE" };

    const res = await fetch(`/api/category?${new URLSearchParams({ id, type })}`, options);

    if (!res.ok) return await statusMessage({ t, res, options });

    if (id === selectedSeries) setSelectedSeries("");
    setSeries((prev) => prev.filter((_id) => _id !== id));
  };

  const isLg = useBreakpoints("lg");
  return (
    <>
      <div className="mb-2 flex items-center gap-1">
        <Toggle
          variant="outline"
          pressed={type === doctypeEnum.document}
          className={cn("rounded-none", {
            "!border-blue-200 !bg-blue-50 !text-blue-800": type === doctypeEnum.document,
          })}
          onPressedChange={(pressed: boolean) => pressed && setType(doctypeEnum.document)}
          aria-label="Toggle wkdoc"
          size="sm"
        >
          <ScrollText className="size-4" />
          {t("document")}
        </Toggle>

        <Toggle
          variant="outline"
          pressed={type === doctypeEnum.post}
          className={cn("rounded-none", {
            "!border-rose-200 !bg-rose-50 !text-rose-800": type === doctypeEnum.post,
          })}
          onPressedChange={(pressed: boolean) => pressed && setType(doctypeEnum.post)}
          aria-label="Toggle post"
          size="sm"
        >
          <MessageSquareHeart className="size-4" />
          {t("post")}
        </Toggle>
      </div>

      <div className="flex flex-col items-center gap-4 lg:flex-row">
        <Command className="rounded-lg border shadow-md max-lg:max-h-[calc(40dvh_-_(var(--spacing)_*_20))] lg:h-[calc(100dvh_-_(var(--spacing)_*_74))]">
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
            {series.map((id) => (
              <CommandItem
                key={`category-${id}`}
                onSelect={setSelectedSeries}
                className={cn("group", {
                  "!text-blue-600 dark:!text-blue-500 underline": id === selectedSeries,
                })}
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
                          onChange={debounce((e) => setChangeSeriesName(e.target.value), 110)}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          {t("Cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleClickEditNameCategory(id, changeSeriesName);
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
                        <AlertDialogCancel onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                          {t("Cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e: React.MouseEvent) => {
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

        <div className="shrink-0">
          {isLg ? <ChevronsRight className="size-4" /> : <ChevronsDown className="size-4" />}
        </div>

        <Command className="rounded-lg border shadow-md max-lg:max-h-[calc(40dvh_-_(var(--spacing)_*_20))] lg:h-[calc(100dvh_-_(var(--spacing)_*_74))]">
          {selectedSeries ? (
            <>
              <CommandInput
                value={inputTag}
                onValueChange={setInputTag}
                placeholder={t("Type a tag or search...")}
              />
              {loadingPages ? (
                <Spinner className="mx-auto my-6" variant="ring" size={32} />
              ) : (
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

                  {pages.map(({ category, id }) => (
                    <CommandItem className="group" key={`tag-${category}-${id}`}>
                      {id}
                    </CommandItem>
                  ))}
                </CommandList>
              )}
            </>
          ) : (
            <p className="my-6 text-center font-semibold text-muted-foreground">
              {t("Please select category first.")}
            </p>
          )}
        </Command>
      </div>
    </>
  );
}
