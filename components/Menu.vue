<template lang="pug">
#menu-wrap
  #mobile_menu.right-1.fixed(v-if="isMobileMenuVisible" @click="toggleMenu" :class="menuColorClass") MENU
  #menu(v-if="!isMobileMenuVisible" :class="menuColorClass")
    .menu-items.flex-col.flex.md_block.text-right
      a.cursor-pointer.inline-block(
        v-for="item in menuItems"
        :key="item.section"
        :class="{ 'active': activeSection === item.section }"
        @click="scrollToSection(item.section)"
        @mouseenter="$emit('menuHover', item.section)"
        @mouseleave="$emit('menuHover', '')"
      )
        span.link.px-3.py-0.rounded-xl.inline-block(:class="menuBackgroundClass") {{ item.name }}

</template>
<script setup>
const { locale } = useI18n()
const { overlaySection } = useOverlay()

const menuLabels = {
  en: {
    news: "News",
    publications: "Publications",
    books: "Books",
    info: "Info"
  },
  cn: {
    news: "新闻",
    publications: "出版物",
    books: "书籍",
    info: "信息"
  }
}

const menuItems = computed(() => {
  const labels = menuLabels[locale.value] || menuLabels.en
  return [
    { name: labels.news, section: "news" },
    { name: labels.publications, section: "publications" },
    { name: labels.books, section: "books" },
    { name: labels.info, section: "About" },
  ]
});

const emit = defineEmits(['menuHover', 'update:activeSection'])

const isMobileMenuVisible = ref(false);
const activeSection = ref('hero');

const menuColorClass = computed(() => {
  // If overlay is open, use overlay's color scheme
  const section = overlaySection.value || activeSection.value

  switch (section) {
    case 'hero':
      return 'text-white';
    case 'news':
      return 'text-purple';
    case 'publications':
      return 'text-green';
    case 'books':
      return 'text-brown';
    case 'About':
      return 'text-purple';
    default:
      return 'text-white';
  }
});

const menuBackgroundClass = computed(() => {
  // If overlay is open, use overlay's color scheme
  const section = overlaySection.value || activeSection.value

  switch (section) {
    case 'news':
      return 'bg-lightpurple md_bg-transparent';
    case 'publications':
      return 'bg-avocado md_bg-transparent';
    case 'books':
      return 'bg-sand md_bg-transparent';
    case 'About':
      return 'bg-grey md_bg-transparent';
    default:
      return '';
  }
});

const scrollToSection = (sectionId) => {
  if (process.client) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const updateActiveSection = () => {
  if (!process.client) return;

  const sections = ['hero', 'news', 'publications', 'books', 'About'];
  // Check when section is near the top of viewport (10% down)
  const checkPoint = window.scrollY + window.innerHeight * 0.1;

  // Loop through sections from bottom to top
  for (let i = sections.length - 1; i >= 0; i--) {
    const element = document.getElementById(sections[i]);
    if (element) {
      // If the section's top has passed our checkpoint, it's active
      if (element.offsetTop <= checkPoint) {
        activeSection.value = sections[i];
        emit('update:activeSection', sections[i]);
        break;
      }
    }
  }
};

const handleScroll = () => {
  if (process.client && window.innerWidth <= 767) {
    isMobileMenuVisible.value = true;
  }
  updateActiveSection();
};

const toggleMenu = () => {
  if (process.client && window.innerWidth <= 767) {
    isMobileMenuVisible.value = !isMobileMenuVisible.value;
  }
};

onMounted(() => {
  // Initialize mobile menu state
  if (process.client && window.innerWidth <= 767) {
    isMobileMenuVisible.value = true;
  }

  window.addEventListener('scroll', handleScroll);
  // Use nextTick and setTimeout to ensure DOM is fully rendered
  nextTick(() => {
    setTimeout(() => {
      updateActiveSection();
    }, 100);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
<style lang="sass" scoped>

a
  text-decoration: none
  border-bottom: 2px solid transparent
  transition: border-color 0.3s ease
  display: inline-block

a span:hover, #mobile_menu
  border-bottom-color: currentColor

a.active span
  text-decoration: underline
  text-decoration-thickness: 2px
  text-underline-offset: .4rem

#menu
  font-size: 1.5rem
  transition: color 0.3s ease

@media (max-width: 767px)
  #menu
    font-size: 2.5rem
  .menu-items
    a
      span


</style>
