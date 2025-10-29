	<template lang="pug">
		//- h1.title.text-xl.p-1 Graphic Design
		PrismicRichText(:field="gfxData.data.content").p-1.mt-16

		MasonryWall(:items='gfxData.data.gfx_collection' :ssr-columns='1' :max-columns='3' :gap='10').p-2
			template(#default='{ item, index }')
				.item.relative
					NuxtImg(
						:src="item.image.url"
						:width="item.image.dimensions.width"
						:height="item.image.dimensions.height"
						:class="['image', { loaded: loadedImages[index] }]"
						@click="openLightbox(item.image.url, item.description)"
						@mouseenter="updateHoveredItem(item)"
						@mouseleave="clearHoveredItem"
						loading="lazy"
						@load="markImageLoaded(index)" 
					)

		//- Lightbox
		.lightbox(v-if="showLightbox" @click="closeLightbox")
			.lightbox-content(@click.stop)
				img(:src="currentImage"  @click="closeLightbox")
				.caption.text-xs.pt-1 {{ currentCaption }}

		.floating-description(v-if="hoveredItem && (hoveredItem.title || hoveredItem.description)" :style="{ left: cursorX + 'px', top: cursorY + 'px' }")
			| {{ hoveredItem.title }}
			br
			PrismicRichText(v-if="hoveredItem.description" :field="hoveredItem.description").text-xs
	</template>

	<style lang="sass" scoped>
	h1
		font-size: 140px
		line-height: 0.8
		letter-spacing: -0.07em
		transition: all 100ms ease-in-out
		&:hover
			font-variation-settings: "EXPO" -90

	.title
		margin-bottom: 2rem

	.image
		width: 100%
		height: auto
		display: block
		opacity: 0
		// filter: grayscale(100%)
		transition: opacity 1s ease-out
		cursor: zoom-in

	.desc
		cursor: zoom-in
		border-radius: 60%
		height: 50%
		transform: translateY(50%)
		
	.image.loaded
		opacity: 1
		filter: grayscale(0)

	.lightbox
		position: fixed
		top: 0
		left: 0
		width: 100vw
		height: 100vh
		background-color: rgba(255, 255, 255, 0.95)
		display: flex
		justify-content: center
		align-items: center
		z-index: 1000
		cursor: zoom-out

	.lightbox-content
		position: relative
		max-width: 90%
		max-height: 90vh
		img
			max-width: 100%
			max-height: 90vh
			object-fit: contain

	.caption
		text-align: center
		margin-top: 1rem
		color: white

	.floating-description
		position: fixed
		padding: 0.5rem .5rem
		pointer-events: none
		z-index: 100
		font-size: 0.8rem
		white-space: nowrap
		transform: translateY(-50%)
		mix-blend-mode: difference
		color: #fff
		font-variation-settings: "EXPO" -60
	</style>


	<script setup>
	import { usePrismic } from '@prismicio/vue'
	// import { ref, onMounted } from 'vue'

	const { client } = usePrismic()

	const shuffleArray = (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	const { data: gfxData } = await useAsyncData("gfx", () =>
		client.getSingle("gfx").then(data => {
			// Shuffle the gfx_collection
			data.data.gfx_collection = shuffleArray(data.data.gfx_collection);
			return data;
		})
	)

	// Track which images are loaded
	const loadedImages = ref({})

	const markImageLoaded = (index) => {
		loadedImages.value[index] = true
	}
	// Lightbox state
	const showLightbox = ref(false)
	const currentImage = ref(null)
	const currentCaption = ref('')

	// Cursor following description state
	const cursorX = ref(0)
	const cursorY = ref(0)
	const hoveredItem = ref(null)

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


	onMounted(async () => {
		window.addEventListener('mousemove', handleMouseMove)
	})

	onUnmounted(() => {
		window.removeEventListener('mousemove', handleMouseMove)
	})
	</script>

