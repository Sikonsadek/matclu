
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-['Tajawal']" dir="rtl">
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-900 shadow-lg shadow-amber-500/20 rotate-3">
              📐
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight leading-none">حاسبة الخامات</h1>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">الذكاء الفني الصناعي</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">الحالة التشغيلية</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-black text-slate-300">النظام نشط</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container max-w-7xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-20 no-print">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-1 bg-amber-500 rounded-full mb-2"></div>
            <p className="text-slate-400 text-sm font-bold">
              جميع الحقوق محفوظة © 2025 حاسبة الخامات الذكية
            </p>
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Powered by AI Precision</span>
              <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
              <p className="text-amber-500 text-xs font-black tracking-widest uppercase">
                تصميم Ahmed Sadek
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
