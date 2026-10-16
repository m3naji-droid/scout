export type UserRole = 'ADMIN' | 'LEADER' | 'SUPERVISOR' | 'TEACHER' | 'SCOUT' | 'PARENT';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  nationalId?: string; // الرقم الشخصي
  phoneNumber?: string;
  avatarUrl?: string;
  avatarStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  avatarRejectionReason?: string;
  isActive: boolean;
  assignedClasses?: string[]; // For teachers: e.g. ["الأول إعدادي / 1", "الثاني إعدادي / 2"]
  assignedPermissions?: string[]; // For supervisors
  scoutId?: string; // If role is SCOUT or PARENT (linked scout)
  linkedScoutIds?: string[]; // For parent with multiple sons
  createdAt: string;
}

export interface ScoutProfile {
  id: string;
  userId: string;
  fullName: string;
  nationalId: string;
  grade: string; // e.g. "الأول إعدادي"
  section: string; // e.g. "1" or "فرقة الصقر"
  patrolName?: string; // اسم الطليعة (الصقر، اليرموك، الفاتح...)
  avatarUrl: string;
  avatarStatus: 'APPROVED' | 'PENDING' | 'REJECTED';
  avatarRejectionReason?: string;
  totalPositivePoints: number;
  totalDeductions: number;
  netBalance: number;
  badgeCount: number;
  activitiesAttendedCount: number;
  registrationYear: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  suspensionEndDate?: string;
  suspensionReason?: string;
  parentName?: string;
  parentPhone?: string;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  fullName: string;
  employeeId: string; // الرقم الوظيفي
  subject?: string;
  assignedClasses: string[]; // ["الأول إعدادي - 1", "الأول إعدادي - 2"]
  evaluationsGivenCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export type PointType = 'POSITIVE' | 'DEDUCTION';

export type EvaluationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CORRECTED';

export interface PointEvaluation {
  id: string;
  scoutId: string;
  scoutName: string;
  scoutGrade: string;
  scoutSection: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: UserRole;
  type: PointType;
  points: number; // 1 to 5 for positive; specific deduction amounts
  behaviorCategory: string; // e.g. "حسن الخلق", "المشاركة الفعالة", "الإخلال بالنظام"
  notes?: string;
  encouragementMessage?: string; // رسالة التعزيز
  status: EvaluationStatus;
  reviewedById?: string;
  reviewedByName?: string;
  reviewDate?: string;
  reviewNotes?: string;
  correctionReason?: string;
  createdAt: string;
}

export interface SuspensionRequest {
  id: string;
  scoutId: string;
  scoutName: string;
  scoutGrade: string;
  scoutSection: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  violationType: string;
  violationCount: number; // عدد مرات التكرار
  description: string;
  targetActivities: string; // الأنشطة المطلوب الحرمان منها
  requestedDuration: 'أسبوعان' | 'شهر' | 'شهران' | 'فصل دراسي كامل' | 'فصلان دراسيان كاملان';
  status: 'NEW' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  decisionLeaderId?: string;
  decisionLeaderName?: string;
  decisionDate?: string;
  decisionNotes?: string;
  approvedDuration?: string;
  suspensionStartDate?: string;
  suspensionEndDate?: string;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  category: 'سلوكي' | 'انضباطي' | 'فعالية' | 'اقتراح' | 'عام';
  severity: 'عادي' | 'متوسط' | 'عاجل وهام';
  description: string;
  scoutId?: string;
  scoutName?: string;
  targetClass?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  status: 'جديد' | 'قيد المتابعة' | 'تمت المعالجة';
  leaderResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface TroopActivity {
  id: string;
  title: string;
  description: string;
  type: 'INTERNAL' | 'EXTERNAL'; // داخل المدرسة أو خارجها
  location: string;
  date: string;
  time: string;
  returnTime?: string;
  targetGrades: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  requiresParentConsent: boolean;
  emergencyContact?: string;
  requiredItems?: string;
  meetingInstructions?: string;
  postEventReport?: string;
  images: string[];
  attendeesCount?: number;
  createdAt: string;
}

export interface ActivityAttendance {
  id: string;
  activityId: string;
  scoutId: string;
  scoutName: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  parentConsentApproved?: boolean;
  notes?: string;
  markedAt: string;
}

export interface ScoutBadge {
  id: string;
  title: string;
  description: string;
  category: 'أخلاقي' | 'قيادي' | 'مهاري' | 'كشفي' | 'خدمة مجتمع';
  icon: string; // Icon identifier or svg
  criteria: string;
  awardedCount?: number;
}

export interface AwardedBadge {
  id: string;
  badgeId: string;
  badgeTitle: string;
  badgeCategory: string;
  badgeIcon: string;
  scoutId: string;
  scoutName: string;
  awardedById: string;
  awardedByName: string;
  notes?: string;
  awardedAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  scoutId: string;
  scoutName: string;
  scoutGrade: string;
  scoutSection: string;
  title: string;
  reason: string;
  achievementType: string;
  date: string;
  issuerLeaderName: string;
  templateId: 'GOLDEN' | 'ROYAL_GREEN' | 'MODERN_SCOUT';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'تنبيه هام' | 'فعالية قادمة' | 'تكريم وتميز' | 'إرشادات كشفية';
  isPublic: boolean;
  authorName: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  recipientUserId: string; // or 'ALL' or role
  title: string;
  message: string;
  type: 'POINT_ADDED' | 'POINT_DEDUCTED' | 'APPROVAL' | 'REJECTION' | 'EVENT' | 'BADGE' | 'SUSPENSION' | 'GENERAL';
  relatedLink?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ParentEncouragement {
  id: string;
  parentId: string;
  parentName: string;
  scoutId: string;
  scoutName: string;
  message: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  targetResource: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SiteSettings {
  troopName: string;
  schoolName: string;
  kingdom: string;
  ministryName: string;
  currentAcademicYear: string;
  competitionPeriod: {
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  pointsRules: {
    minPositive: number;
    maxPositive: number;
    requireLeaderApprovalForDeductions: boolean;
    requireLeaderApprovalForPositive: boolean;
    consecutiveViolationsForSuspension: number;
  };
  contactInfo: {
    schoolPhone: string;
    troopEmail: string;
    address: string;
  };
  privacyPolicyText: string;
}
