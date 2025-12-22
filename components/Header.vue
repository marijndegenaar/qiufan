<template lang="pug">
#header
	//- h1.logo.fixed.top-2.left-2 Chen Qiufan
	.menu-wrapper.fixed.top-2.right-2
		Menu.text-sm

.locale-select.p-2.fixed.bottom-2
	select(v-model="currentLocale" @change="switchLocale")
		option(value="en") EN
		option(value="cn") CN
</template>

<script setup>
const { locale, setLocale } = useI18n()

const currentLocale = ref(locale.value)

const switchLocale = async () => {
  await setLocale(currentLocale.value)
}

// Watch for external locale changes
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})
</script>

<style lang="sass" scoped>
#header
  position: relative
  z-index: 1000

.menu-wrapper
  mix-blend-mode: difference

.locale-select
  mix-blend-mode: difference
  z-index: 1000

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
</style>