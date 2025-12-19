<template lang="pug">
Header.fixed.px-2.pt-2.mt-4.z-10
//- Hero
ClientOnly
  ReactionDiffusion
News.p-2
Publications.p-2
Books.p-2
ShaderDemo
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