
import React, { useState, useRef } from 'react';
import { Layout } from './components/Layout';
import { MaterialType, CalculationResult } from './types';
import { calculateMaterials, generateProductVisual } from './services/geminiService';

type PDFTemplate = 'Professional' | 'Simple' | 'Print-ready';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>('Professional');
  
  const [productName, setProductName] = useState('مشروع جديد');
  const [material, setMaterial] = useState<MaterialType>('iron');
  const [width, setWidth] = useState<number | string>('');
  const [height, setHeight] = useState<number | string>('');
  const [length, setLength] = useState<number | string>('');
  const [details, setDetails] = useState('');
  const [rawMaterialSizes, setRawMaterialSizes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [includeCost, setIncludeCost] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    if (!currentResult) return;
    
    const originalTitle = document.title;
    const dateStr = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
    document.title = `مقايسة_${currentResult.productName}_${dateStr}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  const handleCalculate = async () => {
    if (!productName && !details && !image) {
      return alert("يرجى إدخال اسم المشروع أو وصف أو صورة للبدء.");
    }

    setLoading(true);
    setCurrentResult(null);
    try {
      const currentWidth = width !== '' ? Number(width) : undefined;
      const currentHeight = height !== '' ? Number(height) : undefined;
      const currentLength = length !== '' ? Number(length) : undefined;

      const aiData = await calculateMaterials(
        material, 
        { width: currentWidth, height: currentHeight, length: currentLength }, 
        details || productName, 
        rawMaterialSizes,
        includeCost,
        image || undefined
      );

      const visualWidth = currentWidth || 100;
      const visualHeight = currentHeight || 200;

      const generatedImg = await generateProductVisual(
        productName, 
        material, 
        { width: visualWidth, height: visualHeight }, 
        details || "Professional technical design", 
        image || undefined 
      );

      const result: CalculationResult = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: Date.now(),
        productName,
        materialType: material,
        dimensions: { 
          width: currentWidth as any, 
          height: currentHeight as any, 
          length: currentLength 
        },
        details,
        rawMaterialSizes,
        calculatedMaterials: aiData.materials,
        estimatedCost: includeCost ? aiData.costEstimation : undefined,
        aiImageUrl: generatedImg || undefined,
        summary: aiData.summary
      };

      setCurrentResult(result);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 500);
    } catch (error) {
      alert("حدث خطأ أثناء المعالجة، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  const formatDimensions = (dims: any) => {
    const parts = [];
    if (dims.width) parts.push(`${dims.width}W`);
    if (dims.height) parts.push(`${dims.height}H`);
    if (dims.length) parts.push(`${dims.length}L`);
    return parts.length > 0 ? parts.join(' × ') + ' cm' : 'أبعاد تقديرية (Standard)';
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <section className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-16 overflow-hidden no-print shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
          </div>
          <div className="relative z-10 text-right space-y-4">
            <span className="inline-block bg-amber-500 text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">محرك الذكاء الاصطناعي v3.1</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
              الدقة في <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">حساباتك</span> هي أساس قوتك.
            </h2>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              حوّل الرسومات البسيطة إلى مقايسات خامات احترافية معتمدة على المعايير الهندسية الصارمة.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Inputs */}
          <div className="lg:col-span-5 space-y-6 no-print">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <h3 className="text-xl font-black text-slate-900">مواصفات التصنيع</h3>
              </div>

              <div className="space-y-6">
                {/* Image Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={`group relative h-44 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${image ? 'border-amber-500 bg-amber-50/10' : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50'}`}
                >
                  {image ? (
                    <div className="relative w-full h-full p-2">
                      <img src={image} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                         <span className="text-white text-xs font-bold">تغيير الصورة 🔄</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="text-4xl">📸</div>
                      <p className="text-xs font-black text-slate-500">ارفع صورة التصميم للمعايرة البصرية</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">(اختياري ولكن يفضل للذكاء الاصطناعي)</p>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Primary Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 px-2 uppercase">نوع الخامة الأساسية</label>
                    <div className="relative">
                      <select 
                        value={material} 
                        onChange={e => setMaterial(e.target.value as MaterialType)}
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-900 appearance-none focus:ring-2 focus:ring-amber-500/20 outline-none"
                      >
                        <option value="iron">⚙️ حديد ومشغولات</option>
                        <option value="wood">🪵 أعمال نجارة وأثاث</option>
                        <option value="aluminum">🏗️ قطاعات ألمنيوم</option>
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 px-2 uppercase">مسمى المشروع</label>
                    <input 
                      type="text" 
                      value={productName} 
                      onChange={e => setProductName(e.target.value)}
                      placeholder="مثلاً: بوابة فيلا النرجس"
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold text-slate-900 placeholder:opacity-30 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                  </div>
                </div>

                {/* Dimensions Group */}
                <div className="bg-slate-900 p-6 rounded-[1.5rem] shadow-inner">
                  <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest block mb-4 text-center">أبعاد المقايسة الهندسية (سم)</span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {label: 'العرض', val: width, set: setWidth},
                      {label: 'الارتفاع', val: height, set: setHeight},
                      {label: 'الطول', val: length, set: setLength}
                    ].map((dim, idx) => (
                      <div key={idx} className="space-y-1">
                        <input 
                          type="number" 
                          value={dim.val} 
                          onChange={e => dim.set(e.target.value)}
                          placeholder={dim.label}
                          className="w-full bg-slate-800 text-white text-center p-3 rounded-lg font-black text-lg border border-slate-700 outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
                        />
                        <span className="block text-[8px] text-slate-500 text-center font-bold uppercase">{dim.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details & Additional Info */}
                <div className="space-y-4">
                  <textarea 
                    value={details} 
                    onChange={e => setDetails(e.target.value)}
                    placeholder="اكتب ملاحظات فنية (مثل: سمك الصاج، نوع الدهان، النقوش المطلوبة)..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 h-24 outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  />
                  <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-xl">💰</span>
                    <div className="flex-grow">
                      <p className="text-[10px] font-black text-amber-800">تفعيل تقدير التكلفة</p>
                      <p className="text-[9px] text-amber-600 font-bold">بناءً على متوسط أسعار السوق الحالية</p>
                    </div>
                    <button 
                      onClick={() => setIncludeCost(!includeCost)}
                      className={`w-10 h-5 rounded-full transition-all relative ${includeCost ? 'bg-amber-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${includeCost ? 'left-1' : 'left-6'}`}></div>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleCalculate} 
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-900 py-5 rounded-2xl font-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                       <span>جاري المعالجة الفنية...</span>
                    </div>
                  ) : (
                    <>
                      <span>توليد المقايسة الذكية</span>
                      <span className="text-xl">✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-7" ref={resultRef}>
            {currentResult ? (
              <div className="fade-up space-y-6">
                
                {/* AI Visualization */}
                {currentResult.aiImageUrl && (
                  <div className="relative group overflow-hidden rounded-[2.5rem] shadow-2xl bg-slate-900 aspect-video">
                    <img 
                      src={currentResult.aiImageUrl} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[2s]" 
                      alt="Product Visual"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 right-8 text-right space-y-1">
                      <h4 className="text-white font-black text-2xl drop-shadow-lg">{currentResult.productName}</h4>
                      <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                        <span>معاينة بصرية</span>
                        <span className="w-4 h-[1px] bg-amber-500/40"></span>
                        <span>{formatDimensions(currentResult.dimensions)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsImageModalOpen(true)}
                      className="absolute top-6 left-6 bg-white/10 backdrop-blur-md text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity no-print"
                    >
                      🔍 تكبير
                    </button>
                  </div>
                )}

                {/* Technical Report Card */}
                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                  <div className={`report-container template-${selectedTemplate.toLowerCase()}`}>
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 border-b border-slate-100 pb-10 mb-10">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">تقرير توريد خامات معتمد</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">مواصفات <span className="text-amber-500">التصنيع</span></h2>
                        <p className="text-slate-500 font-bold mt-2">{currentResult.productName} | ID: {currentResult.id}</p>
                      </div>

                      {currentResult.estimatedCost !== undefined && (
                        <div className="bg-slate-900 p-8 rounded-[2rem] text-center shadow-2xl border border-slate-800 min-w-[200px]">
                          <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] block mb-2">إجمالي التقدير المالي</span>
                          <div className="text-4xl font-black text-white">{currentResult.estimatedCost.toLocaleString()} <span className="text-sm font-medium text-slate-500">ج.م</span></div>
                        </div>
                      )}
                    </div>

                    {/* Material Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-separate border-spacing-y-3">
                        <thead>
                          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="px-6 py-4">الخامة / الوصف الفني</th>
                            <th className="px-6 py-4 text-center">الكمية الصافية</th>
                            <th className="px-6 py-4 text-center">الوحدة</th>
                            {includeCost && <th className="px-6 py-4 text-center">السعر التقديري</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {currentResult.calculatedMaterials.map((m, i) => (
                            <tr key={i} className="hover-lift bg-slate-50/50 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 group">
                              <td className="px-6 py-6 rounded-r-2xl">
                                <p className="font-black text-slate-900 text-lg">{m.item}</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-1 italic">{m.description}</p>
                              </td>
                              <td className="px-6 py-6 text-center">
                                <span className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-lg font-black text-xl">{m.quantity}</span>
                              </td>
                              <td className="px-6 py-6 text-center text-slate-600 font-black text-sm">{m.unit}</td>
                              {includeCost && (
                                <td className="px-6 py-6 text-center rounded-l-2xl">
                                  <span className="font-bold text-slate-900">{m.price?.toLocaleString()} <span className="text-[10px] text-slate-400">ج.م</span></span>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Expert Summary */}
                    {currentResult.summary && (
                      <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-right relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <h4 className="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-4">التحليل الهندسي النهائي</h4>
                        <p className="text-slate-300 font-bold leading-relaxed text-lg relative z-10">{currentResult.summary}</p>
                      </div>
                    )}

                    {/* PDF Actions */}
                    <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">تغيير نمط التقارير:</span>
                        <div className="flex gap-2">
                          {(['Professional', 'Simple', 'Print-ready'] as PDFTemplate[]).map(t => (
                            <button 
                              key={t}
                              onClick={() => setSelectedTemplate(t)}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 ${selectedTemplate === t ? 'bg-amber-500 border-amber-500 text-slate-900' : 'bg-transparent border-slate-100 text-slate-400 hover:border-slate-300'}`}
                            >
                              {t === 'Professional' ? '🎨 احترافي' : t === 'Simple' ? '📄 بسيط' : '🖨️ طباعة'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-sm flex items-center gap-4 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95 w-full md:w-auto justify-center"
                      >
                         <span>تصدير كملف PDF</span>
                         <span className="text-xl">📥</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-slate-200 rounded-[3rem] bg-white shadow-inner animate-pulse">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-6 grayscale">📐</div>
                <h3 className="text-2xl font-black text-slate-300">لوحة عرض المقايسات</h3>
                <p className="text-slate-300 font-bold max-w-sm mt-3 leading-relaxed">
                  أدخل بيانات المشروع على اليمين وسنقوم بتوليد تقرير هندسي متكامل فوراً.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {isImageModalOpen && currentResult?.aiImageUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 p-4 md:p-20 no-print" onClick={() => setIsImageModalOpen(false)}>
           <button className="absolute top-8 right-8 text-white text-5xl hover:text-amber-500 transition-colors" onClick={() => setIsImageModalOpen(false)}>✕</button>
           <img src={currentResult.aiImageUrl} className="max-w-full max-h-full rounded-3xl shadow-2xl scale-up" alt="Full Preview" />
        </div>
      )}
    </Layout>
  );
};

export default App;
