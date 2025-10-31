<template lang="pug">
#header.flex.w-full.md_w-1x3.flex-wrap
    //- nuxt-link(to="/").w-1x4 Marijn Degenaar 
    nuxt-link(to="/").md_pr-8.mb-2
      strong.text-lg.logo Elif Satanaya Özbay 
      div(v-if="!isUidPage && isBioVisible").bio.text-sm.w-3x4
        | is an artist working with performances, installations, and text, using the horror genre to explore suspense and merge readymades with texts.
        br
        br
        | Upcoming: 
        br
        | 12 October, Mutter, Amsterdam
        br
        | 28 November, KW, Berlin
    Menu.fixed.left-2.bottom-2.text-lg
    
</template>
  
<script setup>
// import { ref, onMounted, onBeforeUnmount } from 'vue'
// import { usePrismic } from 'prismic-nuxt'
// import { computed } from 'vue'
// import { useRoute } from 'vue-router'

const { client } = usePrismic()
// get content from 'homepage'
const { data: homepageData } = await useAsyncData("homepage", () =>
client.getSingle("homepage")
);

const route = useRoute()
const isUidPage = computed(() => {
  return route.params.uid !== undefined
})


const isBioVisible = ref(true)


</script>

<style lang="sass" scoped>
@keyframes rotate
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

.logo
  font-family: 'G', serif
</style>