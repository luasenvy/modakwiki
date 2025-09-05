import { TFunction } from "i18next";
import { AlignLeft, FileClock, Pencil } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/core/button/CopyButton";
import { Container, Viewport } from "@/components/core/Container";
import { TOCProvider, TOCScrollArea } from "@/components/fumadocs/toc";
import TocClerk from "@/components/fumadocs/toc-clerk";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { MdxLoader } from "@/lib/mdx/server";
import { getToc } from "@/lib/mdx/utils";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";
import { scopeEnum } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentProps {
  lng: Language;
  doctype?: Doctype;
  doc?: DocumentType;
  content?: string;
  title?: string;
  description?: string;
  session?: Session | null;
}

export async function Document({
  lng: lngParam,
  doc,
  doctype,
  content = "",
  title = "",
  description = "",
  session,
}: DocumentProps) {
  content = doc?.content ?? content;
  title = doc?.title ?? title;
  description = doc?.description ?? description;

  const toc = getToc(content);

  const { t } = await useTranslation(lngParam);

  return (
    <TOCProvider toc={toc} single={false}>
      <Viewport>
        <Container
          as="article"
          className={cn(
            "relative w-full max-w-full lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
            "h-fit",
            "prose dark:prose-invert",
            "pt-8 pr-2 pb-24 pl-4 max-lg:pr-4",
            "break-keep",
            // Sub
            "[&_sub]:text-muted-foreground",
            // Link
            "prose-a:text-blue-600 prose-a:no-underline prose-a:hover:underline dark:prose-a:text-blue-500",
            // Code
            "prose-pre:max-h-[calc(var(--spacing)_*_100)]",
            // Image
            "prose-img:w-full",
            "prose-img:[&[alt*=width-4]]:max-w-4",
            "prose-img:[&[alt*=width-8]]:max-w-8",
            "prose-img:[&[alt*=width-12]]:max-w-12",
            "prose-img:[&[alt*=width-16]]:max-w-16",
            "prose-img:[&[alt*=width-20]]:max-w-20",
            "prose-img:[&[alt*=width-24]]:max-w-24",
            "prose-img:[&[alt*=width-28]]:max-w-28",
            "prose-img:[&[alt*=width-32]]:max-w-32",
            "prose-img:[&[alt*=width-36]]:max-w-36",
            "prose-img:[&[alt*=width-40]]:!max-w-40", // Avoid Duplicate with w-4
            "prose-img:[&[alt*=width-3xs]]:max-w-3xs",
            "prose-img:[&[alt*=width-2xs]]:max-w-2xs",
            "prose-img:[&[alt*=width-xs]]:max-w-xs",
            "prose-img:[&[alt*=width-sm]]:max-w-sm",
            "prose-img:[&[alt*=width-md]]:max-w-md",
            "prose-img:[&[alt*=width-lg]]:max-w-lg",
            "prose-img:[&[alt*=width-xl]]:max-w-xl",
            "prose-img:[&[alt*=width-2xl]]:max-w-2xl",
            "prose-img:[&[alt*=width-3xl]]:max-w-3xl",
            "prose-img:[&[alt*=width-4xl]]:max-w-4xl",
            "prose-img:[&[alt*=width-5xl]]:max-w-5xl",
            "prose-img:[&[alt*=width-6xl]]:max-w-6xl",
            "prose-img:[&[alt*=width-7xl]]:max-w-7xl",
            "prose-img:[&[alt*=height-4]]:max-h-4",
            "prose-img:[&[alt*=height-8]]:max-h-8",
            "prose-img:[&[alt*=height-12]]:max-h-12",
            "prose-img:[&[alt*=height-16]]:max-h-16",
            "prose-img:[&[alt*=height-20]]:max-h-20",
            "prose-img:[&[alt*=height-24]]:max-h-24",
            "prose-img:[&[alt*=height-28]]:max-h-28",
            "prose-img:[&[alt*=height-32]]:max-h-32",
            "prose-img:[&[alt*=height-36]]:max-h-36",
            "prose-img:[&[alt*=height-40]]:!max-h-40", // Avoid Duplicate with h-4
            "prose-img:[&[alt*=height-3xs]]:max-h-3xs",
            "prose-img:[&[alt*=height-2xs]]:max-h-2xs",
            "prose-img:[&[alt*=height-xs]]:max-h-xs",
            "prose-img:[&[alt*=height-sm]]:max-h-sm",
            "prose-img:[&[alt*=height-md]]:max-h-md",
            "prose-img:[&[alt*=height-lg]]:max-h-lg",
            "prose-img:[&[alt*=height-xl]]:max-h-xl",
            "prose-img:[&[alt*=height-2xl]]:max-h-2xl",
            "prose-img:[&[alt*=height-3xl]]:max-h-3xl",
            "prose-img:[&[alt*=height-4xl]]:max-h-4xl",
            "prose-img:[&[alt*=height-5xl]]:max-h-5xl",
            "prose-img:[&[alt*=height-6xl]]:max-h-6xl",
            "prose-img:[&[alt*=height-7xl]]:max-h-7xl",
            // Task
            "prose-ol:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
            "prose-ul:[&.contains-task-list]:[&_[type=checkbox]]:mr-2",
            // Table
            "prose-table:m-0",
            "prose-td:[&>img]:m-auto",
            // footnote
            "[&>section.footnotes]:mt-24 [&>section.footnotes]:border-t",
            "prose-a:[&[data-footnote-ref]]:before:content-['[']",
            "prose-a:[&[data-footnote-ref]]:after:content-[']']",
          )}
        >
          {title && <h1 className={cn("my-8", { "!mb-1": Boolean(description) })}>{title}</h1>}
          {description && (
            <h2 className="!m-0 !mb-8 font-font-semibold text-lg text-muted-foreground">
              {description}
            </h2>
          )}

          <MdxLoader source={content} />
        </Container>

        <nav
          id="nav-toc"
          className="sticky top-0 flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-[286px] shrink-0 flex-col pt-8 pr-4 pl-2 [mask-image:linear-gradient(to_bottom,transparent,white_16px,white_calc(100%-16px),transparent)] max-xl:hidden"
        >
          <div className="mb-2 flex items-center gap-2">
            <AlignLeft className="size-4" />
            <p className="m-0 text-muted-foreground text-sm">목차</p>
          </div>

          <TOCScrollArea className="mb-2 overflow-auto p-0">
            <TocClerk lng={lngParam} />
          </TOCScrollArea>

          {(session || doc) && (
            <Remocon
              lng={lngParam}
              t={t}
              doc={doc}
              doctype={doctype}
              content={content}
              editable={
                Boolean(doc) &&
                Boolean(session) &&
                session!.user.scope >= scopeEnum.editor &&
                session!.user.email === doc!.email
              }
              copiable={
                Boolean(content) && Boolean(session) && session!.user.scope >= scopeEnum.associate
              }
            />
          )}
        </nav>
      </Viewport>
    </TOCProvider>
  );
}

interface RemoconProps extends React.HTMLAttributes<HTMLDivElement> {
  lng: Language;
  t: TFunction;
  doctype?: Doctype;
  content?: string;
  editable?: boolean;
  copiable?: boolean;
  doc?: DocumentType;
}

function Remocon({
  lng: lngParam,
  t,
  editable,
  copiable,
  doc,
  doctype,
  content,
  className,
}: RemoconProps) {
  const lng = localePrefix(lngParam);

  return (
    <div
      className={cn(
        "mt-auto mb-4 flex items-center justify-around rounded-lg border bg-background px-4 py-1",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {doc && doctype && (
          <Button
            type="button"
            variant="ghost"
            className="!text-muted-foreground hover:!text-foreground size-6"
            size="icon"
            title={t("Document History")}
            asChild
          >
            <Link href={`${lng}/${doctype}/history?${new URLSearchParams({ id: doc.id })}`}>
              <FileClock className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1">
        {copiable && <CopyButton lng={lngParam} content={content!} />}

        {editable && (
          <Button
            type="button"
            variant="ghost"
            className="!text-muted-foreground hover:!text-foreground size-6"
            size="icon"
            title={t("Edit Document")}
            asChild
          >
            <Link
              href={`${lng}/editor/write?${new URLSearchParams({ id: doc!.id, type: doctype as string })}`}
            >
              <Pencil className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
