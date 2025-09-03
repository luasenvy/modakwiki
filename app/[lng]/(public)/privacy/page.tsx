import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import type { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";

export default async function HowToPage(ctx: PageProps<"/[lng]/what-is-this">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## 모닥위키 개인정보 처리방침

모닥위키는 정보주체의 자유와 권리 보호를 위해 ｢개인정보 보호법｣ 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 ｢개인정보 보호법｣ 제30조 에 따라 정보주체에게 개인정보의 처리와 보호에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.

## 개인정보의 처리목적

모닥위키는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 ｢개인정보 보호법｣ 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.

### 회원 가입 및 관리

회원 가입 의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 14세 미만 아동의 개인정보 처리 시 법정대리인의 동의 여부 확인, 각종 고지·통지, 고충처리 목적으로 개인정보를 처리합니다.

### 재화 또는 서비스 제공

물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공, 맞춤형 추천서비스 제공, 본인인증, 연령인증, 요금결제·정산의 목적으로 개인정보를 처리합니다.

### 서비스 개선 및 분석

서비스 이용에 대한 분석, 인구통계학적 분석 및 서비스 개선을 목적으로 개인정보를 처리합니다.

### 서비스 개발
기존 서비스와 별개의 신규 서비스 개발 목적으로 개인정보를 처리합니다.

## 처리하는 개인정보 항목

모닥위키는 다음과 같은 개인정보 법적 근거로 정보주체의 개인정보를 수집 및 이용합니다.

### 간편 로그인

- 「개인정보 보호법」 제15조제1항제4호(‘계약 체결·이행’)
- 구글 로그인 수집·이용 항목: 사용자 ID, 이메일, 프로필 사진, 이름
- 깃헙 로그인 수집·이용 항목: 사용자 ID, 이메일, 프로필 사진, 이름


`.trim();

  const breadcrumbs: Array<BreadcrumbItem> = [{ title: "모닥위키", href: `${lng}/what-is-this` }];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} content={content.trim()} />;
    </>
  );
}
