export interface FabricMaterial {
  roughness: number;

  metalness: number;

  envMapIntensity: number;
}

export const fabricMaterials: Record<string, FabricMaterial> = {
  "Organic Cotton": {
    roughness: 0.95,

    metalness: 0,

    envMapIntensity: 0.3,
  },

  "Bamboo Blend": {
    roughness: 0.75,

    metalness: 0.03,

    envMapIntensity: 0.45,
  },

  "Linen Mix": {
    roughness: 1,

    metalness: 0,

    envMapIntensity: 0.25,
  },

  "Silk Touch": {
    roughness: 0.18,

    metalness: 0.1,

    envMapIntensity: 1,
  },
};
