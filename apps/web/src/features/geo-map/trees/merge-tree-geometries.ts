import { BufferAttribute, BufferGeometry } from 'three';

const copyAttribute = (
  source: BufferGeometry,
  name: 'position' | 'normal' | 'color',
  target: Float32Array,
  vertexOffset: number,
): void => {
  const attribute = source.getAttribute(name);
  for (let index = 0; index < attribute.count; index += 1) {
    const dest = (vertexOffset + index) * 3;
    target[dest] = attribute.getX(index);
    target[dest + 1] = attribute.getY(index);
    target[dest + 2] = attribute.getZ(index);
  }
};

const appendIndices = (source: BufferGeometry, vertexOffset: number, indices: number[]): void => {
  if (!source.index) {
    return;
  }
  for (let index = 0; index < source.index.count; index += 1) {
    indices.push(source.index.getX(index) + vertexOffset);
  }
};

/** Merge painted tree parts without pulling `three/addons` (avoids a second Three.js copy). */
export const mergeTreeGeometries = (parts: readonly BufferGeometry[]): BufferGeometry => {
  let vertexCount = 0;
  for (const part of parts) {
    vertexCount += part.getAttribute('position').count;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const indices: number[] = [];
  let vertexOffset = 0;
  for (const part of parts) {
    copyAttribute(part, 'position', positions, vertexOffset);
    copyAttribute(part, 'normal', normals, vertexOffset);
    copyAttribute(part, 'color', colors, vertexOffset);
    appendIndices(part, vertexOffset, indices);
    vertexOffset += part.getAttribute('position').count;
  }
  const merged = new BufferGeometry();
  merged.setAttribute('position', new BufferAttribute(positions, 3));
  merged.setAttribute('normal', new BufferAttribute(normals, 3));
  merged.setAttribute('color', new BufferAttribute(colors, 3));
  merged.setIndex(indices);
  return merged;
};
