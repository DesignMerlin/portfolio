// remark-mdx-frontmatter adds this export to every .mdx file.
// It is `unknown` on purpose: lib/content.ts validates it before use.
declare module "*.mdx" {
  export const frontmatter: unknown;
}
