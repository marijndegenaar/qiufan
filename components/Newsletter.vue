<template lang="pug">
  #newsletter.bg-lilac.text-purple
    .signup.flex.gap-4.p-16
      .message Follow my newsletter for updates
      input.px-4.py-2.rounded.border.border-purple.outline-none(
        type="email"
        placeholder="yourname@your-email.com"
        v-model="email"
      )
      button.px-6.py-2.bg-purple.text-white.rounded.hover_opacity-90.cursor-pointer(
        @click="handleSubmit"
      ) SUBMIT
</template>

<script setup>
const { locale } = useI18n()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

const email = ref('')

const handleSubmit = () => {
  // Will hook up to service later
  console.log('Subscribe:', email.value)
}
</script>

<style lang="sass" scoped>

</style>
