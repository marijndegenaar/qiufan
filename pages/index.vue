<template lang="pug">
article.content.p-2.w-10x12.mt-4 
  
.fixed.bottom-0.z-10
  //- Gallery(:gallery="homepageData.data.gallery" :featured-image="homepageData.data.featuredImage" :grid="homepageData.data.show_as_grid" :autoscroll="homepageData.data.enable_autoscroll" :aspectRatio="'3/4'")
  //- Slider(:gallery="homepageData.data.gallery" :items_to_show="3.5")
</template>

<script setup>
const { client } = usePrismic()
// get content from 'homepage'
const { data: homepageData } = await useAsyncData("homepage", () =>
  client.getSingle("homepage")
);
</script>

<style lang="sass" scoped>
</style>