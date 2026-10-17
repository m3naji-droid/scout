import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ActivityAttendance, ScoutBadge, AwardedBadge, 
  Certificate, Announcement, AppNotification, ParentEncouragement, AuditLogItem, SiteSettings 
} from '../types';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';

export const api = {
  // Public Info & Stats
  getPublicInfo: async () => {
    try {
      const scoutsSnap = await getDocs(collection(db, 'scouts'));
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const activitiesSnap = await getDocs(collection(db, 'activities'));
      const announcementsSnap = await getDocs(collection(db, 'announcements'));

      const announcements: Announcement[] = [];
      announcementsSnap.forEach(d => announcements.push({ id: d.id, ...d.data() } as Announcement));

      const activities: Partial<TroopActivity>[] = [];
      activitiesSnap.forEach(d => activities.push({ id: d.id, ...d.data() } as TroopActivity));

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

  // Auth & Passwords
  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) throw new Error('المستخدم غير موجود');
      
      await updateDoc(userRef, { passwordHash: newPassword });
      return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
    } catch (err: any) {
      throw new Error(err.message || 'فشل تغيير كلمة المرور');
    }
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
      return {
        periodName: 'منافسة درع الفاتح السنوية 2026-2027',
        topScouts: scouts.slice(0, 3)
      };
    } catch (err) {
      console.error('Error fetching distinction:', err);
      return { periodName: 'منافسة درع الفاتح السنوية 2026-2027', topScouts: [] };
    }
  },

  // Scouts Management (الاسم، الرقم الشخصي، والصف)
  getScouts: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'scouts'));
      const scouts: ScoutProfile[] = [];
      querySnapshot.forEach((doc) => {
        scouts.push({ id: doc.id, ...doc.data() } as ScoutProfile);
      });
      return scouts;
    } catch (err) {
      console.error('Error fetching scouts:', err);
      return [];
    }
  },

  getScoutDetails: async (id: string) => {
    try {
      const docRef = doc(db, 'scouts', id);
      const docSnap = await getDoc(docRef);
      const scout = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
      
      const evalsQuery = query(collection(db, 'evaluations'), where('scoutId', '==', id));
      const evalsSnap = await getDocs(evalsQuery);
      const evaluations: PointEvaluation[] = [];
      evalsSnap.forEach(d => evaluations.push({ id: d.id, ...d.data() } as PointEvaluation));

      const badgesQuery = query(collection(db, 'awardedBadges'), where('scoutId', '==', id));
      const badgesSnap = await getDocs(badgesQuery);
      const badges: AwardedBadge[] = [];
      badgesSnap.forEach(d => badges.push({ id: d.id, ...d.data() } as AwardedBadge));

      const certsQuery = query(collection(db, 'certificates'), where('scoutId', '==', id));
      const certsSnap = await getDocs(certsQuery);
      const certificates: Certificate[] = [];
      certsSnap.forEach(d => certificates.push({ id: d.id, ...d.data() } as Certificate));

      return { scout, evaluations, badges, certificates };
    } catch (err) {
      console.error('Error loading scout details:', err);
      return { scout: null, evaluations: [], badges: [], certificates: [] };
    }
  },

  addScout: async (scoutData: { fullName: string, nationalId: string, grade: string }) => {
    try {
      const scoutRef = await addDoc(collection(db, 'scouts'), {
        fullName: scoutData.fullName,
        nationalId: scoutData.nationalId,
        grade: scoutData.grade,
        totalPositivePoints: 0,
        totalDeductions: 0,
        netBalance: 0,
        badgeCount: 0,
        activitiesAttendedCount: 0,
        registrationYear: '2026-2027',
        status: 'ACTIVE',
        avatarStatus: 'APPROVED',
        avatarUrl: ''
      });

      // إنشاء حساب دخول تلقائي للكشاف باستخدام الرقم الشخصي
      await addDoc(collection(db, 'users'), {
        username: scoutData.nationalId,
        fullName: scoutData.fullName,
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

  updateScout: async (id: string, updates: any) => {
    const docRef = doc(db, 'scouts', id);
    await updateDoc(docRef, updates);
    return { success: true };
  },

  // Teachers Management (الاسم ورقم الترتيب / الوظيفي)
  getTeachers: async () => {
    try {
      const snap = await getDocs(collection(db, 'teachers'));
      const teachers: TeacherProfile[] = [];
      snap.forEach(d => teachers.push({ id: d.id, ...d.data() } as TeacherProfile));
      return teachers;
    } catch (err) {
      return [];
    }
  },

  addTeacher: async (teacherData: { fullName: string, employeeId: string }) => {
    try {
      const teacherRef = await addDoc(collection(db, 'teachers'), {
        fullName: teacherData.fullName,
        employeeId: teacherData.employeeId, // رقم الترتيب / الرقم الوظيفي
        subject: 'عام',
        evaluationsGivenCount: 0,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });

      // إنشاء حساب دخول تلقائي للمعلم باستخدام رقم الترتيب
      await addDoc(collection(db, 'users'), {
        username: teacherData.employeeId,
        fullName: teacherData.fullName,
        role: 'TEACHER',
        isActive: true,
        createdAt: new Date().toISOString()
      });

      return { id: teacherRef.id, success: true, message: 'تم إضافة المعلم بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة المعلم: ' + err.message);
    }
  },

  addUserAccount: async (userData: { fullName: string, username: string, passwordHash: string, role: 'TEACHER' | 'ADMIN' | 'SUPERVISOR', employeeId?: string }) => {
    try {
      const userRef = await addDoc(collection(db, 'users'), {
        username: userData.username,
        fullName: userData.fullName,
        role: userData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        passwordHash: userData.passwordHash
      });

      if (userData.role === 'TEACHER') {
        await addDoc(collection(db, 'teachers'), {
          userId: userRef.id,
          fullName: userData.fullName,
          employeeId: userData.employeeId || userData.username,
          evaluationsGivenCount: 0,
          status: 'ACTIVE'
        });
      }

      return { success: true, message: 'تم إضافة الحساب بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة الحساب: ' + err.message);
    }
  },

  // Parent Management
  addParentAccount: async (parentData: { fullName: string, username: string, passwordHash: string, linkedScoutId: string, phoneNumber?: string }) => {
    try {
      await addDoc(collection(db, 'users'), {
        username: parentData.username,
        fullName: parentData.fullName,
        role: 'PARENT',
        phoneNumber: parentData.phoneNumber || '',
        linkedScoutIds: [parentData.linkedScoutId],
        isActive: true,
        createdAt: new Date().toISOString(),
        passwordHash: parentData.passwordHash
      });
      return { success: true, message: 'تم ربط ولي الأمر بالكشاف بنجاح' };
    } catch (err: any) {
      throw new Error('فشل إضافة ولي الأمر: ' + err.message);
    }
  },

  uploadScoutAvatar: async (scoutId: string, avatarDataUrl: string) => {
    const docRef = doc(db, 'scouts', scoutId);
    await updateDoc(docRef, { avatarUrl: avatarDataUrl, avatarStatus: 'PENDING' });
    return { message: 'تم إرسال الصورة بنجاح وتنتظر اعتماد القائد' };
  },

  reviewScoutAvatar: async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason: string) => {
    const docRef = doc(db, 'scouts', scoutId);
    await updateDoc(docRef, { avatarStatus: decision, avatarRejectionReason: reason });
    return { success: true };
  },

  // Evaluations / Points
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

  submitEvaluation: async (evalData: any, actor: any) => {
    const payload = {
      ...evalData,
      evaluatorId: actor.id,
      evaluatorName: actor.fullName || actor.name,
      evaluatorRole: actor.role,
      status: evalData.type === 'POSITIVE' ? 'APPROVED' : 'PENDING',
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, 'evaluations'), payload);
    return { success: true, message: 'تم تسجيل التقييم بنجاح' };
  },

  getSuspensions: async () => {
    try {
      const snap = await getDocs(collection(db, 'suspensionRequests'));
      const requests: SuspensionRequest[] = [];
      snap.forEach(d => requests.push({ id: d.id, ...d.data() } as SuspensionRequest));
      return requests;
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

  // Notifications
  getNotifications: async (userId: string) => {
    try {
      const q = query(collection(db, 'notifications'), where('recipientUserId', '==', userId));
      const snap = await getDocs(q);
      const notifs: AppNotification[] = [];
      snap.forEach(d => notifs.push({ id: d.id, ...d.data() } as AppNotification));
      return notifs;
    } catch (err) {
      return [];
    }
  },

  markNotificationRead: async (notifId: string) => {
    const ref = doc(db, 'notifications', notifId);
    await updateDoc(ref, { isRead: true });
    return { success: true };
  },

  markAllNotificationsRead: async (userId: string) => {
    const q = query(collection(db, 'notifications'), where('recipientUserId', '==', userId));
    const snap = await getDocs(q);
    const promises = snap.docs.map(d => updateDoc(doc(db, 'notifications', d.id), { isRead: true }));
    await Promise.all(promises);
    return { success: true };
  },

  // Parent Encouragements
  sendParentEncouragement: async (parentId: string, parentName: string, scoutId: string, message: string) => {
    await addDoc(collection(db, 'parentEncouragements'), {
      parentId,
      parentName,
      scoutId,
      message,
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    });
    return { success: true };
  },

  getParentEncouragements: async (scoutId: string) => {
    try {
      const q = query(collection(db, 'parentEncouragements'), where('scoutId', '==', scoutId));
      const snap = await getDocs(q);
      const msgs: ParentEncouragement[] = [];
      snap.forEach(d => msgs.push({ id: d.id, ...d.data() } as ParentEncouragement));
      return msgs;
    } catch (err) {
      return [];
    }
  },

  // Incident Reports
  submitIncidentReport: async (reportData: any, actor: any) => {
    await addDoc(collection(db, 'incidentReports'), {
      ...reportData,
      senderId: actor.id,
      senderName: actor.fullName || actor.name,
      senderRole: actor.role,
      status: 'جديد',
      createdAt: new Date().toISOString()
    });
    return { success: true };
  }
};
