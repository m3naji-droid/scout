import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ScoutProfile, TeacherProfile } from '../types';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  scoutProfile: ScoutProfile | null;
  linkedScouts: ScoutProfile[];
  selectedLinkedScout: ScoutProfile | null;
  setSelectedLinkedScoutId: (id: string) => void;
  teacherProfile: TeacherProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// قائمة الكشافين الرسمية (اسم المستخدم هو الاسم، وكلمة المرور هي الرقم الشخصي)
const HARDCODED_SCOUTS = [
  { id: "scout_1", fullName: "علي شوقي علي الكلالي", nationalId: "120407310", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_2", fullName: "حمزة محمد صبحي محمد عبد العزيز", nationalId: "130815780", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_3", fullName: "محمد عبدالرحمن فايز الرواحي", nationalId: "130912026", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_4", fullName: "فارس مصطفي عبدالعزيز عبدالله", nationalId: "130403679", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_5", fullName: "عمار نادر أحمد رحيمي", nationalId: "121224619", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_6", fullName: "علي عادل عبد الرحيم محمد", nationalId: "120612372", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_7", fullName: "محمد حسين محمد سالم", nationalId: "111127564", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_8", fullName: "سلطان حمد سلطان صالح", nationalId: "130705365", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_9", fullName: "حسين وليد محمد سليم", nationalId: "130517895", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_10", fullName: "خالد سند بشر الرويعي", nationalId: "130502758", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_11", fullName: "البدر سند الرويعي", nationalId: "140816666", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_12", fullName: "خالد رجب عقاب المحميد", nationalId: "120205149", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_13", fullName: "عبدالرحمن عمار مثنى الماطري", nationalId: "121100995", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_14", fullName: "عبد الرحمن ناصر عبدالله البوعينين", nationalId: "120710617", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_15", fullName: "سلمان سالم بحر", nationalId: "130105600", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_16", fullName: "خالد سالم بحر", nationalId: "130105597", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_17", fullName: "أحمد عبدالله صالح طاهر", nationalId: "121010864", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_18", fullName: "حمد توفيق مسعد الظبيع", nationalId: "121206793", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_19", fullName: "عبدالله عمر محمد الرضي", nationalId: "130706043", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_20", fullName: "يوسف أيمن العجمي حسب النبي", nationalId: "121227804", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_21", fullName: "يوسف جاسم يوسف النعيمي", nationalId: "120135337", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_22", fullName: "زياد طاهر عبدالله حسن", nationalId: "120318903", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_23", fullName: "سلطان أحمد سلطان الدوسري", nationalId: "١٣٠٦٠١٨٣٧", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_24", fullName: "عبدالله عامر رضا", nationalId: "١٣٠٣١٢٥٧٧", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_25", fullName: "عهد عهدي أحمد الحصيني", nationalId: "130622761", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_26", fullName: "ناصر وهاب محمد السهو", nationalId: "121016048", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_27", fullName: "اثنيان خليفة مشرف اثنيان", nationalId: "120709325", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_28", fullName: "بندر تيسير حمود فنتوخ", nationalId: "130903752", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_29", fullName: "عيسى وليد عبدالواحد محمد", nationalId: "130303542", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_30", fullName: "معاذ محمد محسن أحمد", nationalId: "120603063", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_31", fullName: "يوسف سلمان يوسف الدوسري", nationalId: "120903652", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_32", fullName: "وضاح بدر محمد ردمان محمد", nationalId: "130616150", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_33", fullName: "حسام محمد السيد المسلماني", nationalId: "130720909", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_34", fullName: "راكان محمد سالم الخلاقي", nationalId: "130524212", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_35", fullName: "جاسم مهران احمد راشد", nationalId: "130707813", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_36", fullName: "احمد مهران احمد راشد", nationalId: "130707791", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_37", fullName: "همام ماهر فتيخ خلف", nationalId: "130807923", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_38", fullName: "خليفة بشار محمد المريسي", nationalId: "120606488", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_39", fullName: "خليفة سامي محمد قاسم علوان", nationalId: "120203758", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_40", fullName: "حمدان هاني محمد الطريمي", nationalId: "120617870", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_41", fullName: "ابراهيم محمد حسين الحردان", nationalId: "130808652", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_42", fullName: "حمد عصام الطيري", nationalId: "110503783", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_43", fullName: "عبد الحمن غازي محسن علي", nationalId: "130402915", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_44", fullName: "نواف سعود عباد المرشد", nationalId: "١٢٠٦١٠٤٠٠", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_45", fullName: "محمد صلاح محمد البرطي", nationalId: "131011693", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_46", fullName: "سلمان صالح خليفة مسعود", nationalId: "150608969", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_47", fullName: "محمد خالد علي العبدالله", nationalId: "140209743", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_48", fullName: "عبدالرقيب قاسم الطيري", nationalId: "140107185", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_49", fullName: "عوض عبدالله", nationalId: "140120181", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_50", fullName: "فيصل نواف محمد جمعه", nationalId: "140309187", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_51", fullName: "محمد نواف محمد جمعه", nationalId: "150516975", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_52", fullName: "يزن عبدالله عبدالواحد الحارثي", nationalId: "131227440", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_53", fullName: "محمد وصي منان", nationalId: "131018701", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_54", fullName: "عبدالله عادل عبدالله الضبيع", nationalId: "140714375", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_55", fullName: "يوسف عمر احمد محمد", nationalId: "131125893", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_56", fullName: "سالم بن عبدالرحمن ين يوسف يوداود", nationalId: "131228439", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_57", fullName: "راشد خليفة راشد بوعشوان", nationalId: "140206060", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_58", fullName: "خليفة  وليد سيف مسعد", nationalId: "130513687", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_59", fullName: "محمد وليد سيف مسعد", nationalId: "141102470", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_60", fullName: "ابراهيم حمد ابراهيم المناصير", nationalId: "140612874", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_61", fullName: "عبدالرحمن أحمد العبدالرحمن", nationalId: "150510047", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_62", fullName: "احمد فواز عيسى احمد الغتم", nationalId: "120907658", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_63", fullName: "عدي صدام حسن قائد الجشوبي", nationalId: "130102377", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_64", fullName: "عبدالله عبدالرحمن بخيت الدوسري", nationalId: "111205824", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_65", fullName: "عبدالعزيز عبدالرحمن بخيت الدوسري", nationalId: "1140701613", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_66", fullName: "راشد حمد عبدالله الدوسري", nationalId: "150112254", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_67", fullName: "عبدالرحمن فؤاد فايد أحمد الحبيش", nationalId: "١٥٠٨٠٧٨٥٦", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_68", fullName: "مشعل خلوف كسار العلي", nationalId: "131004182", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_69", fullName: "يوسف خالد محمد السريري", nationalId: "140310550", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_70", fullName: "موسى فضل سبحان حاجي", nationalId: "131016393", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_71", fullName: "حسن خالد حسن جناحي", nationalId: "131215302", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_72", fullName: "خالد نورالدين عبدالله القشار", nationalId: "140315748", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_73", fullName: "خالداكرم محمد عسكر", nationalId: "١٤٠٤٠٨٤٥٢", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_74", fullName: "عبدالعزيز عبدالرحمن بخيت سالم عبدالله", nationalId: "١٤٠٧٠١٦١٣", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_75", fullName: "محمد علي مسعد البسارة", nationalId: "140501843", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_76", fullName: "عمار علي عبدالله القشار", nationalId: "140801677", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_77", fullName: "عبد العزيز ناصر عبد الله البو عينين", nationalId: "130905178", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_78", fullName: "ناصر امان عثمان عثمان", nationalId: "131020854", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_79", fullName: "سلطان سلمان كيا رحيم", nationalId: "140417087", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_80", fullName: "نواف احمد ناجي الجبلي", nationalId: "130904295", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_81", fullName: "عبدالعزيز جاسم محمد جاسم الراشد آل بن علي", nationalId: "141205091", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_82", fullName: "فهد سامي احمد الكلالي", nationalId: "131004573", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_83", fullName: "علاء الدين محمد احمد عبدالرحمن", nationalId: "١٤٠٥٠٨٩٤٥", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_84", fullName: "نايف محمد جديع علي", nationalId: "140201726", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_85", fullName: "عبدالله ناصر عبدالله سعد البوعينين", nationalId: "141022833", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_86", fullName: "احمد محمد حسن الذوادي", nationalId: "131130544", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_87", fullName: "فهد سامي حسن ادم", nationalId: "131212850", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_88", fullName: "راشد فواز مثنى المريسي", nationalId: "150405464", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_89", fullName: "احمد خليف محمد المواعي", nationalId: "131109375", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_90", fullName: "سلمان فرج مهدي العنزي", nationalId: "141018402", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_91", fullName: "بدر حمود علي سيف", nationalId: "120802783", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_92", fullName: "مهنا خالد مهنا الكبيسي", nationalId: "140908900", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_93", fullName: "سلمان محمد احمد قاسم علي", nationalId: "150523491", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_94", fullName: "ريان ابراهيم احمد عبده", nationalId: "130705918", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_95", fullName: "نايف ياسر علي الضبيع", nationalId: "150505027", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_96", fullName: "عبدالحميد بلوله صديق محمد", nationalId: "111168074", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_97", fullName: "فيصل جاسم سلطان فخرو", nationalId: "120915219", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_98", fullName: "احمد جمعه شلش السهو", nationalId: "١٢٠٣٠٧٠٩٠", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_99", fullName: "محمد قاسم نعمان المهلل", nationalId: "140411062", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_100", fullName: "عبدالله ماجد عواد الدلماز", nationalId: "121109267", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_101", fullName: "سعود أحمد سلطان الدوسري", nationalId: "140701281", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_102", fullName: "خليفة احمد عبدالله الضبيع", nationalId: "140522905", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_103", fullName: "دعيج سلمان محمد سلمان العاثمي", nationalId: "141004339", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_104", fullName: "ناصر بلال ناصر محمد", nationalId: "131009320", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_105", fullName: "حافظ منصور صالح سعد", nationalId: "140805982", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_106", fullName: "عبدالواحد وليد عبدالواحد عبدالله", nationalId: "111204453", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_107", fullName: "حمد سلمان عبيد الظفيري", nationalId: "150211007", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_108", fullName: "ريان محمد دحام نويران", nationalId: "141107782", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_109", fullName: "عبد الكريم سعد راوي الحسن", nationalId: "140604685", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_110", fullName: "محمد صلاح محمد الحلحلي", nationalId: "120818078", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_111", fullName: "محمدعبدالرحمن حمدحسين", nationalId: "140403744", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_112", fullName: "محمد يوسف صالح قاسم", nationalId: "140818561", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_113", fullName: "يوسف عيسى محمد محمود", nationalId: "120706148", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_114", fullName: "غيث حازم أميز الأحمد", nationalId: "140206450", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_115", fullName: "حارث وارث احمد", nationalId: "131139894", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_116", fullName: "طلال قاسم يحى الخلاقي", nationalId: "120204991", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_117", fullName: "غيمان احمد محمد صالح", nationalId: "140904687", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_118", fullName: "محمد ناصر حبيب مصطفي", nationalId: "140116133", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_119", fullName: "دعيج خليفة دعيج العيد", nationalId: "140711481", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_120", fullName: "حمد عبدالغفور سيد نور", nationalId: "140415912", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_121", fullName: "احمد علي الحسن", nationalId: "111051487", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_122", fullName: "عبدالعزيز خالد علي العقبي", nationalId: "130610585", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_123", fullName: "أحمد عبالرحمن عبدالكريم أخوند", nationalId: "120718014", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_124", fullName: "خليفه حسين البكري", nationalId: "140311076", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_125", fullName: "صقر صالح علي الرياشي", nationalId: "140803360", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_126", fullName: "محمد فواز محمد ابوشاره", nationalId: "140213376", grade: "الأول إعدادي", role: "SCOUT", isActive: true },
  { id: "scout_127", fullName: "علي ياسر الحاج", nationalId: "150120982", grade: "الأول إعدادي", role: "SCOUT", isActive: true }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scoutProfile, setScoutProfile] = useState<ScoutProfile | null>(null);
  const [linkedScouts, setLinkedScouts] = useState<ScoutProfile[]>([]);
  const [selectedLinkedScoutId, setSelectedLinkedScoutId] = useState<string>('');
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session safely from localStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('ahmed_alfateh_session');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.user) {
          setUser(parsed.user);
          setToken(parsed.token || null);
          setScoutProfile(parsed.scoutProfile || null);
          setLinkedScouts(parsed.linkedScouts || []);
          if (parsed.linkedScouts && parsed.linkedScouts.length > 0) {
            setSelectedLinkedScoutId(parsed.linkedScouts[0]?.id || '');
          }
          setTeacherProfile(parsed.teacherProfile || null);
        }
      }
    } catch (err) {
      console.error('Failed reading saved session:', err);
      localStorage.removeItem('ahmed_alfateh_session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const trimmedUser = (username || '').trim();
      const trimmedPass = (password || '').trim();

      // 1. التحقق الاستثنائي من القادة الثابتين (باسل / محمد)
      if ((trimmedUser === 'باسل' && trimmedPass === '1234') || (trimmedUser === 'محمد' && trimmedPass === '5678')) {
        const leaderUser = {
          id: trimmedUser === 'باسل' ? 'leader_basel' : 'leader_mohammed',
          username: trimmedUser,
          fullName: trimmedUser === 'باسل' ? 'القائد باسل حسن' : 'القائد محمد علي',
          role: 'LEADER',
          isActive: true
        };
        const sessionToken = `session_${leaderUser.id}_${Date.now()}`;
        setUser(leaderUser);
        setToken(sessionToken);
        localStorage.setItem('ahmed_alfateh_session', JSON.stringify({ user: leaderUser, token: sessionToken }));
        return;
      }

      // 2. التحقق من قائمة الكشافين المدمجة (الاسم كاسم مستخدم، والرقم الشخصي ككلمة مرور)
      const matchedScout = HARDCODED_SCOUTS.find(
        s => s.fullName.trim() === trimmedUser && s.nationalId.trim() === trimmedPass
      );

      if (matchedScout) {
        const scoutUser = {
          id: matchedScout.id,
          username: matchedScout.fullName,
          fullName: matchedScout.fullName,
          role: 'SCOUT',
          scoutId: matchedScout.id,
          isActive: true
        };
        const sessionToken = `session_${scoutUser.id}_${Date.now()}`;
        setUser(scoutUser);
        setToken(sessionToken);
        setScoutProfile(matchedScout as any);
        localStorage.setItem('ahmed_alfateh_session', JSON.stringify({
          user: scoutUser,
          token: sessionToken,
          scoutProfile: matchedScout
        }));
        return;
      }

      // 3. البحث الاحتياطي في قاعدة بيانات Firebase للمستخدمين الآخرين
      const usersSnap = await getDocs(collection(db, 'users'));
      let foundUser: any = null;

      usersSnap.forEach(docSnap => {
        const data = docSnap.data();
        const dbUsername = String(data.username || data.fullName || data.nationalId || data.employeeId || '').trim();
        
        if (dbUsername === trimmedUser) {
          foundUser = { id: docSnap.id, ...data };
        }
      });

      if (!foundUser) {
        throw new Error('اسم المستخدم غير مسجل في النظام');
      }

      if (foundUser.isActive === false) {
        throw new Error('هذا الحساب معطل حالياً');
      }

      if (foundUser.passwordHash && foundUser.passwordHash !== trimmedPass) {
        throw new Error('كلمة المرور غير صحيحة');
      }

      const sessionToken = `session_${foundUser.id}_${Date.now()}`;
      
      setUser(foundUser);
      setToken(sessionToken);
      setScoutProfile(null);
      setLinkedScouts([]);
      setSelectedLinkedScoutId('');
      setTeacherProfile(null);

      localStorage.setItem('ahmed_alfateh_session', JSON.stringify({
        user: foundUser,
        token: sessionToken,
        scoutProfile: null,
        linkedScouts: [],
        teacherProfile: null
      }));

    } catch (err: any) {
      console.error('Login error:', err);
      throw new Error(err.message || 'فشل تسجيل الدخول. يرجى التحقق من صحة البيانات.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setScoutProfile(null);
    setLinkedScouts([]);
    setSelectedLinkedScoutId('');
    setTeacherProfile(null);
    localStorage.removeItem('ahmed_alfateh_session');
  };

  const refreshUser = async () => {
    if (!user) return;
  };

  const selectedLinkedScout = linkedScouts.find(s => s.id === selectedLinkedScoutId) || linkedScouts[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        scoutProfile,
        linkedScouts,
        selectedLinkedScout,
        setSelectedLinkedScoutId,
        teacherProfile,
        token,
        isLoading,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
