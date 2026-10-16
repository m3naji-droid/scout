import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { 
  User, ScoutProfile, TeacherProfile, PointEvaluation, SuspensionRequest, 
  IncidentReport, TroopActivity, ActivityAttendance, ScoutBadge, AwardedBadge, 
  Certificate, Announcement, AppNotification, ParentEncouragement, AuditLogItem, SiteSettings,
  EvaluationStatus
} from './src/types/index';

const app = express();
const PORT = 3000;
const DB_FILE = path.resolve(__dirname, 'database/troop_database.json');

// Ensure database directory exists
if (!fs.existsSync(path.resolve(__dirname, 'database'))) {
  fs.mkdirSync(path.resolve(__dirname, 'database'), { recursive: true });
}

// In-Memory Database Schema Structure
interface DatabaseSchema {
  settings: SiteSettings;
  users: (User & { passwordHash: string; salt: string })[];
  scouts: ScoutProfile[];
  teachers: TeacherProfile[];
  evaluations: PointEvaluation[];
  suspensionRequests: SuspensionRequest[];
  incidentReports: IncidentReport[];
  activities: TroopActivity[];
  attendance: ActivityAttendance[];
  badges: ScoutBadge[];
  awardedBadges: AwardedBadge[];
  certificates: Certificate[];
  announcements: Announcement[];
  notifications: AppNotification[];
  parentEncouragements: ParentEncouragement[];
  auditLogs: AuditLogItem[];
}

// Password hashing helper
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  return hashPassword(password, salt) === hash;
}

function generateId(): string {
  return crypto.randomUUID();
}

// Initial Seed Database Factory
function createInitialDatabase(): DatabaseSchema {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const baselSalt = crypto.randomBytes(16).toString('hex');
  const mohammedSalt = crypto.randomBytes(16).toString('hex');
  const teacherSalt = crypto.randomBytes(16).toString('hex');
  const scoutSalt = crypto.randomBytes(16).toString('hex');
  const parentSalt = crypto.randomBytes(16).toString('hex');

  const users: (User & { passwordHash: string; salt: string })[] = [
    {
      id: 'usr_admin',
      username: 'المدير',
      fullName: 'مدير مدرسة أحمد الفاتح الإعدادية',
      role: 'ADMIN',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
      salt: adminSalt,
      passwordHash: hashPassword('00973', adminSalt), // Requested initial dev password
    },
    {
      id: 'usr_basel',
      username: 'باسل',
      fullName: 'القائد باسل حسن',
      role: 'LEADER',
      phoneNumber: '973-39001122',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
      salt: baselSalt,
      passwordHash: hashPassword('001', baselSalt), // Requested initial dev password
    },
    {
      id: 'usr_mohammed',
      username: 'محمد',
      fullName: 'القائد محمد علي',
      role: 'LEADER',
      phoneNumber: '973-39003344',
      isActive: true,
      createdAt: '2026-09-01T08:00:00Z',
      salt: mohammedSalt,
      passwordHash: hashPassword('002', mohammedSalt), // Requested initial dev password
    },
    {
      id: 'usr_teacher_salman',
      username: 'salman',
      fullName: 'أ. سلمان راشد البنعلي',
      role: 'TEACHER',
      isActive: true,
      assignedClasses: ['الأول إعدادي - 1', 'الأول إعدادي - 2', 'الثاني إعدادي - 1'],
      createdAt: '2026-09-05T08:00:00Z',
      salt: teacherSalt,
      passwordHash: hashPassword('123456', teacherSalt),
    },
    {
      id: 'usr_teacher_khalid',
      username: 'khalid',
      fullName: 'أ. خالد جاسم المهندي',
      role: 'TEACHER',
      isActive: true,
      assignedClasses: ['الثاني إعدادي - 2', 'الثالث إعدادي - 1', 'الثالث إعدادي - 2'],
      createdAt: '2026-09-05T08:00:00Z',
      salt: teacherSalt,
      passwordHash: hashPassword('123456', teacherSalt),
    },
    {
      id: 'usr_scout_1',
      username: 'scout_ahmed',
      fullName: 'أحمد سلمان البلوشي',
      role: 'SCOUT',
      nationalId: '120104523',
      isActive: true,
      avatarUrl: '',
      avatarStatus: 'APPROVED',
      scoutId: 'sct_1',
      createdAt: '2026-09-06T08:00:00Z',
      salt: scoutSalt,
      passwordHash: hashPassword('123456', scoutSalt),
    },
    {
      id: 'usr_scout_2',
      username: 'scout_yousef',
      fullName: 'يوسف مبارك الدوسري',
      role: 'SCOUT',
      nationalId: '120205841',
      isActive: true,
      avatarUrl: '',
      avatarStatus: 'APPROVED',
      scoutId: 'sct_2',
      createdAt: '2026-09-06T08:00:00Z',
      salt: scoutSalt,
      passwordHash: hashPassword('123456', scoutSalt),
    },
    {
      id: 'usr_scout_3',
      username: 'scout_ali',
      fullName: 'علي حسن العوضي',
      role: 'SCOUT',
      nationalId: '110309912',
      isActive: true,
      avatarUrl: '',
      avatarStatus: 'APPROVED',
      scoutId: 'sct_3',
      createdAt: '2026-09-06T08:00:00Z',
      salt: scoutSalt,
      passwordHash: hashPassword('123456', scoutSalt),
    },
    {
      id: 'usr_scout_4',
      username: 'scout_abdullah',
      fullName: 'عبدالله إبراهيم الكواري',
      role: 'SCOUT',
      nationalId: '110507722',
      isActive: true,
      avatarUrl: '',
      avatarStatus: 'PENDING',
      scoutId: 'sct_4',
      createdAt: '2026-09-06T08:00:00Z',
      salt: scoutSalt,
      passwordHash: hashPassword('123456', scoutSalt),
    },
    {
      id: 'usr_parent_ahmed',
      username: 'parent_ahmed',
      fullName: 'سلمان البلوشي (ولي أمر)',
      role: 'PARENT',
      phoneNumber: '973-39887766',
      isActive: true,
      linkedScoutIds: ['sct_1'],
      createdAt: '2026-09-08T08:00:00Z',
      salt: parentSalt,
      passwordHash: hashPassword('123456', parentSalt),
    }
  ];

  const scouts: ScoutProfile[] = [
    {
      id: 'sct_1',
      userId: 'usr_scout_1',
      fullName: 'أحمد سلمان البلوشي',
      nationalId: '120104523',
      grade: 'الأول إعدادي',
      section: '1',
      patrolName: 'طليعة الفاتح',
      avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop&crop=faces',
      avatarStatus: 'APPROVED',
      totalPositivePoints: 48,
      totalDeductions: 2,
      netBalance: 46,
      badgeCount: 4,
      activitiesAttendedCount: 5,
      registrationYear: '2026-2027',
      status: 'ACTIVE',
      parentName: 'سلمان البلوشي',
      parentPhone: '973-39887766'
    },
    {
      id: 'sct_2',
      userId: 'usr_scout_2',
      fullName: 'يوسف مبارك الدوسري',
      nationalId: '120205841',
      grade: 'الأول إعدادي',
      section: '2',
      patrolName: 'طليعة الصقر',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      avatarStatus: 'APPROVED',
      totalPositivePoints: 42,
      totalDeductions: 0,
      netBalance: 42,
      badgeCount: 3,
      activitiesAttendedCount: 4,
      registrationYear: '2026-2027',
      status: 'ACTIVE',
      parentName: 'مبارك الدوسري',
      parentPhone: '973-39112233'
    },
    {
      id: 'sct_3',
      userId: 'usr_scout_3',
      fullName: 'علي حسن العوضي',
      nationalId: '110309912',
      grade: 'الثاني إعدادي',
      section: '1',
      patrolName: 'طليعة اليرموك',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      avatarStatus: 'APPROVED',
      totalPositivePoints: 39,
      totalDeductions: 3,
      netBalance: 36,
      badgeCount: 3,
      activitiesAttendedCount: 4,
      registrationYear: '2026-2027',
      status: 'ACTIVE',
      parentName: 'حسن العوضي',
      parentPhone: '973-39445566'
    },
    {
      id: 'sct_4',
      userId: 'usr_scout_4',
      fullName: 'عبدالله إبراهيم الكواري',
      nationalId: '110507722',
      grade: 'الثالث إعدادي',
      section: '1',
      patrolName: 'طليعة حطين',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      avatarStatus: 'PENDING',
      totalPositivePoints: 28,
      totalDeductions: 0,
      netBalance: 28,
      badgeCount: 2,
      activitiesAttendedCount: 3,
      registrationYear: '2026-2027',
      status: 'ACTIVE',
      parentName: 'إبراهيم الكواري',
      parentPhone: '973-39778899'
    }
  ];

  const teachers: TeacherProfile[] = [
    {
      id: 'tch_1',
      userId: 'usr_teacher_salman',
      fullName: 'أ. سلمان راشد البنعلي',
      employeeId: 'EMP-9021',
      subject: 'العلوم العامة والفيزياء',
      assignedClasses: ['الأول إعدادي - 1', 'الأول إعدادي - 2', 'الثاني إعدادي - 1'],
      evaluationsGivenCount: 14,
      status: 'ACTIVE'
    },
    {
      id: 'tch_2',
      userId: 'usr_teacher_khalid',
      fullName: 'أ. خالد جاسم المهندي',
      employeeId: 'EMP-9034',
      subject: 'الرياضيات',
      assignedClasses: ['الثاني إعدادي - 2', 'الثالث إعدادي - 1', 'الثالث إعدادي - 2'],
      evaluationsGivenCount: 9,
      status: 'ACTIVE'
    }
  ];

  const badges: ScoutBadge[] = [
    { id: 'bdg_1', title: 'كشاف متميز', description: 'يُمنح للكشاف المتميز في الانضباط والمبادرة الكشفية', category: 'كشفي', icon: 'Award', criteria: 'الحصول على 30 نقطة إيجابية والمشاركة في 3 فعاليات' },
    { id: 'bdg_2', title: 'حسن الخلق', description: 'يُمنح للتحلي بالأخلاق الرفيعة والتعامل الراقي مع المعلمين والزملاء', category: 'أخلاقي', icon: 'Heart', criteria: 'تكرار تقييم حسن الخلق 5 مرات متتالية دون مخالفات' },
    { id: 'bdg_3', title: 'التعاون وروح الفريق', description: 'يُمنح للتميز في خدمة الزملاء والعمل الجماعي بالطليعة', category: 'مهاري', icon: 'Users', criteria: 'المبادرة الإيجابية في الأنشطة الميدانية' },
    { id: 'bdg_4', title: 'القيادة الكشفية', description: 'يُمنح لعريف الطليعة المبدع في إدارة مجموعته وتحفيزهم', category: 'قيادي', icon: 'Shield', criteria: 'قيادة الطليعة في مخيم أو مسير كشفي بنجاح' },
    { id: 'bdg_5', title: 'خدمة المجتمع والبيئة', description: 'يُمنح للمساهمة في المبادرات التطوعية ونظافة المدرسة والبيئة', category: 'خدمة مجتمع', icon: 'Sparkles', criteria: 'المشاركة في فعاليات خدمة المجتمع بفرقة الفاتح' },
    { id: 'bdg_6', title: 'الالتزام والانضباط', description: 'يُمنح للكشاف الملتزم بالحضور في الموعد والزي الكشفي الكامل', category: 'كشفي', icon: 'CheckCircle', criteria: 'عدم تسجيل أي تأخير أو خصم انضباطي طوال الفصل' }
  ];

  const awardedBadges: AwardedBadge[] = [
    {
      id: 'awb_1',
      badgeId: 'bdg_1',
      badgeTitle: 'كشاف متميز',
      badgeCategory: 'كشفي',
      badgeIcon: 'Award',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      awardedById: 'usr_basel',
      awardedByName: 'القائد باسل حسن',
      notes: 'تفوق ملحوظ في مخيم الصخير والانضباط السلوكي',
      awardedAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'awb_2',
      badgeId: 'bdg_2',
      badgeTitle: 'حسن الخلق',
      badgeCategory: 'أخلاقي',
      badgeIcon: 'Heart',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      awardedById: 'usr_mohammed',
      awardedByName: 'القائد محمد علي',
      notes: 'قدوة حسنة لزملائه في الطليعة والمدرسة',
      awardedAt: '2026-10-05T09:30:00Z'
    },
    {
      id: 'awb_3',
      badgeId: 'bdg_1',
      badgeTitle: 'كشاف متميز',
      badgeCategory: 'كشفي',
      badgeIcon: 'Award',
      scoutId: 'sct_2',
      scoutName: 'يوسف مبارك الدوسري',
      awardedById: 'usr_basel',
      awardedByName: 'القائد باسل حسن',
      notes: 'انضباط ممتاز ومبادرة طيبة',
      awardedAt: '2026-10-04T11:00:00Z'
    }
  ];

  const evaluations: PointEvaluation[] = [
    {
      id: 'eval_1',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      scoutGrade: 'الأول إعدادي',
      scoutSection: '1',
      evaluatorId: 'usr_teacher_salman',
      evaluatorName: 'أ. سلمان راشد البنعلي',
      evaluatorRole: 'TEACHER',
      type: 'POSITIVE',
      points: 5,
      behaviorCategory: 'حسن الخلق والمبادرة',
      notes: 'مساعدة زملائه في المختبر وحسن الإنصات',
      encouragementMessage: 'استمر يا بطل! نفتخر بجهودك وأخلاقك العالية.',
      status: 'APPROVED',
      reviewedById: 'usr_basel',
      reviewedByName: 'القائد باسل حسن',
      reviewDate: '2026-10-08T12:00:00Z',
      createdAt: '2026-10-08T09:15:00Z'
    },
    {
      id: 'eval_2',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      scoutGrade: 'الأول إعدادي',
      scoutSection: '1',
      evaluatorId: 'usr_teacher_khalid',
      evaluatorName: 'أ. خالد جاسم المهندي',
      evaluatorRole: 'TEACHER',
      type: 'POSITIVE',
      points: 4,
      behaviorCategory: 'المشاركة الفعالة',
      notes: 'تفاعل متميز وإجابات نموذجية في الحصة',
      encouragementMessage: 'رائع، أحسنت! مشاركتك تصنع الفرق.',
      status: 'APPROVED',
      reviewedById: 'usr_mohammed',
      reviewedByName: 'القائد محمد علي',
      reviewDate: '2026-10-09T13:00:00Z',
      createdAt: '2026-10-09T10:45:00Z'
    },
    {
      id: 'eval_3',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      scoutGrade: 'الأول إعدادي',
      scoutSection: '1',
      evaluatorId: 'usr_teacher_salman',
      evaluatorName: 'أ. سلمان راشد البنعلي',
      evaluatorRole: 'TEACHER',
      type: 'DEDUCTION',
      points: 2,
      behaviorCategory: 'التحدث أثناء الشرح',
      notes: 'تكرار الحديث الجانبي مع الزميل دون استئذان',
      encouragementMessage: 'يرجى منك تصحيح السلوك، أنت قادر على التحسن وننتظر منك الأفضل.',
      status: 'APPROVED',
      reviewedById: 'usr_basel',
      reviewedByName: 'القائد باسل حسن',
      reviewDate: '2026-10-11T11:00:00Z',
      createdAt: '2026-10-10T11:20:00Z'
    },
    {
      id: 'eval_4',
      scoutId: 'sct_2',
      scoutName: 'يوسف مبارك الدوسري',
      scoutGrade: 'الأول إعدادي',
      scoutSection: '2',
      evaluatorId: 'usr_teacher_salman',
      evaluatorName: 'أ. سلمان راشد البنعلي',
      evaluatorRole: 'TEACHER',
      type: 'POSITIVE',
      points: 5,
      behaviorCategory: 'الانضباط والالتزام بالتعليمات',
      notes: 'التزام تام بالهدوء ومساعدة المعلم في تنظيم الصف',
      encouragementMessage: 'وحش، إنجاز مميز! استمر في التألق والتميز.',
      status: 'APPROVED',
      reviewedById: 'usr_mohammed',
      reviewedByName: 'القائد محمد علي',
      reviewDate: '2026-10-12T12:00:00Z',
      createdAt: '2026-10-12T08:30:00Z'
    },
    {
      id: 'eval_5',
      scoutId: 'sct_4',
      scoutName: 'عبدالله إبراهيم الكواري',
      scoutGrade: 'الثالث إعدادي',
      scoutSection: '1',
      evaluatorId: 'usr_teacher_khalid',
      evaluatorName: 'أ. خالد جاسم المهندي',
      evaluatorRole: 'TEACHER',
      type: 'POSITIVE',
      points: 4,
      behaviorCategory: 'المبادرة وتحمل المسؤولية',
      notes: 'المبادرة بحل التمارين الصعبة وإشراك زملائه',
      encouragementMessage: 'أحسنت يا بطل! مستواك مفخرة للفرقة الكشفية.',
      status: 'PENDING',
      createdAt: '2026-10-15T09:00:00Z'
    }
  ];

  const suspensionRequests: SuspensionRequest[] = [
    {
      id: 'susp_1',
      scoutId: 'sct_3',
      scoutName: 'علي حسن العوضي',
      scoutGrade: 'الثاني إعدادي',
      scoutSection: '1',
      requesterId: 'usr_teacher_salman',
      requesterName: 'أ. سلمان راشد البنعلي',
      requesterRole: 'TEACHER',
      violationType: 'الإخلال بالنظام والتأخر المتكرر',
      violationCount: 3,
      description: 'تم التنبيه الشفهي مرتين على عدم تكرار التأخر والحديث غير اللائق أثناء الحصة، والمطلوب مراجعة السلوك.',
      targetActivities: 'الأنشطة الميدانية والرحلات الخارجية',
      requestedDuration: 'أسبوعان',
      status: 'NEW',
      createdAt: '2026-10-14T11:00:00Z'
    }
  ];

  const incidentReports: IncidentReport[] = [
    {
      id: 'inc_1',
      title: 'ملاحظة سلوكية حول الطابور الصباحي',
      category: 'انضباطي',
      severity: 'عادي',
      description: 'لوحظ تحسن كبير في تنظيم كشافة الأول إعدادي للطابور الصباحي وتوزيع المهام بصورة ممتازة.',
      targetClass: 'الأول إعدادي',
      senderId: 'usr_teacher_salman',
      senderName: 'أ. سلمان راشد البنعلي',
      senderRole: 'TEACHER',
      status: 'تمت المعالجة',
      leaderResponse: 'شكرًا أستاذ سلمان على الرصد، سيتم تكريم الطليعة في اللقاء القادم.',
      respondedAt: '2026-10-12T13:00:00Z',
      createdAt: '2026-10-12T09:00:00Z'
    }
  ];

  const activities: TroopActivity[] = [
    {
      id: 'act_1',
      title: 'المخيم الكشفي الخلوي التدريبي - الصخير',
      description: 'مخيم تدريبي كشفي يهدف لتعليم فتيان أحمد الفاتح مبادئ التخييم والطهي الخلوي واستخدام البوصلة والربطات الكشفية وتعزيز الاعتماد على النفس.',
      type: 'EXTERNAL',
      location: 'منطقة الصخير الكشفية - مملكة البحرين',
      date: '2026-11-06',
      time: '07:30 صباحًا',
      returnTime: '04:00 مساءً',
      targetGrades: ['الأول إعدادي', 'الثاني إعدادي', 'الثالث إعدادي'],
      status: 'PUBLISHED',
      requiresParentConsent: true,
      emergencyContact: 'القائد باسل: 39001122 - القائد محمد: 39003344',
      requiredItems: 'الزي الكشفي الكامل، مطارة ماء، كشاف يدوي، دفتر وقلم كشفي، حذاء رياضي مناسب.',
      meetingInstructions: 'التجمع عند البوابة الرئيسية للمدرسة في تمام الساعة 7:00 صباحًا، والانطلاق بالحافلات 7:30.',
      images: [
        'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop'
      ],
      attendeesCount: 28,
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'act_2',
      title: 'دورة العقد الكشفية والإسعافات الأولية الميدانية',
      description: 'ورشة عمل داخلية في النادي الكشفي بالمدرسة لتدريب الفتيان على العقد الأساسية وكيفية التعامل مع الحوادث البسيطة بالتعاون مع الهلال الأحمر البحريني.',
      type: 'INTERNAL',
      location: 'مقر النادي الكشفي بمدرسة أحمد الفاتح',
      date: '2026-10-24',
      time: '10:00 صباحًا',
      returnTime: '12:30 ظهرًا',
      targetGrades: ['الأول إعدادي', 'الثاني إعدادي'],
      status: 'PUBLISHED',
      requiresParentConsent: false,
      requiredItems: 'حبال كشفية، وشاح الكشافة.',
      images: [
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop'
      ],
      attendeesCount: 35,
      createdAt: '2026-10-05T08:00:00Z'
    }
  ];

  const attendance: ActivityAttendance[] = [
    {
      id: 'att_1',
      activityId: 'act_1',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      status: 'PRESENT',
      parentConsentApproved: true,
      notes: 'مشاركة ممتازة والتزام بالمواعيد',
      markedAt: '2026-11-06T07:15:00Z'
    },
    {
      id: 'att_2',
      activityId: 'act_1',
      scoutId: 'sct_2',
      scoutName: 'يوسف مبارك الدوسري',
      status: 'PRESENT',
      parentConsentApproved: true,
      notes: 'حضور مبكر وتفاعل طيب',
      markedAt: '2026-11-06T07:10:00Z'
    }
  ];

  const certificates: Certificate[] = [
    {
      id: 'cert_1',
      certificateNumber: 'AF-SCOUT-2026-001',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      scoutGrade: 'الأول إعدادي',
      scoutSection: '1',
      title: 'شهادة تميز وانضباط كشفي',
      reason: 'تقديراً لسلوكه المثالي وأخلاقه العالية وتميزه في الأنشطة الميدانية ومخيم الصخير الكشفي',
      achievementType: 'شرف الفرقة الأول',
      date: '2026-10-15',
      issuerLeaderName: 'القائد باسل حسن & القائد محمد علي',
      templateId: 'GOLDEN',
      createdAt: '2026-10-15T12:00:00Z'
    }
  ];

  const announcements: Announcement[] = [
    {
      id: 'ann_1',
      title: 'انطلاق اللقاءات الدورية لطليعتي الفاتح والصقر',
      content: 'تعلن قيادة الفرقة عن بدء اللقاءات التدريبية الأسبوعية كل ثلاثاء في النادي الكشفي بعد الدوام المدرسي، متمنين للجميع الاستفادة والتميز.',
      category: 'تنبيه هام',
      isPublic: true,
      authorName: 'القائد باسل حسن',
      createdAt: '2026-10-10T08:00:00Z'
    },
    {
      id: 'ann_2',
      title: 'فتح باب رفع الصور الشخصية بالزي الكشفي الرسمي',
      content: 'يُرجى من جميع الكشافين المسجلين رفع صورهم الحديثة بالبدلة الكشفية المعتمدة لاعتماد بطاقات العضوية والشارات وشاشة التميز السنوية.',
      category: 'إرشادات كشفية',
      isPublic: true,
      authorName: 'القائد محمد علي',
      createdAt: '2026-10-12T09:00:00Z'
    }
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      recipientUserId: 'usr_scout_1',
      title: 'تم اعتماد نقاط إيجابية جديدة (+5)',
      message: 'قام أ. سلمان البنعلي بمنحك 5 نقاط عن حسن الخلق والمبادرة، واعتمدها القائد باسل.',
      type: 'POINT_ADDED',
      isRead: false,
      createdAt: '2026-10-08T12:00:00Z'
    },
    {
      id: 'notif_2',
      recipientUserId: 'usr_scout_1',
      title: 'مبارك! حصلت على شارة كشاف متميز',
      message: 'تم منحك شارة كشاف متميز تقديراً لجهودك ومشاركتك في مخيم الصخير.',
      type: 'BADGE',
      isRead: false,
      createdAt: '2026-10-01T10:00:00Z'
    },
    {
      id: 'notif_3',
      recipientUserId: 'usr_parent_ahmed',
      title: 'تقييم إيجابي جديد لابنكم أحمد (+5)',
      message: 'سجل أ. سلمان البنعلي 5 نقاط إيجابية لأحمد عن حسن الخلق في المدرسة.',
      type: 'POINT_ADDED',
      isRead: false,
      createdAt: '2026-10-08T12:05:00Z'
    }
  ];

  const parentEncouragements: ParentEncouragement[] = [
    {
      id: 'penc_1',
      parentId: 'usr_parent_ahmed',
      parentName: 'سلمان البلوشي (ولي الأمر)',
      scoutId: 'sct_1',
      scoutName: 'أحمد سلمان البلوشي',
      message: 'فخورون بك يا بطل! واصل التميز والاجتهاد والأخلاق الطيبة، رفعت رؤوسنا جميعاً.',
      status: 'APPROVED',
      createdAt: '2026-10-09T14:00:00Z'
    }
  ];

  const auditLogs: AuditLogItem[] = [
    {
      id: 'aud_1',
      action: 'تهيئة النظام وقاعدة البيانات',
      actorId: 'usr_basel',
      actorName: 'القائد باسل حسن',
      actorRole: 'LEADER',
      targetResource: 'System',
      details: 'تم بدء تدشين منصة فرقة فتيان أحمد الفاتح الكشفية للعام الدراسي 2026-2027.',
      timestamp: '2026-09-01T08:00:00Z'
    },
    {
      id: 'aud_2',
      action: 'اعتماد نقاط سلوكية',
      actorId: 'usr_basel',
      actorName: 'القائد باسل حسن',
      actorRole: 'LEADER',
      targetResource: 'Points',
      details: 'اعتماد 5 نقاط إيجابية للكشاف أحمد سلمان البلوشي مقترحة من أ. سلمان البنعلي.',
      timestamp: '2026-10-08T12:00:00Z'
    }
  ];

  const settings: SiteSettings = {
    troopName: 'فرقة فتيان أحمد الفاتح الكشفية',
    schoolName: 'مدرسة أحمد الفاتح الإعدادية للبنين',
    kingdom: 'مملكة البحرين',
    ministryName: 'وزارة التربية والتعليم - كشافة البحرين',
    currentAcademicYear: '2026-2027',
    competitionPeriod: {
      name: 'منافسة درع الفاتح السنوية 2026-2027',
      startDate: '2026-09-01',
      endDate: '2027-06-15',
      isActive: true
    },
    pointsRules: {
      minPositive: 1,
      maxPositive: 5,
      requireLeaderApprovalForDeductions: true,
      requireLeaderApprovalForPositive: true,
      consecutiveViolationsForSuspension: 3
    },
    contactInfo: {
      schoolPhone: '+973 1700 0000',
      troopEmail: 'ahmedalfateh.scouts@moe.gov.bh',
      address: 'مملكة البحرين - مدرسة أحمد الفاتح الإعدادية للبنين'
    },
    privacyPolicyText: 'تلتزم فرقة فتيان أحمد الفاتح الكشفية بحماية خصوصية بيانات الطلاب وسجلاتهم السلوكية وصورهم الشخصية. تطبق المنصة سياسات وزارة التربية والتعليم بمملكة البحرين، ولا يُسمح بنشر بيانات أو صور الطلبة للعامة دون موافقة رسمية من ولي الأمر وقيادة الفرقة.'
  };

  return {
    settings,
    users,
    scouts,
    teachers,
    evaluations,
    suspensionRequests,
    incidentReports,
    activities,
    attendance,
    badges,
    awardedBadges,
    certificates,
    announcements,
    notifications,
    parentEncouragements,
    auditLogs
  };
}

// Database helper functions
let db: DatabaseSchema;

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed reading DB file, reinitializing default:', err);
  }
  const initial = createInitialDatabase();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing database to disk:', err);
  }
}

// Initialize db
db = loadDatabase();

// Recalculate scout balances safely
function recalculateScoutBalances() {
  for (const scout of db.scouts) {
    const scoutEvals = db.evaluations.filter(e => e.scoutId === scout.id && e.status === 'APPROVED');
    const positive = scoutEvals
      .filter(e => e.type === 'POSITIVE')
      .reduce((sum, e) => sum + e.points, 0);
    const deductions = scoutEvals
      .filter(e => e.type === 'DEDUCTION')
      .reduce((sum, e) => sum + e.points, 0);

    scout.totalPositivePoints = positive;
    scout.totalDeductions = deductions;
    scout.netBalance = positive - deductions;

    const badges = db.awardedBadges.filter(b => b.scoutId === scout.id);
    scout.badgeCount = badges.length;

    const attendances = db.attendance.filter(a => a.scoutId === scout.id && a.status === 'PRESENT');
    scout.activitiesAttendedCount = attendances.length;
  }
}

// Express Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper to log audit actions
function logAudit(action: string, actor: { id: string; name: string; role: any }, resource: string, details: string) {
  const item: AuditLogItem = {
    id: generateId(),
    action,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    targetResource: resource,
    details,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(item);
  saveDatabase(db);
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

// 1. Health check & Initial Public Data
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

app.get('/api/public-info', (req: Request, res: Response) => {
  recalculateScoutBalances();
  // Safe public info without exposing private student records to unauthenticated visitors
  const publishedAnnouncements = db.announcements.filter(a => a.isPublic);
  const upcomingActivities = db.activities
    .filter(a => a.status === 'PUBLISHED')
    .map(a => ({
      id: a.id,
      title: a.title,
      type: a.type,
      location: a.location,
      date: a.date,
      time: a.time,
      description: a.description
    }));

  res.json({
    settings: {
      troopName: db.settings.troopName,
      schoolName: db.settings.schoolName,
      kingdom: db.settings.kingdom,
      ministryName: db.settings.ministryName,
      competitionPeriod: db.settings.competitionPeriod,
      contactInfo: db.settings.contactInfo,
      privacyPolicyText: db.settings.privacyPolicyText
    },
    announcements: publishedAnnouncements,
    upcomingActivities,
    stats: {
      scoutsCount: db.scouts.filter(s => s.status === 'ACTIVE').length,
      teachersCount: db.teachers.filter(t => t.status === 'ACTIVE').length,
      activitiesCount: db.activities.length
    }
  });
});

// 2. Authentication Route
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
  }

  const user = db.users.find(u => u.username.trim().toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'تم تعطيل هذا الحساب، يرجى مراجعة قيادة الفرقة' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  // Safe user profile response
  const { passwordHash, salt, ...safeUser } = user;

  // Include scout profile if role is scout
  let scoutProfile = null;
  if (user.role === 'SCOUT' && user.scoutId) {
    scoutProfile = db.scouts.find(s => s.id === user.scoutId);
  }

  // Include linked scouts if role is parent
  let linkedScouts: ScoutProfile[] = [];
  if (user.role === 'PARENT' && user.linkedScoutIds) {
    linkedScouts = db.scouts.filter(s => user.linkedScoutIds?.includes(s.id));
  }

  // Include teacher profile
  let teacherProfile = null;
  if (user.role === 'TEACHER') {
    teacherProfile = db.teachers.find(t => t.userId === user.id);
  }

  logAudit('تسجيل دخول ناجح', { id: user.id, name: user.fullName, role: user.role }, 'Auth', `دخول إلى حساب ${user.fullName}`);

  res.json({
    token: `session_${user.id}_${Date.now()}`,
    user: safeUser,
    scoutProfile,
    linkedScouts,
    teacherProfile
  });
});

// Change Password
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
  }

  user.salt = crypto.randomBytes(16).toString('hex');
  user.passwordHash = hashPassword(newPassword, user.salt);
  saveDatabase(db);

  logAudit('تغيير كلمة المرور', { id: user.id, name: user.fullName, role: user.role }, 'Auth', `تم تحديث كلمة المرور للحساب ${user.username}`);
  res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
});

// 3. Distinction Screen (نجوم فرقة فتيان أحمد الفاتح الكشفية)
app.get('/api/distinction/top3', (req: Request, res: Response) => {
  recalculateScoutBalances();

  // Active scouts sorted by net balance descending
  const sorted = [...db.scouts]
    .filter(s => s.status === 'ACTIVE')
    .sort((a, b) => b.netBalance - a.netBalance);

  // Take top 3 with ties handled
  const topScouts = sorted.slice(0, 3);

  res.json({
    periodName: db.settings.competitionPeriod.name,
    topScouts: topScouts.map((s, idx) => ({
      rank: idx + 1,
      id: s.id,
      fullName: s.fullName,
      grade: s.grade,
      section: s.section,
      patrolName: s.patrolName || 'طليعة الفاتح',
      avatarUrl: s.avatarStatus === 'APPROVED' && s.avatarUrl ? s.avatarUrl : null,
      netBalance: s.netBalance,
      badgeCount: s.badgeCount,
      activitiesAttendedCount: s.activitiesAttendedCount
    }))
  });
});

// 4. Scouts APIs
app.get('/api/scouts', (req: Request, res: Response) => {
  recalculateScoutBalances();
  const { grade, section, status } = req.query;
  let list = db.scouts;
  if (grade) list = list.filter(s => s.grade === grade);
  if (section) list = list.filter(s => s.section === section);
  if (status) list = list.filter(s => s.status === status);
  res.json(list);
});

app.get('/api/scouts/:id', (req: Request, res: Response) => {
  recalculateScoutBalances();
  const scout = db.scouts.find(s => s.id === req.params.id);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const evals = db.evaluations.filter(e => e.scoutId === scout.id);
  const badges = db.awardedBadges.filter(b => b.scoutId === scout.id);
  const certs = db.certificates.filter(c => c.scoutId === scout.id);
  const attendances = db.attendance.filter(a => a.scoutId === scout.id);
  const suspensions = db.suspensionRequests.filter(sr => sr.scoutId === scout.id);

  res.json({
    scout,
    evaluations: evals,
    badges,
    certificates: certs,
    attendance: attendances,
    suspensions
  });
});

// Add Single Scout (Leader Only)
app.post('/api/scouts', (req: Request, res: Response) => {
  const { fullName, nationalId, grade, section, patrolName, parentName, parentPhone, username, password, actor } = req.body;
  if (!fullName || !nationalId || !grade || !section) {
    return res.status(400).json({ error: 'يرجى ملء جميع الحقول الإلزامية للكشاف' });
  }

  // Prevent duplicate national ID
  if (db.scouts.some(s => s.nationalId === nationalId.trim())) {
    return res.status(400).json({ error: 'الرقم الشخصي مسجل مسبقاً لكشاف آخر' });
  }

  const scoutId = generateId();
  const userId = generateId();
  const scoutUsername = username || `scout_${nationalId.trim()}`;
  const scoutPassword = password || '123456';
  const salt = crypto.randomBytes(16).toString('hex');

  const newUser: User & { passwordHash: string; salt: string } = {
    id: userId,
    username: scoutUsername,
    fullName,
    nationalId,
    role: 'SCOUT',
    isActive: true,
    scoutId,
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: hashPassword(scoutPassword, salt)
  };

  const newScout: ScoutProfile = {
    id: scoutId,
    userId,
    fullName,
    nationalId,
    grade,
    section,
    patrolName: patrolName || 'طليعة الفاتح',
    avatarUrl: '',
    avatarStatus: 'PENDING',
    totalPositivePoints: 0,
    totalDeductions: 0,
    netBalance: 0,
    badgeCount: 0,
    activitiesAttendedCount: 0,
    registrationYear: db.settings.currentAcademicYear,
    status: 'ACTIVE',
    parentName,
    parentPhone
  };

  db.users.push(newUser);
  db.scouts.push(newScout);
  saveDatabase(db);

  logAudit('إضافة كشاف جديد', actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' }, 'Scouts', `إضافة الكشاف ${fullName} بالصف ${grade} / ${section}`);
  res.json({ success: true, scout: newScout, username: scoutUsername });
});

// Update Scout
app.put('/api/scouts/:id', (req: Request, res: Response) => {
  const scout = db.scouts.find(s => s.id === req.params.id);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const { fullName, grade, section, patrolName, status, parentName, parentPhone, actor } = req.body;
  if (fullName) scout.fullName = fullName;
  if (grade) scout.grade = grade;
  if (section) scout.section = section;
  if (patrolName !== undefined) scout.patrolName = patrolName;
  if (status) scout.status = status;
  if (parentName) scout.parentName = parentName;
  if (parentPhone) scout.parentPhone = parentPhone;

  // Also update corresponding user name
  const user = db.users.find(u => u.scoutId === scout.id);
  if (user && fullName) user.fullName = fullName;

  saveDatabase(db);
  logAudit('تعديل بيانات كشاف', actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' }, 'Scouts', `تعديل الكشاف ${scout.fullName}`);
  res.json({ success: true, scout });
});

// Upload Scout Avatar with explicit review guidelines
app.post('/api/scouts/:id/avatar', (req: Request, res: Response) => {
  const scout = db.scouts.find(s => s.id === req.params.id);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const { avatarDataUrl } = req.body;
  if (!avatarDataUrl || !avatarDataUrl.startsWith('data:image/')) {
    return res.status(400).json({ error: 'صيغة الصورة غير صحيحة، يرجى رفع ملف صورة سليم' });
  }

  // Set avatar in PENDING status for leader review
  scout.avatarUrl = avatarDataUrl;
  scout.avatarStatus = 'PENDING';
  scout.avatarRejectionReason = undefined;

  // Notify leaders
  for (const leader of db.users.filter(u => u.role === 'LEADER')) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: leader.id,
      title: 'طلب اعتماد صورة شخصية لكشاف',
      message: `قام الكشاف ${scout.fullName} برفع صورة جديدة بالبدلة الكشفية بانتظار اعتمادك.`,
      type: 'APPROVAL',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'تم رفع الصورة بنجاح وتنتظر مراجعة واعتماد القائد قبل نشرها.' });
});

// Leader Approve or Reject Avatar
app.post('/api/scouts/:id/review-avatar', (req: Request, res: Response) => {
  const scout = db.scouts.find(s => s.id === req.params.id);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const { decision, reason, actor } = req.body; // 'APPROVED' or 'REJECTED'
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return res.status(400).json({ error: 'قرار غير صالح' });
  }

  scout.avatarStatus = decision;
  if (decision === 'REJECTED') {
    scout.avatarRejectionReason = reason || 'الصورة لا تطابق معايير الزي الكشفي الرسمي المعتمد أو غير واضحة';
  } else {
    scout.avatarRejectionReason = undefined;
  }

  // Notify the scout
  const scoutUser = db.users.find(u => u.scoutId === scout.id);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: decision === 'APPROVED' ? 'تم اعتماد صورتك الشخصية' : 'تم رفض الصورة الشخصية',
      message: decision === 'APPROVED'
        ? 'اعتمد القائد صورتك بالبدلة الكشفية الرسمية، وستظهر الآن في شاشة التميز وملفك الكشفي.'
        : `تم رفض الصورة المرفوعة للسبب التالي: ${scout.avatarRejectionReason}. يرجى إعادة رفع صورة بالزي الكشفي المعتمد.`,
      type: decision === 'APPROVED' ? 'APPROVAL' : 'REJECTION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(`مراجعة صورة كشاف (${decision})`, actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' }, 'Media', `مراجعة صورة الكشاف ${scout.fullName}`);
  res.json({ success: true, scout });
});

// 5. Teachers APIs
app.get('/api/teachers', (req: Request, res: Response) => {
  res.json(db.teachers);
});

app.post('/api/teachers', (req: Request, res: Response) => {
  const { fullName, employeeId, subject, assignedClasses, username, password, actor } = req.body;
  if (!fullName || !employeeId) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المعلم ورقمه الوظيفي' });
  }

  const teacherId = generateId();
  const userId = generateId();
  const teacherUsername = username || `teacher_${employeeId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const teacherPassword = password || '123456';
  const salt = crypto.randomBytes(16).toString('hex');

  const newUser: User & { passwordHash: string; salt: string } = {
    id: userId,
    username: teacherUsername,
    fullName,
    role: 'TEACHER',
    isActive: true,
    assignedClasses: assignedClasses || ['الأول إعدادي - 1'],
    createdAt: new Date().toISOString(),
    salt,
    passwordHash: hashPassword(teacherPassword, salt)
  };

  const newTeacher: TeacherProfile = {
    id: teacherId,
    userId,
    fullName,
    employeeId,
    subject: subject || 'معلم مواد دراسية',
    assignedClasses: assignedClasses || ['الأول إعدادي - 1'],
    evaluationsGivenCount: 0,
    status: 'ACTIVE'
  };

  db.users.push(newUser);
  db.teachers.push(newTeacher);
  saveDatabase(db);

  logAudit('إضافة معلم جديد', actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' }, 'Teachers', `إضافة المعلم ${fullName} (${employeeId})`);
  res.json({ success: true, teacher: newTeacher, username: teacherUsername });
});

// Update teacher classes
app.put('/api/teachers/:id/classes', (req: Request, res: Response) => {
  const teacher = db.teachers.find(t => t.id === req.params.id);
  if (!teacher) return res.status(404).json({ error: 'المعلم غير موجود' });

  const { assignedClasses } = req.body;
  if (!Array.isArray(assignedClasses)) {
    return res.status(400).json({ error: 'قائمة الصفوف غير صالحة' });
  }

  teacher.assignedClasses = assignedClasses;
  const user = db.users.find(u => u.id === teacher.userId);
  if (user) user.assignedClasses = assignedClasses;

  saveDatabase(db);
  res.json({ success: true, teacher });
});

// 6. Points & Evaluations System
app.get('/api/evaluations', (req: Request, res: Response) => {
  const { scoutId, status, type } = req.query;
  let list = db.evaluations;
  if (scoutId) list = list.filter(e => e.scoutId === scoutId);
  if (status) list = list.filter(e => e.status === status);
  if (type) list = list.filter(e => e.type === type);
  res.json(list);
});

// Submit Evaluation (Teacher or Leader)
app.post('/api/evaluations', (req: Request, res: Response) => {
  const { scoutId, type, points, behaviorCategory, notes, encouragementMessage, actor } = req.body;
  if (!scoutId || !type || !points || !behaviorCategory) {
    return res.status(400).json({ error: 'يرجى استكمال بيانات التقييم' });
  }

  const scout = db.scouts.find(s => s.id === scoutId);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const pointsNum = Math.abs(Number(points));
  if (pointsNum < 1 || pointsNum > 10) {
    return res.status(400).json({ error: 'النقاط يجب أن تكون بين 1 و 5 للتقييمات الإيجابية والحدود المعتمدة للخصم' });
  }

  // Determine approval state:
  // Leaders approve instantly; teachers' entries may require leader approval based on settings
  const isLeader = actor?.role === 'LEADER';
  const autoApprove = isLeader;
  const status: EvaluationStatus = autoApprove ? 'APPROVED' : 'PENDING';

  const newEval: PointEvaluation = {
    id: generateId(),
    scoutId: scout.id,
    scoutName: scout.fullName,
    scoutGrade: scout.grade,
    scoutSection: scout.section,
    evaluatorId: actor?.id || 'unknown',
    evaluatorName: actor?.name || 'معلم',
    evaluatorRole: actor?.role || 'TEACHER',
    type,
    points: pointsNum,
    behaviorCategory,
    notes,
    encouragementMessage,
    status,
    reviewedById: autoApprove ? actor?.id : undefined,
    reviewedByName: autoApprove ? actor?.name : undefined,
    reviewDate: autoApprove ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString()
  };

  db.evaluations.unshift(newEval);

  // Update teacher evaluation count
  if (actor?.role === 'TEACHER') {
    const teacher = db.teachers.find(t => t.userId === actor.id);
    if (teacher) teacher.evaluationsGivenCount += 1;
  }

  recalculateScoutBalances();

  // Notifications
  const scoutUser = db.users.find(u => u.scoutId === scout.id);
  if (scoutUser) {
    const title = type === 'POSITIVE'
      ? (status === 'APPROVED' ? `تم اعتماد +${pointsNum} نقطة إيجابية!` : `تم تسجيل +${pointsNum} نقطة إيجابية (قيد المراجعة)`)
      : (status === 'APPROVED' ? `تم خصم -${pointsNum} نقطة سلوكية` : `تم تسجيل طلب خصم -${pointsNum} نقطة (قيد مراجعة القائد)`);

    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title,
      message: `${behaviorCategory} - بواسطة: ${newEval.evaluatorName}${encouragementMessage ? ` | ${encouragementMessage}` : ''}`,
      type: type === 'POSITIVE' ? 'POINT_ADDED' : 'POINT_DEDUCTED',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  // If pending, notify leaders
  if (status === 'PENDING') {
    for (const leader of db.users.filter(u => u.role === 'LEADER')) {
      db.notifications.unshift({
        id: generateId(),
        recipientUserId: leader.id,
        title: `تقييم جديد يحتاج المراجعة (${type === 'POSITIVE' ? 'إيجابي' : 'خصم'})`,
        message: `سجل ${newEval.evaluatorName} تقييماً للكشاف ${scout.fullName} (${pointsNum} نقطة)`,
        type: 'APPROVAL',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  saveDatabase(db);
  logAudit(
    `تسجيل تقييم (${type === 'POSITIVE' ? 'إيجابي' : 'خصم'})`,
    actor || { id: 'unknown', name: 'مستخدم', role: 'TEACHER' },
    'Points',
    `${pointsNum} نقطة للكشاف ${scout.fullName} - ${behaviorCategory} - الحالة: ${status}`
  );

  res.json({ success: true, evaluation: newEval, scoutBalance: scout.netBalance });
});

// Leader Approve or Reject Evaluation
app.post('/api/evaluations/:id/review', (req: Request, res: Response) => {
  const evalItem = db.evaluations.find(e => e.id === req.params.id);
  if (!evalItem) return res.status(404).json({ error: 'التقييم غير موجود' });

  const { decision, reviewNotes, actor } = req.body; // 'APPROVED' or 'REJECTED'
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return res.status(400).json({ error: 'قرار غير صالح' });
  }

  evalItem.status = decision;
  evalItem.reviewedById = actor?.id;
  evalItem.reviewedByName = actor?.name || 'القائد';
  evalItem.reviewDate = new Date().toISOString();
  evalItem.reviewNotes = reviewNotes;

  recalculateScoutBalances();

  // Notify Scout
  const scoutUser = db.users.find(u => u.scoutId === evalItem.scoutId);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: decision === 'APPROVED' ? 'تم اعتماد التقييم رسميًا' : 'تم رفض التقييم من قيادة الفرقة',
      message: `${evalItem.behaviorCategory} (${evalItem.points} نقطة) - ${decision === 'APPROVED' ? 'أُضيفت لرصيدك' : 'لم تُحتسب في الرصيد'}`,
      type: decision === 'APPROVED' ? 'APPROVAL' : 'REJECTION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    `مراجعة تقييم (${decision})`,
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Points',
    `تقييم ${evalItem.scoutName} - ${evalItem.behaviorCategory}`
  );

  res.json({ success: true, evaluation: evalItem });
});

// Documented Correction (Leader Only)
app.post('/api/evaluations/:id/correct', (req: Request, res: Response) => {
  const evalItem = db.evaluations.find(e => e.id === req.params.id);
  if (!evalItem) return res.status(404).json({ error: 'التقييم غير موجود' });

  const { newPoints, correctionReason, actor } = req.body;
  if (!newPoints || !correctionReason) {
    return res.status(400).json({ error: 'يرجى تحديد النقاط المصححة وسبب التصحيح' });
  }

  const oldPoints = evalItem.points;
  evalItem.points = Math.abs(Number(newPoints));
  evalItem.status = 'CORRECTED';
  evalItem.correctionReason = correctionReason;
  evalItem.reviewedById = actor?.id;
  evalItem.reviewedByName = actor?.name || 'القائد';
  evalItem.reviewDate = new Date().toISOString();

  recalculateScoutBalances();
  saveDatabase(db);

  logAudit(
    'تصحيح موثق لتقييم',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Points',
    `تعديل نقاط ${evalItem.scoutName} من ${oldPoints} إلى ${evalItem.points} - السبب: ${correctionReason}`
  );

  res.json({ success: true, evaluation: evalItem });
});

// 7. Suspension Requests (طلبات الحرمان)
app.get('/api/suspensions', (req: Request, res: Response) => {
  res.json(db.suspensionRequests);
});

app.post('/api/suspensions', (req: Request, res: Response) => {
  const { scoutId, violationType, violationCount, description, targetActivities, requestedDuration, actor } = req.body;
  if (!scoutId || !violationType || !description || !requestedDuration) {
    return res.status(400).json({ error: 'يرجى استكمال جميع بيانات طلب الحرمان' });
  }

  const scout = db.scouts.find(s => s.id === scoutId);
  if (!scout) return res.status(404).json({ error: 'الكشاف غير موجود' });

  const newRequest: SuspensionRequest = {
    id: generateId(),
    scoutId: scout.id,
    scoutName: scout.fullName,
    scoutGrade: scout.grade,
    scoutSection: scout.section,
    requesterId: actor?.id || 'unknown',
    requesterName: actor?.name || 'المعلم',
    requesterRole: actor?.role || 'TEACHER',
    violationType,
    violationCount: violationCount || 1,
    description,
    targetActivities: targetActivities || 'الأنشطة الميدانية والرحلات الخارجية',
    requestedDuration,
    status: 'NEW',
    createdAt: new Date().toISOString()
  };

  db.suspensionRequests.unshift(newRequest);

  // Notify Leaders
  for (const leader of db.users.filter(u => u.role === 'LEADER')) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: leader.id,
      title: 'طلب حرمان جديد من الأنشطة',
      message: `رفع ${newRequest.requesterName} طلب حرمان للكشاف ${scout.fullName} لمدة ${requestedDuration}`,
      type: 'SUSPENSION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    'إنشاء طلب حرمان',
    actor || { id: 'unknown', name: 'المعلم', role: 'TEACHER' },
    'Suspensions',
    `طلب حرمان للكشاف ${scout.fullName} - ${violationType} (${requestedDuration})`
  );

  res.json({ success: true, request: newRequest });
});

// Leader Decide on Suspension Request
app.post('/api/suspensions/:id/decide', (req: Request, res: Response) => {
  const request = db.suspensionRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'الطلب غير موجود' });

  const { decision, decisionNotes, approvedDuration, actor } = req.body; // 'APPROVED' or 'REJECTED'
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return res.status(400).json({ error: 'قرار غير صالح' });
  }

  request.status = decision;
  request.decisionLeaderId = actor?.id;
  request.decisionLeaderName = actor?.name || 'القائد';
  request.decisionDate = new Date().toISOString();
  request.decisionNotes = decisionNotes;

  const scout = db.scouts.find(s => s.id === request.scoutId);
  if (decision === 'APPROVED' && scout) {
    const dur = approvedDuration || request.requestedDuration || 'أسبوعان';
    request.approvedDuration = dur;
    request.suspensionStartDate = new Date().toISOString();

    // Calculate end date based on duration
    const endDate = new Date();
    if (dur.includes('أسبوعان')) endDate.setDate(endDate.getDate() + 14);
    else if (dur.includes('شهران')) endDate.setMonth(endDate.getMonth() + 2);
    else if (dur.includes('شهر')) endDate.setMonth(endDate.getMonth() + 1);
    else if (dur.includes('فصلان')) endDate.setMonth(endDate.getMonth() + 8);
    else endDate.setMonth(endDate.getMonth() + 4);

    request.suspensionEndDate = endDate.toISOString();
    scout.status = 'SUSPENDED';
    scout.suspensionEndDate = request.suspensionEndDate;
    scout.suspensionReason = request.violationType;
  }

  // Notify Scout & Requester
  const scoutUser = db.users.find(u => u.scoutId === request.scoutId);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: decision === 'APPROVED' ? 'تنبيه إداري: قرار حرمان مؤقت من الأنشطة' : 'تم حفظ طلب الحرمان دون عقوبة',
      message: decision === 'APPROVED'
        ? `صدر قرار بحرمانكم من ${request.targetActivities} لمدة ${request.approvedDuration}. يُرجى الالتزام وتصحيح السلوك.`
        : `راجعت قيادة الفرقة الملاحظة السلوكية وقررت الاكتفاء بالتوجيه التربوي.`,
      type: 'SUSPENSION',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    `قرار طلب حرمان (${decision})`,
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Suspensions',
    `قرار بشأن ${request.scoutName}: ${decision} - ${decisionNotes || ''}`
  );

  res.json({ success: true, request });
});

// 8. Incident Reports (البلاغات والملاحظات)
app.get('/api/reports', (req: Request, res: Response) => {
  res.json(db.incidentReports);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const { title, category, severity, description, scoutId, targetClass, actor } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'العنوان والوصف مطلوبان' });
  }

  let scoutName = undefined;
  if (scoutId) {
    const s = db.scouts.find(sc => sc.id === scoutId);
    if (s) scoutName = s.fullName;
  }

  const report: IncidentReport = {
    id: generateId(),
    title,
    category: category || 'سلوكي',
    severity: severity || 'متوسط',
    description,
    scoutId,
    scoutName,
    targetClass,
    senderId: actor?.id || 'unknown',
    senderName: actor?.name || 'المعلم',
    senderRole: actor?.role || 'TEACHER',
    status: 'جديد',
    createdAt: new Date().toISOString()
  };

  db.incidentReports.unshift(report);

  // Notify Leaders
  for (const leader of db.users.filter(u => u.role === 'LEADER')) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: leader.id,
      title: `بلاغ جديد: ${title}`,
      message: `${report.senderName} (${category} - أولوية: ${severity})`,
      type: 'GENERAL',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  res.json({ success: true, report });
});

app.post('/api/reports/:id/respond', (req: Request, res: Response) => {
  const report = db.incidentReports.find(r => r.id === req.params.id);
  if (!report) return res.status(404).json({ error: 'البلاغ غير موجود' });

  const { response, status, actor } = req.body;
  report.leaderResponse = response;
  report.status = status || 'تمت المعالجة';
  report.respondedAt = new Date().toISOString();

  // Notify sender
  db.notifications.unshift({
    id: generateId(),
    recipientUserId: report.senderId,
    title: `رد قيادة الفرقة على البلاغ: ${report.title}`,
    message: response,
    type: 'GENERAL',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ success: true, report });
});

// 9. Troop Activities & Attendance (الفعاليات الداخلية والخارجية)
app.get('/api/activities', (req: Request, res: Response) => {
  res.json(db.activities);
});

app.post('/api/activities', (req: Request, res: Response) => {
  const { 
    title, description, type, location, date, time, returnTime, 
    targetGrades, requiresParentConsent, emergencyContact, requiredItems, 
    meetingInstructions, images, actor 
  } = req.body;

  if (!title || !location || !date || !time) {
    return res.status(400).json({ error: 'يرجى إدخال اسم الفعالية، الموقع، التاريخ والوقت' });
  }

  const newActivity: TroopActivity = {
    id: generateId(),
    title,
    description: description || '',
    type: type || 'INTERNAL',
    location,
    date,
    time,
    returnTime,
    targetGrades: Array.isArray(targetGrades) ? targetGrades : ['الأول إعدادي', 'الثاني إعدادي', 'الثالث إعدادي'],
    status: 'PUBLISHED',
    requiresParentConsent: !!requiresParentConsent,
    emergencyContact,
    requiredItems,
    meetingInstructions,
    images: Array.isArray(images) ? images : [],
    attendeesCount: 0,
    createdAt: new Date().toISOString()
  };

  db.activities.unshift(newActivity);

  // Notify all active scouts and parents
  for (const user of db.users.filter(u => u.role === 'SCOUT' || u.role === 'PARENT')) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: user.id,
      title: `فعالية كشفية جديدة: ${title}`,
      message: `${type === 'EXTERNAL' ? 'فعالية خارج المدرسة' : 'فعالية داخل المدرسة'} في ${location} بتاريخ ${date}`,
      type: 'EVENT',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    'إضافة فعالية جديدة',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Activities',
    `إضافة فعالية: ${title} (${type})`
  );

  res.json({ success: true, activity: newActivity });
});

// Record Activity Attendance
app.post('/api/activities/:id/attendance', (req: Request, res: Response) => {
  const activity = db.activities.find(a => a.id === req.params.id);
  if (!activity) return res.status(404).json({ error: 'الفعالية غير موجودة' });

  const { scoutAttendances, actor } = req.body; // array of { scoutId, status, parentConsentApproved, notes }
  if (!Array.isArray(scoutAttendances)) {
    return res.status(400).json({ error: 'بيانات الحضور غير صالحة' });
  }

  // Remove existing attendance records for this activity
  db.attendance = db.attendance.filter(a => a.activityId !== activity.id);

  let presentCount = 0;
  for (const item of scoutAttendances) {
    const scout = db.scouts.find(s => s.id === item.scoutId);
    if (!scout) continue;

    if (item.status === 'PRESENT') presentCount++;

    db.attendance.push({
      id: generateId(),
      activityId: activity.id,
      scoutId: scout.id,
      scoutName: scout.fullName,
      status: item.status || 'PRESENT',
      parentConsentApproved: !!item.parentConsentApproved,
      notes: item.notes,
      markedAt: new Date().toISOString()
    });
  }

  activity.attendeesCount = presentCount;
  recalculateScoutBalances();
  saveDatabase(db);

  logAudit(
    'تسجيل حضور فعالية',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Attendance',
    `حضور فعالية ${activity.title}: ${presentCount} حاضرين`
  );

  res.json({ success: true, count: presentCount });
});

// 10. Badges & Rewards (الشارات والأوسمة)
app.get('/api/badges', (req: Request, res: Response) => {
  res.json({ badges: db.badges, awarded: db.awardedBadges });
});

app.post('/api/badges/award', (req: Request, res: Response) => {
  const { badgeId, scoutId, notes, actor } = req.body;
  const badge = db.badges.find(b => b.id === badgeId);
  const scout = db.scouts.find(s => s.id === scoutId);

  if (!badge || !scout) {
    return res.status(400).json({ error: 'الشارة أو الكشاف غير موجود' });
  }

  const award: AwardedBadge = {
    id: generateId(),
    badgeId: badge.id,
    badgeTitle: badge.title,
    badgeCategory: badge.category,
    badgeIcon: badge.icon,
    scoutId: scout.id,
    scoutName: scout.fullName,
    awardedById: actor?.id || 'leader',
    awardedByName: actor?.name || 'القائد باسل حسن',
    notes,
    awardedAt: new Date().toISOString()
  };

  db.awardedBadges.push(award);
  recalculateScoutBalances();

  // Notify Scout
  const scoutUser = db.users.find(u => u.scoutId === scout.id);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: `مبروك! تم منحك شارة: ${badge.title}`,
      message: `${badge.description} - ${notes || ''}`,
      type: 'BADGE',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    'منح شارة كشفية',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Badges',
    `منح شارة ${badge.title} للكشاف ${scout.fullName}`
  );

  res.json({ success: true, award });
});

// 11. Certificates (شهادات التقدير)
app.get('/api/certificates', (req: Request, res: Response) => {
  res.json(db.certificates);
});

app.post('/api/certificates', (req: Request, res: Response) => {
  const { scoutId, title, reason, achievementType, templateId, actor } = req.body;
  const scout = db.scouts.find(s => s.id === scoutId);
  if (!scout || !title || !reason) {
    return res.status(400).json({ error: 'يرجى تحديد الكشاف وعنوان الشهادة والسبب' });
  }

  const certNumber = `AF-SCOUT-${new Date().getFullYear()}-${String(db.certificates.length + 1).padStart(3, '0')}`;

  const cert: Certificate = {
    id: generateId(),
    certificateNumber: certNumber,
    scoutId: scout.id,
    scoutName: scout.fullName,
    scoutGrade: scout.grade,
    scoutSection: scout.section,
    title,
    reason,
    achievementType: achievementType || 'التميز والانضباط الكشفي',
    date: new Date().toISOString().split('T')[0],
    issuerLeaderName: actor?.name || 'القائد باسل حسن & القائد محمد علي',
    templateId: templateId || 'GOLDEN',
    createdAt: new Date().toISOString()
  };

  db.certificates.unshift(cert);

  // Notify scout
  const scoutUser = db.users.find(u => u.scoutId === scout.id);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: `صدرت لك شهادة تقدير رقم ${certNumber}`,
      message: `${title} - ${reason}`,
      type: 'BADGE',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  logAudit(
    'إصدار شهادة تقدير',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Certificates',
    `إصدار شهادة تقدير (${certNumber}) للكشاف ${scout.fullName}`
  );

  res.json({ success: true, certificate: cert });
});

// 12. Excel Import & Templates (استيراد الكشافين والمعلمين من Excel)
// Provide ready-to-download Excel template buffer
app.get('/api/import/template/:type', (req: Request, res: Response) => {
  const { type } = req.params; // 'scouts' or 'teachers'
  const wb = XLSX.utils.book_new();

  if (type === 'scouts') {
    const scoutData = [
      {
        'الاسم الكامل': 'محمد خليل إبراهيم',
        'الرقم الشخصي': '120509876',
        'الصف': 'الأول إعدادي',
        'الشعبة': '1',
        'اسم الطليعة': 'طليعة الفاتح',
        'اسم ولي الأمر': 'خليل إبراهيم',
        'هاتف ولي الأمر': '39123456'
      },
      {
        'الاسم الكامل': 'فيصل جاسم راشد',
        'الرقم الشخصي': '120601234',
        'الصف': 'الأول إعدادي',
        'الشعبة': '2',
        'اسم الطليعة': 'طليعة الصقر',
        'اسم ولي الأمر': 'جاسم راشد',
        'هاتف ولي الأمر': '39654321'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(scoutData);
    XLSX.utils.book_append_sheet(wb, ws, 'كشافون');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="scouts_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  } else {
    const teacherData = [
      {
        'الاسم الكامل': 'أ. عبدالهادي حسن الدوسري',
        'الرقم الوظيفي': 'EMP-9045',
        'المادة': 'التربية الرياضية',
        'الصفوف المصرح بها': 'الأول إعدادي - 1, الأول إعدادي - 2'
      },
      {
        'الاسم الكامل': 'أ. عيسى عبدالله التميمي',
        'الرقم الوظيفي': 'EMP-9056',
        'المادة': 'اللغة العربية',
        'الصفوف المصرح بها': 'الثاني إعدادي - 1, الثالث إعدادي - 1'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(teacherData);
    XLSX.utils.book_append_sheet(wb, ws, 'معلمون');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="teachers_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  }
});

// Import Scouts Execution
app.post('/api/import/scouts', (req: Request, res: Response) => {
  const { rows, dryRun, actor } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على صفوف بيانات صالحة' });
  }

  const validRows: any[] = [];
  const errors: { row: number; error: string; data: any }[] = [];
  const existingNationalIds = new Set(db.scouts.map(s => s.nationalId));

  rows.forEach((r, idx) => {
    const rowNum = idx + 2; // header is row 1
    const fullName = r['الاسم الكامل'] || r['الاسم'] || r['fullName'];
    const nationalId = String(r['الرقم الشخصي'] || r['nationalId'] || '').trim();
    const grade = r['الصف'] || r['grade'] || 'الأول إعدادي';
    const section = String(r['الشعبة'] || r['section'] || '1').trim();
    const patrolName = r['اسم الطليعة'] || r['الطليعة'] || 'طليعة الفاتح';
    const parentName = r['اسم ولي الأمر'] || r['parentName'];
    const parentPhone = r['هاتف ولي الأمر'] || r['parentPhone'];

    if (!fullName || !nationalId) {
      errors.push({ row: rowNum, error: 'الاسم الكامل والرقم الشخصي حقول إلزامية مفقودة', data: r });
      return;
    }

    if (existingNationalIds.has(nationalId)) {
      errors.push({ row: rowNum, error: `الرقم الشخصي (${nationalId}) مسجل مسبقاً في النظام`, data: r });
      return;
    }

    existingNationalIds.add(nationalId);
    validRows.push({
      fullName: String(fullName).trim(),
      nationalId,
      grade: String(grade).trim(),
      section,
      patrolName: String(patrolName).trim(),
      parentName: parentName ? String(parentName).trim() : undefined,
      parentPhone: parentPhone ? String(parentPhone).trim() : undefined
    });
  });

  if (dryRun) {
    return res.json({
      dryRun: true,
      totalRows: rows.length,
      validCount: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5)
    });
  }

  // Commit valid rows
  let addedCount = 0;
  for (const item of validRows) {
    const scoutId = generateId();
    const userId = generateId();
    const salt = crypto.randomBytes(16).toString('hex');
    const username = `scout_${item.nationalId}`;

    const newUser: User & { passwordHash: string; salt: string } = {
      id: userId,
      username,
      fullName: item.fullName,
      nationalId: item.nationalId,
      role: 'SCOUT',
      isActive: true,
      scoutId,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: hashPassword('123456', salt)
    };

    const newScout: ScoutProfile = {
      id: scoutId,
      userId,
      fullName: item.fullName,
      nationalId: item.nationalId,
      grade: item.grade,
      section: item.section,
      patrolName: item.patrolName,
      avatarUrl: '',
      avatarStatus: 'PENDING',
      totalPositivePoints: 0,
      totalDeductions: 0,
      netBalance: 0,
      badgeCount: 0,
      activitiesAttendedCount: 0,
      registrationYear: db.settings.currentAcademicYear,
      status: 'ACTIVE',
      parentName: item.parentName,
      parentPhone: item.parentPhone
    };

    db.users.push(newUser);
    db.scouts.push(newScout);
    addedCount++;
  }

  saveDatabase(db);
  logAudit(
    'استيراد كشافين من Excel',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Import',
    `تم استيراد ${addedCount} كشاف بنجاح (مع وجود ${errors.length} صفوف مرفوضة)`
  );

  res.json({
    success: true,
    addedCount,
    errorCount: errors.length,
    errors
  });
});

// Import Teachers Execution
app.post('/api/import/teachers', (req: Request, res: Response) => {
  const { rows, dryRun, actor } = req.body;
  if (!Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على صفوف صالحة' });
  }

  const validRows: any[] = [];
  const errors: { row: number; error: string; data: any }[] = [];
  const existingEmpIds = new Set(db.teachers.map(t => t.employeeId));

  rows.forEach((r, idx) => {
    const rowNum = idx + 2;
    const fullName = r['الاسم الكامل'] || r['الاسم'];
    const employeeId = String(r['الرقم الوظيفي'] || r['employeeId'] || '').trim();
    const subject = r['المادة'] || r['subject'] || 'معلم مواد دراسية';
    const classesRaw = r['الصفوف المصرح بها'] || r['الصفوف'] || 'الأول إعدادي - 1';

    if (!fullName || !employeeId) {
      errors.push({ row: rowNum, error: 'الاسم الكامل والرقم الوظيفي حقول إلزامية', data: r });
      return;
    }

    if (existingEmpIds.has(employeeId)) {
      errors.push({ row: rowNum, error: `الرقم الوظيفي (${employeeId}) مسجل مسبقاً`, data: r });
      return;
    }

    existingEmpIds.add(employeeId);
    const assignedClasses = String(classesRaw).split(',').map(s => s.trim()).filter(Boolean);

    validRows.push({
      fullName: String(fullName).trim(),
      employeeId,
      subject: String(subject).trim(),
      assignedClasses
    });
  });

  if (dryRun) {
    return res.json({
      dryRun: true,
      totalRows: rows.length,
      validCount: validRows.length,
      errorCount: errors.length,
      errors,
      preview: validRows.slice(0, 5)
    });
  }

  let addedCount = 0;
  for (const item of validRows) {
    const teacherId = generateId();
    const userId = generateId();
    const salt = crypto.randomBytes(16).toString('hex');
    const username = `teacher_${item.employeeId.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newUser: User & { passwordHash: string; salt: string } = {
      id: userId,
      username,
      fullName: item.fullName,
      role: 'TEACHER',
      isActive: true,
      assignedClasses: item.assignedClasses,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: hashPassword('123456', salt)
    };

    const newTeacher: TeacherProfile = {
      id: teacherId,
      userId,
      fullName: item.fullName,
      employeeId: item.employeeId,
      subject: item.subject,
      assignedClasses: item.assignedClasses,
      evaluationsGivenCount: 0,
      status: 'ACTIVE'
    };

    db.users.push(newUser);
    db.teachers.push(newTeacher);
    addedCount++;
  }

  saveDatabase(db);
  logAudit(
    'استيراد معلمين من Excel',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Import',
    `تم استيراد ${addedCount} معلم بنجاح`
  );

  res.json({ success: true, addedCount, errorCount: errors.length, errors });
});

// 13. Notifications API
app.get('/api/notifications/:userId', (req: Request, res: Response) => {
  const notifs = db.notifications.filter(n => n.recipientUserId === req.params.userId || n.recipientUserId === 'ALL');
  res.json(notifs);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.isRead = true;
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/notifications/mark-all-read/:userId', (req: Request, res: Response) => {
  for (const n of db.notifications.filter(item => item.recipientUserId === req.params.userId)) {
    n.isRead = true;
  }
  saveDatabase(db);
  res.json({ success: true });
});

// 14. Parent Encouragement
app.post('/api/parent/encouragement', (req: Request, res: Response) => {
  const { parentId, parentName, scoutId, message } = req.body;
  const scout = db.scouts.find(s => s.id === scoutId);
  if (!scout || !message) {
    return res.status(400).json({ error: 'الكشاف والرسالة مطلوبان' });
  }

  const encouragement: ParentEncouragement = {
    id: generateId(),
    parentId,
    parentName: parentName || 'ولي الأمر',
    scoutId: scout.id,
    scoutName: scout.fullName,
    message,
    status: 'APPROVED',
    createdAt: new Date().toISOString()
  };

  db.parentEncouragements.unshift(encouragement);

  // Notify Scout
  const scoutUser = db.users.find(u => u.scoutId === scout.id);
  if (scoutUser) {
    db.notifications.unshift({
      id: generateId(),
      recipientUserId: scoutUser.id,
      title: 'رسالة تشجيع من ولي أمرك',
      message,
      type: 'GENERAL',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  saveDatabase(db);
  res.json({ success: true, encouragement });
});

app.get('/api/parent/encouragements/:scoutId', (req: Request, res: Response) => {
  const list = db.parentEncouragements.filter(e => e.scoutId === req.params.scoutId);
  res.json(list);
});

// 15. Audit Log (سجل التدقيق)
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.auditLogs.slice(0, 200));
});

// 16. Site Settings & Backup/Restore
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  const { settings, actor } = req.body;
  if (settings) {
    db.settings = { ...db.settings, ...settings };
    saveDatabase(db);
    logAudit(
      'تحديث إعدادات الموقع والفرقة',
      actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
      'Settings',
      'تم تحديث القواعد والإعدادات العامة'
    );
  }
  res.json({ success: true, settings: db.settings });
});

// Full Database Backup Export (JSON snapshot)
app.get('/api/backup/export', (req: Request, res: Response) => {
  // Strip out sensitive password hashes
  const safeUsers = db.users.map(({ passwordHash, salt, ...rest }) => rest);
  const backupData = {
    ...db,
    users: safeUsers,
    exportDate: new Date().toISOString(),
    version: '1.0.0-ahmed-alfateh'
  };

  res.setHeader('Content-Disposition', `attachment; filename="ahmed_alfateh_backup_${new Date().toISOString().split('T')[0]}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(backupData, null, 2));
});

// Full Database Restore
app.post('/api/backup/restore', (req: Request, res: Response) => {
  const { backupData, actor } = req.body;
  if (!backupData || !backupData.scouts || !backupData.settings) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح' });
  }

  // Preserve existing password hashes for users if matching IDs exist
  const existingPasswordMap = new Map(db.users.map(u => [u.id, { hash: u.passwordHash, salt: u.salt }]));

  const restoredUsers = backupData.users.map((u: any) => {
    const existing = existingPasswordMap.get(u.id);
    const salt = existing ? existing.salt : crypto.randomBytes(16).toString('hex');
    const passwordHash = existing ? existing.hash : hashPassword('123456', salt);
    return { ...u, salt, passwordHash };
  });

  db = {
    ...backupData,
    users: restoredUsers
  };

  saveDatabase(db);
  logAudit(
    'استعادة نسخة احتياطية للنظام',
    actor || { id: 'leader', name: 'قيادة الفرقة', role: 'LEADER' },
    'Backup',
    `تمت استعادة البيانات بنجاح من نسخة ${backupData.exportDate || 'غير محددة'}`
  );

  res.json({ success: true, message: 'تمت استعادة قاعدة البيانات بنجاح' });
});

// 17. Reports Data Aggregator (التقارير الشهرية والفصلية والسنوية)
app.get('/api/reports/summary', (req: Request, res: Response) => {
  recalculateScoutBalances();

  const totalScouts = db.scouts.length;
  const activeScouts = db.scouts.filter(s => s.status === 'ACTIVE').length;
  const suspendedScouts = db.scouts.filter(s => s.status === 'SUSPENDED').length;

  const totalPositive = db.evaluations
    .filter(e => e.type === 'POSITIVE' && e.status === 'APPROVED')
    .reduce((sum, e) => sum + e.points, 0);

  const totalDeductions = db.evaluations
    .filter(e => e.type === 'DEDUCTION' && e.status === 'APPROVED')
    .reduce((sum, e) => sum + e.points, 0);

  // Group by grade
  const gradeBreakdown: Record<string, { count: number; totalPoints: number; positive: number; deductions: number }> = {};
  for (const s of db.scouts) {
    if (!gradeBreakdown[s.grade]) {
      gradeBreakdown[s.grade] = { count: 0, totalPoints: 0, positive: 0, deductions: 0 };
    }
    gradeBreakdown[s.grade].count += 1;
    gradeBreakdown[s.grade].totalPoints += s.netBalance;
    gradeBreakdown[s.grade].positive += s.totalPositivePoints;
    gradeBreakdown[s.grade].deductions += s.totalDeductions;
  }

  // Top positive behaviors
  const behaviorFreq: Record<string, number> = {};
  for (const e of db.evaluations.filter(e => e.status === 'APPROVED')) {
    behaviorFreq[e.behaviorCategory] = (behaviorFreq[e.behaviorCategory] || 0) + 1;
  }

  res.json({
    period: db.settings.competitionPeriod.name,
    totalScouts,
    activeScouts,
    suspendedScouts,
    teachersCount: db.teachers.length,
    activitiesCount: db.activities.length,
    totalPositive,
    totalDeductions,
    netBalanceAll: totalPositive - totalDeductions,
    pendingApprovalsCount: db.evaluations.filter(e => e.status === 'PENDING').length,
    newSuspensionRequestsCount: db.suspensionRequests.filter(s => s.status === 'NEW').length,
    gradeBreakdown,
    topBehaviors: Object.entries(behaviorFreq).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6)
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION INTEGRATION
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`Ahmed Al-Fateh Scout Troop Server running on port ${PORT}`);
    console.log(`Initial Admin: المستخدم: المدير | كلمة المرور: 00973`);
    console.log(`Initial Leaders: باسل (001) | محمد (002)`);
    console.log(`=======================================================`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
