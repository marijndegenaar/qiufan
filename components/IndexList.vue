<template lang="pug">
  //- #filter.text-xs.fixed.w-full.left-1.top-8.z-10.flex
  #filter.w-full.p-2.fixed.top-48.w-1x3
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

  #project-list.flex.p-2
    .w-1x3.spacer 
    .w-2x3
      .content-item.w-full.mb-8.flex(v-for="item in filteredItems" :key="item.id")
        .title.w-1x2
          nuxt-link(:to="`/${contentType}/${item.uid}`").block
            h2.flex {{ item.data.title }}
        .meta.w-1x4
          .year {{ item.data.year }}
          .location {{ item.data.location }}
          .type {{ item.data.category }}
        .featured-image.w-1x4
          NuxtImg.w-full(
          v-if="item.data.featured_image.url"
          :src="item.data.featured_image.url"
          :alt="item.data.featured_image?.alt || 'Image'"
        )
      
  </template>
  
  <script setup>
  // import { ref, computed } from 'vue'
  // import { useAsyncData } from '#app'
  import { usePrismic } from '@prismicio/vue'
  
  const { client } = usePrismic()
  
  const props = defineProps({
    contentType: String, // Either 'projects' or 'exhibitions'
  })
  
  const placeholderImage = '/placeholder.jpg' // Replace if needed
  
  // Load items
  const { data: items } = await useAsyncData(() =>
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

  </style>
  