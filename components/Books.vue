<template lang="pug">
  #books.w-screen.min-h-screen.bg-lilac.text-purple
    h1.text-xl.font-bold.mb-4 {{ locale === 'cn' ? '书籍' : 'Books' }}
    template(v-if="books && books.length")
      .space-y-4
        .book-item(v-for="book in books" :key="book.id")
          h2.font-semibold {{ book.data.title }}
          p.text-sm.text-purp(v-if="book.data.subtitle") {{ book.data.subtitle }}
    template(v-else)
      p {{ locale === 'cn' ? '没有找到书籍' : 'No books found.' }}
</template>

<script setup>
const { locale } = useI18n()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const { data, refresh } = await useAsyncData(
  () => `books-${locale.value}`,
  () => usePrismic().client.getAllByType("books", { lang: getPrismicLang(locale.value) })
);

const books = computed(() => data.value || []);

// Refresh data when locale changes
watch(locale, () => {
  refresh()
})
</script>

<style lang="sass" scoped>

</style>
