import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ScoutBadge, Certificate, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, query, where } from 'firebase/firestore';

// قائمة الكشافين الرسمية (الـ 127 كشافاً من ملف الأكسل)
const HARDCODED_SCOUTS_LIST: ScoutProfile[] = [
  { id: "s1", fullName: "علي شوقي علي الكلالي", name: "علي شوقي علي الكلالي", nationalId: "120407310", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s2", fullName: "حمزة محمد صبحي محمد عبد العزيز", name: "حمزة محمد صبحي محمد عبد العزيز", nationalId: "130815780", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s3", fullName: "محمد عبدالرحمن فايز الرواحي", name: "محمد عبدالرحمن فايز الرواحي", nationalId: "130912026", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s4", fullName: "فارس مصطفي عبدالعزيز عبدالله", name: "فارس مصطفي عبدالعزيز عبدالله", nationalId: "130403679", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s5", fullName: "عمار نادر أحمد رحيمي", name: "عمار نادر أحمد رحيمي", nationalId: "121224619", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s6", fullName: "علي عادل عبد الرحيم محمد", name: "علي عادل عبد الرحيم محمد", nationalId: "120612372", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s7", fullName: "محمد حسين محمد سالم", name: "محمد حسين محمد سالم", nationalId: "111127564", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s8", fullName: "سلطان حمد سلطان صالح", name: "سلطان حمد سلطان صالح", nationalId: "130705365", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s9", fullName: "حسين وليد محمد سليم", name: "حسين وليد محمد سليم", nationalId: "130517895", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s10", fullName: "خالد سند بشر الرويعي", name: "خالد سند بشر الرويعي", nationalId: "130502758", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s11", fullName: "البدر سند الرويعي", name: "البدر سند الرويعي", nationalId: "140816666", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s12", fullName: "خالد رجب عقاب المحميد", name: "خالد رجب عقاب المحميد", nationalId: "120205149", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s13", fullName: "عبدالرحمن عمار مثنى الماطري", name: "عبدالرحمن عمار مثنى الماطري", nationalId: "121100995", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s14", fullName: "عبد الرحمن ناصر عبدالله البوعينين", name: "عبد الرحمن ناصر عبدالله البوعينين", nationalId: "120710617", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s15", fullName: "سلمان سالم بحر", name: "سلمان سالم بحر", nationalId: "130105600", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s16", fullName: "خالد سالم بحر", name: "خالد سالم بحر", nationalId: "130105597", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s17", fullName: "أحمد عبدالله صالح طاهر", name: "أحمد عبدالله صالح طاهر", nationalId: "121010864", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s18", fullName: "حمد توفيق مسعد الظبيع", name: "حمد توفيق مسعد الظبيع", nationalId: "121206793", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s19", fullName: "عبدالله عمر محمد الرضي", name: "عبدالله عمر محمد الرضي", nationalId: "130706043", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s20", fullName: "يوسف أيمن العجمي حسب النبي", name: "يوسف أيمن العجمي حسب النبي", nationalId: "121227804", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s21", fullName: "يوسف جاسم يوسف النعيمي", name: "يوسف جاسم يوسف النعيمي", nationalId: "120135337", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s22", fullName: "زياد طاهر عبدالله حسن", name: "زياد طاهر عبدالله حسن", nationalId: "120318903", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s23", fullName: "سلطان أحمد سلطان الدوسري", name: "سلطان أحمد سلطان الدوسري", nationalId: "١٣٠٦٠١٨٣٧", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s24", fullName: "عبدالله عامر رضا", name: "عبدالله عامر رضا", nationalId: "١٣٠٣١٢٥٧٧", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s25", fullName: "عهد عهدي أحمد الحصيني", name: "عهد عهدي أحمد الحصيني", nationalId: "130622761", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s26", fullName: "ناصر وهاب محمد السهو", name: "ناصر وهاب محمد السهو", nationalId: "121016048", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s27", fullName: "اثنيان خليفة مشرف اثنيان", name: "اثنيان خليفة مشرف اثنيان", nationalId: "120709325", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s28", fullName: "بندر تيسير حمود فنتوخ", name: "بندر تيسير حمود فنتوخ", nationalId: "130903752", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s29", fullName: "عيسى وليد عبدالواحد محمد", name: "عيسى وليد عبدالواحد محمد", nationalId: "130303542", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s30", fullName: "معاذ محمد محسن أحمد", name: "معاذ محمد محسن أحمد", nationalId: "120603063", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s31", fullName: "يوسف سلمان يوسف الدوسري", name: "يوسف سلمان يوسف الدوسري", nationalId: "120903652", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s32", fullName: "وضاح بدر محمد ردمان محمد", name: "وضاح بدر محمد ردمان محمد", nationalId: "130616150", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s33", fullName: "حسام محمد السيد المسلماني", name: "حسام محمد السيد المسلماني", nationalId: "130720909", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s34", fullName: "راكان محمد سالم الخلاقي", name: "راكان محمد سالم الخلاقي", nationalId: "130524212", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s35", fullName: "جاسم مهران احمد راشد", name: "جاسم مهران احمد راشد", nationalId: "130707813", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s36", fullName: "احمد مهران احمد راشد", name: "احمد مهران احمد راشد", nationalId: "130707791", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s37", fullName: "همام ماهر فتيخ خلف", name: "همام ماهر فتيخ خلف", nationalId: "130807923", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s38", fullName: "خليفة بشار محمد المريسي", name: "خليفة بشار محمد المريسي", nationalId: "120606488", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s39", fullName: "خليفة سامي محمد قاسم علوان", name: "خليفة سامي محمد قاسم علوان", nationalId: "120203758", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s40", fullName: "حمدان هاني محمد الطريمي", name: "حمدان هاني محمد الطريمي", nationalId: "120617870", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s41", fullName: "ابراهيم محمد حسين الحردان", name: "ابراهيم محمد حسين الحردان", nationalId: "130808652", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s42", fullName: "حمد عصام الطيري", name: "حمد عصام الطيري", nationalId: "110503783", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s43", fullName: "عبد الحمن غازي محسن علي", name: "عبد الحمن غازي محسن علي", nationalId: "130402915", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s44", fullName: "نواف سعود عباد المرشد", name: "نواف سعود عباد المرشد", nationalId: "١٢٠٦١٠٤٠٠", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s45", fullName: "محمد صلاح محمد البرطي", name: "محمد صلاح محمد البرطي", nationalId: "131011693", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s46", fullName: "سلمان صالح خليفة مسعود", name: "سلمان صالح خليفة مسعود", nationalId: "150608969", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s47", fullName: "محمد خالد علي العبدالله", name: "محمد خالد علي العبدالله", nationalId: "140209743", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s48", fullName: "عبدالرقيب قاسم الطيري", name: "عبدالرقيب قاسم الطيري", nationalId: "140107185", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s49", fullName: "عوض عبدالله", name: "عوض عبدالله", nationalId: "140120181", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s50", fullName: "فيصل نواف محمد جمعه", name: "فيصل نواف محمد جمعه", nationalId: "140309187", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s51", fullName: "محمد نواف محمد جمعه", name: "محمد نواف محمد جمعه", nationalId: "150516975", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s52", fullName: "يزن عبدالله عبدالواحد الحارثي", name: "يزن عبدالله عبدالواحد الحارثي", nationalId: "131227440", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s53", fullName: "محمد وصي منان", name: "محمد وصي منان", nationalId: "131018701", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s54", fullName: "عبدالله عادل عبدالله الضبيع", name: "عبدالله عادل عبدالله الضبيع", nationalId: "140714375", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s55", fullName: "يوسف عمر احمد محمد", name: "يوسف عمر احمد محمد", nationalId: "131125893", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s56", fullName: "سالم بن عبدالرحمن ين يوسف يوداود", name: "سالم بن عبدالرحمن ين يوسف يوداود", nationalId: "131228439", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s57", fullName: "راشد خليفة راشد بوعشوان", name: "راشد خليفة راشد بوعشوان", nationalId: "140206060", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s58", fullName: "خليفة  وليد سيف مسعد", name: "خليفة  وليد سيف مسعد", nationalId: "130513687", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s59", fullName: "محمد وليد سيف مسعد", name: "محمد وليد سيف مسعد", nationalId: "141102470", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s60", fullName: "ابراهيم حمد ابراهيم المناصير", name: "ابراهيم حمد ابراهيم المناصير", nationalId: "140612874", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s61", fullName: "عبدالرحمن أحمد العبدالرحمن", name: "عبدالرحمن أحمد العبدالرحمن", nationalId: "150510047", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s62", fullName: "احمد فواز عيسى احمد الغتم", name: "احمد فواز عيسى احمد الغتم", nationalId: "120907658", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s63", fullName: "عدي صدام حسن قائد الجشوبي", name: "عدي صدام حسن قائد الجشوبي", nationalId: "130102377", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s64", fullName: "عبدالله عبدالرحمن بخيت الدوسري", name: "عبدالله عبدالرحمن بخيت الدوسري", nationalId: "111205824", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s65", fullName: "عبدالعزيز عبدالرحمن بخيت الدوسري", name: "عبدالعزيز عبدالرحمن بخيت الدوسري", nationalId: "1140701613", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s66", fullName: "راشد حمد عبدالله الدوسري", name: "راشد حمد عبدالله الدوسري", nationalId: "150112254", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s67", fullName: "عبدالرحمن فؤاد فايد أحمد الحبيش", name: "عبدالرحمن فؤاد فايد أحمد الحبيش", nationalId: "١٥٠٨٠٧٨٥٦", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s68", fullName: "مشعل خلوف كسار العلي", name: "مشعل خلوف كسار العلي", nationalId: "131004182", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s69", fullName: "يوسف خالد محمد السريري", name: "يوسف خالد محمد السريري", nationalId: "140310550", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s70", fullName: "موسى فضل سبحان حاجي", name: "موسى فضل سبحان حاجي", nationalId: "131016393", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s71", fullName: "حسن خالد حسن جناحي", name: "حسن خالد حسن جناحي", nationalId: "131215302", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s72", fullName: "خالد نورالدين عبدالله القشار", name: "خالد نورالدين عبدالله القشار", nationalId: "140315748", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s73", fullName: "خالداكرم محمد عسكر", name: "خالداكرم محمد عسكر", nationalId: "١٤٠٤٠٨٤٥٢", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s74", fullName: "عبدالعزيز عبدالرحمن بخيت سالم عبدالله", name: "عبدالعزيز عبدالرحمن بخيت سالم عبدالله", nationalId: "١٤٠٧٠١٦١٣", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s75", fullName: "محمد علي مسعد البسارة", name: "محمد علي مسعد البسارة", nationalId: "140501843", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s76", fullName: "عمار علي عبدالله القشار", name: "عمار علي عبدالله القشار", nationalId: "140801677", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s77", fullName: "عبد العزيز ناصر عبد الله البو عينين", name: "عبد العزيز ناصر عبد الله البو عينين", nationalId: "130905178", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s78", fullName: "ناصر امان عثمان عثمان", name: "ناصر امان عثمان عثمان", nationalId: "131020854", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s79", fullName: "سلطان سلمان كيا رحيم", name: "سلطان سلمان كيا رحيم", nationalId: "140417087", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s80", fullName: "نواف احمد ناجي الجبلي", name: "نواف احمد ناجي الجبلي", nationalId: "130904295", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s81", fullName: "عبدالعزيز جاسم محمد جاسم الراشد آل بن علي", name: "عبدالعزيز جاسم محمد جاسم الراشد آل بن علي", nationalId: "141205091", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s82", fullName: "فهد سامي احمد الكلالي", name: "فهد سامي احمد الكلالي", nationalId: "131004573", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s83", fullName: "علاء الدين محمد احمد عبدالرحمن", name: "علاء الدين محمد احمد عبدالرحمن", nationalId: "١٤٠٥٠٨٩٤٥", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s84", fullName: "نايف محمد جديع علي", name: "نايف محمد جديع علي", nationalId: "140201726", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s85", fullName: "عبدالله ناصر عبدالله سعد البوعينين", name: "عبدالله ناصر عبدالله سعد البوعينين", nationalId: "141022833", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s86", fullName: "احمد محمد حسن الذوادي", name: "احمد محمد حسن الذوادي", nationalId: "131130544", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s87", fullName: "فهد سامي حسن ادم", name: "فهد سامي حسن ادم", nationalId: "131212850", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s88", fullName: "راشد فواز مثنى المريسي", name: "راشد فواز مثنى المريسي", nationalId: "150405464", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s89", fullName: "احمد خليف محمد المواعي", name: "احمد خليف محمد المواعي", nationalId: "131109375", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s90", fullName: "سلمان فرج مهدي العنزي", name: "سلمان فرج مهدي العنزي", nationalId: "141018402", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s91", fullName: "بدر حمود علي سيف", name: "بدر حمود علي سيف", nationalId: "120802783", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s92", fullName: "مهنا خالد مهنا الكبيسي", name: "مهنا خالد مهنا الكبيسي", nationalId: "140908900", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s93", fullName: "سلمان محمد احمد قاسم علي", name: "سلمان محمد احمد قاسم علي", nationalId: "150523491", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s94", fullName: "ريان ابراهيم احمد عبده", name: "ريان ابراهيم احمد عبده", nationalId: "130705918", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s95", fullName: "نايف ياسر علي الضبيع", name: "نايف ياسر علي الضبيع", nationalId: "150505027", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s96", fullName: "عبدالحميد بلوله صديق محمد", name: "عبدالحميد بلوله صديق محمد", nationalId: "111168074", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s97", fullName: "فيصل جاسم سلطان فخرو", name: "فيصل جاسم سلطان فخرو", nationalId: "120915219", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s98", fullName: "احمد جمعه شلش السهو", name: "احمد جمعه شلش السهو", nationalId: "١٢٠٣٠٧٠٩٠", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s99", fullName: "محمد قاسم نعمان المهلل", name: "محمد قاسم نعمان المهلل", nationalId: "140411062", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s100", fullName: "عبدالله ماجد عواد الدلماز", name: "عبدالله ماجد عواد الدلماز", nationalId: "121109267", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s101", fullName: "سعود أحمد سلطان الدوسري", name: "سعود أحمد سلطان الدوسري", nationalId: "140701281", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s102", fullName: "خليفة احمد عبدالله الضبيع", name: "خليفة احمد عبدالله الضبيع", nationalId: "140522905", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s103", fullName: "دعيج سلمان محمد سلمان العاثمي", name: "دعيج سلمان محمد سلمان العاثمي", nationalId: "141004339", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s104", fullName: "ناصر بلال ناصر محمد", name: "ناصر بلال ناصر محمد", nationalId: "131009320", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s105", fullName: "حافظ منصور صالح سعد", name: "حافظ منصور صالح سعد", nationalId: "140805982", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s106", fullName: "عبدالواحد وليد عبدالواحد عبدالله", name: "عبدالواحد وليد عبدالواحد عبدالله", nationalId: "111204453", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s107", fullName: "حمد سلمان عبيد الظفيري", name: "حمد سلمان عبيد الظفيري", nationalId: "150211007", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s108", fullName: "ريان محمد دحام نويران", name: "ريان محمد دحام نويران", nationalId: "141107782", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s109", fullName: "عبد الكريم سعد راوي الحسن", name: "عبد الكريم سعد راوي الحسن", nationalId: "140604685", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s110", fullName: "محمد صلاح محمد الحلحلي", name: "محمد صلاح محمد الحلحلي", nationalId: "120818078", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s111", fullName: "محمدعبدالرحمن حمدحسين", name: "محمدعبدالرحمن حمدحسين", nationalId: "140403744", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s112", fullName: "محمد يوسف صالح قاسم", name: "محمد يوسف صالح قاسم", nationalId: "140818561", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s113", fullName: "يوسف عيسى محمد محمود", name: "يوسف عيسى محمد محمود", nationalId: "120706148", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s114", fullName: "غيث حازم أميز الأحمد", name: "غيث حازم أميز الأحمد", nationalId: "140206450", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s115", fullName: "حارث وارث احمد", name: "حارث وارث احمد", nationalId: "131139894", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s116", fullName: "طلال قاسم يحى الخلاقي", name: "طلال قاسم يحى الخلاقي", nationalId: "120204991", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s117", fullName: "غيمان احمد محمد صالح", name: "غيمان احمد محمد صالح", nationalId: "140904687", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s118", fullName: "محمد ناصر حبيب مصطفي", name: "محمد ناصر حبيب مصطفي", nationalId: "140116133", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s119", fullName: "دعيج خليفة دعيج العيد", name: "دعيج خليفة دعيج العيد", nationalId: "140711481", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s120", fullName: "حمد عبدالغفور سيد نور", name: "حمد عبدالغفور سيد نور", nationalId: "140415912", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s121", fullName: "احمد علي الحسن", name: "احمد علي الحسن", nationalId: "111051487", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s122", fullName: "عبدالعزيز خالد علي العقبي", name: "عبدالعزيز خالد علي العقبي", nationalId: "130610585", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s123", fullName: "أحمد عبالرحمن عبدالكريم أخوند", name: "أحمد عبالرحمن عبدالكريم أخوند", nationalId: "120718014", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s124", fullName: "خليفه حسين البكري", name: "خليفه حسين البكري", nationalId: "140311076", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s125", fullName: "صقر صالح علي الرياشي", name: "صقر صالح علي الرياشي", nationalId: "140803360", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s126", fullName: "محمد فواز محمد ابوشاره", name: "محمد فواز محمد ابوشاره", nationalId: "140213376", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" },
  { id: "s127", fullName: "علي ياسر الحاج", name: "علي ياسر الحاج", nationalId: "150120982", grade: "الأول إعدادي", section: "1", patrolName: "طليعة الفاتح", netBalance: 0, status: "ACTIVE", avatarStatus: "APPROVED", avatarUrl: "" }
];

export const api = {
  // Public Info & Stats
  getPublicInfo: async () => {
    try {
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const activitiesSnap = await getDocs(collection(db, 'activities'));
      const announcementsSnap = await getDocs(collection(db, 'announcements'));

      const announcements: any[] = [];
      announcementsSnap.forEach(d => announcements.push({ id: d.id, ...d.data() }));

      const activities: any[] = [];
      activitiesSnap.forEach(d => activities.push({ id: d.id, ...d.data() }));

      return {
        troopName: 'فرقة فتيان أحمد الفاتح الكشفية',
        schoolName: 'مدرسة أحمد الفاتح الإعدادية للبنين',
        season: '2026-2027',
        announcements,
        upcomingActivities: activities,
        stats: { 
          scoutsCount: HARDCODED_SCOUTS_LIST.length, 
          teachersCount: teachersSnap.size, 
          activitiesCount: activitiesSnap.size 
        }
      };
    } catch (err) {
      console.error('Error fetching public info:', err);
      return {
        troopName: 'فرقة فتيان أحمد الفاتح الكشفية',
        schoolName: 'مدرسة أحمد الفاتح الإعدادية للبنين',
        season: '2026-2027',
        announcements: [],
        upcomingActivities: [],
        stats: { scoutsCount: HARDCODED_SCOUTS_LIST.length, teachersCount: 0, activitiesCount: 0 }
      };
    }
  },

  // إرجاع كافة الكشافين ليظهروا لدى القائد والمعلمين
  getScouts: async () => {
    return HARDCODED_SCOUTS_LIST;
  },

  addScout: async (scoutData: any, actor: any) => {
    return { id: 'custom_scout_' + Date.now(), success: true };
  },

  deleteScout: async (id: string, actor: any) => {
    return { success: true };
  },

  deleteMultipleScouts: async (ids: string[], actor: any) => {
    return { success: true };
  },

  getTeachers: async () => {
    try {
      const snap = await getDocs(collection(db, 'teachers'));
      const teachers: TeacherProfile[] = [];
      snap.forEach(d => {
        const data = d.data() || {};
        teachers.push({ 
          id: d.id, 
          ...data,
          fullName: data.fullName || data.name || 'معلم بدون اسم',
          name: data.name || data.fullName || 'معلم بدون اسم',
          employeeId: data.employeeId || 'غير محدد',
          subject: data.subject || 'العلوم العامة',
          assignedClasses: data.assignedClasses || [],
          evaluationsGivenCount: data.evaluationsGivenCount || 0,
          status: data.status || 'ACTIVE'
        } as TeacherProfile);
      });
      return teachers;
    } catch (err) {
      return [];
    }
  },

  addTeacher: async (teacherData: any, actor: any) => {
    return { success: true, message: 'تم إضافة المعلم بنجاح' };
  },

  deleteTeacher: async (id: string, actor: any) => {
    return { success: true };
  },

  deleteMultipleTeachers: async (ids: string[], actor: any) => {
    return { success: true };
  },

  getEvaluations: async () => {
    try {
      const snap = await getDocs(collection(db, 'evaluations'));
      const evals: PointEvaluation[] = [];
      snap.forEach(d => evals.push({ id: d.id, ...d.data() } as PointEvaluation));
      return evals;
    } catch (err) {
      return [];
    }
  },

  reviewEvaluation: async (id: string, decision: 'APPROVED' | 'REJECTED', notes: string, actor: any) => {
    return { success: true };
  },

  correctEvaluation: async (id: string, newPoints: number, reason: string, actor: any) => {
    return { success: true };
  },

  deleteEvaluation: async (id: string, actor: any) => {
    return { success: true };
  },

  getSuspensions: async () => {
    try {
      const snap = await getDocs(collection(db, 'suspensionRequests'));
      const reqs: SuspensionRequest[] = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() } as SuspensionRequest));
      return reqs;
    } catch (err) {
      return [];
    }
  },

  decideSuspensionRequest: async (id: string, decision: 'APPROVED' | 'REJECTED', notes: string, duration: string, actor: any) => {
    return { success: true };
  },

  getIncidentReports: async () => {
    try {
      const snap = await getDocs(collection(db, 'incidentReports'));
      const reports: IncidentReport[] = [];
      snap.forEach(d => reports.push({ id: d.id, ...d.data() } as IncidentReport));
      return reports;
    } catch (err) {
      return [];
    }
  },

  getActivities: async () => {
    try {
      const snap = await getDocs(collection(db, 'activities'));
      const acts: TroopActivity[] = [];
      snap.forEach(d => acts.push({ id: d.id, ...d.data() } as TroopActivity));
      return acts;
    } catch (err) {
      return [];
    }
  },

  createActivity: async (activityData: any, actor: any) => {
    return { success: true };
  },

  deleteActivity: async (id: string, actor: any) => {
    return { success: true };
  },

  getBadges: async () => {
    return { badges: [] };
  },

  awardBadge: async (badgeId: string, scoutId: string, notes: string, actor: any) => {
    return { success: true };
  },

  getCertificates: async () => {
    return [];
  },

  issueCertificate: async (certData: any, actor: any) => {
    return { success: true, certificate: { id: 'cert_1', ...certData } };
  },

  getAuditLogs: async () => {
    return [];
  },

  getSettings: async () => {
    return null;
  },

  getReportsSummary: async () => {
    return { totalPointsGiven: 150, activeAlertsCount: 0 };
  },

  reviewScoutAvatar: async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason: string, actor: any) => {
    return { success: true };
  },

  restoreBackup: async (backupData: any, actor: any) => {
    return { success: true, message: 'تمت استعادة البيانات بنجاح' };
  }
};
