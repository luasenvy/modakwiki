import DOMpurify from "isomorphic-dompurify";
import { Document } from "@/components/core/Document";

export default async function HowToPage(ctx: PageProps<"/[lng]/how-to">) {
  const content = `
## 마크다운 문법

[마크다운 문법](https://commonmark.org/help/)으로 문서를 작성할 수 있습니다. 링크를 통해 사용법을 익히고 바로 사용할 수 있습니다.

## 문서의 구조

문서는 최대한 간결하게 유지하도록 2-3 레벨을 권장하고 예외적으로 4레벨을 지원합니다. 4레벨 이상이 필요하다면 고쳐야할 점이 없는지 다시 한 번 검토해보시기 바랍니다.

## 특수 문법: 코드 하이라이트

백틱 또는 틸더를 3번 반복하는 코드블록 문법에서 \`[언어][:파일명]\`을 옵션으로 하이라이팅 규칙과 코드 타이틀을 지정할 수 있습니다. 코드 타이틀은 *^* 특수문자를 띄어쓰기로 취급합니다.

코드 하이라이팅 지원 언어 목록:

- bash
- typescript, javascript, xml, css, json
- dockerfile
- java
- sql
- plaintext

~~~plain:markdown
\`\`\`ts:markdown^output
function multiply(x: number) {
  return x * 3;
}
\`\`\`
~~~

~~~ts:markdown^output
function multiply(x: number) {
  return x * 3;
}
~~~

## 특수 문법: 첨자

모닥위키는 취소선, 각주와 같은 문법을 지원하지 않습니다. 대신 밑첨자를 통하여 문서의 간결함을 유지하고 사용자가 페이지와 상호작용해야 하는 불편함을 최소화 합니다. 사용자는 페이지를 자연스럽게 읽을 수 있습니다.

~~~plain
밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.

윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.
~~~

밑첨자는 틸더문자를 감싸서 표현합니다. 부연 설명~또는 간단한 메모나 첨언~으로 사용할 수 있습니다.

윗첨자는 캐럿문자를 감싸서 표현합니다. H^2^O처럼 사용할 수 있습니다.

## 특수 문법: 표

[Github 스타일의 표](https://github.com/micromark/micromark-extension-gfm-table?tab=readme-ov-file#syntax) 문법을 지원합니다.

~~~plain:Github_스타일_표_문법
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


`;

  return (
    <Document
      content={DOMpurify.sanitize(content.trim(), {
        KEEP_CONTENT: false,
        USE_PROFILES: { html: false },
      })}
    />
  );
}
