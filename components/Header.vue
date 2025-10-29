<template lang="pug">
#header.flex.w-full.flex-wrap
    //- nuxt-link(to="/").w-1x4 Marijn Degenaar 
    nuxt-link(to="/").md_pr-8.mb-2.w-3x5.md_w-2x5.text-xs
      strong.text-base Marijn Degenaar 
      span(v-if="!isUidPage && isBioVisible").bio is a Berlin based graphic designer, and artist working with moving image, sound and performance. Open to projects and collaborations of any kind. 
    Menu.w-2x5.md_w-3x5.mb-2.text-right.md_text-left
    img(src="~assets/images/underconstruction.webp" alt="Under Construction").underconstruction.fixed.bottom-0.md_top-0.right-0.w-1x6.md_w-1x12.z-10
    //- img.glyph.w-1x12.fixed.top-2.right-5.hidden.md_block(src="~/assets/images/petroglyph.png")
    .cursor-description.fixed.pointer-events-none.z-50.text-xs(
      :style="{ left: cursorX + 'px', top: cursorY + 'px' }"
      :class="{ 'opacity-0': !currentDescription }"
    ) {{ currentDescription }}
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

// Cursor following description
const cursorX = ref(0)
const cursorY = ref(0)
const currentDescription = ref('')

const menuDescriptions = {
  '/projects': 'Selected works and projects',
  '/graphicdesign': 'Graphic design work and experiments',
  '/about': 'About Marijn Degenaar'
}

const handleMouseMove = (e) => {
  cursorX.value = e.clientX + 10
  cursorY.value = e.clientY + 10
}

const handleMouseEnter = (path) => {
  currentDescription.value = menuDescriptions[path] || ''
}

const handleMouseLeave = () => {
  currentDescription.value = ''
}

const isBioVisible = ref(true)

const handleScroll = () => {
  if (window.scrollY > 50) {
    isBioVisible.value = false // Hide bio
  } else {
    isBioVisible.value = true // Show bio
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="sass" scoped>
@keyframes rotate
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)

.glyph
  animation: rotate 20s linear infinite // Adjust the duration as needed
  filter: blur(4px)
  transition: all 200ms 
  opacity: .4
  &:hover
    filter: blur(0)
    opacity: 1

.cursor-description
  transform: translateY(-50%)
  transition: opacity 200ms ease
  background: rgba(255, 255, 255, 0.9)
  padding: 0.5rem
  border-radius: 4px
  white-space: nowrap
  font-variation-settings: "EXPO" -30
.underconstruction
  z-index: 1000
</style>