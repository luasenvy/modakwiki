import { Document } from "@/components/core/Document";
import Logo from "@/public/logo.webp";

export default async function HowToPage(ctx: PageProps<"/[lng]/editor/syntax">) {
  const content = `
## Micromark 문법

Micromark에서 제공하는 마크다운 문법을 지원합니다. 본문 하단의 [연관링크](#연관링크)를 통하여 학습할 수 있습니다.

## 특수 문법: 미주

~~~plain:미주^마크다운
본문의 미주[^미주설명]는 대괄호안에 캐럿문자[^문법설명]를 통하여 지정할 수 있습니다.
[^미주설명]: 그리고 해당 미주에 대한 설명은 이렇게 작성합니다.
[^문법설명]: 미주의 문법을 설명합니다.
~~~

본문의 미주[^미주설명]는 대괄호안에 캐럿문자[^문법설명]를 통하여 지정할 수 있습니다.
[^미주설명]: 그리고 해당 미주에 대한 설명은 이렇게 작성합니다.
[^문법설명]: 미주의 문법을 설명합니다.

미주의 설명은 문서 어디에 어떤 순서로 작성하든 영향을 받지 않고 본문에 표시한 순서대로 문서의 최하단에 순서대로 나열됩니다. 관리편의를 위해 미주의 설명을 작성할 때에는 위 예제처럼 미주를 사용한 문단과 가까운 곳에 작성해두거나 최하단에 모아두는 형식을 취하는 것이 좋습니다.

## 특수 문법: 이미지 크기 설정

~~~plain:마크다운
![로고 width-24](${Logo.src})
~~~

이미지 마크다운은 기본 문법으로 제공됩니다. 이미지는 영역을 채울 수 있도록 항상 가로 크기 100%로 설정되며 크기를 변경하고 싶을 때 이미지 명칭에 \`width-[size]\` 또는 \`height-[size]\`를 포함시켜 조정할 수 있습니다. 이것은 이미지 자체의 크기를 설정하는 것이 아닌 이미지의 최대크기를 제한하는 방식입니다. 이 작동 방식은 작은 이미지를 사용하더라도 항상 가용영역을 모두 채우려하므로 *설정된 크기보다 작은 이미지를 사용한다면 계단현상이 발생*합니다.

| width-4            | width-8            | width-12           | width-16           | width-20           | 
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-4](${Logo.src}) | ![로고 width-8](${Logo.src}) | ![로고 width-12](${Logo.src}) | ![로고 width-16](${Logo.src}) | ![로고 width-20](${Logo.src}) |

| width-24           | width-28           | width-32           | width-36           | width-40           |
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-24](${Logo.src}) | ![로고 width-28](${Logo.src}) | ![로고 width-32](${Logo.src}) | ![로고 width-36](${Logo.src}) | ![로고 width-40](${Logo.src}) |

크기를 설정할 때에는 4의 배수로 40이하의 값을 설정할 수 있습니다. 크기는 tailwindcss의 기본단위인 \`0.25rem(4px)\` 단위를 기준으로 배수 설정됩니다.

| width-3xs          | width-2xs          | width-xs           | width-sm           | width-md           |
| :----------------: | :----------------: | :----------------: | :----------------: | :----------------: |
| ![로고 width-3xs](${Logo.src}) | ![로고 width-2xs](${Logo.src}) | ![로고 width-xs](${Logo.src}) | ![로고 width-sm](${Logo.src}) | ![로고 width-md](${Logo.src}) | 

tailwindcss에서 제공해주는 선정의된 컨테이너 크기도 사용할 수 있습니다. 더 자세한 내용은 문서 하단의 연관링크 \`Tailwindcss v4 sizing width\`를 통해 확인하실 수 있습니다. 최대 크기를 제한하는 방식이므로 매우 큰 사이즈로 설정되어도 문서의 최대 크기인 4xl 이상을 벗어날 수 없습니다.

## 특수 문법: 첨자

~~~plain:마크다운
~또는 간단한 메모나 첨언~
H^2^O
~~~

모닥위키는 취소선, 각주와 같은 문법을 지원하지 않습니다. 대신 밑첨자를 사용하여 문서의 간결함을 유지할 수 있습니다. 밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다. 윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.


## 특수 문법: Github 스타일 표

Github 스타일의 표 문법을 지원합니다. 자세한 사항은 문서 하단의 [연관링크](#연관링크)를 참고하세요.

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

## 특수 문법: 코드 하이라이트

백틱 또는 틸더를 3번 반복하는 코드블록 문법에서 \`[언어][:파일명]\`을 옵션으로 추가하여 하이라이팅과 코드 타이틀을 지정할 수 있습니다. 코드 타이틀은 *^* 특수문자를 띄어쓰기로 취급합니다.

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


---
## 연관링크

- [Tailwindcss v4 sizing width](https://tailwindcss.com/docs/width)
- [Micromark](https://github.com/micromark/micromark?tab=readme-ov-file#what-is-this)
- [마크다운 문법](https://commonmark.org/help/)
- [Github 스타일의 표](https://github.com/micromark/micromark-extension-gfm-table?tab=readme-ov-file#syntax)
`;

  return <Document content={content.trim()} />;
}
