import { FlameKindling } from "lucide-react";
import { Breadcrumb } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import { FootnoteHighlighter } from "@/components/core/MdxViewer/FootnoteHighlighter";
import { site } from "@/config";
import { BreadcrumbItem } from "@/hooks/use-breadcrumbs";
import type { Language } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/next";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/what-is-this">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## 환영합니다!

모닥위키는 여러 사용자들이 함께 사용할 수 있는 위키 엔진입니다. 모닥위키간의 문서 공유, 사용자간의 소통, 그리고 다양한 편의기능을 제공하여 사용자들이 쉽게 지식을 쌓고 나눌 수 있도록 돕는 것을 목표로 하고 있습니다.

## 왜 모닥위키인가요?

모닥위키의 \`모닥\`은 *몰다*, *모으다*를 어원으로 한 단어입니다. 모닥불의 의미가 *여러가지를 모아 지핀 불*이라는 것을 생각하면 쉽게 이해할 수 있습니다. 의미있는 정보들을 제공할 수 있기를 바랍니다.

## 콘텐츠

모닥위키는 \`문서\`와 \`에세이\` 두가지 형태의 콘텐츠를 제공합니다. 각 콘텐츠의 특성에 따라 작성 및 관리 방식이 다릅니다.

- 위키문서: 공동 편집이 가능한 콘텐츠입니다. 누구나 편집할 수 있지만 편집을 위해서는 회원간의 신뢰와 협의가 필요합니다.
- 에세이: 에세이는 블로그 포스팅과 동일한 사견이 담긴 글입니다. 작성자가 원할 때 마음대로 편집할 수 있으며 댓글 기능을 사용할 수 있습니다.

모든 콘텐츠는 이미지와 동영상을 포함하여 본문 전체를 관리자에게 승인 받아야합니다. 승인된 컨텐츠를 웹에 공개 게시되어 누구나 열람할 수 있습니다.

## 회원제 안내

!!비회원제
모닥위키는 현재 비회원제로 운영되고 있습니다.

모닥위키는 개인정보 처리를 위한 보안 기능과 회원 관리 기능이 구현되어 있지만 법률적 문제를 보완하기 위하여 비회원제를 유지하고 있습니다. 회원제로 전환하여 보다 안전하고 편리한 서비스를 제공할 예정입니다. 개인정보 처리를 통한 회원제의 목표는 다음과 같습니다.

- **책임감** 있는 문서 작성·관리
- **상호 존중** 문화 지원
- **저작권 보호** 방안 구성
- **개인정보 보호**를 위한 구조적 설계

관련 작업은 사업자가 아닌 개인 한 명이 개발/운영하기 때문에 많은 시간이 걸릴 수 있습니다.

### 회원 등급 체계

모든 회원은 동일한 권리와 대우를 받습니다. 회원 등급체계는 더 큰 책임과 역할이 부과됨을 의미합니다. 따라서 등급별로 제공되는 기능이 다릅니다.

- 비회원: 문서 열람, 에세이 열람
- 준회원: 에세이 댓글 열람
- 정회원: 문서 협의 열람, 에세이 댓글 작성
- 편집자: 문서 협의 참여, 문서 작성/편집
- 관리자: 문서 승인, 회원 승인, 에세이 작성/편집


`.trim();

  const { t } = await useTranslation(lngParam);
  const breadcrumbs: Array<BreadcrumbItem> = [{ title: t(site.name), href: `${lng}/what-is-this` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <FootnoteHighlighter />
      <Document
        lng={lngParam}
        content={content.trim()}
        title={t(site.name)}
        category={t(site.name)}
        tags={[t("welcome! 🥳")]}
      />
    </>
  );
}
