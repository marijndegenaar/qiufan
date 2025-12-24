<template lang="pug">
#header
	//- h1.logo.fixed.top-2.left-2 Chen Qiufan
	.menu-wrapper.fixed.top-2.right-2(:class="{ 'blend-mode': activeSection === 'hero', 'elevated': activeSection !== 'hero' }")
		Menu.text-sm(@update:activeSection="updateActiveSection")

	.locale-select.p-2.fixed.bottom-2.blend-mode
		select(v-model="currentLocale" @change="switchLocale")
			option(value="en") EN
			option(value="cn") CN
</template>

<script setup>
const { locale, setLocale } = useI18n()

const currentLocale = ref(locale.value)
const activeSection = ref('hero')

const switchLocale = async () => {
  await setLocale(currentLocale.value)
}

const updateActiveSection = (section) => {
  activeSection.value = section
}

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

.menu-wrapper
  transition: mix-blend-mode 0.3s ease

.locale-select
  z-index: 100
  transition: mix-blend-mode 0.3s ease

  select
    background: none
    color: white
    border: none
    padding: 0.25rem 0.5rem
    cursor: pointer

    &:focus
      outline: none

    option
      background: none
      color: white

.elevated
  z-index: 100
</style>