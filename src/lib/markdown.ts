import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

// Markdown to sanitised HTML (GFM, heading ids), done once when content is seeded, so pages serve stored HTML.
// Raw HTML in the source is dropped, not passed through.
const processor = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeSanitize, defaultSchema).use(rehypeSlug).use(rehypeStringify)

export async function renderMarkdown(source: string): Promise<string> {
  return String(await processor.process(source))
}
