import { mathFromMarkdown, mathToMarkdown, ToOptions as Options } from "mdast-util-math";
import { math } from "micromark-extension-math";

const emptyOptions: Options = {};
export default function remarkKatex(options: Options) {
  // @ts-expect-error: TS is wrong about `this`.
  const self = /** @type {Processor<Root>} */ (this);
  const settings: Options = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(math());
  fromMarkdownExtensions.push(mathFromMarkdown());
  toMarkdownExtensions.push(mathToMarkdown(settings));
}
