<template lang="pug">
  ShaderBackground#news.w-screen.min-h-screen.text-purple(
    bg="lilac"
    ink="purple"
    shape="circle"
    :pixel-size="3"
  )
    .flex.flex-col.md_flex-row.gap-8.max-w-7xl.mx-auto.py-8.md_py-24.px-2.md_px-4
      .h1.text-base.font-bold.mb-8.uppercase.md_hidden.text-center News
      .news-menu.w-full.md_w-1x3(
        :class="{ 'hidden': selectedNews && showMobileDetail }"
        class="md_block"
      )
        //- Category tabs
        .category-tabs.flex.gap-2.mb-4.flex-wrap
          button.px-2.py-1.rounded-lg.text-sm.transition-colors.leading-none.uppercase(
            v-for="cat in categories"
            :key="cat.value"
            :class="{ 'bg-purple text-lilac': activeCategory === cat.value, 'bg-lightpurple': activeCategory !== cat.value }"
            @click="setCategory(cat.value)"
            class="md_hover_bg-lightpurple md_hover_text-purple"
          ) {{ cat.label }}

        template(v-if="filteredNews && filteredNews.length")
          .news-list.space-y-2
            .news-item.cursor-pointer.rounded.transition-colors.p-1.mb-8(
              v-for="item in filteredNews"
              :key="item.id"
              :class="{ 'md_bg-lightpurple md_shadow-lightpurple md_shadow-lg md_text-purple': isMounted && selectedNews?.id === item.id }"
              @click="selectNews(item)"
              class="md_hover_shadow-xl md_hover_shadow-lightpurple md_hover_text-shadow-lg"
            )
              .meta.text-sm
                | {{ formatDate(item.first_publication_date) }} — {{ item.data.subtitle }}
                span.category.text-xs.ml-2.px-1.bg-lightpurple.rounded.uppercase {{ item.data.category }}
              .title.text-xl.md_text-md.leading-none {{ item.data.title }}
        template(v-else)
          p.text-sm {{ locale === 'cn' ? '没有找到新闻' : 'No news items found.' }}

      ClientOnly
        //- Mobile overlay detail view (slides in) - teleported to body to escape stacking context
        Teleport(to="body")
          Transition(name="slide-in")
            .news-detail.mobile-detail-overlay(
              v-if="selectedNews && showMobileDetail"
              key="mobile"
              @touchstart="handleTouchStart"
              @touchmove="handleTouchMove"
              @touchend="handleTouchEnd"
            )
              //- Back button for mobile
              button.mb-4.rounded-lg.bg-lilac.text-purple.transition-colors.mobile-back-button(
                @click="closeMobileDetail"
                class="md_hover_bg-purple md_hover_text-lilac"
              ) ← {{ locale === 'cn' ? '返回列表' : 'BACK TO LIST' }}

              .overflow-hidden
                PrismicImage.w-full.shadow-lightpurple.shadow-xl(
                  v-if="selectedNews.data.featured_image?.url"
                  :field="selectedNews.data.featured_image"
                )
                .content.mt-2
                  .meta.text-sm
                    | {{ formatDate(selectedNews.first_publication_date) }} — {{ selectedNews.data.subtitle }}
                    span.category.bg-lightpurple.ml-2.rounded.px-1.uppercase {{ selectedNews.data.category }}
                  h2.text-xl.md_text-lg.mb-2.leading-none.text-purple {{ selectedNews.data.title }}
                  .news-content.text-purple(v-if="selectedNews.data.description")
                    PrismicRichText(:field="selectedNews.data.description")

        //- Desktop sidebar detail view (always visible on desktop)
        .news-detail.hidden.md_block.w-full.md_w-1x2(
          v-if="selectedNews"
        )
          .overflow-hidden
            PrismicImage.w-full.md_w-1x2.shadow-lightpurple.shadow-xl(
              v-if="selectedNews.data.featured_image?.url"
              :field="selectedNews.data.featured_image"
            )
            .content.mt-2
              .meta.text-sm
                | {{ formatDate(selectedNews.first_publication_date) }} — {{ selectedNews.data.subtitle }}
                span.category.bg-lightpurple.ml-2.rounded.px-1 {{ selectedNews.data.category }}
              h2.text-lg.mb-2 {{ selectedNews.data.title }}
              .news-content(v-if="selectedNews.data.description")
                PrismicRichText(:field="selectedNews.data.description")
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
  'news',
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[News.vue] Fetching news for locale:', locale.value, '| Prismic lang:', lang)
    const result = await prismic.client.getAllByType("news", { lang })
    console.log('[News.vue] Fetched', result?.length || 0, 'news items')
    return result
  },
  {
    watch: [() => locale.value]
  }
);

const news = computed(() => {
  const isServer = typeof window === 'undefined';
  console.log(`[News.vue] News computed triggered (${isServer ? 'SERVER' : 'CLIENT'}), data.value:`, data.value?.length || 0, 'items')
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
  const isServer = typeof window === 'undefined';
  const newsItems = news.value || [];
  const filtered = activeCategory.value === 'all'
    ? newsItems
    : newsItems.filter(item => item.data.category === activeCategory.value);
  console.log(`[News.vue] filteredNews computed (${isServer ? 'SERVER' : 'CLIENT'}):`, filtered.length, 'items, activeCategory:', activeCategory.value);
  return filtered;
});

// Selected news item state
const selectedNews = ref(null);
const isMounted = ref(false);

// Mobile detail view state
const showMobileDetail = ref(false);

// Function to set active category
const setCategory = (category) => {
  activeCategory.value = category;
  selectedNews.value = null; // Clear selection when category changes
  showMobileDetail.value = false; // Return to list view on mobile
};

// Function to select a news item
const selectNews = (item) => {
  selectedNews.value = item;
  // On mobile, show the detail view
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    showMobileDetail.value = true;
    // Disable body scroll when overlay is open
    document.body.style.overflow = 'hidden';
  }
};

// Function to close mobile detail view and return to list
const closeMobileDetail = () => {
  showMobileDetail.value = false;
  // Re-enable body scroll when overlay is closed
  if (typeof window !== 'undefined') {
    document.body.style.overflow = '';
  }
};

// Touch gesture handling for swipe to close
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchStartTime = Date.now();
};

const handleTouchMove = (e) => {
  // Optional: Add visual feedback during swipe
};

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndTime = Date.now();

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  const deltaTime = touchEndTime - touchStartTime;

  // Check if it's a right swipe (left to right)
  // Must be more horizontal than vertical, move right at least 100px, and be quick enough
  if (Math.abs(deltaX) > Math.abs(deltaY) &&
      deltaX > 100 &&
      deltaTime < 300) {
    closeMobileDetail();
  }
};

// Auto-select the latest news item after component is mounted (client-side only)
onMounted(() => {
  console.log('[News.vue] onMounted called, filteredNews:', filteredNews.value?.length || 0, 'items');
  isMounted.value = true;
  if (filteredNews.value && filteredNews.value.length > 0 && !selectedNews.value) {
    selectedNews.value = filteredNews.value[0];
    console.log('[News.vue] Auto-selected first news item:', selectedNews.value?.data?.title);
  }
});

// Watch for changes and auto-select if selection is cleared
watch(filteredNews, (newFilteredNews) => {
  if (newFilteredNews && newFilteredNews.length > 0 && !selectedNews.value) {
    selectedNews.value = newFilteredNews[0];
  }
});

// Format date based on locale - using UTC to ensure consistency between SSR and client
const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const isServer = typeof window === 'undefined';

  let formatted;
  if (locale.value === 'cn') {
    // Chinese format: YYYY年MM月DD日 - using UTC to prevent timezone mismatches
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    formatted = `${year}年${month}月${day}日`;
  } else {
    // English format: Month DD, YYYY - using UTC to prevent timezone mismatches
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    formatted = `${months[month]} ${day}, ${year}`;
  }

  if (!isServer) {
    console.log('[News.vue] formatDate (CLIENT):', dateString, '->', formatted);
  }

  return formatted;
};

// Clear selections when locale changes
watch(locale, () => {
  console.log('[News.vue] Locale changed, clearing selections...')
  activeCategory.value = 'all'
  selectedNews.value = null
  showMobileDetail.value = false
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style lang="sass" scoped>
// Mobile detail overlay styles - only on mobile
.mobile-detail-overlay
  position: fixed
  top: 0
  left: 0
  right: 0
  bottom: 0
  background: #e9dffd
  z-index: 999 !important
  overflow-y: auto
  padding: 1rem
  padding-top: .5rem

.mobile-back-button
  position: sticky
  top: 0
  z-index: 10

// Slide-in transition - only on mobile
.slide-in-enter-active,
.slide-in-leave-active
  transition: transform 0.3s ease-out, opacity 0.3s ease-out

.slide-in-enter-from
  transform: translateX(100%)
  opacity: 0

.slide-in-leave-to
  transform: translateX(100%)
  opacity: 0

.slide-in-enter-to,
.slide-in-leave-from
  transform: translateX(0)
  opacity: 1
</style>

<style>
/* Global style to ensure menu button stays above overlay */
#mobile_menu,
.menu-wrapper,
#menu-wrap {
  z-index: 10000 !important;
}
</style>
