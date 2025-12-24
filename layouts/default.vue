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

<style lang="sass">
#__nuxt
    min-height: 100vh
    display: flex
    flex-direction: column

</style>