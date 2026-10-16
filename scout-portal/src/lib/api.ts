import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ActivityAttendance, ScoutBadge, AwardedBadge, 
  Certificate, Announcement, AppNotification, ParentEncouragement, AuditLogItem, SiteSettings 
} from '../types';

export const api = {
  // Public
  getPublicInfo: async () => {
    const res = await fetch('/api/public-info');
    if (!res.ok) throw new Error('فشل جلب المعلومات العامة');
    return res.json();
  },

  // Auth
  login: async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تسجيل الدخول');
    return data;
  },

  changePassword: async (userId: string, currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تغيير كلمة المرور');
    return data;
  },

  // Distinction Top 3
  getTop3Distinction: async () => {
    const res = await fetch('/api/distinction/top3');
    if (!res.ok) throw new Error('فشل جلب نجوم الفرقة');
    return res.json();
  },

  // Scouts
  getScouts: async (filters?: { grade?: string; section?: string; status?: string }) => {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/scouts?${query}`);
    if (!res.ok) throw new Error('فشل جلب الكشافين');
    return res.json() as Promise<ScoutProfile[]>;
  },

  getScoutDetails: async (id: string) => {
    const res = await fetch(`/api/scouts/${id}`);
    if (!res.ok) throw new Error('فشل جلب بيانات الكشاف');
    return res.json();
  },

  addScout: async (scoutData: any, actor: any) => {
    const res = await fetch('/api/scouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scoutData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إضافة الكشاف');
    return data;
  },

  updateScout: async (id: string, updates: any, actor: any) => {
    const res = await fetch(`/api/scouts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تعديل الكشاف');
    return data;
  },

  uploadScoutAvatar: async (scoutId: string, avatarDataUrl: string) => {
    const res = await fetch(`/api/scouts/${scoutId}/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatarDataUrl })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل رفع الصورة');
    return data;
  },

  reviewScoutAvatar: async (scoutId: string, decision: 'APPROVED' | 'REJECTED', reason: string, actor: any) => {
    const res = await fetch(`/api/scouts/${scoutId}/review-avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reason, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل مراجعة الصورة');
    return data;
  },

  // Teachers
  getTeachers: async () => {
    const res = await fetch('/api/teachers');
    if (!res.ok) throw new Error('فشل جلب المعلمين');
    return res.json() as Promise<TeacherProfile[]>;
  },

  addTeacher: async (teacherData: any, actor: any) => {
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...teacherData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إضافة المعلم');
    return data;
  },

  updateTeacherClasses: async (id: string, assignedClasses: string[]) => {
    const res = await fetch(`/api/teachers/${id}/classes`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedClasses })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث صفوف المعلم');
    return data;
  },

  // Evaluations / Points
  getEvaluations: async (filters?: { scoutId?: string; status?: string; type?: string }) => {
    const query = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/evaluations?${query}`);
    if (!res.ok) throw new Error('فشل جلب التقييمات');
    return res.json() as Promise<PointEvaluation[]>;
  },

  submitEvaluation: async (evalData: any, actor: any) => {
    const res = await fetch('/api/evaluations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...evalData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تسجيل التقييم');
    return data;
  },

  reviewEvaluation: async (id: string, decision: 'APPROVED' | 'REJECTED', reviewNotes: string, actor: any) => {
    const res = await fetch(`/api/evaluations/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, reviewNotes, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل اعتماد التقييم');
    return data;
  },

  correctEvaluation: async (id: string, newPoints: number, correctionReason: string, actor: any) => {
    const res = await fetch(`/api/evaluations/${id}/correct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPoints, correctionReason, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تصحيح التقييم');
    return data;
  },

  // Suspensions
  getSuspensions: async () => {
    const res = await fetch('/api/suspensions');
    if (!res.ok) throw new Error('فشل جلب طلبات الحرمان');
    return res.json() as Promise<SuspensionRequest[]>;
  },

  createSuspensionRequest: async (requestData: any, actor: any) => {
    const res = await fetch('/api/suspensions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...requestData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل رفع طلب الحرمان');
    return data;
  },

  decideSuspensionRequest: async (id: string, decision: 'APPROVED' | 'REJECTED', decisionNotes: string, approvedDuration: string, actor: any) => {
    const res = await fetch(`/api/suspensions/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, decisionNotes, approvedDuration, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل اتخاذ القرار');
    return data;
  },

  // Reports / Incidents
  getIncidentReports: async () => {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('فشل جلب البلاغات');
    return res.json() as Promise<IncidentReport[]>;
  },

  submitIncidentReport: async (reportData: any, actor: any) => {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reportData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال البلاغ');
    return data;
  },

  respondToIncidentReport: async (id: string, response: string, status: string, actor: any) => {
    const res = await fetch(`/api/reports/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, status, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل الرد على البلاغ');
    return data;
  },

  // Activities & Attendance
  getActivities: async () => {
    const res = await fetch('/api/activities');
    if (!res.ok) throw new Error('فشل جلب الفعاليات');
    return res.json() as Promise<TroopActivity[]>;
  },

  createActivity: async (activityData: any, actor: any) => {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activityData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إنشاء الفعالية');
    return data;
  },

  recordAttendance: async (activityId: string, scoutAttendances: any[], actor: any) => {
    const res = await fetch(`/api/activities/${activityId}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoutAttendances, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل رصد الحضور');
    return data;
  },

  // Badges
  getBadges: async () => {
    const res = await fetch('/api/badges');
    if (!res.ok) throw new Error('فشل جلب الشارات');
    return res.json() as Promise<{ badges: ScoutBadge[]; awarded: AwardedBadge[] }>;
  },

  awardBadge: async (badgeId: string, scoutId: string, notes: string, actor: any) => {
    const res = await fetch('/api/badges/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ badgeId, scoutId, notes, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل منح الشارة');
    return data;
  },

  // Certificates
  getCertificates: async () => {
    const res = await fetch('/api/certificates');
    if (!res.ok) throw new Error('فشل جلب الشهادات');
    return res.json() as Promise<Certificate[]>;
  },

  issueCertificate: async (certData: any, actor: any) => {
    const res = await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...certData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إصدار الشهادة');
    return data;
  },

  // Excel Import
  importScouts: async (rows: any[], dryRun: boolean, actor: any) => {
    const res = await fetch('/api/import/scouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, dryRun, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل استيراد الكشافين');
    return data;
  },

  importTeachers: async (rows: any[], dryRun: boolean, actor: any) => {
    const res = await fetch('/api/import/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, dryRun, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل استيراد المعلمين');
    return data;
  },

  // Notifications
  getNotifications: async (userId: string) => {
    const res = await fetch(`/api/notifications/${userId}`);
    if (!res.ok) throw new Error('فشل جلب الإشعارات');
    return res.json() as Promise<AppNotification[]>;
  },

  markNotificationRead: async (notifId: string) => {
    const res = await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
    return res.json();
  },

  markAllNotificationsRead: async (userId: string) => {
    const res = await fetch(`/api/notifications/mark-all-read/${userId}`, { method: 'POST' });
    return res.json();
  },

  // Parent Encouragement
  sendParentEncouragement: async (parentId: string, parentName: string, scoutId: string, message: string) => {
    const res = await fetch('/api/parent/encouragement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, parentName, scoutId, message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل إرسال رسالة التشجيع');
    return data;
  },

  getParentEncouragements: async (scoutId: string) => {
    const res = await fetch(`/api/parent/encouragements/${scoutId}`);
    if (!res.ok) throw new Error('فشل جلب رسائل ولي الأمر');
    return res.json() as Promise<ParentEncouragement[]>;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('فشل جلب سجل التدقيق');
    return res.json() as Promise<AuditLogItem[]>;
  },

  // Settings & Reports Summary
  getSettings: async () => {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('فشل جلب الإعدادات');
    return res.json() as Promise<SiteSettings>;
  },

  updateSettings: async (settings: Partial<SiteSettings>, actor: any) => {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل تحديث الإعدادات');
    return data;
  },

  getReportsSummary: async () => {
    const res = await fetch('/api/reports/summary');
    if (!res.ok) throw new Error('فشل جلب ملخص التقارير');
    return res.json();
  },

  restoreBackup: async (backupData: any, actor: any) => {
    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backupData, actor })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'فشل استعادة النسخة الاحتياطية');
    return data;
  }
};
