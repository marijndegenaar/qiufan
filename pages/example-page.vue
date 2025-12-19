<template>
  <div class="page-container">
    <ThreeShader
      :shape="controls.shape"
      :pixel-size="controls.pixelSize"
      :bg="controls.bg"
      :ink="controls.ink"
      class="shader-background"
    />

    <div class="controls-panel">
      <h2>Shader Controls</h2>

      <div class="control-section">
        <h3>Basic Settings</h3>

        <div class="control-group">
          <label>Shape</label>
          <select v-model="controls.shape">
            <option value="square">Square</option>
            <option value="circle">Circle</option>
            <option value="triangle">Triangle</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>

        <div class="control-group">
          <label>Pixel Size: {{ controls.pixelSize }}</label>
          <input
            v-model.number="controls.pixelSize"
            type="range"
            min="1"
            max="20"
            step="0.5"
          >
        </div>

        <div class="control-group">
          <label>Ink Color</label>
          <input v-model="controls.ink" type="color">
        </div>

        <div class="control-group">
          <label>Background Color</label>
          <input v-model="controls.bg" type="color">
        </div>
      </div>

      <div class="control-section">
        <h3>Pattern Controls</h3>

        <div class="control-group">
          <label>Noise Scale: {{ advanced.uFbmScale.toFixed(2) }}</label>
          <input
            v-model.number="advanced.uFbmScale"
            type="range"
            min="0.5"
            max="20"
            step="0.1"
            @input="updateUniform('uFbmScale', advanced.uFbmScale)"
          >
        </div>

        <div class="control-group">
          <label>Animation Speed: {{ advanced.uTimeSpeed.toFixed(3) }}</label>
          <input
            v-model.number="advanced.uTimeSpeed"
            type="range"
            min="0"
            max="0.2"
            step="0.001"
            @input="updateUniform('uTimeSpeed', advanced.uTimeSpeed)"
          >
        </div>

        <div class="control-group">
          <label>Contrast: {{ advanced.uContrast.toFixed(2) }}</label>
          <input
            v-model.number="advanced.uContrast"
            type="range"
            min="0"
            max="2"
            step="0.01"
            @input="updateUniform('uContrast', advanced.uContrast)"
          >
        </div>

        <div class="control-group">
          <label>Brightness: {{ advanced.uBias.toFixed(2) }}</label>
          <input
            v-model.number="advanced.uBias"
            type="range"
            min="-2"
            max="2"
            step="0.01"
            @input="updateUniform('uBias', advanced.uBias)"
          >
        </div>

        <div class="control-group">
          <label>Threshold: {{ advanced.uThreshold.toFixed(2) }}</label>
          <input
            v-model.number="advanced.uThreshold"
            type="range"
            min="0"
            max="1"
            step="0.01"
            @input="updateUniform('uThreshold', advanced.uThreshold)"
          >
        </div>
      </div>

      <div class="control-section">
        <button @click="resetDefaults" class="reset-btn">Reset to Defaults</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const controls = ref({
  shape: 'square' as 'square' | 'circle' | 'triangle' | 'diamond',
  pixelSize: 4,
  bg: '#000000',
  ink: '#FFFFFF',
});

const advanced = ref({
  uFbmScale: 5.0,
  uTimeSpeed: 0.05,
  uContrast: 0.5,
  uBias: -0.65,
  uThreshold: 0.5,
});

const defaults = {
  controls: {
    shape: 'square' as 'square' | 'circle' | 'triangle' | 'diamond',
    pixelSize: 4,
    bg: '#000000',
    ink: '#FFFFFF',
  },
  advanced: {
    uFbmScale: 5.0,
    uTimeSpeed: 0.05,
    uContrast: 0.5,
    uBias: -0.65,
    uThreshold: 0.5,
  },
};

const updateUniform = (name: string, value: number) => {
  if (typeof window !== 'undefined' && (window as any).shaderControls) {
    const uniforms = (window as any).shaderControls.uniforms;
    if (uniforms && uniforms[name]) {
      uniforms[name].value = value;
    }
  }
};

const resetDefaults = () => {
  controls.value = { ...defaults.controls };
  advanced.value = { ...defaults.advanced };

  // Update all uniforms
  Object.entries(advanced.value).forEach(([key, value]) => {
    updateUniform(key, value);
  });
};

onMounted(() => {
  // Initialize uniforms with current values
  Object.entries(advanced.value).forEach(([key, value]) => {
    updateUniform(key, value);
  });
});
</script>

<style scoped>
.page-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.shader-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.controls-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 24px;
  max-width: 320px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 10;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.controls-panel h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 12px;
}

.controls-panel h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.7);
}

.control-section {
  margin-bottom: 24px;
}

.control-group {
  margin-bottom: 16px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.control-group input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-group input[type="range"]::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.control-group select,
.control-group input[type="color"] {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.control-group input[type="color"] {
  height: 40px;
  padding: 4px;
}

.control-group select option {
  background: #1a1a1a;
  color: white;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.reset-btn:active {
  transform: scale(0.98);
}

.controls-panel::-webkit-scrollbar {
  width: 8px;
}

.controls-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.controls-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.controls-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

@media (max-width: 768px) {
  .controls-panel {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    max-height: calc(100vh - 20px);
  }
}
</style>
