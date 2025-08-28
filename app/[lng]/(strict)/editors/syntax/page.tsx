import { Document } from "@/components/core/Document";

import Logo from "@/public/logo.webp";

export default async function HowToPage(ctx: PageProps<"/[lng]/editors/syntax">) {
  const content = `
## 마크다운 문법

가장 기본적인 형태의 마크다운 문법을 사용할 수 있습니다. 본문 하단의 연관링크를 통하여 사용법을 익히고 바로 사용할 수 있습니다.

## 특수 문법: 이미지 크기 설정

~~~plain:마크다운
![로고 width-24](${Logo.src})
~~~

![로고 width-24](${Logo.src})

이미지 마크다운은 기본 문법으로 제공됩니다. 모든 이미지는 기본값 100%의 크기로 화면에 표시됩니다. 크기를 조정하고 싶을 때 이미지 명칭에 \`width-[size]\` 또는 \`height-[size]\`를 추가하여 이미지의 크기를 조정할 수 있습니다. 크기값은 4의 배수로 4부터 40까지 또는 선정의된 컨테이너 크기인 \`3xs\`, \`2xs\`, \`xs\`, \`sm\`, \`md\`, \`lg\`, \`xl\`, \`2xl\`, \`3xl\`, \`4xl\`, \`5xl\`, \`6xl\`, \`7xl\` 값으로 설정할 수 있습니다. 이미지의 크기는 \`max-width\`와 \`max-height\`를 제한하는 방식이므로 가로 설정의 경우 문서의 최대 크기인 4xl 이상을 벗어날 수 없습니다.

크기에 대한 더 자세한 내용은 문서 하단의 연관링크 \`Tailwindcss v4 sizing width\` 문서에서 확인할 수 있습니다.

## 특수 문법: 첨자

모닥위키는 취소선, 각주와 같은 문법을 지원하지 않습니다. 대신 밑첨자를 사용하여 문서의 간결함을 유지할 수 있습니다.

~~~plain:마크다운
> 밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.\\
> 윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.
~~~

> 밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.\\
> 윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.


## 특수 문법: Github 스타일 표

Github 스타일의 표 문법을 지원합니다. 자세한 사항은 연관링크를 참고하세요.

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
| 연관링크                                      |
| ----------------------------------------------|
| [Tailwindcss v4 sizing width](https://tailwindcss.com/docs/width) |
| [Micromark](https://github.com/micromark/micromark?tab=readme-ov-file#what-is-this) |
| [마크다운 문법](https://commonmark.org/help/) |
| [Github 스타일의 표](https://github.com/micromark/micromark-extension-gfm-table?tab=readme-ov-file#syntax) |
`;

  return <Document content={content.trim()} />;
}
