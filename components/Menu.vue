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
        span.ml-8 {{ item.name }}
    
</template>
<script setup>

const menu = [ 
  { name: "News", slug: "" },
  { name: "Publications", slug: "" },  
  { name: "Books", slug: "" },
  { name: "Info", slug: "" },
];

//get current route

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

@media (max-width: 767px)
  .menu-items 
    a
      span
          background: #fff
          border-radius: .4em
          padding: 0 0.2em
          
</style>
