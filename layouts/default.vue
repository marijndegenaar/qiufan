<template lang="pug">
Header
#hero
  ClientOnly
    ReactionDiffusion
News
Publications.p-2.md_p-4
Books
Newsletter
About
//- ShaderDemo(bg="purple", ink="lilac")
//- ShaderDemo(:showControls="true" ink="purple" bg="lilac")
//- #layout.default.mt-4
    slot
//- Footer
</template>

<script setup>
const { locale } = useI18n()

if (process.client) {
  const applyLocaleFont = (loc) => {
    const html = document.documentElement
    const body = document.body

    if (!html || !body) return

    const fontFamily = loc === 'cn' ? '"H", sans-serif' : "'B', sans-serif"

    html.style.fontFamily = fontFamily
    body.style.fontFamily = fontFamily
  }

  onMounted(() => {
    applyLocaleFont(locale.value)
  })

  watch(locale, (newLocale) => {
    applyLocaleFont(newLocale)
  })
}
</script>

<style lang="sass">
#__nuxt
    min-height: 100vh
    display: flex
    flex-direction: column

</style>