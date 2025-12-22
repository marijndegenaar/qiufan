<template>
  <div class="shader-background-wrapper">
    <ClientOnly>
      <ThreeShader
        v-bind="$attrs"
        :shape="shape"
        :pixel-size="pixelSize"
        :bg="bg"
        :ink="ink"
        class="shader-bg"
      />
      <template #fallback>
        <div class="shader-bg shader-placeholder" :style="{ backgroundColor: resolveColor(bg) }" />
      </template>
    </ClientOnly>
    <div class="content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import ThreeShader from './ThreeShader.client.vue';

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

// Tailwind color palette matching ThreeShader
const TAILWIND_COLORS: Record<string, string> = {
  avocado: '#F0FBE1',
  lilac: '#EBDEFF',
  purple: '#320954',
  lightpurple: 'rgb(209 184 229)',
  sand: '#EFEDDE',
  brown: '#675D57',
  grey: '#D8D5E0',
  purp: '#594A6F',
  green: '#85A863',
};

// Helper to resolve color (accepts hex, rgb, or Tailwind color name)
const resolveColor = (color: string): string => {
  if (color.startsWith('#') || color.startsWith('rgb')) {
    return color;
  }
  return TAILWIND_COLORS[color] || color;
};
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
