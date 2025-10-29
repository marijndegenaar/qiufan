<template lang="pug">
    p
      template(v-for="(part, index) in processedText" :key="index")
        template(v-if="part.type === 'text'") {{ part.content }}
        a(v-else-if="part.type === 'link'" :href="part.url" target="_blank" rel="noopener noreferrer") {{ part.text }}
        audio(v-else-if="part.type === 'audio'" controls)
          source(:src="part.url" type="audio/mpeg")
          | Your browser does not support the audio element.
  </template>
  
  <script setup>
  const props = defineProps({
    text: {
      type: String,
      required: true
    },
    spans: {
      type: Array,
      default: () => []
    }
  })
  
  const processedText = computed(() => {
    if (!props.text) return []
    
    const parts = []
    let currentIndex = 0
    
    props.spans.forEach(span => {
      // Add text before the span
      if (span.start > currentIndex) {
        parts.push({
          type: 'text',
          content: props.text.substring(currentIndex, span.start)
        })
      }
      
      // Handle audio spans
      if (span.type === 'hyperlink' && span.data.kind === 'audio') {
        parts.push({
          type: 'audio',
          url: span.data.url
        })
      }
      // Handle regular hyperlinks
      else if (span.type === 'hyperlink') {
        parts.push({
          type: 'link',
          url: span.data.url,
          text: props.text.substring(span.start, span.end)
        })
      }
      
      currentIndex = span.end
    })
    
    // Add remaining text after last span
    if (currentIndex < props.text.length) {
      parts.push({
        type: 'text',
        content: props.text.substring(currentIndex)
      })
    }
    
    return parts
  })
  </script>