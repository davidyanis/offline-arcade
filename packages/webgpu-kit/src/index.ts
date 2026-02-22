export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: [number, number, number];
}

export interface Renderer {
  drawRects: (rects: Rect[]) => void;
  resize: () => void;
}

const FLOATS_PER_VERTEX = 5;
const VERTICES_PER_RECT = 6;

function toClipX(x: number, width: number): number {
  return (x / width) * 2 - 1;
}

function toClipY(y: number, height: number): number {
  return 1 - (y / height) * 2;
}

export async function createRenderer(canvas: HTMLCanvasElement): Promise<Renderer> {
  if (!navigator.gpu) {
    throw new Error("WebGPU is not supported in this browser.");
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error("Failed to get GPU adapter.");
  }

  const device = await adapter.requestDevice();
  const context = canvas.getContext("webgpu");
  if (!context) {
    throw new Error("Could not initialize WebGPU context.");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  const configure = (): void => {
    const ratio = window.devicePixelRatio || 1;
    const width = Math.floor(canvas.clientWidth * ratio);
    const height = Math.floor(canvas.clientHeight * ratio);
    canvas.width = Math.max(width, 1);
    canvas.height = Math.max(height, 1);

    context.configure({
      device,
      format,
      alphaMode: "opaque"
    });
  };

  configure();

  const shaderModule = device.createShaderModule({
    code: `
      struct VSOut {
        @builtin(position) pos : vec4f,
        @location(0) color : vec3f,
      }

      @vertex
      fn vs_main(@location(0) position : vec2f, @location(1) color : vec3f) -> VSOut {
        var out : VSOut;
        out.pos = vec4f(position, 0.0, 1.0);
        out.color = color;
        return out;
      }

      @fragment
      fn fs_main(@location(0) color : vec3f) -> @location(0) vec4f {
        return vec4f(color, 1.0);
      }
    `
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: {
      module: shaderModule,
      entryPoint: "vs_main",
      buffers: [
        {
          arrayStride: FLOATS_PER_VERTEX * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x2"
            },
            {
              shaderLocation: 1,
              offset: 2 * 4,
              format: "float32x3"
            }
          ]
        }
      ]
    },
    fragment: {
      module: shaderModule,
      entryPoint: "fs_main",
      targets: [{ format }]
    },
    primitive: {
      topology: "triangle-list"
    }
  });

  let vertexBuffer = device.createBuffer({
    size: 1024 * 1024,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });

  const ensureBuffer = (requiredBytes: number): void => {
    if (requiredBytes <= vertexBuffer.size) {
      return;
    }
    vertexBuffer.destroy();
    vertexBuffer = device.createBuffer({
      size: Math.max(requiredBytes, vertexBuffer.size * 2),
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });
  };

  const drawRects = (rects: Rect[]): void => {
    const vertexCount = rects.length * VERTICES_PER_RECT;
    if (vertexCount === 0) {
      return;
    }

    const verts = new Float32Array(vertexCount * FLOATS_PER_VERTEX);
    let i = 0;
    const width = canvas.width;
    const height = canvas.height;

    for (const rect of rects) {
      const x0 = toClipX(rect.x, width);
      const y0 = toClipY(rect.y, height);
      const x1 = toClipX(rect.x + rect.w, width);
      const y1 = toClipY(rect.y + rect.h, height);
      const [r, g, b] = rect.color;

      const push = (x: number, y: number): void => {
        verts[i++] = x;
        verts[i++] = y;
        verts[i++] = r;
        verts[i++] = g;
        verts[i++] = b;
      };

      push(x0, y0);
      push(x1, y0);
      push(x1, y1);

      push(x0, y0);
      push(x1, y1);
      push(x0, y1);
    }

    const bytes = verts.byteLength;
    ensureBuffer(bytes);
    device.queue.writeBuffer(vertexBuffer, 0, verts.buffer, verts.byteOffset, bytes);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          clearValue: { r: 0.53, g: 0.81, b: 0.92, a: 1.0 },
          storeOp: "store"
        }
      ]
    });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(vertexCount);
    pass.end();

    device.queue.submit([encoder.finish()]);
  };

  return {
    drawRects,
    resize: configure
  };
}
