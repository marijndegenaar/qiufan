<template lang="pug">
  ShaderBackground#About.text-purple.px-2.py-8.md_py-24(
    bg="grey"
    ink="purple"
    shape="circle"
    :pixel-size="3"
  )
    .w-full.flex.flex-wrap(v-if="about")
      .h1.text-base.font-bold.mb-8.uppercase.md_hidden About
      .feature-image.w-full.md_w-1x3.md_mr-8.mb-8
        PrismicImage.shadow-lightpurple.shadow-xl(
          v-if="about.data.featured_image?.url"
          :field="about.data.featured_image"
          imgix-params="{ fit: 'max' }"
        )
      .content.w-full.md_w-1x2(v-if="about.data.content")
        PrismicRichText(:field="about.data.content")
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
  'about',
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[About.vue] Fetching about for locale:', locale.value, '| Prismic lang:', lang)
    const result = await prismic.client.getSingle("about", { lang })
    console.log('[About.vue] Fetched about document')
    return result
  },
  {
    watch: [() => locale.value]
  }
);

const about = computed(() => {
  return data.value || null
});

</script>

<style lang="sass" scoped>
#About
  :deep(img)
    height: auto
  :deep(p)
    margin-bottom: 1em
</style>
