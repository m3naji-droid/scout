import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ScoutBadge, Certificate, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';

export const api = {
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
      return [];
    }
  },

  addScout: async (scoutData: { fullName: string, nationalId: string, grade: string, section?: string, patrolName?: string }, actor: any) => {
    try {
      const scoutRef = await addDoc(collection(db, 'scouts'), {
        fullName: scoutData.fullName,
        name: scoutData.fullName,
        nationalId: scoutData.nationalId,
        grade: scoutData.grade,
        section: scoutData.section || '1',
        patrolName: scoutData.patrolName || 'طليعة الفاتح',
        totalPositivePoints: 0,
        totalDeductions: 0,
        netBalance: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'users'), {
        username: scoutData.fullName.trim(),
        passwordHash: String(scoutData.nationalId).trim(),
        fullName: scoutData.fullName,
        name: scoutData.fullName,
        role: 'SCOUT',
        scoutId: scoutRef.id,
        isActive: true,
        createdAt: new Date().toISOString()
      });

      return { id: scoutRef.id, success: true };
    } catch (err: any) {
      throw new Error('فشل إضافة الكشاف: ' + err.message);
    }
  },

  // الاستيراد الجماعي المطور مع تحديد الصف والشعبة بدقة
  importScoutsBulk: async (scoutsArray: Array<{ fullName: string, nationalId: string, grade: string, section: string }>, actor: any) => {
    try {
      let count = 0;
      for (const item of scoutsArray) {
        if (!item.fullName || !item.nationalId) continue;
        
        const scoutRef = await addDoc(collection(db, 'scouts'), {
          fullName: String(item.fullName).trim(),
          name: String(item.fullName).trim(),
          nationalId: String(item.nationalId).trim(),
          grade: item.grade || 'الأول إعدادي',
          section: String(item.section || '1'),
          patrolName: 'طليعة الفاتح',
          totalPositivePoints: 0,
          totalDeductions: 0,
          netBalance: 0,
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        });

        await addDoc(collection(db, 'users'), {
          username: String(item.fullName).trim(),
          passwordHash: String(item.nationalId).trim(),
          fullName: String(item.fullName).trim(),
          name: String(item.fullName).trim(),
          role: 'SCOUT',
          scoutId: scoutRef.id,
          isActive: true,
          createdAt: new Date().toISOString()
        });

        count++;
      }
      return { success: true, count };
    } catch (err: any) {
      throw new Error('فشل الاستيراد الجماعي: ' + err.message);
    }
  },

  deleteScout: async (id: string, actor: any) => {
    await deleteDoc(doc(db, 'scouts', id));
    return { success: true };
  },

  deleteMultipleScouts: async (ids: string[], actor: any) => {
    for (const id of ids) {
      await deleteDoc(doc(db, 'scouts', id));
    }
    return { success: true };
  },

  addPointsToScout: async (scoutId: string, points: number, reason: string, actor: any) => {
    await addDoc(collection(db, 'evaluations'), {
      scoutId,
      points,
      behaviorCategory: reason,
      type: points >= 0 ? 'POSITIVE' : 'NEGATIVE',
      status: 'APPROVED',
      evaluatorName: actor?.name || 'القائد',
      createdAt: new Date().toISOString()
    });
    return { success: true };
  },

  awardBadgeToScout: async (scoutId: string, badgeId: string, notes: string, actor: any) => {
    await addDoc(collection(db, 'awardedBadges'), {
      scoutId,
      badgeId,
      notes,
      awardedBy: actor?.name || 'القائد',
      awardedAt: new Date().toISOString()
    });
    return { success: true };
  },

  getTeachers: async () => {
    const snap = await getDocs(collection(db, 'teachers'));
    const teachers: TeacherProfile[] = [];
    snap.forEach(d => teachers.push({ id: d.id, ...d.data() } as TeacherProfile));
    return teachers;
  },

  addTeacher: async (data: any, actor: any) => {
    const ref = await addDoc(collection(db, 'teachers'), { ...data, status: 'ACTIVE', createdAt: new Date().toISOString() });
    return { id: ref.id, success: true };
  },

  deleteTeacher: async (id: string, actor: any) => {
    await deleteDoc(doc(db, 'teachers', id));
    return { success: true };
  },

  deleteMultipleTeachers: async (ids: string[], actor: any) => {
    for (const id of ids) {
      await deleteDoc(doc(db, 'teachers', id));
    }
    return { success: true };
  },

  getBadges: async () => {
    return { badges: [
      { id: 'b1', name: 'شارة التفوق الكشفي', description: 'تميز' },
      { id: 'b2', name: 'شارة الانضباط', description: 'انتظام' }
    ] };
  }
};
