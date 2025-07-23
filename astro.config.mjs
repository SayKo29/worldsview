import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import rehypeExternalLinks from 'rehype-external-links'

// https://astro.build/config
export default defineConfig({
  site: 'https://worldsvieew.com',
  integrations: [mdx(), svelte()],
  output: 'static',
  adapter: 'static',
  build: {
    inlineStylesheets: 'auto'
  },
  vite: {
    optimizeDeps: {
      include: ['svelte', '@astrojs/svelte']
    },
    ssr: {
      noExternal: ['svelte']
    }
  },
  markdown: {
    shikiConfig: {
      theme: 'nord',
    },
    remarkPlugins: [remarkGfm, remarkSmartypants],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: '_blank',
        },
      ],
    ],
  },
})
