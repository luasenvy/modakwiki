import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import type { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/what-is-this">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## 환영합니다!

모닥위키는 여러 사용자들이 함께 사용할 수 있는 위키엔진입니다.

## 모닥이 뭔가요?

\`모닥\`은 *몰다*, *모으다*를 어원으로 한 단어입니다. 모닥불의 의미가 *여러가지를 모아 지핀 불*이라는 것을 생각하면 쉽게 이해할 수 있습니다.

## 모닥위키는 어떤 위키인가요?

모닥위키는 여러 사용자들이 함께 정보를 모아 사용할 수 있도록 돕는 위키엔진입니다. "개인정보 처리방침"과 "서비스 약관" 등 법률적인 부분을 보완하기 위해 작업을 진행하고 있습니다. 다만, 모닥위키는 사업자가 아닌 개인이 개발/운영하는 사설 사이트이므로 많은 시간이 걸릴 수 있습니다.

`.trim();

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: "모닥위키", href: `${lng}/what-is-this` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} content={content.trim()} />;
    </>
  );
}
