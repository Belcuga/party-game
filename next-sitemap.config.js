/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://tipsytrials.com',
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  // Gameplay screens require in-memory/session state (players, chosen mode) and
  // render empty/broken when crawled cold, and /admin is gated + blocked by
  // middleware in production - none of these are worth indexing.
  exclude: [
    '/admin',
    '/admin/*',
    '/game/category',
    '/game/bonding',
    '/game/mostlikely',
    '/game/never',
    '/game/truthdare',
    '/game/wasted',
    '/game/wingman',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api', '/api/*'],
      },
    ],
    additionalSitemaps: ['https://tipsytrials.com/sitemap.xml'],
  },
  transform: async (config, path) => {
    const priorityByPath = {
      '/': 1.0,
      '/game': 0.9,
      '/how-to-play': 0.6,
      '/policy': 0.3,
      '/policy-web': 0.3,
    };

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: priorityByPath[path] ?? config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
