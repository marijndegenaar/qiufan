import { apiEndpoint, repositoryName } from "./slicemachine.config.json";
import pugPlugin from "vite-plugin-pug";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  vite: {
    plugins: [pugPlugin()],
  },

  ignore: process.env.NODE_ENV === 'production' ? ['pages/slice-simulator.vue'] : [],

  app: {
    head: {
      title: 'Chen Qiuan',
      charset: 'utf-8',
      viewport: 'width=device-width, minimal-ui initial-scale=1, user-scalable=no',
      link: [{ rel: 'icon', type: 'image/png', href: '/fav.png' }],
      meta: [
        { hid: 'description', name: 'description', content: '' },
        { hid: 'keywords', name: 'keywords', content: '' }
      ],
    },
  },

  modules: [
    '@nuxtjs/prismic',
    '@nuxtjs/tailwindcss',
    '@nuxt/image',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      {
        code: 'en',
        language: 'en-US',
        name: 'English'
      },
      {
        code: 'cn',
        language: 'zh-CN',
        name: '中文'
      }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    },
    vueI18n: './i18n.config.ts'
  },

  image: {
    quality: 70,
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
    endpoint: apiEndpoint || repositoryName,
    clientConfig: {
      routes: []
    }
  },

  css: [
    '@/assets/fonts/fonts.css',
    '@/assets/sass/main.sass'
  ],

  compatibilityDate: '2025-03-18',
})