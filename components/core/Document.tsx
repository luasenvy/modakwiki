import { TFunction } from "i18next";
import { FileClock, Pencil } from "lucide-react";
import Link from "next/link";
import { CopyButton } from "@/components/core/button/CopyButton";
import { Container, Viewport } from "@/components/core/Container";
import { NavToc } from "@/components/core/MdxViewer/NavToc";
import { PageHeadline } from "@/components/core/PageHeadline";
import { TOCProvider } from "@/components/fumadocs/toc";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth/server";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { License, licenseEnum } from "@/lib/license";
import { MdxLoader } from "@/lib/mdx/server";
import { getToc } from "@/lib/mdx/utils";
import { Doctype, Document as DocumentType } from "@/lib/schema/document";
import { scopeEnum, User } from "@/lib/schema/user";
import { localePrefix } from "@/lib/url";
import { cn } from "@/lib/utils";

interface DocumentProps {
  lng: Language;
  doctype?: Doctype;
  doc?: DocumentType & User;
  content?: string;
  title?: string;
  description?: string;
  category?: string;
  license?: License;
  tags?: string[];
  author?: { name: string; image?: string; email?: string; emailVerified?: boolean };
  created?: number;
  updated?: number;
  session?: Session["user"] | null;
}

export async function Document({
  lng: lngParam,
  doc,
  doctype,
  content = "",
  title = "",
  description = "",
  license = licenseEnum.ccbysa,
  category,
  tags,
  author,
  created,
  updated,
  session,
}: DocumentProps) {
  content = doc?.content ?? content;
  title = doc?.title ?? title;
  description = doc?.description ?? description;
  author = doc?.name
    ? { name: doc.name, image: doc.image, email: doc.email, emailVerified: doc.emailVerified }
    : author;
  created = doc?.created ?? created;
  updated = doc?.updated ?? updated;
  license = doc?.license ?? license;
  category = doc?.category ?? category;
  tags = doc?.tags ?? tags;
  const toc = getToc(content);

  const { t } = await useTranslation(lngParam);

  return (
    <TOCProvider toc={toc} single={false}>
      <Viewport>
        <Container as="article" variant="document">
          <PageHeadline title={title} description={description} category={category} tags={tags} />

          <MdxLoader source={content} />
        </Container>

        <NavToc
          lng={lngParam}
          title={title}
          author={author}
          license={license}
          created={created}
          updated={updated}
        >
          {(session || doc) && (
            <Remocon
              lng={lngParam}
              t={t}
              doc={doc}
              doctype={doctype}
              content={content}
              editable={Boolean(
                doc && session && session.scope >= scopeEnum.editor && session.id === doc!.userId,
              )}
              copiable={Boolean(content && session && session.scope >= scopeEnum.associate)}
            />
          )}
        </NavToc>
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
