import React from 'react';
import { Printer, X, Download, Shield, Award, CheckCircle } from 'lucide-react';
import { Certificate } from '../../types';

interface CertificatePrintModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  certificate,
  onClose
}) => {
  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl space-y-4 my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-slate-800 text-sm">
              معاينة وطباعة شهادة التقدير الرسمية (A4)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشهادة الآن</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Certificate Canvas */}
        <div className="certificate-page bg-gradient-to-b from-amber-50/40 via-white to-amber-50/40 border-8 border-double border-amber-600/80 p-8 sm:p-12 rounded-3xl shadow-lg relative text-center space-y-6">
          {/* Ornate corner ornaments */}
          <div className="absolute top-3 right-3 text-amber-600 font-serif text-2xl select-none">❖</div>
          <div className="absolute top-3 left-3 text-amber-600 font-serif text-2xl select-none">❖</div>
          <div className="absolute bottom-3 right-3 text-amber-600 font-serif text-2xl select-none">❖</div>
          <div className="absolute bottom-3 left-3 text-amber-600 font-serif text-2xl select-none">❖</div>

          {/* Certificate Header with Emblems */}
          <div className="flex items-center justify-between border-b-2 border-amber-600/30 pb-4">
            <div className="text-right">
              <div className="text-xs font-bold text-emerald-950">مملكة البحرين</div>
              <div className="text-[11px] text-slate-600">وزارة التربية والتعليم</div>
              <div className="text-[10px] text-slate-500">مدرسة أحمد الفاتح الإعدادية</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-900 text-amber-400 p-2 flex items-center justify-center border-2 border-amber-400 shadow-md">
                <Shield className="w-10 h-10" />
              </div>
              <span className="text-xs font-black text-emerald-950 mt-1">كشافة البحرين</span>
            </div>

            <div className="text-left">
              <div className="text-xs font-bold text-amber-900">فرقة فتيان الفاتح</div>
              <div className="text-[11px] text-slate-600">منظومة الحوافز والشارات</div>
              <div className="text-[10px] text-slate-400">{certificate.certificateNumber}</div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2 pt-2">
            <h1 className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight" style={{ fontFamily: 'Amiri, Cairo, serif' }}>
              شهادة شكر وتقدير وانضباط كشفي
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800">
              «كُن مستعداً • وسام الفخر والاعتزاز الكشفي»
            </p>
          </div>

          {/* Recipient Details */}
          <div className="space-y-4 py-4 max-w-2xl mx-auto">
            <p className="text-sm text-slate-600">
              تتشرف قيادة فرقة فتيان أحمد الفاتح الكشفية بمنح هذه الشهادة للكشاف المتميز:
            </p>

            <div className="text-2xl sm:text-3xl font-black text-emerald-950 border-b-2 border-dashed border-amber-500 pb-2">
              {certificate.scoutName}
            </div>

            <p className="text-xs font-bold text-slate-600">
              الصف: {certificate.scoutGrade} • شعبة {certificate.scoutSection}
            </p>

            <div className="bg-amber-100/40 p-4 rounded-2xl border border-amber-300 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {certificate.reason}
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t-2 border-amber-600/30 flex items-end justify-between px-6">
            <div className="text-right space-y-1">
              <div className="text-xs font-bold text-slate-500">التاريخ:</div>
              <div className="text-xs font-semibold text-slate-800">{certificate.date}</div>
            </div>

            {/* Official Stamp Placeholder */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-700/60 p-1 flex flex-col items-center justify-center text-center rotate-[-8deg] opacity-80">
              <Award className="w-6 h-6 text-amber-700" />
              <span className="text-[8px] font-black text-amber-900 mt-0.5">ختم الفرقة المعتمد</span>
            </div>

            <div className="text-left space-y-1">
              <div className="text-xs font-bold text-slate-500">اعتماد قيادة الفرقة:</div>
              <div className="text-xs font-black text-emerald-950">{certificate.issuerLeaderName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
