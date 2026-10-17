import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ScoutBadge, Certificate, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

export const api = {
  // Public Info & Stats
  getPublicInfo: async () => {
    try {
      const scoutsSnap = await getDocs(collection(db, 'scouts'));
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
          scoutsCount: scoutsSnap.size, 
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
        stats: { scoutsCount: 0, teachersCount: 0, activitiesCount: 0 }
      };
    }
  },

  // ==================== SCOUTS MANAGEMENT (قاعدة البيانات مباشرة) ====================
  getScouts: async () => {
    try {
      const snap = await getDocs(collection(db, 'scouts'));
      const scouts: ScoutProfile[] = [];
      snap.forEach(d => {
        const data = d.data() || {};
        scouts.push({ 
          id: d.id, 
          ...data,
          fullName: data.fullName || data.name || 'كشاف بدون اسم',
          name: data.name || data.fullName || 'كشاف بدون اسم',
          nationalId: data.nationalId || '',
          grade: data.grade || 'الأول إعدادي',
          section: data.section || '1',
          netBalance: data.netBalance || 0
        } as ScoutProfile);
      });
      return scouts;
    } catch (err) {
      console.error('Error fetching scouts:', err);
      return [];
    }
  },

  // إضافة كشاف فردي مع توزيع الصفوف والشعبة والرقّم الشخصي
  addScout: async (scoutData: { fullName: string, nationalId: string, grade: string, section?: string, patrolName?: string, parentName?: string, parentPhone?: string }, actor: any) => {
    try {
      const scoutRef = await addDoc(collection(db, 'scouts'), {
        fullName: scoutData.fullName,
        name: scoutData.fullName,
        nationalId: scoutData.nationalId,
        grade: scoutData.grade || 'الأول إعدادي',
        section: scoutData.section || '1',
        patrolName: scoutData.patrolName || 'طليعة الفاتح',
        parentName: scoutData.parentName || '',
        parentPhone: scoutData.parentPhone || '',
        totalPositivePoints: 0,
        totalDeductions: 0,
        netBalance: 0,
        badgeCount: 0,
        activitiesAttendedCount: 0,
        registrationYear: '2026-2027',
        status: 'ACTIVE',
        avatarStatus: 'APPROVED',
        avatarUrl: '',
        createdAt: new Date().toISOString()
      });

      // إنشاء حساب دخول للكشاف برقمة الشخصي واسمه
      await addDoc(collection(db, 'users'), {
        username: scoutData.fullName,
        passwordHash: scoutData.nationalId,
        fullName: scoutData.fullName,
        name: scoutData.fullName,
        role: 'SCOUT',
        scoutId: scoutRef.id,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'auditLogs'), {
        action: 'ADD_SCOUT',
        details: `أضاف القائد ${actor?.name || 'السيستم'} الكشاف ${scoutData.fullName}`,
        actorName: actor?.name || 'القائد',
        createdAt: new Date().toISOString()
      });

      return { id: scoutRef.id, success: true };
    } catch (err: any) {
      throw new Error('فشل إضافة الكشاف: ' + err.message);
    }
  },

  // حذف كشاف فردي نهائياً من قاعدة البيانات
  deleteScout: async (id: string, actor: any) => {
    try {
      await deleteDoc(doc(db, 'scouts', id));
      await addDoc(collection(db, 'auditLogs'), {
        action: 'DELETE_SCOUT',
        details: `حذف القائد ${actor?.name || 'السيستم'} الكشاف برقم معرف: ${id}`,
        actorName: actor?.name || 'القائد',
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل حذف الكشاف: ' + err.message);
    }
  },

  // الحذف الجماعي للكشافين المحددين
  deleteMultipleScouts: async (ids: string[], actor: any) => {
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, 'scouts', id));
      }
      await addDoc(collection(db, 'auditLogs'), {
        action: 'DELETE_MULTIPLE_SCOUTS',
        details: `حذف القائد ${actor?.name || 'السيستم'} دفعة كشافين بعدد: ${ids.length}`,
        actorName: actor?.name || 'القائد',
        createdAt: new Date().toISOString()
      });
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل الحذف الجماعي للكشافين: ' + err.message);
    }
  },

  // إضافة نقاط للكشاف بواسطة القائد لتظهر فوراً
  addPointsToScout: async (scoutId: string, points: number, reason: string, actor: any) => {
    try {
      await addDoc(collection(db, 'evaluations'), {
        scoutId,
        points,
        behaviorCategory: reason,
        type: points >= 0 ? 'POSITIVE' : 'NEGATIVE',
        status: 'APPROVED',
        evaluatorName: actor?.name || 'القائد',
        createdAt: new Date().toISOString()
      });
      return { success: true, message: 'تم إضافة النقاط بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة النقاط: ' + err.message);
    }
  },

  // منح شارة للكشاف بواسطة القائد لتظهر فوراً
  awardBadgeToScout: async (scoutId: string, badgeId: string, notes: string, actor: any) => {
    try {
      await addDoc(collection(db, 'awardedBadges'), {
        scoutId,
        badgeId,
        notes,
        awardedBy: actor?.name || 'القائد',
        awardedAt: new Date().toISOString()
      });
      return { success: true, message: 'تم منح الشارة بنجاح' };
    } catch (err: any) {
      throw new Error('فشل منح الشارة: ' + err.message);
    }
  },

  // ==================== TEACHERS MANAGEMENT ====================
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
      console.error('Error fetching teachers:', err);
      return [];
    }
  },

  addTeacher: async (teacherData: { fullName: string, employeeId: string, subject?: string, assignedClasses?: string[] }, actor: any) => {
    try {
      const teacherRef = await addDoc(collection(db, 'teachers'), {
        fullName: teacherData.fullName,
        name: teacherData.fullName,
        employeeId: teacherData.employeeId,
        subject: teacherData.subject || 'العلوم العامة',
        assignedClasses: teacherData.assignedClasses || ['الأول إعدادي - 1'],
        evaluationsGivenCount: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'users'), {
        username: teacherData.employeeId,
        passwordHash: teacherData.employeeId,
        fullName: teacherData.fullName,
        name: teacherData.fullName,
        role: 'TEACHER',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      return { id: teacherRef.id, success: true, message: 'تم إضافة المعلم بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة المعلم: ' + err.message);
    }
  },

  deleteTeacher: async (id: string, actor: any) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل حذف المعلم: ' + err.message);
    }
  },

  deleteMultipleTeachers: async (ids: string[], actor: any) => {
    try {
      for (const id of ids) {
        await deleteDoc(doc(db, 'teachers', id));
      }
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل الحذف الجماعي للمعلمين: ' + err.message);
    }
  },

  // ==================== EVALUATIONS & BADGES ====================
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

  deleteEvaluation: async (id: string, actor: any) => {
    try {
      await deleteDoc(doc(db, 'evaluations', id));
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل حذف التقييم: ' + err.message);
    }
  },

  getBadges: async () => {
    try {
      const snap = await getDocs(collection(db, 'badges'));
      const badges: ScoutBadge[] = [];
      snap.forEach(d => badges.push({ id: d.id, ...d.data() } as ScoutBadge));
      return { badges: badges.length > 0 ? badges : [
        { id: 'b1', name: 'شارة التفوق الكشفي', description: 'منحت للتميز المستمر' },
        { id: 'b2', name: 'شارة الانضباط والانتظام', description: 'لالتزام بالزي والمواعيد' }
      ] };
    } catch (err) {
      return { badges: [] };
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

  deleteActivity: async (id: string, actor: any) => {
    try {
      await deleteDoc(doc(db, 'activities', id));
      return { success: true };
    } catch (err: any) {
      throw new Error('فشل الحذف: ' + err.message);
    }
  },

  getAuditLogs: async () => {
    try {
      const snap = await getDocs(collection(db, 'auditLogs'));
      const logs: AuditLogItem[] = [];
      snap.forEach(d => logs.push({ id: d.id, ...d.data() } as AuditLogItem));
      return logs;
    } catch (err) {
      return [];
    }
  },

  getSettings: async () => {
    try {
      const docRef = doc(db, 'settings', 'site_config');
      const snap = await getDoc(docRef);
      return snap.exists() ? (snap.data() as SiteSettings) : null;
    } catch (err) {
      return null;
    }
  }
};
