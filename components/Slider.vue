<template lang="pug">
Carousel.gallery(v-if="gallery" ref="galleryRef" v-bind="config")
	slide.gallery-item(
		v-for="(item, index) in gallery" 
		:key="index" 
		@click="openLightbox(item.image?.url, item.description, item.media.url, item.embed_url)"
		@mouseenter="updateHoveredItem(item)"
		@mouseleave="clearHoveredItem"
	)
		template(v-if="item.media.kind === 'file' && item.media.url").mr-1
			video(:src="item.media.url" autoplay muted loop no-controls playsinline controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture)
		template(v-if="item.embed_url")
			prismic-embed(:field="item.embed_url").mr-1
		template(v-if="item.image && item.image.url")
			//- ImageResizer(:image-src="item.image.url").mr-1
			img(:src="item.image.url")
			
	template(#addons)
		CarouselNavigation.absolute.h-100.z-10
	
div.lightbox(v-if="lightboxVisible" @click.self="closeLightbox")
	div.lightbox-content(@click="closeLightbox")
		template(v-if="lightboxEmbed.embed_url")
			prismic-embed(:field="lightboxEmbed").mr-1
		template(v-else-if="lightboxMedia")
			video.lightbox-video(:src="lightboxMedia" autoplay muted loop no-controls controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture).mr-1.w-20
		template(v-else)
			img(:src="lightboxImage" :alt="lightboxCaption" class="lightbox-img")
		p.lightbox-caption {{ lightboxCaption }}
.floating-description(v-if="hoveredItem && hoveredItem.description" :style="{ left: cursorX + 'px', top: cursorY + 'px' }")
	| {{ hoveredItem.description }}
</template>

<script setup>
import { Navigation as CarouselNavigation } from 'vue3-carousel'

// Props to receive gallery data from parent component
const props = defineProps({
	gallery: Array,
	featuredImage: Object,
	grid: Boolean,
	autoscroll: Boolean,
	items_to_show: Number // Change to Number for proper usage
})

const config = computed(() => ({
	itemsToShow: props.items_to_show || 3.5, // Use props.items_to_show with fallback
	gap: 5,
	wrapAround: true,
	snapAlign: "start",
	// height: "600"
}))

const lightboxVisible = ref(false)
const lightboxImage = ref('')
const lightboxMedia = ref('')
const lightboxEmbed = ref('')
const lightboxCaption = ref('')
const cursorX = ref(0)
const cursorY = ref(0)
const hoveredItem = ref(null)

// Lightbox functions
const openLightbox = (imageUrl, caption, mediaUrl, embedUrl) => {
	lightboxImage.value = imageUrl;
	lightboxMedia.value = mediaUrl;
	lightboxEmbed.value = embedUrl;
	lightboxCaption.value = caption || ''; // Fallback if description is missing
	lightboxVisible.value = true;

	document.addEventListener('keydown', handleKeydown);
};

const closeLightbox = () => {
	lightboxVisible.value = false
	document.removeEventListener('keydown', handleKeydown)
}

const handleKeydown = (event) => {
	if (event.key === 'Escape') {
		closeLightbox()
	}
}

const updateHoveredItem = (item) => {
	hoveredItem.value = item
}

const clearHoveredItem = () => {
	hoveredItem.value = null
}

const handleMouseMove = (event) => {
	cursorX.value = event.clientX + 10
	cursorY.value = event.clientY + 10
}

onMounted(() => {
	window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
	window.removeEventListener('mousemove', handleMouseMove)
})

</script>

<style scoped lang="sass">

:deep(.carousel__next),
:deep(.carousel__prev)
	height: 100%
	// background: green
	width: 20%
	margin: 0
:deep(.carousel__next)
	right: 0
	cursor: e-resize
:deep(.carousel__prev)
	left: 0
	cursor: w-resize
:deep(.carousel__icon)
	display: none

:deep(.carousel__slide) 
	align-items: start

// /* Make images fit within the slide */
// :deep(.carousel__slide) img 
// 	max-height: 100%  /* Constrain by height */
// 	width: auto       /* Adjust width proportionally */
// 	object-fit: cover

.gallery 
	.gallery-item
		cursor: zoom-in
		video
			@media (max-width: 767px)
				height: 100vw
				aspect-ratio: 3 / 4
		.description
			// display: none
		// &.active
		// 	border: 2px solid red
		// 	.description
		// 		display: block
		// 		font-variation-settings: "EXPO" -60


.floating-description
	position: fixed
	// background: rgba(255, 255, 255, 0.9)
	padding: 0.5rem .5rem
	// border-radius: 4px
	pointer-events: none
	z-index: 100
	font-size: 0.8rem
	white-space: nowrap
	// box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)
	transform: translateY(-50%)
	mix-blend-mode: difference
	color: #fff
	font-variation-settings: "EXPO" -60


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

.lightbox-video
	object-fit: contain
	max-width: 100%
	max-height: 100%
	width: 100%
	height: 100%
	margin: 0 auto	

</style>  