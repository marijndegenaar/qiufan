<template>
  <div class="shader-background-wrapper">
    <ThreeShader
      v-bind="$attrs"
      :shape="shape"
      :pixel-size="pixelSize"
      :bg="bg"
      :ink="ink"
      class="shader-bg"
    />
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  shape?: 'square' | 'circle' | 'triangle' | 'diamond';
  pixelSize?: number;
  bg?: string;
  ink?: string;
}

const props = withDefaults(defineProps<Props>(), {
  shape: 'square',
  pixelSize: 4,
  bg: '#000000',
  ink: '#FFFFFF',
});
</script>

<style scoped>
.shader-background-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.shader-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
}
</style>
