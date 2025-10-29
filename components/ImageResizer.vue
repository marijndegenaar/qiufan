<template lang="pug">
  .image-container
    NuxtImg(ref='image' :src='imageSrc' @load="onImageLoad" v-slot="{ src, isLoaded, imgAttrs }")
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { useWindowSize } from '@vueuse/core'
  import { debounce } from 'lodash-es'
  
  const props = defineProps({
    imageSrc: {
      type: String,
      required: true,
    },
    imageObj: {
      type: Object
    }
  })
  
  const image = ref(null)
  const isImageLoaded = ref(false)
  
  const { width: containerWidth, height: containerHeight } = useWindowSize()
  
  const resizeImage = debounce(() => {
    if (!isImageLoaded.value || !image.value?.$el) return
    
    const imgEl = image.value.$el // NuxtImg's underlying img element
    const imageWidth = imgEl.naturalWidth
    const imageHeight = imgEl.naturalHeight
    const isMobile = containerWidth.value < 768
  
    let widthRatio = isMobile ? 1.1 : 0.4
  
    if (imageWidth > imageHeight) {
      // Landscape orientation
      imgEl.style.width = containerWidth.value * widthRatio + 'px'
      imgEl.style.height = 'auto'
    } else {
      // Portrait orientation
      imgEl.style.width = 'auto'
      imgEl.style.height = containerWidth.value * widthRatio + 'px'
    }
  }, 100)
  
  const onImageLoad = () => {
    isImageLoaded.value = true
    resizeImage()
  }
  
  onMounted(() => {
    watch([containerWidth, containerHeight], resizeImage)
  })
  
  onUnmounted(() => {
    resizeImage.cancel()
  })
  </script>
  
  <style scoped>
  .image-container {
    display: flex;
    justify-content: center;
    align-items: start;
  }
  
  img {
    transition: width 0.3s ease, height 0.3s ease;
  }
  </style>