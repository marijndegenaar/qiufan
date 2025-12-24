<template lang="pug">
  #newsletter.bg-lilac.text-purple
    .signup.flex.gap-2.px-4.py-16.flex-wrap
      .spacer.md_w-1x6.hidden.md_block
      .message.w-full.md_w-auto.text-center Follow my newsletter for updates:
      input.w-full.md_w-1x5.px-4.py-2.md_py-1.text-base.md_text-sm.text-center.rounded.border.border-purple.outline-none(
        type="email"
        placeholder="yourname@your-email.com"
        v-model="email"
      )
      button.w-full.md_w-auto.px-4.py-4.md_py-1.bg-purple.text-lilac.rounded.hover_opacity-90.cursor-pointer.text-base.md_text-sm(
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
