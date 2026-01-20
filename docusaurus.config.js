// @ts-check
import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Data to Decisions: AI in Healthcare",
  tagline: "Interactive, clinically grounded AI concepts for future physicians.",
  favicon: "img/uva-swords.png",

  future: {
    v4: true,
  },

  // Set this to your eventual production domain (Cloudflare Pages custom domain, etc.)
  url: "https://your-domain.example.com",
  baseUrl: "/",

  // If you deploy via GitHub/Cloudflare Pages, keep these accurate (not required for local dev).
  organizationName: "uva-ai-in-healthcare", // your GitHub org/user
  projectName: "uva-ai-in-healthcare", // your repo name

  onBrokenLinks: "throw",

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          routeBasePath: "docs",
          // MVP: no "edit this page" links until your repo URL is stable.
          editUrl: undefined,
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
        },
        // MVP: turn off blog entirely
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Optional social card; replace later if you want
      image: "img/social-card.png",

      colorMode: {
        respectPrefersColorScheme: true,
      },

      // Make the left docs sidebar collapsible; keep right TOC auto-hide behavior as-is
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },

      navbar: {
        title: "Data to Decisions",
        // If you want the UVA logo "front and center", keep it on the homepage hero.
        // Navbar logo can be small; you can remove it to keep the header clean.
        logo: {
          alt: "University of Virginia",
          src: "img/uva-swords.png",
        },
        items: [
          { to: "/docs/schedule", label: "Schedule", position: "left" },
          { to: "/docs/lectures/intro", label: "Sessions", position: "left" },
          // Add later if desired:
          // { href: "https://github.com/<org>/<repo>", label: "GitHub", position: "right" },
        ],
      },

      footer: {
        style: "dark",
        links: [
          {
            title: "Course",
            items: [
              { label: "Schedule", to: "/docs/schedule" },
              { label: "Sessions", to: "/docs/lectures/intro" },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} University of Virginia. Built with Docusaurus.`,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
