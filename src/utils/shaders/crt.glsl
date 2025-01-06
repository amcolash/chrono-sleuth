precision mediump float;

uniform float     uAlpha;
uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

// slight modifications made to original shader
// use alpha channel for fragColor + changed uniform names

// original shader from: https://www.shadertoy.com/view/WsVSzV
// tips for chromatic aberration: https://lettier.github.io/3d-game-shaders-for-beginners/chromatic-aberration.html

float warp = 0.35;     // simulate curvature of CRT monitor (larger number = more curvature)
float scan = 0.75;    // simulate darkness between scanlines
float scanSize = 0.75; // size of scanlines [0.0 - 2.0] (smaller number = taller scanlines)

float chromaticAberration = 0.25 * uAlpha;
float redOffset   =  0.006 * chromaticAberration;
float greenOffset =  0.003 * chromaticAberration;
float blueOffset  = -0.003 * chromaticAberration;

vec4 mainImage(in vec2 fragCoord, in vec2 uv) {
  if (uAlpha <= 0.0) {
    return texture2D(uMainSampler, uv);
  }

  // squared distance from center
  vec2 dc = abs(0.5-uv);
  dc *= dc;

  // warp the fragment coordinates
  uv.x -= 0.5; uv.x *= 1.0+(dc.y*(0.3*warp)); uv.x += 0.5;
  uv.y -= 0.5; uv.y *= 1.0+(dc.x*(0.4*warp)); uv.y += 0.5;

  vec2 chromaticOffset = vec2((abs(0.5-uv) + 0.5) * 2.);

  vec4 color;
  color.r = texture2D(uMainSampler,uv + vec2(redOffset * chromaticOffset)).r;
  color.g = texture2D(uMainSampler,uv + vec2(greenOffset * chromaticOffset)).g;
  color.b = texture2D(uMainSampler,uv + vec2(blueOffset * chromaticOffset)).b;
  color.a = texture2D(uMainSampler,uv).a;

  // sample inside boundaries, otherwise set to black
  if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0) {
      return vec4(0.0);
  } else {
    // determine if we are drawing in a scanline
    float apply = abs(sin(fragCoord.y * scanSize)*0.5*scan);

    apply = uAlpha * apply;

    // sample the texture
    return vec4(mix(color.rgb,vec3(0.0), apply), color.a);
  }
}

void main(void) {
  gl_FragColor = mainImage(gl_FragCoord.xy, outTexCoord);
}