precision mediump float;

uniform float     uAlpha;
uniform sampler2D uMainSampler;

varying vec2 outTexCoord;

void main(void)
{
  vec4 baseColor = vec4(texture2D(uMainSampler, outTexCoord).rgba);
  vec4 newColor = baseColor;
  newColor.g *= 1.25;
  newColor.r *= 2.5;
  newColor.b *= 3.;

  gl_FragColor = mix(baseColor, newColor, uAlpha);
}