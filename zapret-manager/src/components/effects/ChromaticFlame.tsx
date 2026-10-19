import { useEffect, useRef } from "react";

import fragmentSource from "@/components/effects/shaders/flame.frag?raw";
import vertexSource from "@/components/effects/shaders/flame.vert?raw";
import {
  FLAME_FPS,
  FLAME_LAYER_Z,
  FLAME_MAX_CANVAS_PIXELS,
  FLAME_MAX_DEVICE_PIXEL_RATIO,
} from "@/lib/constants";
import {
  clampEdgeWidth,
  FLAME_PRESETS,
  FLAME_SPEEDS,
  type FlameIntensity,
  type FlameSpeed,
} from "@/lib/flamePresets";

export interface ChromaticFlameProps {
  intensity: FlameIntensity;
  speed: FlameSpeed;
  chromatic: boolean;
  still?: boolean;
  lightTheme?: boolean;
}

interface Uniforms {
  resolution: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  edgeWidth: WebGLUniformLocation | null;
  alpha: WebGLUniformLocation | null;
  chromatic: WebGLUniformLocation | null;
  lightTheme: WebGLUniformLocation | null;
  speed: WebGLUniformLocation | null;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);

  if (shader === null) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);

    return null;
  }

  return shader;
}

function buildProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

  if (vertex === null || fragment === null) {
    return null;
  }

  const program = gl.createProgram();

  if (program === null) {
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);

    return null;
  }

  return program;
}

function readUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram
): Uniforms {
  return {
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    edgeWidth: gl.getUniformLocation(program, "uEdgeWidth"),
    alpha: gl.getUniformLocation(program, "uAlpha"),
    chromatic: gl.getUniformLocation(program, "uChromatic"),
    lightTheme: gl.getUniformLocation(program, "uLightTheme"),
    speed: gl.getUniformLocation(program, "uSpeed"),
  };
}

function sizeCanvas(canvas: HTMLCanvasElement): boolean {
  const ratio = Math.min(
    window.devicePixelRatio || 1,
    FLAME_MAX_DEVICE_PIXEL_RATIO
  );
  const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  const overflow = width * height - FLAME_MAX_CANVAS_PIXELS;

  if (overflow <= 0) {
    if (canvas.width === width && canvas.height === height) {
      return false;
    }

    canvas.width = width;
    canvas.height = height;

    return true;
  }

  const shrink = Math.sqrt(FLAME_MAX_CANVAS_PIXELS / (width * height));
  const scaledWidth = Math.max(1, Math.round(width * shrink));
  const scaledHeight = Math.max(1, Math.round(height * shrink));

  if (canvas.width === scaledWidth && canvas.height === scaledHeight) {
    return false;
  }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;

  return true;
}

function drawFrame(
  gl: WebGLRenderingContext,
  uniforms: Uniforms,
  options: {
    time: number;
    edgeWidthPx: number;
    alpha: number;
    chromatic: boolean;
    lightTheme: boolean;
    speed: number;
  }
): void {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(
    uniforms.resolution,
    gl.drawingBufferWidth,
    gl.drawingBufferHeight
  );
  // Шейдер считает расстояние до края в нормализованных координатах, поэтому
  // пиксели переводим по меньшей стороне буфера: 18 px одинаково выглядят и на
  // 1080p, и на 4K.
  const minSide = Math.max(
    1,
    Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight)
  );

  gl.uniform1f(uniforms.time, options.time);
  gl.uniform1f(uniforms.edgeWidth, options.edgeWidthPx / minSide);
  gl.uniform1f(uniforms.alpha, options.alpha);
  gl.uniform1f(uniforms.chromatic, options.chromatic ? 1 : 0);
  gl.uniform1f(uniforms.lightTheme, options.lightTheme ? 1 : 0);
  gl.uniform1f(uniforms.speed, options.speed);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function ChromaticFlame({
  intensity,
  speed,
  chromatic,
  still = false,
  lightTheme = false,
}: ChromaticFlameProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (host === null) {
      return;
    }

    // Канвас создаётся здесь, а не через JSX: контекст WebGL нельзя переиспользовать
    // на элементе, который уже его терял. В разработке StrictMode монтирует эффект
    // дважды, и принудительная потеря контекста в cleanup роняла GPU-процесс
    // WebView2 вместе со всем интерфейсом.
    const canvas = document.createElement("canvas");

    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "absolute inset-0 h-full w-full";
    host.appendChild(canvas);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
    });

    if (gl === null) {
      console.warn("[flame] WebGL unavailable, flame disabled");
      canvas.remove();

      return;
    }

    const program = buildProgram(gl);

    if (program === null) {
      console.warn("[flame] shader build failed, flame disabled");
      canvas.remove();

      return;
    }

    const buffer = gl.createBuffer();

    if (buffer === null) {
      gl.deleteProgram(program);

      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const position = gl.getAttribLocation(program, "aPosition");

    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uniforms = readUniforms(gl, program);
    const preset = FLAME_PRESETS[intensity];
    const flameSpeed = FLAME_SPEEDS[speed];
    const frameInterval = 1000 / FLAME_FPS;

    let frame = 0;
    let last = 0;
    let alive = true;
    const start = performance.now();

    const draw = (elapsed: number): void => {
      sizeCanvas(canvas);
      drawFrame(gl, uniforms, {
        time: elapsed,
        edgeWidthPx: clampEdgeWidth(preset.edgeWidthPx),
        alpha: preset.alpha,
        chromatic,
        lightTheme,
        speed: flameSpeed,
      });
    };

    const render = (now: number): void => {
      if (!alive) {
        return;
      }

      frame = window.requestAnimationFrame(render);

      if (now - last < frameInterval) {
        return;
      }

      last = now;
      draw((now - start) / 1000);
    };

    // При отключённой анимации горит один статичный кадр: рамка остаётся,
    // но цикл рендера не крутится.
    if (still) {
      draw(0.7);
    } else {
      frame = window.requestAnimationFrame(render);
    }

    return () => {
      alive = false;
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      canvas.remove();
    };
  }, [chromatic, intensity, lightTheme, speed, still]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: FLAME_LAYER_Z }}
    />
  );
}

export default ChromaticFlame;
