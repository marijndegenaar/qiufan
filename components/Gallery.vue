<template lang="pug">
	.gallery-wrap.relative(:class="{ 'is-loaded': isGalleryLoaded }")
		.gallery-loader(v-if="!isGalleryLoaded")
			.loader-skeleton
		.scroller.right-0.hidden.md_block(@click="scrollToNextItem" v-if="isGalleryLoaded")
		.gallery.relative.md_w-screen.flex.flex-nowrap.overflow-x-auto.pb-2.pl-2.origin-top-left(
			v-if="gallery && isGalleryLoaded" 
			ref="galleryRef" 
			@scroll="handleScroll"
			@mousedown="startDrag"
			@mousemove="onDrag"
			@mouseup="stopDrag"
			@mouseleave="stopDrag"
			@touchstart="startDrag"
			@touchmove="onDrag"
			@touchend="stopDrag"
			:class="{ 'is-dragging': isDragging }"
		)
			.gallery-item.flex-none(v-for="(item, index) in repeatedGallery" :key="index" @click="handleItemClick(item, $event)"  :class="{ 'active': index === activeItem }")
				template(v-if="item.embed_url && !item.media?.url")
					prismic-embed(:field="item.embed_url").pr-1
				template(v-if="item.image && item.image.url")
					ImageResizer(:image-src="item.image.url" :imageObj="item.image").pr-1
					//- NuxtImg(:src="item.image.url").w-1x6
			NuxtImg.featured-image.w-2x6(v-if="!gallery[0]" :src="featuredImage.url" :alt="featuredImage.alt")
	
	div.lightbox(v-if="lightboxVisible" @click.self="closeLightbox")
		div.lightbox-content(@click="closeLightbox")
			template(v-if="lightboxEmbed && lightboxEmbed.embed_url")
				prismic-embed(:field="lightboxEmbed").mr-1
			template(v-else-if="lightboxMedia")
				video.lightbox-video(:src="lightboxMedia" autoplay muted loop controls controlslist="nofullscreen nodownload noremoteplayback noplaybackrate" disablePictureInPicture).mr-1
			template(v-else-if="lightboxImage")
				img(:src="lightboxImage" :alt="lightboxCaption" class="lightbox-img")
			p.lightbox-caption(v-if="lightboxCaption") {{ lightboxCaption }}

</template>


<script setup>

	// Props to receive gallery data from parent component
	const props = defineProps({
		gallery: Array,
		featuredImage: Object
	})

	const galleryRef = ref(null)
	const lightboxVisible = ref(false)
	const lightboxImage = ref('')
	const lightboxMedia = ref('')
	const lightboxEmbed = ref(null)
	const lightboxCaption = ref('')
	const isGalleryLoaded = ref(false)
	const activeItem = ref(0) // Track the active gallery item
	
	// Drag functionality state
	const isDragging = ref(false)
	const isMouseDown = ref(false)
	const startX = ref(0)
	const scrollLeft = ref(0)
	const hasDragged = ref(false)

	// Gallery items (no duplication)
	const repeatedGallery = computed(() => {
		return props.gallery
	})

	// Lightbox functions
	const openLightbox = (imageUrl, caption, mediaUrl, embedUrl) => {
		// Reset all values first
		lightboxImage.value = '';
		lightboxMedia.value = '';
		lightboxEmbed.value = null;
		lightboxCaption.value = '';
		
		// Set values based on what's available (priority: embed > media > image)
		if (embedUrl) {
			lightboxEmbed.value = embedUrl;
		} else if (mediaUrl) {
			lightboxMedia.value = mediaUrl;
		} else if (imageUrl) {
			lightboxImage.value = imageUrl;
		}
		
		// Handle caption (could be string, Prismic KeyTextField, or null/undefined)
		if (caption) {
			if (typeof caption === 'string') {
				lightboxCaption.value = caption;
			} else if (caption?.text) {
				lightboxCaption.value = caption.text;
			} else if (Array.isArray(caption) && caption[0]?.text) {
				lightboxCaption.value = caption[0].text;
			}
		}
		
		lightboxVisible.value = true;
		document.addEventListener('keydown', handleKeydown);
		// Prevent body scroll when lightbox is open
		document.body.style.overflow = 'hidden';
	};

	const closeLightbox = () => {
		lightboxVisible.value = false
		lightboxImage.value = ''
		lightboxMedia.value = ''
		lightboxEmbed.value = null
		lightboxCaption.value = ''
		document.removeEventListener('keydown', handleKeydown)
		// Restore body scroll
		document.body.style.overflow = '';
	}

	const handleKeydown = (event) => {
		if (event.key === 'Escape') {
			closeLightbox()
		}
	}

	const handleScroll = () => {
		if (galleryRef.value) {
			const galleryElement = galleryRef.value
			
			// Calculate which item is currently in view
			const scrollLeft = galleryElement.scrollLeft
			const itemWidth = galleryElement.children[0]?.offsetWidth || 0
			const visibleItem = Math.floor(scrollLeft / itemWidth)
			activeItem.value = visibleItem
		}
	}

	const scrollToNextItem = () => {
		if (galleryRef.value) {
			const galleryElement = galleryRef.value
			const currentScrollPosition = galleryElement.scrollLeft
			const galleryItems = galleryElement.children
			const maxScroll = galleryElement.scrollWidth - galleryElement.clientWidth
			
			// Check if we're at or near the end (within 10px tolerance)
			if (currentScrollPosition >= maxScroll - 10) {
				// Loop back to the beginning
				galleryElement.scrollTo({
					left: 0,
					behavior: 'smooth'
				})
				return
			}
			
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

	// Drag functionality
	const startDrag = (e) => {
		if (!galleryRef.value) return
		
		isMouseDown.value = true
		hasDragged.value = false
		
		const galleryElement = galleryRef.value
		const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX
		
		startX.value = pageX - galleryElement.offsetLeft
		scrollLeft.value = galleryElement.scrollLeft
	}

	const onDrag = (e) => {
		if (!isMouseDown.value || !galleryRef.value) return
		
		const galleryElement = galleryRef.value
		const pageX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX
		
		const x = pageX - galleryElement.offsetLeft
		const walk = (x - startX.value) * 2
		
		// Only mark as dragged if movement exceeds threshold (5 pixels)
		if (Math.abs(walk) > 5) {
			if (!isDragging.value) {
				isDragging.value = true
				// Disable smooth scrolling during drag
				galleryElement.style.scrollBehavior = 'auto'
			}
			e.preventDefault()
			hasDragged.value = true
			galleryElement.scrollLeft = scrollLeft.value - walk
		}
	}

	const stopDrag = () => {
		if (isDragging.value && hasDragged.value) {
			snapToNearestItem()
		}
		
		isMouseDown.value = false
		isDragging.value = false
		hasDragged.value = false
	}

	const snapToNearestItem = () => {
		if (!galleryRef.value) return
		
		const galleryElement = galleryRef.value
		const scrollLeft = galleryElement.scrollLeft
		const galleryItems = galleryElement.children
		
		let closestItem = null
		let closestDistance = Infinity
		let targetScrollLeft = 0
		
		// Find the closest item to the current scroll position
		for (let i = 0; i < galleryItems.length; i++) {
			const item = galleryItems[i]
			const itemLeft = item.offsetLeft
			const distance = Math.abs(scrollLeft - itemLeft)
			
			if (distance < closestDistance) {
				closestDistance = distance
				closestItem = item
				targetScrollLeft = itemLeft
			}
		}
		
		// Smoothly scroll to the closest item
		if (closestItem) {
			// Re-enable smooth scrolling for the snap
			galleryElement.style.scrollBehavior = 'smooth'
			galleryElement.scrollTo({
				left: targetScrollLeft,
				behavior: 'smooth'
			})
			
			// Reset scroll behavior after snap completes
			setTimeout(() => {
				if (galleryRef.value) {
					galleryElement.style.scrollBehavior = ''
				}
			}, 500)
		}
	}

	const handleItemClick = (item, event) => {
		// Prevent opening lightbox if user was dragging (moved more than 5px)
		if (hasDragged.value || isDragging.value) {
			return
		}
		
		openLightbox(item.image?.url, item.caption || item.description, item.media?.url, item.embed_url)
	}

	// Set isGalleryLoaded to true once the gallery data is available
	onMounted(() => {
		if (props.gallery && props.gallery.length > 0) {
			// Add a small delay to ensure smooth fade-in
			setTimeout(() => {
				isGalleryLoaded.value = true
			}, 100)
		}
	})
	
	// Watch for gallery prop changes
	watch(() => props.gallery, (newGallery) => {
		if (newGallery && newGallery.length > 0 && !isGalleryLoaded.value) {
			setTimeout(() => {
				isGalleryLoaded.value = true
			}, 100)
		}
	})

</script>

<style scoped lang="sass">
:deep([data-oembed-provider="YouTube"])
	width: 100%
	aspect-ratio: 16 / 9
	iframe
		width: 100%
		height: 100%

.gallery-wrap
	min-height: 50vh
	opacity: 0
	transition: opacity 0.5s ease-in-out
	
	&.is-loaded
		opacity: 1

.gallery-loader
	width: 100%
	height: 50vh
	display: flex
	align-items: center
	justify-content: flex-start
	padding-left: 0.5rem
	
.loader-skeleton
	width: 80%
	height: 80%
	background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)
	background-size: 200% 100%
	animation: loading 1.5s infinite
	border-radius: 4px

@keyframes loading
	0%
		background-position: 200% 0
	100%
		background-position: -200% 0

.gallery::-webkit-scrollbar 
	display: none

.gallery 
	-ms-overflow-style: none
	scrollbar-width: none
	cursor: grab
	user-select: none
	scroll-snap-type: x mandatory
	
	&.is-dragging
		cursor: grabbing
		scroll-snap-type: none
		scroll-behavior: auto
		.gallery-item
			pointer-events: none
	
	.gallery-item
		cursor: zoom-in
		scroll-snap-align: start
		scroll-snap-stop: normal
		&.active
			// Active state styling if needed

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
</style>  