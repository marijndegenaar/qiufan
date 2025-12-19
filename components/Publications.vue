<template lang="pug">
  #publications.w-screen.min-h-screen.bg-avocado.text-green.py-24
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

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const { data, refresh } = await useAsyncData(
  () => `publications-${locale.value}`,
  () => usePrismic().client.getSingle("publications", { lang: getPrismicLang(locale.value) })
);

const publication = computed(() => data.value || null);

// Refresh data when locale changes
watch(locale, () => {
  refresh()
})
</script>

<style lang="sass" scoped>
  #publications
    :deep(h3)
      text-transform: uppercase
      font-size: .625rem
    :deep(p)
      margin-bottom: 2rem
      a
        font-size: 1.5rem
        text-decoration: none
        margin-bottom: .5rem
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
