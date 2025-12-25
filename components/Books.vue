<template lang="pug">
  ShaderBackground#books.w-screen.min-h-screen.text-brown(
    bg="sand"
    ink="brown"
    shape="circle"
    :pixel-size="3"
  )
    .py-8.md_py-24.px-2.md_px-4
      .h1.text-base.font-bold.mb-8.uppercase.md_hidden.text-center Books
      .flex.flex-col.md_flex-row.gap-8.max-w-7xl.mx-auto
        .books-menu.w-full.md_w-1x3(
          :class="{ 'hidden': selectedBook && showMobileDetail }"
          class="md_block"
        )
          //- h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '书籍' : 'Books' }}

          template(v-if="books && books.length")
            //- Group books by category

            div(v-for="category in ['Novels', 'Short-fiction collections']" :key="category")
              template(v-if="booksByCategory[category] && booksByCategory[category].length")
                .text-xs.mb-1.uppercase {{ getCategoryLabel(category) }}
                .space-y-2.mb-8
                  .book-item.cursor-pointer.rounded.transition-colors.text-lg.mb-8(
                    v-for="book in booksByCategory[category]"
                    :key="book.id"
                    :class="{ 'md_bg-lightsand md_text-brown': selectedBook?.id === book.id }"
                    @click="selectBook(book)"
                    class="md_hover_bg-lightsand md_hover_text-brown"
                  )
                    .title.text-xl.md_text-md.leading-none {{ book.data.title }}
          template(v-else)
            p.text-sm {{ locale === 'cn' ? '没有找到书籍' : 'No books found.' }}

        ClientOnly
          //- Mobile overlay detail view (slides in) - teleported to body to escape stacking context
          Teleport(to="body")
            Transition(name="slide-in")
              .book-detail.mobile-detail-overlay(
                v-if="selectedBook && showMobileDetail"
                key="mobile"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
              )
                //- Back button for mobile
                button.mb-4.text-brown.transition-colors.mobile-back-button(
                  @click="closeMobileDetail"
                  class="md_hover_bg-brown md_hover_text-sand"
                ) ← {{ locale === 'cn' ? '返回列表' : 'BACK TO LIST' }}

                .overflow-hidden
                  .content.text-brown
                    h2.text-xl.md_text-lg.mb-1.py-2.leading-none {{ selectedBook.data.title }}
                    .book-content.mb-8(v-if="selectedBook.data.description")
                      PrismicRichText(:field="selectedBook.data.description")
                  PrismicImage.w-full.md_w-1x4(
                    v-if="selectedBook.data.featured_image?.url"
                    :field="selectedBook.data.featured_image"
                  )

          //- Desktop sidebar detail view (always visible on desktop)
          .book-detail.hidden.md_block.w-full.md_w-1x2(v-if="selectedBook")
            .overflow-hidden
              .content
                h2.text-lg.mb-1.pt-2 {{ selectedBook.data.title }}
                .book-content(v-if="selectedBook.data.description")
                  PrismicRichText(:field="selectedBook.data.description")
              PrismicImage.w-full.md_w-1x4(
                v-if="selectedBook.data.featured_image?.url"
                :field="selectedBook.data.featured_image"
              )
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
  'books',
  async () => {
    const lang = getPrismicLang(locale.value)
    console.log('[Books.vue] Fetching books for locale:', locale.value, '| Prismic lang:', lang)
    const result = await prismic.client.getAllByType("books", { lang })
    console.log('[Books.vue] Fetched', result?.length || 0, 'books')
    return result
  },
  {
    watch: [() => locale.value]
  }
);

const books = computed(() => data.value || []);

// Category labels
const categoryLabels = {
  en: {
    'Novels': 'Novels',
    'Short-fiction collections': 'Short Fiction Collections'
  },
  cn: {
    'Novels': '小说',
    'Short-fiction collections': '短篇小说集'
  }
}

// Get localized category label
const getCategoryLabel = (category) => {
  const labels = categoryLabels[locale.value] || categoryLabels.en
  return labels[category] || category
}

// Group books by category
const booksByCategory = computed(() => {
  const grouped = {
    'Novels': [],
    'Short-fiction collections': []
  }

  books.value.forEach(book => {
    const category = book.data.category
    if (category && grouped[category]) {
      grouped[category].push(book)
    }
  })

  return grouped
});

// Selected book state
const selectedBook = ref(null);

// Mobile detail view state
const showMobileDetail = ref(false);

// Function to select a book
const selectBook = (book) => {
  selectedBook.value = book;
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

// Clear selection when locale changes
watch(locale, () => {
  console.log('[Books.vue] Locale changed, clearing selection...')
  selectedBook.value = null
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
  background: #ebe9dc
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

