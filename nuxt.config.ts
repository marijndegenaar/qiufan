// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // ssr: false,
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Marijn Degenaar',
      charset: 'utf-8',
      viewport: 'width=device-width, minimal-ui initial-scale=1, user-scalable=no',
      link: [{ rel: 'icon', type: 'image/png', href: '/fav.png' }],
      meta: [
        { hid: 'description', name: 'description', content: 'Marijn Degenaar is a designer, based in Berlin' },
        { hid: 'keywords', name: 'keywords', content: '' }
      ],
    },
  },

  modules: ['@nuxtjs/prismic', '@nuxtjs/tailwindcss', '@formkit/auto-animate/nuxt', '@nuxt/image', 'vue3-carousel-nuxt'],

  image: {
    // dir: '~/assets/images/graphic_design', // Your image folder
    quality: 70, // default: 70
    format: ['webp', 'avif', 'jpeg'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  
  prismic: {
      endpoint: 'https://marijn.cdn.prismic.io/api/v2',
      toolbar: false,
      preview: false,
    },

  css: [
      "@/assets/fonts/fonts.css",
      "@/assets/sass/main.sass"
  ],

  router: {
  },

  // routeRules: {
  //   '/': { redirect: '/projects' },
  // },
  clientConfig: {
      routes: [
      // Fallback route for content without language prefix
      {
        type: "page",
        path: "/:uid",
      },
    ],
  },

  compatibilityDate: '2025-03-18',
})