// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Elif Özbay',
      charset: 'utf-8',
      viewport: 'width=device-width, minimal-ui initial-scale=1, user-scalable=no',
      link: [{ rel: 'icon', type: 'image/png', href: '/fav.png' }],
      meta: [
        { hid: 'description', name: 'description', content: 'Elif Özbay is an artist based in Amsterdam' },
        { hid: 'keywords', name: 'keywords', content: '' }
      ],
    },
  },

  modules: [
    '@nuxtjs/prismic',
    '@nuxtjs/tailwindcss',
    '@formkit/auto-animate/nuxt',
    '@nuxt/image',
    'vue3-carousel-nuxt'
  ],

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
    endpoint: 'elifozbay'
  },

  css: [
    '@/assets/fonts/fonts.css',
    '@/assets/sass/main.sass'
  ],

  compatibilityDate: '2025-03-18',
})
