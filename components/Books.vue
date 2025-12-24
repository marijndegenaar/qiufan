<template lang="pug">
  ShaderBackground#books.w-screen.min-h-screen.text-brown(
    bg="sand"
    ink="brown"
    shape="circle"
    :pixel-size="3"
  )
    .py-24.px-2.md_px-4
      .flex.flex-col.md_flex-row.gap-8.max-w-7xl.mx-auto
        .books-menu.w-full.md_w-1x3
          //- h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '书籍' : 'Books' }}

          template(v-if="books && books.length")
            //- Group books by category

            div(v-for="category in ['Novels', 'Short-fiction collections']" :key="category")
              template(v-if="booksByCategory[category] && booksByCategory[category].length")
                .text-xs.mb-1.uppercase {{ getCategoryLabel(category) }}
                .space-y-2
                  .book-item.cursor-pointer.px-2.py-1.rounded.transition-colors.text-lg(
                    v-for="book in booksByCategory[category]"
                    :key="book.id"
                    :class="{ 'bg-lightsand text-brown': selectedBook?.id === book.id }"
                    @click="selectBook(book)"
                    class="hover_bg-lightsand hover_text-brown"
                  )
                    .title.text-md {{ book.data.title }}
          template(v-else)
            p.text-sm {{ locale === 'cn' ? '没有找到书籍' : 'No books found.' }}

        .book-detail.w-full.md_w-1x2(v-if="selectedBook")
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

// Function to select a book
const selectBook = (book) => {
  selectedBook.value = book;
};

// Clear selection when locale changes
watch(locale, () => {
  console.log('[Books.vue] Locale changed, clearing selection...')
  selectedBook.value = null
})
</script>

<style lang="sass" scoped>

</style>
