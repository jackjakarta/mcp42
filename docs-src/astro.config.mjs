// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/docs',
  outDir: '../public/docs',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'mcpFortyTwo',
      description: 'Music-theory and MIDI tools for the Model Context Protocol.',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/jackjakarta/mcp-fortytwo',
        },
      ],
      sidebar: [
        { label: 'Introduction', slug: 'index' },
        { label: 'Getting started', slug: 'getting-started' },
        { label: 'Configuration', slug: 'configuration' },
        {
          label: 'Tools',
          items: [{ autogenerate: { directory: 'tools' } }],
        },
      ],
      pagefind: true,
      lastUpdated: true,
    }),
  ],
});
