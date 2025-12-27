
import { GoogleGenAI, Type } from "@google/genai";
import { MaterialType } from "../types";

export const calculateMaterials = async (
  materialType: MaterialType,
  dimensions: { width?: number; height?: number; length?: number },
  details: string,
  rawMaterialSizes?: string,
  includeCost: boolean = true,
  imageContent?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    أنت خبير حساب كميات (QS) هندسي صارم. مهمتك استخراج الخامات الصافية اللازمة للتصنيع.
    
    القواعد الذهبية لمنع الزيادة:
    1. التعامل مع الأبعاد المفقودة: إذا لم يتم توفير العرض أو الارتفاع أو الطول، قم بتقديرها بناءً على "وصف المشروع" أو "الصورة المرفقة" باستخدام المقاسات القياسية المتعارف عليها لهذا النوع من المصنوعات.
    2. المعايرة البصرية: إذا وُجدت صورة، حلل الهيكل الظاهر فقط. لا تخمن قطعاً إضافية.
    3. الحساب الرياضي: 
       - الإطارات = (العرض + الارتفاع) * 2. 
       - الحشوات = المساحة الصافية.
       - في حال وجود "الطول" (length)، يتم اعتباره العمق أو البعد الثالث للمجسم.
    4. الهالك: لا يتجاوز 5% بأي حال من الأحوال.
    5. منع الحشو: لا تضف بنوداً استهلاكية عامة (مثل صنفرة أو نقل) إلا إذا كانت خامات توريد أساسية.
    6. التزم بمقاسات الخام الموردة: ${rawMaterialSizes || 'المقاسات القياسية'}.
    
    الأبعاد المعطاة: ${dimensions.width || 'غير محدد'}سم عرض، ${dimensions.height || 'غير محدد'}سم ارتفاع، ${dimensions.length || 'غير محدد'}سم طول.
  `;

  const prompt = `
    تحليل خامات: ${materialType}.
    وصف التصميم: "${details}".
    المقاسات المعطاة: ${dimensions.width || 'تقديرية'}x${dimensions.height || 'تقديرية'}${dimensions.length ? `x${dimensions.length}` : ''} سم.
    ${includeCost ? 'مطلوب تقدير مالي واقعي.' : 'لا تحسب تكاليف مالية (القيمة 0).'}
    ملاحظة: إذا كانت المقاسات "تقديرية"، افترض المقاس المناسب للقطعة واذكره في الملخص.
    رد بصيغة JSON فقط.
  `;

  const parts: any[] = [{ text: prompt }];
  if (imageContent) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageContent.split(',')[1]
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: { parts },
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 4000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          materials: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                quantity: { type: Type.STRING },
                unit: { type: Type.STRING },
                price: { type: Type.NUMBER },
                description: { type: Type.STRING }
              },
              required: ["item", "quantity", "unit", "price", "description"]
            }
          },
          costEstimation: { type: Type.NUMBER },
          summary: { type: Type.STRING }
        },
        required: ["materials", "costEstimation", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateProductVisual = async (
  productName: string,
  materialType: string,
  dimensions: { width: number; height: number },
  details: string,
  imageContent?: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `High-end architectural 3D render of ${productName} (${dimensions.width}x${dimensions.height}cm). Material: ${materialType}. Design: ${details}. Realistic textures, workshop lighting, neutral background. 8k resolution.`;

  const parts: any[] = [{ text: prompt }];
  if (imageContent) {
    parts.unshift({
      inlineData: { mimeType: 'image/jpeg', data: imageContent.split(',')[1] }
    });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const getSupportAssistantResponse = async (userQuery: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userQuery,
    config: { systemInstruction: "أنت مساعد فني متخصص في حسابات المصانع والورش." }
  });
  return response.text;
};
