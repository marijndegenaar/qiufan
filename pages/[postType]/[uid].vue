<template lang="pug">
  header.px-2.mb-2.mt-6
    .head.flex.items-baseline
      h1.text-xxl {{ title[0].text }} 
      .year.font-bold.text-xs.md_text-base.pl-1.md_pl-4 {{ year }}
    .location.text-lg.md_text-xl.mt-2(v-if="location") — {{ location }}
    NuxtLink(to="/projects").fixed.left-1.top-10.md_right-4._top-2.z-10.back ← Back
  
  //- img(:src="featuredImage.url").w-2x5.sticky.top-0.mix-blend-difference.invert
  .featured-image.flex.w-1x2(v-if="featuredImage.url && !postData.data.featured_embed.embed_url && postData.data.hide_featured !== true")
    img.block-img(:src="featuredImage.url" @click="openLightbox(featuredImage.url, featuredImage.alt)")
  //- pre {{ postData.data.featured_embed.embed_url }}
  .featured-embed.flex.w-full.md_w-3x4.p-2(v-if="postData.data.featured_embed.embed_url")
    prismic-embed(:field="postData.data.featured_embed").w-full.embed

  PrismicRichText.intro.w-full.md_4x5.p-1.md_p-2.text-lg.md_text-lg.container.break-all.md_break-normal(:field="postData.data.introduction")

  Gallery( :gallery="gallery" :featured-image="featuredImage" :grid="postData.data.show_as_grid")

  //- .hidden.md_block
  //-   Gallery(v-if="postData.data.use_vue_carousel === false || !postData.data.use_vue_carousel" :gallery="gallery" :featured-image="featuredImage" :grid="postData.data.show_as_grid")

  //-   Slider(v-if="postData.data.use_vue_carousel === true" :gallery="gallery" :items_to_show="postData.data.items_to_show")
    
  //- .md_hidden.mb-4
  //-   Slider(:gallery="gallery" :items_to_show="1.2")
  
  PrismicRichText.content.text-lg.w-full.md_w-4x5.p-1(:field="postData.data.description")


  //- .content.p-1.md_p-2.container(v-if="postData.data.description")
    template(v-for="(block, index) in processedBlocks" :key="index")
      RichTextWithAudio(v-if="block.type === 'paragraph'" :text="block.text" :spans="block.spans")
      .image-wrap(:class="getImageClass(block.width, block.height)" class="pr-2 mb-4" v-else-if="block.type === 'image'")
        img.block-img(:src="block.url" :alt="block.alt" @click="openLightbox(block.url, block.alt)")
        .caption.text-xs.pt-1(v-if='block.alt != "Image"') {{ block.alt }}


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
}

const closeLightbox = () => {
  showLightbox.value = false
  currentImage.value = null
  currentCaption.value = ''
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
  :deep(ul)
    margin-top: 1rem
    li
      margin-bottom: .3rem
      list-style-type: disc
  :deep(.block-img)
    max-width: 100%
    cursor: zoom-in
    transition: opacity 0.2s ease-in-out
    &:hover
      opacity: 0.9
  
  .intro a, content a
    word-break: wrap

  h1
    line-height: 1
    letter-spacing: -0.06em
    transition: all 100ms ease-in-out
    &:hover
      font-variation-settings: "EXPO" -90
  .back
    transition: all 100ms ease-in-out
    &:hover
      font-variation-settings: "EXPO" -90
  @media (min-width: 768px) 
    h1
      font-size: 100px
      line-height: 0.8
</style>