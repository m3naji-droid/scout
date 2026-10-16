import React, { useState } from 'react';
import { FileSpreadsheet, Download, Upload, CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';

interface ExcelImportModalProps {
  type: 'scouts' | 'teachers';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actor: any;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  type,
  isOpen,
  onClose,
  onSuccess,
  actor
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // توليد وتنزيل القالب محلياً لمنع أخطاء 404 على Vercel
  const handleDownloadTemplate = () => {
    let templateData = [];
    if (type === 'scouts') {
      templateData = [
        { fullName: 'أحمد محمد علي', nationalId: '097312345', grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح', parentName: 'محمد علي', parentPhone: '39000000' }
      ];
    } else {
      templateData = [
        { fullName: 'أ. سلمان عبد الله', employeeId: 'EMP102', subject: 'كشافة', assignedClasses: 'الأول إعدادي - 1, الأول إعدادي - 2' }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'scouts' ? 'الكشافون' : 'المعلمون');
    XLSX.writeFile(wb, `template_${type}_ahmed_alfateh.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setErrorMsg(null);
    setDryRunResult(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setErrorMsg('الملف فارغ أو لا يحتوي على صفوف بيانات صالحة');
          return;
        }

        setParsedRows(data);

        // Perform instant dry-run validation on server/api
        setLoading(true);
        if (type === 'scouts') {
          const res = await api.importScouts(data, true, actor);
          setDryRunResult(res);
        } else {
          const res = await api.importTeachers(data, true, actor);
          setDryRunResult(res);
        }
      } catch (err: any) {
        setErrorMsg('حدث خطأ أثناء قراءة ملف Excel: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(uploaded);
  };

  const handleCommitImport = async () => {
    if (parsedRows.length === 0) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      let res;
      if (type === 'scouts') {
        res = await api.importScouts(parsedRows, false, actor);
      } else {
        res = await api.importTeachers(parsedRows, false, actor);
      }
      setImportResult(res);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل الاستيراد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                استيراد جماعي من ملف Excel ({type === 'scouts' ? 'الكشافون' : 'المعلمون'})
              </h3>
              <p className="text-xs text-slate-500">معاينة البيانات، التحقق من التكرار، والاعتماد الآمن</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Step 1: Download Template */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              الخطوة 1: تنزيل نموذج Excel الجاهز
            </span>
            <p className="text-[11px] text-emerald-800">
              استخدم القالب المعتمد لضمان تطابق أسماء الحقول وتجنب أخطاء الاستيراد.
            </p>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تنزيل القالب (.xlsx)</span>
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            الخطوة 2: رفع ملف Excel المعبأ
          </label>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-700 file:text-white hover:file:bg-blue-800 cursor-pointer"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Dry-Run Validation Summary */}
        {dryRunResult && !importResult && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              نتيجة الفحص والمعاينة الأولية:
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-500">إجمالي الصفوف</div>
                <div className="text-lg font-black text-slate-900">{dryRunResult.totalRows}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-700 font-bold">صفوف صالحة</div>
                <div className="text-lg font-black text-emerald-800">{dryRunResult.validCount}</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="text-xs text-red-700 font-bold">صفوف بها أخطاء</div>
                <div className="text-lg font-black text-red-800">{dryRunResult.errorCount}</div>
              </div>
            </div>

            {/* Errors breakdown */}
            {dryRunResult.errors && dryRunResult.errors.length > 0 && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-1 max-h-36 overflow-y-auto">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>تنبيهات الأخطاء في الصفوف:</span>
                </div>
                {dryRunResult.errors.map((err: any, i: number) => (
                  <div key={i} className="text-[11px]">
                    • الصف #{err.row}: {err.error}
                  </div>
                ))}
              </div>
            )}

            {/* Commit Confirmation Button */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCommitImport}
                disabled={loading || dryRunResult.validCount === 0}
                className="flex-1 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'جارٍ الاستيراد والحفظ...' : `تأكيد استيراد (${dryRunResult.validCount}) سجل صالح`}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Final Import Result */}
        {importResult && (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-950 text-base">تمت عملية الاستيراد بنجاح!</h4>
            <p className="text-xs text-emerald-800">
              تمت إضافة <strong>{importResult.addedCount || importResult.imported}</strong> سجل جديد إلى قاعدة بيانات الفرقة.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs"
            >
              إغلاق وتحديث القائمة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
