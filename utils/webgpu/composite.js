import {CompositeShader} from './shader/composite-shader.js';
import * as wgh from './libs/webgpu-utils.module.js';

export class Composite {

    constructor(device, reactionDiffusion) {
        this.device = device;
        this.reactionDiffusion = reactionDiffusion;
        this.pulseIntensity = 0.05;
        this.brightness = 0.7;
        this.hueShift = 0.0;
        this.saturation = 0.37;
        this.colorStart = [0.749, 0.639, 1.0];
        this.colorEnd = [0.541, 1.0, 0.549];

        const module = device.createShaderModule({ code: CompositeShader });
        const defs = wgh.makeShaderDataDefinitions(CompositeShader);
        const pipelineLayout = {
            vertex: {
                module: module,
                entryPoint: 'vertex_main',
            },
            fragment: {
                module,
                entryPoint:'frag_main',
                targets: [
                    { format: navigator.gpu.getPreferredCanvasFormat() }
                ]
            },
            primitive: {
                topology: 'triangle-list',
            },
        }
        const descriptors = wgh.makeBindGroupLayoutDescriptors(defs, pipelineLayout);
        const bindGroupLayout = device.createBindGroupLayout(descriptors[0]);

        // create the animation uniforms view and buffer
        const animationUniformView = wgh.makeStructuredView(defs.uniforms.animationUniforms);
        this.animationUniform = {
            view: animationUniformView,
            buffer: this.device.createBuffer({
                size: animationUniformView.arrayBuffer.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })
        };

        // the sampler for the input texture
        this.sampler = device.createSampler({
            minFilter: 'linear',
            magFilter: 'linear'
        });

        // create the pipeline
        this.bindGroupLayouts = [bindGroupLayout];
        this.pipeline = device.createRenderPipeline({
            label: 'composite pipeline',
            layout: device.createPipelineLayout({
                bindGroupLayouts: [bindGroupLayout],
            }),
            ...pipelineLayout
        });

        // initial resize
        this.resize();
    }

    resize() {
        this.createBindGroups();
    }

    render(renderPassEncoder, pulse) {
        this.animationUniform.view.set({ pulse });
        this.animationUniform.view.set({ pulseIntensity: this.pulseIntensity });
        this.animationUniform.view.set({ brightness: this.brightness });
        this.animationUniform.view.set({ hueShift: this.hueShift });
        this.animationUniform.view.set({ saturation: this.saturation });
        this.animationUniform.view.set({ colorStart: this.colorStart });
        this.animationUniform.view.set({ colorEnd: this.colorEnd });
        this.device.queue.writeBuffer(this.animationUniform.buffer, 0, this.animationUniform.view.arrayBuffer);

        renderPassEncoder.setPipeline(this.pipeline);
        renderPassEncoder.setBindGroup(0, this.bindGroup);
        renderPassEncoder.draw(3);
    }

    updatePulseIntensity(intensity) {
        this.pulseIntensity = intensity;
    }

    updateBrightness(brightness) {
        this.brightness = brightness;
    }

    updateHueShift(hueShift) {
        this.hueShift = hueShift;
    }

    updateSaturation(saturation) {
        this.saturation = saturation;
    }

    updateColorStart(color) {
        this.colorStart = color;
    }

    updateColorEnd(color) {
        this.colorEnd = color;
    }

    createBindGroups() {
        this.bindGroup = this.device.createBindGroup({
            layout: this.bindGroupLayouts[0],
            entries: [
                { binding: 0, resource: { buffer: this.animationUniform.buffer } },
                { binding: 1, resource: this.sampler },
                { binding: 2, resource: this.reactionDiffusion.resultStorageTexture.createView() },
                { binding: 3, resource: this.reactionDiffusion.seedTexture.createView() },
            ]
        });
    }
}
