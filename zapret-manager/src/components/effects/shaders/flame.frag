precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uEdgeWidth;
uniform float uAlpha;
uniform float uChromatic;
uniform float uLightTheme;
uniform float uSpeed;

varying vec2 vUv;

// 2D Simplex Noise: Стандартная реализация (Ashima), весовую часть не трогаем.
vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;

  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
    0.0
  );

  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

  vec3 g;

  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);
}

// FBM: пять октав дают и крупные языки, и мелкую рябь искр.
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);

  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float time = uTime * uSpeed;

  float dx = min(vUv.x, 1.0 - vUv.x);
  float dy = min(vUv.y, 1.0 - vUv.y);
  float distToEdge = min(dx, dy);

  // Центр окна обязан быть полностью прозрачным. Здесь же выходим раньше
  // шума: три вызова FBM по пять октав на весь экран роняют частоту кадров.
  float reach = uEdgeWidth * 2.1 + 0.004;

  if (distToEdge > reach) {
    gl_FragColor = vec4(0.0);

    return;
  }

  // Доменное искажение: координаты шума изгибает другой шум, поэтому огонь
  // не повторяет��я решёткой и извивается, а ползёт ровной полосой.
  vec2 q = vec2(fbm(vUv * 3.0 + vec2(0.0, time * 0.5)), 0.0);

  q.y = fbm(vUv * 3.0 + vec2(1.0));

  vec2 p = vUv * 4.0 + q;
  float fire = fbm(p + vec2(0.0, time * 1.5));
  float heat = clamp(fire * 0.5 + 0.5, 0.0, 1.0);

  // Рваная маска края: шум растягивает огонь внутрь окна языками, поэтому
  // вместо ровной линии получается кромка с провалами.
  // Шум бывает отрицательным, поэтому множитель обязательно зажимаем снизу:
  // иначе верхняя граница smoothstep уходит за нижнюю, а это undefined
  // behaviour — край то пропадает, то становится сплошной полосой.
  float tongue = max(0.18, 0.5 + fire * 0.75);
  float edgeMask = 1.0 - smoothstep(0.0, uEdgeWidth * tongue * 1.6, distToEdge);
  float alpha = edgeMask * heat * uAlpha;

  alpha = smoothstep(0.06, 0.62, alpha);

  if (alpha <= 0.002) {
    gl_FragColor = vec4(0.0);

    return;
  }

  vec3 finalColor;

  if (uChromatic > 0.5) {
    // У самого края — красный/оранжевый, дальше по затуханию шума жёлтый,
    // зелёный и фиолетовый. Яркость и насыщенность падают вместе с альфой,
    // иначе края выглядят как кислотная неоновая рамка.
    float hue = fract((vUv.x + vUv.y) * 0.3 + time * 0.1 + fire * 0.2);
    float inward = smoothstep(0.0, max(reach, 0.001), distToEdge);

    hue = mix(0.02, hue, inward);

    if (uLightTheme > 0.5) {
      hue = fract(hue * 0.6 + 0.5);
    }

    finalColor = hsv2rgb(vec3(hue, mix(0.55, 0.95, heat), 1.0));
  } else {
    vec3 ember = vec3(1.0, 0.0, 0.0);
    vec3 flame = vec3(1.0, 0.5, 0.0);
    vec3 core = vec3(1.0, 1.0, 0.0);

    finalColor = mix(ember, flame, heat);
    finalColor = mix(finalColor, core, heat * heat);
  }

  gl_FragColor = vec4(finalColor, alpha);
}