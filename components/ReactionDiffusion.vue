<template>
  <div class="reaction-diffusion-container">
    <div v-if="!hasWebGPU" class="no-webgpu">
      <p>
        You are using a browser that does not support WebGPU.
        Read more about the required steps to run WebGPU
        <a href="https://github.com/gpuweb/gpuweb/wiki/Implementation-Status#chromium-chrome-edge-etc" target="_blank">here</a>.
      </p>
    </div>
    <canvas ref="canvasRef" class="viewport"></canvas>

    <div class="controls" :class="{ collapsed: controlsCollapsed }">
      <button class="collapse-toggle" @click="toggleControls">{{ controlsCollapsed ? '▶' : '◀' }}</button>
      <h3>Controls</h3>

      <div class="control-group">
        <label>Pulse Speed: <span class="value">{{ controls.pulseSpeed.toFixed(4) }}</span></label>
        <input type="range" v-model.number="controls.pulseSpeed" min="0" max="0.002" step="0.0001">
      </div>

      <div class="control-group">
        <label>Pulse Intensity: <span class="value">{{ controls.pulseIntensity.toFixed(2) }}</span></label>
        <input type="range" v-model.number="controls.pulseIntensity" min="0" max="0.3" step="0.01" @input="updatePulseIntensity">
      </div>

      <div class="control-group">
        <label>Brightness: <span class="value">{{ controls.brightness.toFixed(1) }}</span></label>
        <input type="range" v-model.number="controls.brightness" min="0.5" max="3" step="0.1" @input="updateBrightness">
      </div>

      <div class="control-group">
        <label>Hue Shift: <span class="value">{{ controls.hueShift.toFixed(2) }}</span></label>
        <input type="range" v-model.number="controls.hueShift" min="0" max="1" step="0.01" @input="updateHueShift">
      </div>

      <div class="control-group">
        <label>Saturation: <span class="value">{{ controls.saturation.toFixed(2) }}</span></label>
        <input type="range" v-model.number="controls.saturation" min="0" max="2" step="0.01" @input="updateSaturation">
      </div>

      <div class="control-group">
        <label>Color Start:</label>
        <input type="color" v-model="controls.colorStartHex" @input="updateColorStart">
      </div>

      <div class="control-group">
        <label>Color End:</label>
        <input type="color" v-model="controls.colorEndHex" @input="updateColorEnd">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const canvasRef = ref(null)
const hasWebGPU = ref(true)
const controlsCollapsed = ref(true)

// Control parameters
const controls = ref({
  pulseSpeed: 0.0002,
  pulseIntensity: 0.05,
  brightness: 0.7,
  hueShift: 0.0,
  saturation: 0.37,
  colorStartHex: '#bfa3ff',
  colorEndHex: '#8aff8c'
})

let device = null
let webGPUContext = null
let viewportSize = null
let reactionDiffusion = null
let composite = null
let animationId = null
let resizeObserver = null

// Helper to convert hex to normalized RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ] : null
}

// Control update functions
const toggleControls = () => {
  controlsCollapsed.value = !controlsCollapsed.value
}

const updatePulseIntensity = () => {
  if (composite) {
    composite.updatePulseIntensity(controls.value.pulseIntensity)
  }
}

const updateBrightness = () => {
  if (composite) {
    composite.updateBrightness(controls.value.brightness)
  }
}

const updateHueShift = () => {
  if (composite) {
    composite.updateHueShift(controls.value.hueShift)
  }
}

const updateSaturation = () => {
  if (composite) {
    composite.updateSaturation(controls.value.saturation)
  }
}

const updateColorStart = () => {
  if (composite) {
    const color = hexToRgb(controls.value.colorStartHex)
    if (color) {
      composite.updateColorStart(color)
    }
  }
}

const updateColorEnd = () => {
  if (composite) {
    const color = hexToRgb(controls.value.colorEndHex)
    if (color) {
      composite.updateColorEnd(color)
    }
  }
}

const updateViewportSize = () => {
  if (!device || !canvasRef.value) return

  const pixelRatio = Math.min(2, window.devicePixelRatio)
  viewportSize = [
    Math.max(1, Math.min(window.innerWidth * pixelRatio, device.limits.maxTextureDimension2D)),
    Math.max(1, Math.min(window.innerHeight * pixelRatio, device.limits.maxTextureDimension2D))
  ]
}

const resize = () => {
  if (!canvasRef.value || !reactionDiffusion || !composite) return

  updateViewportSize()
  canvasRef.value.width = viewportSize[0]
  canvasRef.value.height = viewportSize[1]
  reactionDiffusion.resize(viewportSize[0], viewportSize[1])
  composite.resize()
}

const run = () => {
  if (!device || !reactionDiffusion || !composite || !webGPUContext) return

  // create the global pulse animation value: sin with one cycle per second
  const dateTimeMS = new Date().getTime() + 800
  const pulse = Math.sin(2 * Math.PI * dateTimeMS * controls.value.pulseSpeed)

  const commandEncoder = device.createCommandEncoder()

  // update the reaction diffusion compute
  const computePassEncoder = commandEncoder.beginComputePass()
  reactionDiffusion.compute(computePassEncoder, pulse)
  computePassEncoder.end()

  // render the composite result
  const compositePassEncoder = commandEncoder.beginRenderPass({
    colorAttachments: [{
      view: webGPUContext.getCurrentTexture().createView(),
      clearValue: { r: 1, g: 1, b: 1, a: 1 },
      loadOp: 'clear',
      storeOp: 'store'
    }],
  })
  composite.render(compositePassEncoder, pulse)
  compositePassEncoder.end()

  device.queue.submit([commandEncoder.finish()])

  animationId = requestAnimationFrame(run)
}

const init = async () => {
  if (!navigator.gpu) {
    hasWebGPU.value = false
    return
  }

  try {
    const adapter = await navigator.gpu.requestAdapter()

    if (!adapter) {
      hasWebGPU.value = false
      return
    }

    const format = navigator.gpu.getPreferredCanvasFormat()
    device = await adapter.requestDevice()

    webGPUContext = canvasRef.value.getContext('webgpu')
    webGPUContext.configure({ device, format })

    updateViewportSize()

    // Dynamically import the WebGPU modules
    const { ReactionDiffusionCompute } = await import('~/utils/webgpu/rd-compute.js')
    const { Composite } = await import('~/utils/webgpu/composite.js')

    reactionDiffusion = new ReactionDiffusionCompute(device, viewportSize)
    composite = new Composite(device, reactionDiffusion)

    // Setup resize observer
    resizeObserver = new ResizeObserver(() => resize())
    resizeObserver.observe(canvasRef.value)

    run(0)
  } catch (error) {
    console.error('WebGPU initialization error:', error)
    hasWebGPU.value = false
  }
}

onMounted(async () => {
  // Load the font before initializing
  try {
    const font = new FontFace('BugrinoTrials-Light', 'url(/assets/BugrinoTrials-Light.otf)')
    document.fonts.add(font)
    await font.load()
    await document.fonts.ready
  } catch (error) {
    console.warn('Font loading failed, using system fallback:', error)
  }

  await init()
})

onBeforeUnmount(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.reaction-diffusion-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.viewport {
  display: block;
  width: 100%;
  height: 100%;
}

.no-webgpu {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  text-align: center;
  z-index: 10;
}

.no-webgpu p {
  margin: 0;
  color: #333;
}

.no-webgpu a {
  color: #0066cc;
  text-decoration: underline;
}

.controls {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
  color: white;
  font-family: monospace;
  font-size: 12px;
  z-index: 1000;
  min-width: 250px;
  transition: transform 0.3s ease;
}

.controls.collapsed {
  transform: translateX(calc(100% + 20px));
}

.controls h3 {
  margin: 0 0 15px 0;
  font-size: 14px;
}

.collapse-toggle {
  position: absolute;
  left: -40px;
  top: 20px;
  background: rgba(0, 0, 0, 0.8);
  border: none;
  color: white;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px 0 0 8px;
  font-size: 16px;
}

.collapse-toggle:hover {
  background: rgba(0, 0, 0, 0.9);
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group input[type="color"] {
  width: 100%;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  cursor: pointer;
}

.control-group .value {
  display: inline-block;
  margin-left: 10px;
  color: #4CAF50;
}
</style>
