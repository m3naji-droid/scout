import React from 'react';
import { Shield, Lock, EyeOff, CheckCircle2, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-base">
              وثيقة سياسة الخصوصية وحماية بيانات الطلبة القاصرين
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
            تلتزم قيادة <strong>فرقة فتيان أحمد الفاتح الكشفية</strong> بمدرسة أحمد الفاتح الإعدادية للبنين في مملكة البحرين بحماية الخصوصية الرقمية للطلبة القاصرين وفق أحكام قانون حماية البيانات الشخصية البحريني واللوائح المعتمدة بوزارة التربية والتعليم.
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-amber-600" />
              1. سرية السجلات السلوكية والتقييمات
            </h4>
            <p>
              تعتبر سجلات النقاط الإيجابية والخصومات السلوكية وطلبات الحرمان بيانات سرية خاصة، ولا يُسمح بالاطلاع عليها إلا للمعلم المعني، قائد الفرقة، إدارة المدرسة، الكشاف صاحب السجل، وولي أمره المعتمد.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-amber-600" />
              2. سياسة الصور الشخصية والزي الكشفي
            </h4>
            <p>
              يُشترط لرفع صورة الكشاف ارتداء البدلة الكشفية الرسمية المعتمدة بالكامل. لا تظهر أي صورة شخصية أو تُنشر في الموقع أو شاشة التميز قبل مراجعتها وتدقيقها واعتمادها يدوياً من قائد الفرقة. ولا تُعرض صور الطلبة لزوار الموقع غير المسجلين.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. أمن الحسابات وسجل التدقيق
            </h4>
            <p>
              تخضع كافة الإجراءات الحساسة (مثل منح النقاط، الخصومات، طلبات الحرمان، وتغيير الصلاحيات) لسجل تدقيق غير قابل للتعديل يوثق هوية المستخدم ووقت الإجراء لمنع التجاوزات وحماية حقوق جميع الأطراف.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              4. قنوات التواصل المعتمدة
            </h4>
            <p>
              يتم التواصل الرسمي والاستفسارات عبر صندوق الرسائل الداخلي للمنصة مع قيادة الفرقة حفاظاً على الخصوصية ودون تداول أرقام الهواتف الشخصية للطلبة للعامة.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs"
          >
            فهمت وأوافق
          </button>
        </div>
      </div>
    </div>
  );
};
