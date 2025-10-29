<template lang="pug">
	.grid-gallery(v-if="isGalleryLoaded && grid === true").flex.flex-wrap.p-1
		.grid-item.w-full.sm_w-1x2.md_w-1x3.xl_w-1x4(v-for="(item, index) in gallery" :key="index" @click="openLightbox(item.image?.url, item.description, item.media.url, item.embed_url)" @mouseenter="updateHoveredItem(item)" @mouseleave="clearHoveredItem")
			template(v-if="item.media.kind === 'video' && item.media.url").mr-1
				video(:src="item.media.url" autoplay muted loop controls controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture).mr-1.w-20
			template(v-if="item.embed_url")
				prismic-embed(:field="item.embed_url").mr-1
			template(v-if="item.image && item.image.url")
				.aspect-square.bg-gray-100.hover_bg-gray-200.p-8.flex.justify-center.items-center
					img(:src="item.image?.url").aspect-square.object-contain.hover_cursor-zoom-in

	.gallery-wrap.relative(v-if="isGalleryLoaded && grid!= true")
		.scroller.right-0.hidden.md_block(@click="scrollToNextItem")
		.gallery.relative.md_w-screen.flex.flex-nowrap.overflow-x-auto.pb-2.pl-2.origin-top-left(v-if="gallery" ref="galleryRef" @scroll="handleScroll")
			.gallery-item.flex-none(v-for="(item, index) in repeatedGallery" :key="index" @click="openLightbox(item.image?.url, item.description, item.media.url, item.embed_url)" @mouseenter="updateHoveredItem(item)" @mouseleave="clearHoveredItem" :class="{ 'active': index % gallery.length === activeItem }")
				.description.text-xs.hidden {{ item.description }}
				template(v-if="item.media.kind === 'file' && item.media.url")
					video(:src="item.media.url" autoplay muted loop no-controls playsinline controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture :style="videoAspectStyle").gallery-video.object-cover.video.pr-1
				template(v-if="item.embed_url && !item.media.url")
					prismic-embed(:field="item.embed_url").pr-1
				template(v-if="item.image && item.image.url")
					ImageResizer(:image-src="item.image.url" :imageObj="item.image" ).pr-1
					//- NuxtImg(:src="item.image.url").w-1x6
			NuxtImg.featured-image.w-2x6(v-if="!gallery[0]" :src="featuredImage.url" :alt="featuredImage.alt")
	
	div.lightbox(v-if="lightboxVisible" @click.self="closeLightbox")
		div.lightbox-content(@click="closeLightbox")
			template(v-if="lightboxEmbed.embed_url")
				prismic-embed(:field="lightboxEmbed").mr-1
			template(v-else-if="lightboxMedia")
				video.lightbox-video(:src="lightboxMedia" autoplay muted loop no-controls controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture).mr-1
			template(v-else)
				img(:src="lightboxImage" :alt="lightboxCaption" class="lightbox-img")
			p.lightbox-caption {{ lightboxCaption }}

	.floating-description.hidden.md_block(v-if="hoveredItem && hoveredItem.description" :style="{ left: cursorX + 'px', top: cursorY + 'px' }")
		| {{ hoveredItem.description }}
</template>


<script setup>

	// Props to receive gallery data from parent component
	const props = defineProps({
		gallery: Array,
		featuredImage: Object,
		grid: Boolean,
		autoscroll: Boolean,
		aspectRatio: {
			type: String,
			default: '16/9'
		}
	})

	const galleryRef = ref(null)
	const lightboxVisible = ref(false)
	const lightboxImage = ref('')
	const lightboxMedia = ref('')
	const lightboxEmbed = ref('')
	const lightboxCaption = ref('')
	const isGalleryLoaded = ref(false)
	const activeItem = ref(0) // Track the active gallery item
	const cursorX = ref(0)
	const cursorY = ref(0)
	const hoveredItem = ref(null)

	// Duplicate the gallery items for endless scrolling
	const repeatedGallery = computed(() => {
		return [...props.gallery, ...props.gallery]
	})

	// Computed style for video aspect ratio
	const videoAspectStyle = computed(() => {
		if (!props.aspectRatio || props.aspectRatio === 'auto') return {}
		const [w, h] = props.aspectRatio.split('/').map(Number)
		if (!w || !h) return {}
		return { aspectRatio: `${w} / ${h}` }
	})

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

	const handleScroll = () => {
		if (galleryRef.value) {
			const galleryElement = galleryRef.value
			const scrollWidth = galleryElement.scrollWidth / 2
			
			// Calculate which item is currently in view
			const scrollLeft = galleryElement.scrollLeft
			const itemWidth = galleryElement.children[0]?.offsetWidth || 0
			const visibleItem = Math.floor(scrollLeft / itemWidth) % props.gallery.length
			activeItem.value = visibleItem

			if (galleryElement.scrollLeft >= scrollWidth) {
				galleryElement.scrollLeft -= scrollWidth
			} else if (galleryElement.scrollLeft <= 0) {
				galleryElement.scrollLeft = scrollWidth
			}
		}
	}

	const scrollToNextItem = () => {
		if (galleryRef.value) {
			const galleryElement = galleryRef.value
			const currentScrollPosition = galleryElement.scrollLeft
			const galleryItems = galleryElement.children
			let totalWidth = 0
			for (let i = 0; i < galleryItems.length; i++) {
				const item = galleryItems[i]
				totalWidth += item.offsetWidth
				if (totalWidth > currentScrollPosition) {
					galleryElement.scrollTo({
						left: totalWidth,
						behavior: 'smooth'
					})
					break
				}
			}
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

	// Set isGalleryLoaded to true once the gallery data is available
	onMounted(() => {
		if (props.gallery && props.gallery.length > 0) {
			isGalleryLoaded.value = true
		}
		window.addEventListener('mousemove', handleMouseMove)
	})

	onUnmounted(() => {
		window.removeEventListener('mousemove', handleMouseMove)
	})

</script>

<style scoped lang="sass">
:deep([data-oembed-provider="YouTube"])
	width: 100%
	aspect-ratio: 16 / 9
	iframe
		width: 100%
		height: 100%
.gallery::-webkit-scrollbar 
	display: none

.gallery 
	-ms-overflow-style: none
	scrollbar-width: none
	.image-container
		cursor: zoom-in
	.gallery-item
		video
			@media (max-width: 767px)
				height: 110vw
				aspect-ratio: 3 / 4
		.description
			// display: none
		&.active
			// border: 2px solid red
			.description
				display: block
				font-variation-settings: "EXPO" -60
				position: fixed
				left: 0.5rem
				bottom: 110vw
				transform: translateY(-100%)

.scroller
	position: absolute
	width: 20%
	height: 100%
	z-index: 9
	cursor: e-resize
	transition: background 0.3s, transform 0.3s
	// &:hover
	// 	transform: scaleY(2)
	// 	transform-origin: top
	
	// // This keeps the gallery scaled when scroller is hovered
	// &:hover ~ .gallery 
	// 	transform: scale(2)
	// @media (min-width: 768px)
	// 	// Ensure scroller itself scales when hovered
	// 	&:hover
	// 		transform: scaleY(1.5)
	// 		transform-origin: top
		
	// 	// This keeps the gallery scaled when scroller is hovered
	// 	&:hover ~ .gallery 
	// 		transform: scale(1.5)

	.right
		right: 0

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


.lightbox-video
	object-fit: contain
	max-width: 100%
	max-height: 100%
	width: 100%
	height: 100%
	margin: 0 auto	

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

.gallery-video
	width: 40vw
	max-width: 90vw
	height: auto
	max-height: 50vh
	object-fit: cover

@media (max-width: 767px)
	.gallery-video
		width: 90vw
		max-width: 100vw
		height: auto
		max-height: 60vh

</style>  