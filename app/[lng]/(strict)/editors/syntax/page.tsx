import { Document } from "@/components/core/Document";

export default async function HowToPage(ctx: PageProps<"/[lng]/editors/syntax">) {
  const content = `
## 마크다운 문법

[마크다운 문법](https://commonmark.org/help/)으로 문서를 작성할 수 있습니다. 링크를 통해 사용법을 익히고 바로 사용할 수 있습니다.

## 특수 문법: 첨자

모닥위키는 취소선, 각주와 같은 문법을 지원하지 않습니다. 대신 밑첨자를 사용하여 문서의 간결함을 유지할 수 있습니다.

~~~plain:마크다운
> 밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.\\
> 윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.
~~~

> 밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.\\
> 윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.


## 특수 문법: Github 스타일 표

[Github 스타일의 표](https://github.com/micromark/micromark-extension-gfm-table?tab=readme-ov-file#syntax) 문법을 지원합니다.

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

`;

  return <Document content={content.trim()} />;
}
