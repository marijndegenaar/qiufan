<template lang="pug">
  header.flex.mb-4
    .spacer.w-1x3 
    .head.flex.w-2x3
      .project-title.text-xl.w-1x2.leading-none.mt-2
        h1 {{ title }} 
      .meta.w-1x2.mt-6.text-sm
        .year {{ year }}
        .location(v-if="location")  {{ location }}
        .category {{ category }}
    NuxtLink(to="/projects").fixed.text-sm.right-1.top-8.md_right-4._op-2.z-10.back.hover_text-red-500 ← Back to projects
  

  Gallery( :gallery="gallery" :featured-image="featuredImage")

  .desc-wrapper.w-full.mt-8
    template(v-for="(group, index) in groupedBlocks" :key="index")
      .flex.w-full(v-if="group.type === 'portrait-pair'")
        .spacer.w-1x6
        .flex.gap-4.mb-4.w-10x12
          .w-1x2.p-2(v-for="(img, imgIndex) in group.images" :key="imgIndex")
            img.w-full.cursor-pointer(:src="img.url" :alt="img.alt" @click="openLightbox(img.url, img.alt)")
      .flex.w-full(v-else-if="group.type === 'image' && !isPortrait(group.width, group.height)")
        .spacer.w-1x6
        .w-10x12.mb-4.p-2
          img.w-full.cursor-pointer(:src="group.url" :alt="group.alt" @click="openLightbox(group.url, group.alt)")
      .flex.w-full(v-else)
        .spacer.w-1x3 .
        .w-7x12
          div(v-if="group.type === 'paragraph'" v-html="group.html")
          img.cursor-pointer(v-else-if="group.type === 'image'" :src="group.url" :alt="group.alt" :class="getImageClass(group.width, group.height)" @click="openLightbox(group.url, group.alt)")

  div.lightbox(v-if="showLightbox" @click.self="closeLightbox")
    div.lightbox-content(@click="closeLightbox")
      img(:src="currentImage" :alt="currentCaption" class="lightbox-img")
      p.lightbox-caption(v-if="currentCaption") {{ currentCaption }}

</template>

<script setup>

const { client } = usePrismic()
const route = useRoute()

// Dynamically determine if it's an "exhibition" or a "project"
const postType = route.path.includes('/exhibition') ? 'exhibition' : 'project'

// Fetch data dynamically based on the postType
const { data: postData, error: fetchError } = await useAsyncData("post", async () => {
  try {
    return await client.getByUID(postType, route.params.uid)
  } catch (err) {
    console.error('Error fetching post:', err)
    return null
  }
})

// Check if data exists
if (!postData.value || fetchError.value) {
  throw createError({ 
    statusCode: 404, 
    statusMessage: 'Page Not Found',
    message: fetchError.value?.message || 'Content not found'
  })
}

// Destructure postData to avoid repetition
const { title, year, category, location, gallery, featured_image: featuredImage, description } = postData.value.data

// Lightbox state
const showLightbox = ref(false)
const currentImage = ref(null)
const currentCaption = ref('')

// Lightbox methods
const openLightbox = (imageUrl, caption = '') => {
  currentImage.value = imageUrl
  currentCaption.value = caption
  showLightbox.value = true
  document.addEventListener('keydown', handleKeydown)
}

const closeLightbox = () => {
  showLightbox.value = false
  currentImage.value = null
  currentCaption.value = ''
  document.removeEventListener('keydown', handleKeydown)
}

const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    closeLightbox()
  }
}

// Helper function to determine if image is portrait
const isPortrait = (width, height) => {
  if (!width || !height) return false
  return height > width
}

// Helper function to determine image orientation class
const getImageClass = (width, height) => {
  if (!width || !height) return 'w-4x5' // default to horizontal if dimensions unknown
  return width > height ? 'w-4x5' : 'w-1x2'
}

// Helper function to convert paragraph to HTML
const paragraphToHtml = (block) => {
  if (!block.text) return ''
  
  let html = block.text
  
  // Apply spans (bold, italic, links, etc.)
  if (block.spans && block.spans.length > 0) {
    // Sort spans by start position in reverse to avoid index shifting
    const sortedSpans = [...block.spans].sort((a, b) => b.start - a.start)
    
    sortedSpans.forEach(span => {
      const before = html.substring(0, span.start)
      const content = html.substring(span.start, span.end)
      const after = html.substring(span.end)
      
      if (span.type === 'strong') {
        html = before + `<strong>${content}</strong>` + after
      } else if (span.type === 'em') {
        html = before + `<em>${content}</em>` + after
      } else if (span.type === 'hyperlink') {
        html = before + `<a href="${span.data.url}" target="_blank">${content}</a>` + after
      }
    })
  }
  
  return `<p>${html}</p>`
}

// Group consecutive portrait images together
const groupedBlocks = computed(() => {
  if (!description) return []
  
  const groups = []
  let i = 0
  
  while (i < description.length) {
    const block = description[i]
    
    if (block.type === 'image') {
      const width = block.dimensions?.width || 0
      const height = block.dimensions?.height || 0
      
      // Check if this is a portrait image and if the next block is also a portrait image
      if (isPortrait(width, height) && i + 1 < description.length) {
        const nextBlock = description[i + 1]
        if (nextBlock.type === 'image') {
          const nextWidth = nextBlock.dimensions?.width || 0
          const nextHeight = nextBlock.dimensions?.height || 0
          
          if (isPortrait(nextWidth, nextHeight)) {
            // Group these two portrait images together
            groups.push({
              type: 'portrait-pair',
              images: [
                { url: block.url, alt: block.alt || 'Image', width, height },
                { url: nextBlock.url, alt: nextBlock.alt || 'Image', width: nextWidth, height: nextHeight }
              ]
            })
            i += 2 // Skip both images
            continue
          }
        }
      }
      
      // Single image (not part of a portrait pair)
      groups.push({
        type: 'image',
        url: block.url,
        alt: block.alt || 'Image',
        width,
        height
      })
      i++
    } else if (block.type === 'paragraph') {
      groups.push({
        type: 'paragraph',
        html: paragraphToHtml(block)
      })
      i++
    } else if (block.type === 'heading1') {
      groups.push({
        type: 'paragraph',
        html: `<h1>${block.text}</h1>`
      })
      i++
    } else if (block.type === 'heading2') {
      groups.push({
        type: 'paragraph',
        html: `<h2>${block.text}</h2>`
      })
      i++
    } else if (block.type === 'heading3') {
      groups.push({
        type: 'paragraph',
        html: `<h3>${block.text}</h3>`
      })
      i++
    } else {
      // Handle other block types
      i++
    }
  }
  
  return groups
})

</script>
  
<style scoped lang="sass">
  :deep(p)
    margin-bottom: 1rem
  .lightbox
    position: fixed
    top: 0
    left: 0
    width: 100vw
    height: 100vh
    background-color: rgba(255, 255, 255, .98)
    display: flex
    justify-content: center
    align-items: center
    z-index: 90
    cursor: zoom-out
    isolation: isolate

  .lightbox-content
    width: 90vw
    height: 80vh
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center

  .lightbox-img
    object-fit: contain
    max-width: 100%
    max-height: 100%
    width: 100%
    height: 100%
    margin: 0 auto

  .lightbox-caption
    margin: .5rem 0
    text-align: center
    font-size: .7rem
    position: absolute
    bottom: 5vh
    font-variation-settings: "EXPO" -60
</style>