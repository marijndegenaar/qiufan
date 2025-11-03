<template lang="pug">
#menu-wrap
  #mobile_menu.right-1.fixed.text-sm(v-if="isMobileMenuVisible" @click="toggleMenu") ++
  #menu(v-if="!isMobileMenuVisible" @click="toggleMenu")
    .menu-items.flex-col.flex.md_block
      nuxt-link.hover_text-red-500(
        v-for="item in menu" 
        :key="item.slug" 
        :to="item.slug"
        @mouseenter="$emit('menuHover', item.slug)"
        @mouseleave="$emit('menuHover', '')"
      ) 
        span {{ item.name }}, 
      nuxt-link(to="https://www.instagram.com/yabzofile" target="_blank").hover_text-red-500 IG
    
</template>
<script setup>
import autoAnimate from "@formkit/auto-animate";

const menu = [ 
{ name: "Work", slug: "/projects" },
  // { name: "Exhibitions", slug: "/exhibitions" },
  { name: "About", slug: "/about" },
  
];

//get current route
const route = useRoute();
const routePath = computed(() => route?.path || '/');
const slug = computed(() => routePath.value.split("/")[1] || '');

defineEmits(['menuHover'])

const isMobileMenuVisible = ref(false);

const handleScroll = () => {
  if (process.client && window.innerWidth <= 767) { // Check if the screen width is mobile size
    isMobileMenuVisible.value = window.scrollY > 50;
  }
};

const toggleMenu = () => {
  if (process.client && window.innerWidth <= 767) {
    isMobileMenuVisible.value = !isMobileMenuVisible.value;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
<style lang="sass" scoped>

a:hover, .router-link-active, #mobile_menu
  
#menu
  font-size: 1.5rem
  font-family: "G", serif

@media (max-width: 767px)
  .menu-items 
    a
      span
          background: #fff
          border-radius: .4em
          padding: 0 0.2em
          

// @media (max-width: 767px)
//   .menu-items 
//     a
//       &::after
//         content: ', '
//       &:last-child::after
//         content: ''
</style>
