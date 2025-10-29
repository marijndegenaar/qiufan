<template lang="pug">
  header.flex.mb-2
    .spacer.w-1x3 
    .head.flex.w-2x3
      .project-title.text-lg.w-1x2
        h1 {{ title }} 
      .meta.w-1x2
        .year {{ year }}
        .category {{ category }}
        .location(v-if="location")  {{ location }}
    NuxtLink(to="/projects").fixed.right-1.top-10.md_right-4._top-2.z-10.back ← Back
  

  Gallery( :gallery="gallery" :featured-image="featuredImage") 

  .desc-wrapper.w-full.flex
    .spacer.w-1x3 .
    .w-7x12
      PrismicRichText(:field="postData.data.description")


  //- .content.p-1.md_p-2.container(v-if="postData.data.description")
    template(v-for="(block, index) in processedBlocks" :key="index")
      RichTextWithAudio(v-if="block.type === 'paragraph'" :text="block.text" :spans="block.spans")
      .image-wrap(:class="getImageClass(block.width, block.height)" class="pr-2 mb-4" v-else-if="block.type === 'image'")
        img.block-img(:src="block.url" :alt="block.alt" @click="openLightbox(block.url, block.alt)")
        .caption.text-xs.pt-1(v-if='block.alt != "Image"') {{ block.alt }}

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
const { data: postData } = await useAsyncData("post", () =>
  client.getByUID(postType, route.params.uid)
)

// Destructure postData to avoid repetition
const { title, year, location, gallery, featured_image: featuredImage, description } = postData.value.data

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

// Process the description content
const processedBlocks = computed(() => {
  if (!description) return []
  
  return description.map(block => {
    if (block.type === 'paragraph') {
      return { 
        type: 'paragraph', 
        text: block.text,
        spans: block.spans
      }
    } else if (block.type === 'image') {
      return { 
        type: 'image', 
        url: block.url, 
        alt: block.alt || 'Image',
        width: block.dimensions?.width || 0,
        height: block.dimensions?.height || 0
      }
    }
    return block
  })
})

// Helper function to determine image orientation
const getImageClass = (width, height) => {
  if (!width || !height) return 'w-4x5' // default to horizontal if dimensions unknown
  return width > height ? 'w-4x5' : 'w-1x2'
}

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