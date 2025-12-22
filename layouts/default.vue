<template lang="pug">
Header.fixed.px-2.pt-2.mt-4.z-10
//- Hero
ClientOnly
  ReactionDiffusion
News
Publications.p-4
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