
export type MaterialType = 'iron' | 'wood' | 'aluminum';

export interface CalculatedMaterial {
  item: string;
  quantity: string | number;
  unit: string;
  price?: number; // السعر التقريبي لهذا الصنف بناءً على الكمية
}

export interface CalculationResult {
  id: string;
  timestamp: number;
  productName: string;
  materialType: MaterialType;
  dimensions: {
    width: number;
    height: number;
    length?: number;
  };
  details: string;
  rawMaterialSizes?: string; // مقاسات الخامات المتوفرة لدى المستخدم
  calculatedMaterials: CalculatedMaterial[];
  estimatedCost?: number;
  aiImageUrl?: string;
  summary?: string;
}
