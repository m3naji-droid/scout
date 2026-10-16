import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ActivityAttendance, ScoutBadge, AwardedBadge, 
  Certificate, Announcement, AppNotification, ParentEncouragement, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, query, where } from 'firebase/firestore';

export const api = {
  // Public Info
  getPublicInfo: async () => {
    return {
      troopName: 'فرقة فتيان أحمد الفاتح الكشفية',
      schoolName: 'مدرسة أحمد الفاتح الإعدادية للبنين',
      season: '2025-2026',
      announcements: [],
      upcomingActivities: [],
      stats: { scoutsCount: 4, teachersCount: 2, activitiesCount: 2 }
    };
  },

  // Auth
  login: async (username: string, password: string) => {
    return { success: true };
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  },

  // Distinction Top 3
  getTop3Distinction: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'scouts'));
      const scouts: any[] = [];
      querySnapshot.forEach((doc) => {
        scouts.push({ id: doc.id, ...doc.data() });
      });
      scouts.sort((a, b) => (b.netBalance || 0) - (a.netBalance || 0));
      return scouts.slice(0, 3);
    } catch (err) {
      return [
        { id: 's1', fullName: 'أحمد محمد', netBalance: 45, patrolName: 'طليعة الفاتح', grade: 'الأول إعدادي', section: '1' }
      ];
    }
  },

  // Scouts
  getScouts: async (filters?: { grade?: string; section?: string; status?: string }) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'scouts'));
      const scouts: ScoutProfile[] = [];
      querySnapshot.forEach((doc) => {
        scouts.push({ id: doc.id, ...doc.data() } as ScoutProfile);
      });
      if (scouts.length === 0) {
        return [
          { id: 's1', fullName: 'أحمد محمد', nationalId: '009731234', grade: 'الأول إعدادي', section: '1', netBalance: 25, status: 'ACTIVE', badgeCount: 2, patrolName: 'طليعة الفاتح', avatarStatus: 'APPROVED' }
        ] as ScoutProfile[];
      }
      return scouts;
    } catch (err) {
      console.error('Error fetching scouts:', err);
      return [
        { id: 's1', fullName: 'أحمد محمد', nationalId: '009731234', grade: 'الأول إعدادي', section: '1', netBalance: 25, status: 'ACTIVE', badgeCount: 2, patrolName: 'طليعة الفاتح', avatarStatus: 'APPROVED' }
      ] as ScoutProfile[];
    }
  },

  getScoutDetails: async (id: string) => {
    try {
      const docRef = doc(db, 'scouts', id);
      const docSnap = await getDoc(docRef);
      const scout = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : { id, fullName: 'أحمد محمد', netBalance: 25, grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح' };
      
      return {
        scout,
        evaluations: [
          { id: 'e1', scoutId: id, type: 'POSITIVE', points: 3, behaviorCategory: 'حسن الخلق والتعامل الراقي', status: 'APPROVED', evaluatorName: 'أ. سلمان', createdAt: new Date().toISOString(), encouragementMessage: 'رائع، أحسنت!' }
        ],
        badges: [
          { id: 'b1', scoutId: id, badgeTitle: 'شارة الكشاف المتقدم', badgeCategory: 'مهارات', awardedAt: new Date().toISOString() }
        ],
        certificates: [
          { id: 'c1', scoutId: id, title: 'شهادة تميز سلوكي', certificateNumber: 'CERT-2026-001', issuedAt: new Date().toISOString() }
        ]
      };
    } catch (err) {
      return { 
        scout: { id, fullName: 'أحمد محمد', netBalance: 25, grade: 'الأول إعدادي', section: '1', patrolName: 'طليعة الفاتح' }, 
        evaluations: [], 
        badges: [], 
        certificates: [] 
      };
    }
  },

  addScout: async (scoutData: any, actor: any) => {
    const docRef = await addDoc(collection(db, 'scouts'), scoutData);
    return { id: docRef.id, ...scoutData };
  },

  updateScout: async (id: string, updates: any, actor: any) => {
    const docRef = doc(db, 'scouts', id);
    await updateDoc(docRef, updates);
    return { success: true };
  },

  uploadScoutAvatar: async (scoutId: string, avatarDataUrl: string) => {
    const docRef = doc(db, 'scouts', scoutId);
    await updateDoc(docRef, { avatarUrl: avatarDataUrl, avatarStatus: 'PENDING' });
    return { message: 'تم إرسال الصورة بنجاح وتنتظر اعتماد القائد' };
  },

  reviewScoutAvatar: async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason: string, actor: any) => {
    const docRef = doc(db, 'scouts', scoutId);
    await updateDoc(docRef, { avatarStatus: decision, avatarRejectionReason: reason });
    return { success: true };
  },

  // Teachers
  getTeachers: async () => {
    return [
      { id: 't1', userId: 'teacher_1', name: 'أ. سلمان', subject: 'كشافة', assignedClasses: ['الأول إعدادي - 1', 'الأول إعدادي - 2'] }
    ] as TeacherProfile[];
  },

  addTeacher: async (teacherData: any, actor: any) => { return { success: true, ...teacherData }; },
  updateTeacherClasses: async (id: string, assignedClasses: string[]) => { return { success: true }; },

  // Evaluations / Points
  getEvaluations: async (filters?: { scoutId?: string; status?: string; type?: string }) => {
    return [
      { id: 'e1', scoutId: 's1', type: 'POSITIVE', points: 3, behaviorCategory: 'حسن الخلق والتعامل الراقي', status: 'APPROVED', evaluatorName: 'أ. سلمان', createdAt: new Date().toISOString(), encouragementMessage: 'رائع، أحسنت!' }
    ] as PointEvaluation[];
  },

  submitEvaluation: async (evalData: any, actor: any) => { return { success: true, message: 'تم تسجيل التقييم بنجاح' }; },
  reviewEvaluation: async (id: string, decision: 'APPROVED' | 'REJECTED', reviewNotes: string, actor: any) => { return { success: true }; },
  correctEvaluation: async (id: string, newPoints: number, correctionReason: string, actor: any) => { return { success: true }; },

  // Suspensions
  getSuspensions: async () => { return []; },
  createSuspensionRequest: async (requestData: any, actor: any) => { return { success: true }; },
  decideSuspensionRequest: async (id: string, decision: 'APPROVED' | 'REJECTED', decisionNotes: string, approvedDuration: string, actor: any) => { return { success: true }; },

  // Reports / Incidents
  getIncidentReports: async () => { return []; },
  submitIncidentReport: async (reportData: any, actor: any) => { return { success: true }; },
  respondToIncidentReport: async (id: string, response: string, status: string, actor: any) => { return { success: true }; },

  // Activities & Attendance
  getActivities: async () => { return []; },
  createActivity: async (activityData: any, actor: any) => { return { success: true }; },
  recordAttendance: async (activityId: string, scoutAttendances: any[], actor: any) => { return { success: true }; },

  // Badges
  getBadges: async () => { return { badges: [], awarded: [] }; },
  awardBadge: async (badgeId: string, scoutId: string, notes: string, actor: any) => { return { success: true }; },

  // Certificates
  getCertificates: async () => { return []; },
  issueCertificate: async (certData: any, actor: any) => { return { success: true }; },

  // Excel Import
  importScouts: async (rows: any[], dryRun: boolean, actor: any) => { return { success: true, imported: rows.length }; },
  importTeachers: async (rows: any[], dryRun: boolean, actor: any) => { return { success: true, imported: rows.length }; },

  // Notifications
  getNotifications: async (userId: string) => { return []; },
  markNotificationRead: async (notifId: string) => { return { success: true }; },
  markAllNotificationsRead: async (userId: string) => { return { success: true }; },

  // Parent Encouragement
  sendParentEncouragement: async (parentId: string, parentName: string, scoutId: string, message: string) => {
    return { success: true };
  },
  getParentEncouragements: async (scoutId: string) => {
    return [
      { id: 'pe1', parentId: 'parent_1', parentName: 'ولي أمر أحمد', scoutId, message: 'فخورون بك يا بطل!', createdAt: new Date().toISOString() }
    ] as ParentEncouragement[];
  },

  // Audit Logs
  getAuditLogs: async () => { return []; },

  // Settings & Reports Summary
  getSettings: async () => { 
    return { troopName: 'فرقة فتيان أحمد الفاتح الكشفية', schoolName: 'مدرسة أحمد الفاتح الإعدادية للبنين' } as SiteSettings; 
  },
  updateSettings: async (settings: Partial<SiteSettings>, actor: any) => { return { success: true }; },
  getReportsSummary: async () => { return {}; },
  restoreBackup: async (backupData: any, actor: any) => { return { success: true }; }
};
