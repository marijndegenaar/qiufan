<template lang="pug">
	.gallery-wrap.relative(v-if="isGalleryLoaded")
		.scroller.right-0.hidden.md_block(@click="scrollToNextItem")
		.gallery.relative.md_w-screen.flex.flex-nowrap.overflow-x-auto.pb-2.pl-2.origin-top-left(v-if="gallery" ref="galleryRef" @scroll="handleScroll")
			.gallery-item.flex-none(v-for="(item, index) in repeatedGallery" :key="index" @click="openLightbox(item.image?.url, item.caption || item.description, item.media?.url, item.embed_url)"  :class="{ 'active': index % gallery.length === activeItem }")
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

	// Duplicate the gallery items for endless scrolling
	const repeatedGallery = computed(() => {
		return [...props.gallery, ...props.gallery]
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

	// Set isGalleryLoaded to true once the gallery data is available
	onMounted(() => {
		if (props.gallery && props.gallery.length > 0) {
			isGalleryLoaded.value = true
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
.gallery::-webkit-scrollbar 
	display: none

.gallery 
	-ms-overflow-style: none
	scrollbar-width: none
	.gallery-item
		cursor: zoom-in
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