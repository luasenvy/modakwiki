import { FlameKindling } from "lucide-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { site } from "@/config";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/what-is-this">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## 환영합니다!

모닥위키는 여러 사용자들이 함께 사용할 수 있는 위키엔진입니다. 모닥위키간의 문서 공유, 사용자간의 소통, 그리고 다양한 편의기능을 제공하여 사용자들이 쉽게 지식을 쌓고 나눌 수 있도록 돕는 것을 목표로 하고 있습니다.

!!비회원제로
비회원제로 운영되고 있습니다.

모닥위키는 개인정보 처리를 위한 보안 기능과 회원 관리 기능이 구현되어 있지만 법률적 문제를 보완하기 위하여 비회원제를 유지하고 있습니다. 회원제로 전환하여 보다 안전하고 편리한 서비스를 제공할 예정입니다. 개인정보 처리를 통한 회원제의 궁극적인 목표는 다음과 같습니다.

- 책임감 있는 문서 작성·관리
- 회원간 상호 존중 문화 지원
- 저작권 보호 방안 구성
- 개인정보 보호를 위한 구조적 설계

관련 작업은 사업자가 아닌 개인 한 명이 개발/운영하기 때문에 많은 시간이 걸릴 수 있습니다.

## 왜 모닥위키인가요?

\`모닥\`은 *몰다*, *모으다*를 어원으로 한 단어입니다. 모닥불의 의미가 *여러가지를 모아 지핀 불*이라는 것을 생각하면 쉽게 이해할 수 있습니다. 의미있는 정보들을 제공할 수 있기를 바랍니다. 

`.trim();

  const { t } = await useTranslation(lngParam);
  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t(site.name), href: `${lng}/what-is-this` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} content={content.trim()} title={t(site.name)} />
    </>
  );
}
