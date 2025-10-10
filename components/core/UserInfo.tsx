import { Document } from "@/components/core/Document";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { knex } from "@/lib/db";
import { fromNow } from "@/lib/format";
import { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { doctypeEnum } from "@/lib/schema/document";
import { User } from "@/lib/schema/user";

interface UserInfoProps {
  lng: Language;
  user: User;
}

export async function UserInfo({ lng: lngParam, user }: UserInfoProps) {
  const { t } = await useTranslation(lngParam);

  const { count: docCount } = (await knex
    .count({ count: "*" })
    .from("document")
    .where("userId", user.id)
    .first())!;

  const { count: postCount } = (await knex
    .count({ count: "*" })
    .from("post")
    .where("userId", user.id)
    .first())!;

  const { added: documentAdded, removed: documentRemoved } = (await knex
    .sum({ added: "added", removed: "removed" })
    .from("document_history")
    .where("userId", user.id)
    .first())!;

  const { added: postAdded, removed: postRemoved } = (await knex
    .sum({ added: "added", removed: "removed" })
    .from("post_history")
    .where("userId", user.id)
    .first())!;

  const dateFormatter = new Intl.DateTimeFormat(lngParam, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const numberFormatter = new Intl.NumberFormat(lngParam);

  let content = `## ${t("General Information")}

- ${t("Name")}: ${user.name}
- ${t("Email")}: ${user.email}
- ${t("Joined")}: ${dateFormatter.format(user.createdAt)} ~${fromNow(user.createdAt, lngParam)}~
- ${t("total writes")}: ${numberFormatter.format(Number(docCount))} ${t("document")} / ${numberFormatter.format(Number(postCount))} ${t("post")}
- ${t("total contributes")}: *+${numberFormatter.format(Number(documentAdded) + Number(postAdded))} ${t("letters")}* / -${numberFormatter.format(Number(documentRemoved) + Number(postRemoved))} ${t("letters")}

${t("")}
`;

  if (user.bio)
    content += `\n\n---\n\n## ${t("User Bio")}\n\n${user.bio.replace(/^(#{2,}) /gm, "$1# ")}`;

  return (
    <>
      <FootnoteHighlighter />
      <Document
        lng={lngParam}
        title={user.name}
        description={t("User Info")}
        category={t("user")}
        tags={[t("info")]}
        author={user}
        content={content}
        doctype={doctypeEnum.user}
        session={user}
        remocon={false}
      />
    </>
  );
}
