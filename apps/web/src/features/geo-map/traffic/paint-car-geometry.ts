import { BufferAttribute, Color, type BufferGeometry } from 'three';

export const paintCarGeometry = (geometry: BufferGeometry, hex: number): BufferGeometry => {
  const count = geometry.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  const color = new Color(hex);
  for (let index = 0; index < count; index += 1) {
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return geometry;
};
