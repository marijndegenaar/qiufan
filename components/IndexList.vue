<template lang="pug">
  //- #filter.text-xs.fixed.w-full.left-1.top-8.z-10.flex
  #filter.text-xs.w-11x12.md_w-full.flex.pl-2.md_mt-8.sticky.top-8
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
  
  //- pre {{ filteredItems }}

  #content-list.w-full.px-2.mb-32.mt-8
    .content-item.w-full.mb-8(v-for="item in filteredItems" :key="item.id")
      nuxt-link(:to="`/${contentType}/${item.uid}`")
        h2.text-xl.flex.items-baseline 
          .title.mr-2.tracking-tighter {{ item.data.title[0]?.text }}
          .year.text-sm.md_text-lg.md_text-normal {{ item.data.year }}
        .type.md_text-xs {{ item.data.category }}
        //- NuxtImg.md_hidden.feat.w-2x5.mt-2.aspect-video.object-cover(v-if="item.data.featured_image.url" :src="item.data.featured_image.url" )
  
      .featured-image.hidden.w-1x2.md_w-2x6.md_fixed.right-0.bottom-0
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
  </script>
  
  <style scoped lang="sass">
  @media (min-width: 768px) 
    .content-item a:hover ~ .featured-image 
      display: block
      margin-top: .45em
  .content-item
    a
      transition: all 100ms ease-in-out
      @media (max-width: 767px)
        &:hover
          font-variation-settings: "EXPO" -80
  
    .featured-image
      display: none
  
  @media (max-width: 767px) 
    .filter-item a
      transition: all 150ms ease
      &:hover
        font-variation-settings: "EXPO" -80
  .active
    font-variation-settings: "EXPO" -40

  </style>
  