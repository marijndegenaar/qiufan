<template lang="pug">
.px-2.pb-4.mt-14
  PrismicRichText.text-xl(:field="aboutData.data.content")
</template>

<script setup>
const { client } = usePrismic();
const route = useRoute();

const { data: aboutData } = await useAsyncData("about", () =>
  client.getSingle("about")
);


</script>
<style lang="sass" scoped>

</style>