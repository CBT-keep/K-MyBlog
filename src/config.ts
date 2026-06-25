import type {
    SiteConfig,
    ProfileConfig,
    LicenseConfig
} from "./types/config"

import type { FriendLink } from "./types/friend"

export const siteConfig: SiteConfig = {
    title: "K",
    subTitle: "Blog",

    favicon: "/favicon/favicon.ico", // Path of the favicon, relative to the /public directory

    pageSize: 6, // Number of posts per page
    toc: {
        enable: true,
        depth: 3 // Max depth of the table of contents, between 1 and 4
    },
    blogNavi: {
        enable: true // Whether to enable blog navigation in the blog footer
    },
    comments: {
        enable: false, // Whether to enable comments
        platform: "default", // Comment platform, set "default" to use Momo-backend, also supports "twikoo"
        backendUrl: "https://api-momo.motues.top" // Backend URL for comments
    },
    theme: {
        AOS: true, // Whether to enable AOS (Animate On Scroll) for animations
        LQIP: true, // Whether to enable LQIP (Low-Quality Image Placeholder) for image placeholders
        PhotoSwipe: true // Whether to enable PhotoSwipe for image viewer
    }
}

export const profileConfig: ProfileConfig = {
    avatar: "assets/WDZ.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    name: "还不困",
    description: "唯有行动能解除所有不安",
    indexPage: "https://www.motues.top",
    startYear: 2026,
}

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const friendLinkConfig: FriendLink[] = [
    {
        name: 'WDZ',
        avatar: 'assets/WDZ.png',
        url: '',
        description: 'Keep'
    },
    {
        name: 'Astro',
        avatar: 'https://avatars.githubusercontent.com/u/44914786',
        url: 'https://astro.build',
        description: 'Build fast websites, faster.'
    }
    // Add more friend links here
]