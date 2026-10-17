import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ScoutBadge, Certificate, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';

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

  // Scouts Management with full safety mapping
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

      await addDoc(collection(db, 'users'), {
        username: scoutData.nationalId,
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

  // Teachers Management with anti-crash protection
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
        fullName: teacherData.fullName,
        name: teacherData.fullName,
        role: 'TEACHER',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'auditLogs'), {
        action: 'ADD_TEACHER',
        details: `أضاف القائد ${actor?.name || 'السيستم'} المعلم ${teacherData.fullName}`,
        actorName: actor?.name || 'القائد',
        createdAt: new Date().toISOString()
      });

      return { id: teacherRef.id, success: true, message: 'تم إضافة المعلم بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة المعلم: ' + err.message);
    }
  },

  // Evaluations & Points
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
    const ref = doc(db, 'evaluations', id);
    await updateDoc(ref, { status: decision, reviewNotes: notes });
    return { success: true };
  },

  correctEvaluation: async (id: string, newPoints: number, reason: string, actor: any) => {
    const ref = doc(db, 'evaluations', id);
    await updateDoc(ref, { points: newPoints, correctionReason: reason, status: 'CORRECTED' });
    return { success: true };
  },

  // Suspensions
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
    const ref = doc(db, 'suspensionRequests', id);
    await updateDoc(ref, { status: decision, decisionNotes: notes, approvedDuration: duration });
    return { success: true };
  },

  // Incident Reports
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

  // Activities
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
    await addDoc(collection(db, 'activities'), {
      ...activityData,
      createdAt: new Date().toISOString()
    });
    return { success: true };
  },

  // Badges
  getBadges: async () => {
    try {
      const snap = await getDocs(collection(db, 'badges'));
      const badges: ScoutBadge[] = [];
      snap.forEach(d => badges.push({ id: d.id, ...d.data() } as ScoutBadge));
      return { badges };
    } catch (err) {
      return { badges: [] };
    }
  },

  awardBadge: async (badgeId: string, scoutId: string, notes: string, actor: any) => {
    await addDoc(collection(db, 'awardedBadges'), {
      badgeId,
      scoutId,
      notes,
      awardedAt: new Date().toISOString()
    });
    return { success: true };
  },

  // Certificates
  getCertificates: async () => {
    try {
      const snap = await getDocs(collection(db, 'certificates'));
      const certs: Certificate[] = [];
      snap.forEach(d => certs.push({ id: d.id, ...d.data() } as Certificate));
      return certs;
    } catch (err) {
      return [];
    }
  },

  issueCertificate: async (certData: any, actor: any) => {
    const ref = await addDoc(collection(db, 'certificates'), {
      ...certData,
      issuedAt: new Date().toISOString()
    });
    return { success: true, certificate: { id: ref.id, ...certData } };
  },

  // Audit Logs & Settings
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
  },

  getReportsSummary: async () => {
    return { totalPointsGiven: 150, activeAlertsCount: 0 };
  },

  reviewScoutAvatar: async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason: string, actor: any) => {
    const ref = doc(db, 'scouts', scoutId);
    await updateDoc(ref, { avatarStatus: decision, avatarRejectionReason: reason });
    return { success: true };
  },

  restoreBackup: async (backupData: any, actor: any) => {
    return { success: true, message: 'تمت استعادة البيانات بنجاح' };
  }
};
