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
import { ref, onMounted, onBeforeUnmount } from 'vue';

const menu = [ 
{ name: "Work", slug: "/projects" },
  // { name: "Exhibitions", slug: "/exhibitions" },
  { name: "About", slug: "/about" },
  
];

//get current route
const route = ref(useRoute().path);
//get slug from route
const slug = ref(route.value.split("/")[1]);

watchEffect(() => {
  //update slug when route changes
  slug.value = useRoute().path.split("/")[1];
});

defineEmits(['menuHover'])

const isMobileMenuVisible = ref(false);

const handleScroll = () => {
  if (window.innerWidth <= 767) { // Check if the screen width is mobile size
    isMobileMenuVisible.value = window.scrollY > 50;
  }
};

const toggleMenu = () => {
  if (window.innerWidth <= 767) {
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
