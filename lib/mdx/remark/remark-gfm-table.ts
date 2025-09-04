import { gfmTableFromMarkdown, gfmTableToMarkdown, Options } from "mdast-util-gfm-table";
import { gfmTable } from "micromark-extension-gfm-table";

const emptyOptions: Options = {};
export default function remarkGfmTable(options: Options) {
  // @ts-expect-error: TS is wrong about `this`.
  const self = /** @type {Processor<Root>} */ (this);
  const settings: Options = options || emptyOptions;
  const data = self.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gfmTable());
  fromMarkdownExtensions.push(gfmTableFromMarkdown());
  toMarkdownExtensions.push(gfmTableToMarkdown(settings));
}
