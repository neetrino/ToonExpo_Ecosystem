import {
  Color,
  MeshBasicMaterial,
  type Material,
  type Mesh,
  type Object3D,
  type Texture,
} from 'three';

/** Same tint on every face so roof and walls do not pick a different light. */
const UNIFIED_TINT = new Color(0xffffff);

const textureFrom = (material: Material, key: 'map' | 'alphaMap'): Texture | null => {
  if (!(key in material)) {
    return null;
  }
  const value = material[key as keyof Material];
  return value && typeof value === 'object' && 'isTexture' in value ? (value as Texture) : null;
};

const toUnlitMaterial = (material: Material): MeshBasicMaterial => {
  if (material instanceof MeshBasicMaterial) {
    material.color.copy(UNIFIED_TINT);
    material.toneMapped = false;
    return material;
  }
  const next = new MeshBasicMaterial({
    color: UNIFIED_TINT,
    map: textureFrom(material, 'map'),
    alphaMap: textureFrom(material, 'alphaMap'),
    transparent: material.transparent,
    opacity: material.opacity,
    side: material.side,
    vertexColors: material.vertexColors,
  });
  next.toneMapped = false;
  return next;
};

/** Replace lit PBR with unlit materials so every side keeps the same color. */
export const flattenModelMaterials = (root: Object3D): void => {
  const replaced = new Map<Material, MeshBasicMaterial>();
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const source = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = source.map((material) => {
      const cached = replaced.get(material);
      if (cached) {
        return cached;
      }
      const unlit = toUnlitMaterial(material);
      replaced.set(material, unlit);
      if (unlit !== material) {
        material.dispose();
      }
      return unlit;
    });
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? next);
  });
};
