<template lang="pug">
  #filter.p-2.fixed.top-52.w-1x3.text-sm
    //- .spacer.w-2x5
    //- span.pr-2 🗄️ 
    span.mr-2.hidden.md_block Filter:
    .filter-item.cursor-pointer.pr-3.md_pr-4(
      v-for="item in categoryFilters" 
      :key="item.slug" 
      @click="setFilter(item.slug)"
      :class="{ 'active': item.slug === currentFilter }"
    )
      span {{ item.name }}
    .filter-clear.cursor-pointer.pr-3.md_pr-4.ml-auto(v-if="currentFilter" @click="clearFilter")
      span Clear
  
  //- pre {{ filteredItems }}

  #project-list.flex.mt-2
    .w-1x3.spacer 
    .w-2x3
      .project-item.w-full.mb-8.flex(v-for="item in filteredItems" :key="item.id")
        nuxt-link(:to="`/${contentType}/${item.uid}`").w-full.flex
          .title.w-1x2.text-xl.leading-none
              h2.flex {{ item.data.title }}
          .meta.w-1x4.text-sm.mt-4
            .year {{ item.data.year }}
            .location {{ item.data.location }}
            .category {{ item.data.category }}
          .featured-image.w-1x4.bg-blue-100
            NuxtImg.object-cover.w-full.h-full(
            v-if="item.data.featured_image.url"
            :src="item.data.featured_image.url"
            :alt="item.data.featured_image?.alt || 'Image'"
          )
      
  </template>
  
  <script setup>
  import { usePrismic } from '@prismicio/vue'
  
  const { client } = usePrismic()
  
  const props = defineProps({
    contentType: String, // Either 'projects' or 'exhibitions'
  })
  
  const placeholderImage = '/placeholder.jpg' // Replace if needed
  
  // Load items
  const { data: items } = await useAsyncData(`${props.contentType}-list`, () =>
    client.getAllByType(props.contentType).then(results => {
      return results.sort((a, b) => {
        // First sort by category
        const categoryA = a.data.category || ''
        const categoryB = b.data.category || ''
        if (categoryA !== categoryB) {
          return categoryA.localeCompare(categoryB)
        }
        
        // If categories are the same, sort by year
        const yearA = parseInt(a.data.year) || 0
        const yearB = parseInt(b.data.year) || 0
        return yearB - yearA
      })
    })
  )
  
  // Current filter state
  const currentFilter = ref('')
  
  // Get categories dynamically from content
  const categoryFilters = computed(() => {
    if (!items.value) return []
    const categories = items.value
      .map(item => item.data.category)
      .filter(Boolean)
    const unique = [...new Set(categories)]
    return unique.map(name => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }))
  })
  
  // Filter function
  const filteredItems = computed(() => {
    if (!currentFilter.value) return items.value
    return items.value.filter(item => {
      const cat = item.data.category?.toLowerCase().replace(/\s+/g, '-')
      return cat === currentFilter.value
    })
  })
  
  // Change filter
  const setFilter = (slug) => {
    currentFilter.value = slug === currentFilter.value ? '' : slug
  }
  
  // Clear filter
  const clearFilter = () => {
    currentFilter.value = ''
  }
  </script>
  
<style scoped lang="sass">
.filter-item
  transition: color 200ms
  &:hover
    color: red
  &.active
    text-decoration: underline

.project-item
  transition: all 600ms
  cursor: pointer
  .featured-image
    aspect-ratio: 4/5
  .location, .category, .featured-image
    opacity: 0
    transition: all 200ms
  &:hover 
    .featured-image, .location, .category
      opacity: 1
    .title
      color: red
</style>
  