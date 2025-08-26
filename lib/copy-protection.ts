import { License, licenseEnum, licenseNameEnum } from "@/lib/schema/license";

interface CopyProtectionProps {
  url: string;
  links?: Array<string>;
  author?: string | Array<string>;
  license?: License;
}

export function useCopyProtection({
  url,
  links,
  author,
  license = licenseEnum.ccbyncsa,
}: CopyProtectionProps) {
  return function handleCopy(e: ClipboardEvent) {
    const selection = document.getSelection();
    const authors = Array.isArray(author) ? author : [author].filter(Boolean);
    if (selection instanceof Selection) {
      if (document.activeElement?.tagName === "TEXTAREA") return;

      let text = selection.toString();
      if (text) {
        text += `\n\n---------------------------------\n${authors?.length ? `저작자: ${authors.join(", ")}\n` : ""}`;
        text += `출처: ${window.origin}${url}`;
        if (Array.isArray(links) && links.length > 0) {
          text += `\n`;
          links.forEach((link, i) => {
            text += `\n출처${i + 1}: ${link}`;
          });
        }
        text += `\n\n이 내용은 "${licenseNameEnum[license]}" 라이선스로 배포되었습니다.`;

        e.clipboardData!.setData("text", text);
        e.preventDefault();
      }
    }
  };
}
