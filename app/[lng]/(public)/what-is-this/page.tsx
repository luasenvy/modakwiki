import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import type { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

import Logo from "@/public/logo.webp";

export default async function HowToPage(ctx: PageProps<"/[lng]/what-is-this">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## 환영합니다!

![로고 width-20 height-20](${Logo.src})

모닥위키는 여러 위키들이 협업할 수 있는 위키엔진입니다.

## 모닥이 뭔가요?

\`모닥\`은 *몰다*, *모으다*를 어원으로 여러가지를 모은 것을 말합니다. *여러가지를 모아 지핀 불*이라는 모닥불의 의미를 생각하면 쉽게 이해할 수 있습니다.

`.trim();

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: "모닥위키", href: `${lng}/what-is-this` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} content={content.trim()} />;
    </>
  );
}
