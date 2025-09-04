import { Breadcrumb, BreadcrumbItem } from "@/components/core/Breadcrumb";
import { Document } from "@/components/core/Document";
import type { Language } from "@/lib/i18n/config";
import { localePrefix } from "@/lib/url";
import Logo from "@/public/brand/logo.webp";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const lngParam = (await ctx.params).lng as Language;
  const lng = localePrefix(lngParam);

  const content = `
## Micromark 문법

[Micromark](https://github.com/micromark/micromark?tab=readme-ov-file#what-is-this)에서 제공하는 [마크다운 문법](https://commonmark.org/help/)을 지원합니다.

## 특수 문법: 위 첨자와 아래 첨자

~~~plain:마크다운
~또는 간단한 메모~
H^2^O
~~~

위 첨자와 아래 첨자 기능에서 아래 첨자는 괄호주로 대체됩니다. 괄호주를 사용하여 문서의 간결함을 유지할 수 있습니다. 괄호주는 물결표를 감싸서 표현합니다. 부연 설명~또는 간단한 메모~으로 사용할 수 있습니다. 위 첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.

## 특수 문법: 이미지 크기 설정

~~~plain:마크다운
![로고 width-24](${Logo.src})
~~~

이미지 마크다운은 기본 문법으로 제공됩니다. 이미지는 영역을 채울 수 있도록 항상 가로 크기 100%로 설정되며 크기를 변경하고 싶을 때 이미지 명칭에 \`width-[size]\` 또는 \`height-[size]\`를 포함시켜 조정할 수 있습니다.

이미지의 최대 크기를 제한하는 방식이므로 매우 큰 사이즈로 설정되어도 문서의 최대 크기인 4xl 이상을 벗어날 수 없습니다. 이 작동 방식은 작은 이미지를 사용하더라도 항상 가용 영역을 모두 채우려 하므로 *설정된 크기보다 작은 이미지를 사용한다면 계단현상이 발생*합니다. 

| width-4            | width-8            | width-12           | width-16           | width-20           | 
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-4](${Logo.src}) | ![로고 width-8](${Logo.src}) | ![로고 width-12](${Logo.src}) | ![로고 width-16](${Logo.src}) | ![로고 width-20](${Logo.src}) |

| width-24           | width-28           | width-32           | width-36           | width-40           |
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-24](${Logo.src}) | ![로고 width-28](${Logo.src}) | ![로고 width-32](${Logo.src}) | ![로고 width-36](${Logo.src}) | ![로고 width-40](${Logo.src}) |

| width-3xs          | width-2xs          | width-xs           | width-sm           | width-md           |
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-3xs](${Logo.src}) | ![로고 width-2xs](${Logo.src}) | ![로고 width-xs](${Logo.src}) | ![로고 width-sm](${Logo.src}) | ![로고 width-md](${Logo.src}) | 

제공되는 크기는 [tailwindcss v4에서 제공하는 값](https://tailwindcss.com/docs/width)에 기반하지만 모든 크기를 제공하지는 않습니다. 4의 배수로 40이하의 크기와 3xs 부터 4xl~문서의 최대크기~까지의 컨테이너 크기를 활용할 수 있습니다.

## 특수 문법: 알림

~~~plain:마크다운
!모닥위키는 알림 배너를 지원합니다.
독자가 문서를 읽을 때 주의를 줄 수 있습니다.
알림은 여러 문단으로 작성할 수 있습니다.

!모닥위키는 알림 배너를 지원합니다.
!독자가 문서를 읽을 때 주의를 줄 수 있습니다.
!알림은 여러 문단으로 작성할 수 있습니다.
~~~

!알림제목
!독자가 문서를 읽을 때 주의를 줄 수 있습니다.  
!알림은 여러 문단으로 작성할 수 있습니다.

모닥위키는 알림용 배너 문법을 지원합니다. \`!\` 문자를 시작으로 빈 줄을 만날때까지 알림으로 인식합니다. 첫번째 줄은 제목이되고 나머지 줄은 설명이 됩니다. 설명내 줄바꿈은 띄어쓰기를 2회 반복한 후 다음줄을 입력하면 됩니다. 관리 편의상 알림에 대한 문단은 모두 !표로 시작하도록 하는 것이 좋습니다.

~~~plain:마크다운
!정보
!간단한 팁이나 안내를 작성합니다.

!!경고
!특별히 주의해야할 사항이나 반드시 알아야할 정보를 작성합니다.

!!!위험
!중대한 위험이 있거나 반드시 지켜야할 사항을 작성합니다.
~~~

!정보
!간단한 팁이나 안내를 작성합니다.

!!경고
!특별히 주의해야할 사항이나 반드시 알아야할 정보를 작성합니다.

!!!위험
!중대한 위험이 있거나 반드시 지켜야할 사항을 작성합니다.

알림 문단을 시작하는 \`!\`의 개수에 따라서 알림의 수준이 결정됩니다.

## 특수 문법: Github 스타일 각주

~~~plain:각주^마크다운
본문의 각주[^각주설명]는 대괄호안에 캐럿문자[^문법설명]를 통하여 지정할 수 있습니다.
[^각주설명]: 그리고 해당 각주에 대한 설명은 이렇게 작성합니다.
[^문법설명]: 각주의 문법을 설명합니다.
~~~

본문의 각주[^각주설명]는 대괄호안에 캐럿문자[^문법설명]를 통하여 지정할 수 있습니다.
[^각주설명]: 그리고 해당 각주에 대한 설명은 이렇게 작성합니다.
[^문법설명]: 각주의 문법을 설명합니다.

각주의 설명은 문서 어디에 어떤 순서로 작성하든 영향을 받지 않고 본문에 표시한 순서대로 문서의 최하단에 순서대로 나열됩니다. 관리편의를 위해 각주의 설명을 작성할 때에는 위 예제처럼 각주를 사용한 문단과 가까운 곳에 작성해두거나 최하단에 모아두는 형식을 취하는 것이 좋습니다.

## 특수 문법: Github 스타일 체크리스트

~~~plain:체크리스트^마크다운
- [x] 할 일 1
- [x] 할 일 2
- [ ] 할 일 3

1. [x] 할 일 1
2. [ ] 할 일 2
3. [ ] 할 일 3
~~~

- [x] 할 일 1
- [x] 할 일 2
- [ ] 할 일 3

1. [x] 할 일 1
2. [ ] 할 일 2
3. [ ] 할 일 3

[Github 스타일의 체크리스트](https://github.com/micromark/micromark-extension-gfm-task-list-item?tab=readme-ov-file#syntax) 문법을 지원합니다.

## 특수 문법: Github 스타일 표

~~~plain:Github^스타일^표^마크다운
| Alpha bravo charlie |               delta |
| ------------------- | ------------------: |
| Echo 1              | Example Cell Data1  |
| Echo 2              | Example Cell Data2  |
| Echo 3              | Example Cell Data3  |
| Echo 4              | Example Cell Data4  |
| Echo 5              | Example Cell Data5  |
| Echo 6              | Example Cell Data6  |
| Echo 7              | Example Cell Data7  |
| Echo 8              | Example Cell Data8  |
| Echo 9              | Example Cell Data9  |
| Echo 10             | Example Cell Data10 |
~~~

| Alpha bravo charlie |               delta |
| ------------------- | ------------------: |
| Echo 1              | Example Cell Data1  |
| Echo 2              | Example Cell Data2  |
| Echo 3              | Example Cell Data3  |
| Echo 4              | Example Cell Data4  |
| Echo 5              | Example Cell Data5  |
| Echo 6              | Example Cell Data6  |
| Echo 7              | Example Cell Data7  |
| Echo 8              | Example Cell Data8  |
| Echo 9              | Example Cell Data9  |
| Echo 10             | Example Cell Data10 |

[Github 스타일의 표](https://github.com/micromark/micromark-extension-gfm-table?tab=readme-ov-file#syntax) 문법을 지원합니다.

## 특수 문법: 수학

~~~plain:마크다운
$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

\`\`\`math
L = \\frac{1}{2} \\rho v^2 S C_L
\`\`\`
~~~

$$
L = \\frac{1}{2} \\rho v^2 S C_L
$$

수학적 표현을 표시하기 위하여 [KaTeX](https://katex.org/) 문법을 지원합니다. 달러 기호가 익숙하지 않다면 코드블록의 언어 선택자를 \`math\`로 지정하여도 동일하게 작동합니다.

## 특수 문법: 코드 하이라이트

백틱 또는 물결표를 3번 반복하는 코드블록 문법에서 \`[언어][:파일명]\`을 옵션으로 추가하여 하이라이팅과 코드 타이틀을 지정할 수 있습니다. 코드 타이틀은 *^* 특수문자를 띄어쓰기로 취급합니다.

| 지원 언어 목록      |
| ------------------- |
| bash                |
| typescript, js      |
| typescript, ts      |
| json                |
| html, xml           |
| css                 |
| dockerfile          |
| java                |
| sql                 |
| plaintext           |
| diff                |

~~~plain:마크다운
\`\`\`ts
function multiply(x: number) {
  return x * 3;
}
\`\`\`
~~~

~~~ts:마크다운^결과
function multiply(x: number) {
  return x * 3;
}
~~~

### 라인 하이라이팅

코드 하이라이팅 문법과 함께 \`{숫자}\` 또는 \`{숫자[,숫자[-숫자]]}\` 형식으로 라인 하이라이팅을 지정할 수 있습니다.

~~~plain:라인^마크다운
\`\`\`ts:라인^마크다운^결과{2-4,6}
function sayHello(x: number) {
  const isStanding = true;
  const isWavingHand = true;
  const isSmile = true;

  return "hello, world! :)";
}
\`\`\`
~~~

~~~ts:라인^마크다운^결과{2-4,6}
function sayHello(x: number) {
  const isStanding = true;
  const isWavingHand = true;
  const isSmile = true;

  return "hello, world! :)";
}
~~~

### diff 하이라이팅

코드블록은 \`diff\` 문법을 지원합니다. 추가된 라인은 \`+\`, 삭제된 라인은 \`-\`로 시작하여 구분할 수 있습니다.

~~~plain:diff^마크다운
\`\`\`diff:diff^마크다운^결과
<div>
-   <h2>삭제된 라인</h2>
+   <h2>추가된 라인</h2>
</div>
\`\`\`
~~~

~~~diff:diff^마크다운^결과
<div>
-   <h2>삭제된 라인</h2>
+   <h2>추가된 라인</h2>
</div>
~~~
`;

  const breadcrumbs: Array<BreadcrumbItem> = [
    { title: "편집자" },
    { title: "위키문법", href: `${lng}/editor/syntax` },
  ];

  return (
    <>
      <Breadcrumb lng={lngParam} breadcrumbs={breadcrumbs} />
      <Document lng={lngParam} title="위키문법" content={content.trim()} />
    </>
  );
}
