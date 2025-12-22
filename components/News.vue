<template lang="pug">
  ShaderBackground#news.w-screen.min-h-screen.text-purple(
    bg="lilac"
    ink="purple"
    shape="circle"
    :pixel-size="3"
  )
    .flex.flex-col.md_flex-row.gap-8.max-w-7xl.mx-auto.py-24.px-4
      .news-menu.w-full.md_w-1x3
        //- h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '新闻' : 'News' }}

        //- Category tabs
        .category-tabs.flex.gap-2.mb-4.flex-wrap
          button.px-2.py-1.rounded-lg.text-sm.transition-colors.leading-none(
            v-for="cat in categories"
            :key="cat.value"
            :class="{ 'bg-purple/10 text-purple font-semibold': activeCategory === cat.value, 'bg-white bg-opacity-20': activeCategory !== cat.value }"
            @click="setCategory(cat.value)"
            class="hover_bg-purple hover_text-lilac"
          ) {{ cat.label }}

        template(v-if="filteredNews && filteredNews.length")
          .space-y-2
            .news-item.cursor-pointer.rounded.transition-colors.p-2(
              v-for="item in filteredNews"
              :key="item.id"
              :class="{ 'bg-purple/10 text-purple': selectedNews?.id === item.id }"
              @click="selectNews(item)"
              class="hover_bg-purple hover_text-lilac"
            )
              .meta.text-sm {{ formatDate(item.first_publication_date) }} — {{ item.data.subtitle }}
              .title.text-md {{ item.data.title }}
        template(v-else)
          p.text-sm {{ locale === 'cn' ? '没有找到新闻' : 'No news items found.' }}

      .news-detail.w-full.md_w-1x2(v-if="selectedNews")
        .overflow-hidden
          PrismicImage.w-full.md_w-1x2(
            v-if="selectedNews.data.featured_image?.url"
            :field="selectedNews.data.featured_image"
          )
          .content.mt-2
            .meta.text-sm {{ formatDate(selectedNews.first_publication_date) }} — {{ selectedNews.data.subtitle }}
            h2.text-lg.mb-2 {{ selectedNews.data.title }}
            .news-content(v-if="selectedNews.data.description")
              PrismicRichText(:field="selectedNews.data.description")
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
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[News.vue] Fetching news for locale:', locale.value, '| Prismic lang:', lang)
    const result = await usePrismic().client.getAllByType("news", { lang })
    console.log('[News.vue] Fetched', result?.length || 0, 'news items')
    return result
  }
);

const news = computed(() => {
  console.log('[News.vue] News computed triggered, data.value:', data.value?.length || 0, 'items')
  return data.value || []
});

// Category definitions
const categoryLabels = {
  en: {
    all: 'All',
    News: 'News',
    Interview: 'Interview',
    Event: 'Event'
  },
  cn: {
    all: '全部',
    News: '新闻',
    Interview: '采访',
    Event: '活动'
  }
}

const categories = computed(() => {
  const labels = categoryLabels[locale.value] || categoryLabels.en
  return [
    { value: 'all', label: labels.all },
    { value: 'News', label: labels.News },
    { value: 'Interview', label: labels.Interview },
    { value: 'Event', label: labels.Event }
  ]
})

// Active category state
const activeCategory = ref('all');

// Filtered news based on active category
const filteredNews = computed(() => {
  const newsItems = news.value || [];
  if (activeCategory.value === 'all') {
    return newsItems;
  }
  return newsItems.filter(item => item.data.category === activeCategory.value);
});

// Selected news item state
const selectedNews = ref(null);

// Function to set active category
const setCategory = (category) => {
  activeCategory.value = category;
  selectedNews.value = null; // Clear selection when category changes
};

// Function to select a news item
const selectNews = (item) => {
  selectedNews.value = item;
};

// Auto-select the latest news item when filtered news changes
// Run immediately to set initial selection
if (filteredNews.value && filteredNews.value.length > 0) {
  selectedNews.value = filteredNews.value[0];
}

watch(filteredNews, (newFilteredNews) => {
  if (newFilteredNews && newFilteredNews.length > 0 && !selectedNews.value) {
    selectedNews.value = newFilteredNews[0];
  }
});

// Format date based on locale - using UTC to ensure consistency between SSR and client
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (locale.value === 'cn') {
    // Chinese format: YYYY年MM月DD日 - using UTC to prevent timezone mismatches
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    return `${year}年${month}月${day}日`;
  } else {
    // English format: Month DD, YYYY - using UTC to prevent timezone mismatches
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[month]} ${day}, ${year}`;
  }
};

// Refresh data and clear selections when locale changes
watch(locale, async (newLocale, oldLocale) => {
  console.log('[News.vue] Locale changed from', oldLocale, 'to', newLocale)
  console.log('[News.vue] Calling refresh()...')
  await refresh()
  console.log('[News.vue] Refresh completed, data.value:', data.value?.length || 0, 'items')
  activeCategory.value = 'all'
  selectedNews.value = null
})
</script>

<style lang="sass" scoped>

</style>
