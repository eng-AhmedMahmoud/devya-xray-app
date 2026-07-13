const BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const j = await res.json();
      msg = j?.message ?? j?.error ?? msg;
    } catch {}
    throw new ApiError(msg, res.status);
  }
  return res.json() as Promise<T>;
}

/* ------------------------------ Assessment ------------------------------ */

export type Engagement = {
  companyName: string;
  contactName: string;
  lang: 'en' | 'ar' | string;
  status: string;
  submittedAt: string | null;
  editable: boolean;
};

export type Pillar = {
  key: string;
  code: string;
  name: string;
  order: number;
};

export type Framework = {
  key: string;
  name: string;
  brandKey: string;
  pillars: Pillar[];
};

export type Practice = {
  code: string;
  pillarKey: string;
  subCategory: string | null;
  name: string;
  nameAr?: string | null;
  description: string;
  descriptionAr?: string | null;
  whyItMatters?: string | null;
  maturityRubric: Record<string, string>;
  sortOrder: number;
};

export type PracticeResponse = {
  practiceCode: string;
  selfMaturity: number | null;
  selfEvidence: string | null;
};

export type AssessmentPayload = {
  engagement: Engagement;
  framework: Framework;
  practices: Practice[];
  responses: PracticeResponse[];
};

export type ResponsePatch = {
  practiceCode: string;
  selfMaturity?: number;
  selfEvidence?: string;
};

/* -------------------------------- Report -------------------------------- */

export type Distribution = Record<string, number>;

export type CalibrationStats = {
  overclaimed: number;
  calibrated: number;
  underclaimed: number;
};

export type OverallStats = {
  healthPct: number;
  urgencyIndex: number;
  evaluated: number;
  scored: number;
  distribution: Distribution;
  calibration: CalibrationStats;
};

export type PillarStats = {
  evaluated: number;
  scored: number;
  healthPct: number;
  urgencyIndex: number;
  distribution: Distribution;
  selfDistribution: Distribution;
  calibration: CalibrationStats;
};

export type ReportPracticeRow = {
  code: string;
  subCategory: string | null;
  name: string;
  whyItMatters: string | null;
  selfMaturity: number | null;
  verifiedMaturity: number | null;
  delta: number | null;
  priority: string | number | null;
  urgency: string | number | null;
  decision: string | null;
  consultantNote: string | null;
};

export type PillarNotes = {
  strengths?: string | null;
  gaps?: string | null;
  consultantNotes?: string | null;
};

export type ReportPillar = {
  key: string;
  code: string;
  name: string;
  order: number;
  stats: PillarStats;
  practices: ReportPracticeRow[];
  attention: ReportPracticeRow[];
  notes: PillarNotes;
};

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Effort = 'XS' | 'S' | 'M' | 'L' | 'XL';

export type Finding = {
  id: string;
  title: string;
  severity: Severity;
  effort: Effort;
  effortHours: number | null;
  evidence: string | null;
  businessImpact: string | null;
  recommendation: string | null;
  ownerRole: string | null;
  timeline: string | null;
  practiceCodes: string[];
};

export type RoadmapBucket = {
  timeline: string;
  items: Finding[];
};

export type QuickWin = {
  id: string;
  title: string;
  severity: Severity;
  effort: Effort;
  impactRank: number;
  effortRank: number;
};

export type ReportMeta = {
  companyName: string;
  contactName: string | null;
  companyWebsite: string | null;
  teamSize: string | number | null;
  stackSummary: string | null;
  lang: string;
  status: string;
  workshopDate: string | null;
  leadConsultant: string | null;
  reportVersion: string | number;
  publishedAt: string | null;
  framework: { key: string; name: string; brandKey: string };
};

export type ReportPayload = {
  meta: ReportMeta;
  execSummary: string | null;
  overall: OverallStats;
  pillars: ReportPillar[];
  findings: Finding[];
  roadmap: RoadmapBucket[];
  quickWins: QuickWin[];
};

/* --------------------------------- Client -------------------------------- */

export const api = {
  assessment: {
    get: (token: string) => req<AssessmentPayload>(`/public/xray/${token}`),
    save: (token: string, responses: ResponsePatch[]) =>
      req<{ saved: number }>(`/public/xray/${token}/responses`, {
        method: 'PATCH',
        body: JSON.stringify({ responses }),
      }),
    submit: (token: string) =>
      req<{ ok: boolean; answered: number }>(`/public/xray/${token}/submit`, {
        method: 'POST',
      }),
  },
  report: {
    get: (portalToken: string) =>
      req<ReportPayload>(`/public/xray/report/${portalToken}`),
    pdfUrl: (portalToken: string) =>
      `${BASE}/public/xray/report/${portalToken}/pdf`,
  },
};
