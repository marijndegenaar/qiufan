<template lang="pug">
  ShaderBackground#publications.w-screen.min-h-screen.text-green(
    bg="avocado"
    ink="green"
    shape="circle"
    :pixel-size="3"
  )
    .py-24
      template(v-if="publication")
        //- h1.text-xl.font-bold.mb-4 {{ publication.data.title || (locale === 'cn' ? '出版物' : 'Publications') }}
        template(v-if="publication.data.links")
          PrismicRichText(:field="publication.data.links")
        //- pre {{ publication.data.links }}
      template(v-else)
        h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '出版物' : 'Publications' }}
        p {{ locale === 'cn' ? '没有找到出版物文档' : 'No publications document found.' }}
</template>

<script setup>
const { locale } = useI18n()
const prismic = usePrismic()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const { data } = await useLazyAsyncData(
  'publications',
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[Publications.vue] Fetching publications for locale:', locale.value, '| Prismic lang:', lang)
    const result = await prismic.client.getSingle("publications", { lang })
    console.log('[Publications.vue] Fetched publications document')
    return result
  },
  {
    watch: [() => locale.value]
  }
);

const publication = computed(() => data.value || null);
</script>

<style lang="sass" scoped>
  #publications
    :deep(h3)
      text-transform: uppercase
      font-size: .625rem
      text-shadow: #F0FBE1 0 0 10px
    :deep(p)
      margin-bottom: 2rem
      a
        font-size: 1.5rem
        @media (max-width: 768px)
          font-size: 2rem
          line-height: 1.2
          &::after
              content: "↗︎"
              font-size: 0.4em
              margin-left: .5em
              text-decoration: none
              display: inline-block
              position: absolute
              margin-top: 0.5rem
        text-decoration: none
        margin-bottom: .5em
        text-shadow: #F0FBE1 0 0 10px
        display: inline-block              
        @media (min-width: 769px)
          &:hover
            text-decoration: underline
            text-underline-offset: .15em
            text-decoration-thickness: 0.06em
            &::after
              content: "↗︎\00a0"attr(href)""
              font-size: 0.4em
              margin-left: 1em
              text-decoration: none
              display: inline-block
              position: absolute
              margin-top: 0.5em
              max-width: 33.333%
              word-wrap: break-word
</style>
