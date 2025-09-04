import {
  gfmTaskListItemFromMarkdown,
  gfmTaskListItemToMarkdown,
} from "mdast-util-gfm-task-list-item";
import { gfmTaskListItem } from "micromark-extension-gfm-task-list-item";

export default function remarkGfmTask() {
  // @ts-expect-error: TS is wrong about `this`.
  const self = /** @type {Processor<Root>} */ (this);
  const data = self.data();

  const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);

  micromarkExtensions.push(gfmTaskListItem());
  fromMarkdownExtensions.push(gfmTaskListItemFromMarkdown());
  toMarkdownExtensions.push(gfmTaskListItemToMarkdown());
}
