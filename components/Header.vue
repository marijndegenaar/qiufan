<template lang="pug">
#header
	h1.logo.fixed.top-2.left-4.uppercase(:class="[{ 'blend-mode': activeSection === 'hero', 'elevated': activeSection !== 'hero' }, logoColorClass]") {{ locale === 'cn' ? '陈楸帆' : 'Chen Qiufan' }}
	.menu-wrapper.fixed.top-2.right-2(:class="{ 'blend-mode': activeSection === 'hero', 'elevated': activeSection !== 'hero' }")
		Menu(@update:activeSection="updateActiveSection")

	.locale-select.fixed.left-2.bottom-2.blend-mode
		select(v-model="currentLocale" @change="switchLocale")
			option(value="en") EN
			option(value="cn") CN
</template>

<script setup>
const { locale, setLocale } = useI18n()
const { overlaySection } = useOverlay()

const currentLocale = ref(locale.value)
const activeSection = ref('hero')

const switchLocale = async () => {
  await setLocale(currentLocale.value)
}

const updateActiveSection = (section) => {
  activeSection.value = section
}

const logoColorClass = computed(() => {
  // If overlay is open, use overlay's color scheme
  const section = overlaySection.value || activeSection.value

  switch (section) {
    case 'hero':
      return 'text-white'
    case 'news':
      return 'text-purple'
    case 'publications':
      return 'text-green'
    case 'books':
      return 'text-brown'
    case 'About':
      return 'text-purple'
    default:
      return 'text-white'
  }
})

// Watch for external locale changes
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})
</script>

<style lang="sass" scoped>
#header
  position: relative

.blend-mode
  mix-blend-mode: difference

.logo
  opacity: 0
  transition: opacity 0.3s ease, mix-blend-mode 0.3s ease, color 0.3s ease

  &.elevated
    opacity: 1

.menu-wrapper
  transition: mix-blend-mode 0.3s ease

.locale-select
  z-index: 100
  transition: mix-blend-mode 0.3s ease

  select
    background: none
    color: white
    border: none
    cursor: pointer

    &:focus
      outline: none

    option
      background: none
      color: white

.elevated
  z-index: 100
</style>