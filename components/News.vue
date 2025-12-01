<template lang="pug">
  #news.w-screen.min-h-screen.bg-lilac.text-purple
    h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '新闻' : 'News' }}
    template(v-if="news && news.length")
      .space-y-4
        .news-item(v-for="item in news" :key="item.id")
          h2.font-semibold {{ item.data.title }}
          p.text-sm.text-purp(v-if="item.data.subtitle") {{ item.data.subtitle }}
    template(v-else)
      p {{ locale === 'cn' ? '没有找到新闻' : 'No news items found.' }}
</template>

<script setup>
const { locale } = useI18n()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const { data, refresh } = await useAsyncData(
  () => `news-${locale.value}`,
  () => usePrismic().client.getAllByType("news", { lang: getPrismicLang(locale.value) })
);

const news = computed(() => data.value || []);

// Refresh data when locale changes
watch(locale, () => {
  refresh()
})
</script>

<style lang="sass" scoped>

</style>
