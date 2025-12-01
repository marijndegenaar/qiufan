<template lang="pug">
#header
	h1.logo.fixed.top-2.left-2 Chen Qiufan
	Menu.fixed.top-2.right-2.text-sm


	.locale-select.fixed.bottom-2.text-sm
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

</style>