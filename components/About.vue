<template lang="pug">
  #About.bg-grey.text-purple.px-2.py-16
    .w-full.flex(v-if="about")
      PrismicImage.w-full.md_w-1x3.mr-8(
        v-if="about.data.featured_image?.url"
        :field="about.data.featured_image"
        imgix-params="{ fit: 'max' }"
      )
      .content.w-full.md_w-1x2.text-sm(v-if="about.data.content")
        PrismicRichText(:field="about.data.content")
</template>

<script setup>
const { locale } = useI18n()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const { data, refresh } = await useAsyncData(
  `about-${locale.value}`,
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[About.vue] Fetching about for locale:', locale.value, '| Prismic lang:', lang)
    const result = await usePrismic().client.getSingle("about", { lang })
    console.log('[About.vue] Fetched about document')
    return result
  }
);

const about = computed(() => {
  return data.value || null
});

// Refresh data when locale changes
watch(locale, async (newLocale, oldLocale) => {
  console.log('[About.vue] Locale changed from', oldLocale, 'to', newLocale)
  console.log('[About.vue] Calling refresh()...')
  await refresh()
  console.log('[About.vue] Refresh completed')
})

</script>

<style lang="sass" scoped>
#About
  :deep(img)
    object-fit: contain
    object-position: top
    height: auto
  :deep(p)
    margin-bottom: 1em
</style>
