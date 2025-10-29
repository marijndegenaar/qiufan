<template lang="pug">
IndexList(contentType="project")

</template>

<script setup>


</script>
<style lang="sass" scoped>
.project a:hover ~
    .featured-image
        display: block
        margin-top: .45em
.project
  a
    transition: all 200ms
  .featured-image:hover
    display: none

</style>