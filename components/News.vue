<template lang="pug">
  #news.w-screen.min-h-screen.bg-avocado.text-green
    h1.text-xl.font-bold.mb-4 News
    template(v-if="news && news.length")
      .space-y-4
        .news-item(v-for="item in news" :key="item.id")
          h2.font-semibold {{ item.data.title }}
          p.text-sm.text-purp(v-if="item.data.subtitle") {{ item.data.subtitle }}
    template(v-else)
      p No news items found.
</template>

<script setup>

const { data } = await useAsyncData("news", () =>
  usePrismic().client.getAllByType("news")
);

const news = computed(() => data.value || []);
</script>

<style lang="sass" scoped>

</style>
