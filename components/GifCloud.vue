<template lang="pug">
  div.fixed.inset-0.w-screen.h-screen.overflow-hidden.pointer-events-none(ref="container")
    //- Animated GIF elements
    .gif-float(
      v-for="(gif, index) in gifs" 
      :key="index"
      :style="getGifStyle(index)"
      :ref="el => { if (el) gifRefs[index] = el }"
      :class="{ 'opacity-100': visible, 'opacity-0': !visible }"
    )
      img(
        :src="gif" 
        :alt="'Floating GIF ' + index"
        loading="lazy"
        class="w-full h-full object-contain pointer-events-auto"
      )
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  
  // Get all GIF files from assets/gifs directory
  const gifs = ref([])
  
  // Animation setup
  const container = ref(null)
  const gifRefs = ref([])
  const gifStates = ref([])
  const animationFrame = ref(null)
  const visible = ref(false) // Start hidden
  const mouseIdleTimer = ref(null)
  
  // Load GIFs from assets folder
  const loadGifs = async () => {
    try {
      // In Nuxt 3, we can use import.meta.glob to get all GIFs
      const gifFiles = import.meta.glob('~/assets/images/gifs/*.{gif,GIF}', { eager: true })
      gifs.value = Object.values(gifFiles).map(module => module.default || module)
      
      
      initGifs()
    } catch (error) {
      console.error('Error loading GIFs:', error)
    }
  }
  
  // Initialize random positions and movements
  const initGifs = () => {
    gifStates.value = gifs.value.map(() => ({
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 200),
      speed: 0.5 + Math.random() * 1.5,
      angle: Math.random() * Math.PI * 2,
      width: 100 + Math.random() * 100
    }))
  }
  
  const getGifStyle = (index) => {
    if (!gifStates.value[index]) return {}
    return {
      transform: `translate(${gifStates.value[index].x}px, ${gifStates.value[index].y}px)`,
      width: `${gifStates.value[index].width}px`,
      transition: 'transform 0.1s linear',
      zIndex: 9999
    }
  }
  
  // Handle mouse movement
  const handleMouseMove = () => {
    visible.value = false
    clearTimeout(mouseIdleTimer.value)
    mouseIdleTimer.value = setTimeout(() => {
      visible.value = true
    }, 5000)
  }
  
  // Animation loop
  const animate = () => {
    if (!container.value) return
    
    const containerRect = container.value.getBoundingClientRect()
    
    gifStates.value = gifStates.value.map(state => {
      let newX = state.x + Math.cos(state.angle) * state.speed
      let newY = state.y + Math.sin(state.angle) * state.speed
      let newAngle = state.angle
      
      // Bounce off edges
      if (newX <= 0 || newX >= containerRect.width - state.width) {
        newAngle = Math.PI - newAngle
        newX = newX <= 0 ? 0 : containerRect.width - state.width
      }
      
      if (newY <= 0 || newY >= containerRect.height - state.width) {
        newAngle = -newAngle
        newY = newY <= 0 ? 0 : containerRect.height - state.width
      }
      
      return {
        ...state,
        x: newX,
        y: newY,
        angle: newAngle
      }
    })
    
    // Apply styles
    gifRefs.value.forEach((el, index) => {
      if (el && gifStates.value[index]) {
        el.style.transform = `translate(${gifStates.value[index].x}px, ${gifStates.value[index].y}px)`
        el.style.width = `${gifStates.value[index].width}px`
      }
    })
    
    animationFrame.value = requestAnimationFrame(animate)
  }
  
  onMounted(() => {
    // Set up mouse listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleMouseMove)
    window.addEventListener('keydown', handleMouseMove)
    
    // Load GIFs and start animation
    loadGifs()
    animate()
    
    // Initial delay before showing
    mouseIdleTimer.value = setTimeout(() => {
      visible.value = true
    }, 5000)
  })
  
  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('scroll', handleMouseMove)
    window.removeEventListener('keydown', handleMouseMove)
    cancelAnimationFrame(animationFrame.value)
    clearTimeout(mouseIdleTimer.value)
  })
  </script>
  
  <style scoped lang="scss">
  .container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    pointer-events: none;
    z-index: 9998;
  }
  
  .gif-float {
    position: absolute;
    will-change: transform;
    transition: 
      transform 0.1s linear,
      opacity 0.5s ease;
    opacity: 0;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: auto;
      transition: transform 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
  }
  
  .opacity-100 {
    opacity: 1;
  }
  
  .opacity-0 {
    opacity: 0;
    transition: opacity 0.2s ease !important;
  }
  </style>