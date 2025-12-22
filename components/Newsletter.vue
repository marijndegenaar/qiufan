<template lang="pug">
  #newsletter.bg-lilac.text-purple
    .signup.flex.p-16
      .message Follow my newsletter for updates
      .input.email(placeholder="yourname@your-email.com")
      .button SUBMIT
</template>

<script setup>
const { locale } = useI18n()

// Map locale to Prismic language code
const getPrismicLang = (loc) => {
  if (loc === 'cn') return 'zh-cn'
  return 'en-us'
}

</script>

<style lang="sass" scoped>

</style>
