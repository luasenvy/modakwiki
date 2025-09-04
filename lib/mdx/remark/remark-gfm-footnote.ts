import {
  gfmFootnoteFromMarkdown,
  gfmFootnoteToMarkdown,
  ToMarkdownOptions as Options,
} from "mdast-util-gfm-footnote";
import { gfmFootnote } from "micromark-extension-gfm-footnote";

const emptyOptions: Options = {};
export default function remarkGfmFootnote(options: Options) {
  // @ts-expect-error: TS is wrong about `this`.
  // eslint-disable-next-line unicorn/no-this-assignment
  const self = /** @type {Processor<Root>} */ (this);
  const settings: Options = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gfmFootnote());
  fromMarkdownExtensions.push(gfmFootnoteFromMarkdown());
  toMarkdownExtensions.push(gfmFootnoteToMarkdown(settings));
}
