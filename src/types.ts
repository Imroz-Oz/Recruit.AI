export type AppMode = 'recruiter' | 'hunter' | 'enterprise';
export type SearchMode = 'candidate-for-job' | 'job-for-candidate';

export type IndustryType = 'it' | 'non-it' | 'engineering' | 'light-industrial' | 'healthcare' | 'other';
export type EngagementType = 'contract' | 'direct-hire' | 'contract-to-hire';
export type TaxType = 'w2' | 't4' | 'c2c' | '1099';

export type UserLevel = 'member' | 'admin' | 'admin_head' | 'superadmin' | 'universal' | 'page_admin';

export type RecruitmentType = 'IT' | 'NON-IT' | 'Healthcare' | 'Engineering' | 'Finance' | 'Other';
export type ClientDomain = 'manufacturing' | 'semiconductor' | 'aerospace' | 'utility' | 'oil&gas' | 'power generation' | 'telecom' | 'bfsi' | 'banking software' | 'other';
export type VisaType = 'H1B' | 'US Citizen' | 'Green Card' | 'OPT' | 'CPT' | 'TN' | 'Other';
export type JobNature = 'Remote' | 'Onsite' | 'Hybrid';

export type Page = 
  | 'dashboard' 
  | 'sourcing' 
  | 'intelligence' 
  | 'network' 
  | 'postings' 
  | 'candidates' 
  | 'history' 
  | 'assistant' 
  | 'personal-iq'
  | 'job-feed'
  | 'resume-vault'
  | 'interview-prep'
  | 'linkedin-intelligence'
  | 'message-buddy'
  | 'tasks'
  | 'admin'
  | 'superadmin'
  | 'scale-up'
  | 'privacy'
  | 'profile'
  | 'org-management'
  | 'company-page-builder';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  employeeCount: number;
  adminManagerCount: number;
  adminHeadEmail: string;
  companyEmail?: string;
  country: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  createdBy: string;
  systemEmail: string; // OrganisationNAME@Recruit.AI
}

export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  isLoggedIn: boolean;
  companyId?: string;
  role: 'agency' | 'corp' | 'freelancer' | 'candidate';
  isCompanyUser?: boolean;
  selectedMode?: AppMode;
  linkedInConnected?: boolean;
  onboardingCompleted?: boolean;
  title?: string;
  domain?: string;
  skills?: string[];
  yearsOfExperience?: string;
  headshotUrl?: string;
  backgroundUrl?: string;
  organizationId?: string;
  organizationName?: string;
  organizationUrl?: string;
  userLevel?: UserLevel;
  userPlan?: 'free' | 'pro' | 'enterprise';
  bio?: string;
  location?: string;
  industryTypes?: IndustryType[];
  engagementTypes?: EngagementType[];
  taxTypes?: TaxType[];
  systemEmail?: string; // EmployeeNAME.OrganisationNAME@Recruit.AI
  funNameTag?: string;
  funNameTagHistory?: { tag: string, date: string }[];
  createdAt?: string;
}

export type PipelineStage = 'sourcing' | 'submitted' | 'interviewing' | 'offer' | 'hired' | 'rejected';

export interface SubmissionDetails {
  payRate: string;
  billRate?: string; // Agency/Contract
  salary?: string;   // Direct Hire
  margin?: string;   // Direct Hire
  duration?: string; // Contract
  clientName: string;
  jobId: string;
  startDate?: string;
}

export interface CandidateBase {
  id: string;
  name: string;
  title: string;
  email: string;
  location: string;
  experience: number;
  skills: string[];
  resumeUrl?: string;
  isInternal: boolean;
  linkedInUrl?: string;
  gradYear?: number;
  industry?: string;
  openToRelocation?: boolean;
  degree?: string;
  currentCompany?: string;
  pastCompanies?: string[];
}

export interface Candidate extends CandidateBase {
  matchScore?: number;
  stage: PipelineStage;
  submissionDetails?: SubmissionDetails;
  notes: Note[];
  highlightedMatches?: string[];
}

export interface MultiResumeAnalysis {
  topPicks: {
    candidateName: string;
    score: number;
    reasoning: string;
    recommendations: string[];
  }[];
  generalObservations: string;
}

export interface PersonalProfileAnalysis {
  score: number;
  reachEstimate: string;
  reachImprovementSuggestions: string[];
  contentGaps: string[];
  keywordOptimizations: string[];
  humanReview: string;
}

export interface Note {
  id: string;
  authorId: string;
  text: string;
  isPrivate: boolean;
  timestamp: string;
  metadata?: {
    expectedPay?: string;
    geoPreference?: string;
    workType?: string;
    shiftPreference?: string;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  clientName?: string;
  clientDomain?: ClientDomain;
  recruitmentType?: RecruitmentType;
  visaType?: VisaType;
  jobNature?: JobNature;
  description: string;
  requirements: string[];
  location: string;
  salary?: string;
  postedDate: string;
  url?: string;
  notes?: Note[];
  createdBy?: string; // So creator can edit it
}

export interface BooleanSearch {
  id: string;
  titles: string[];
  skills: string[];
  companies: string[];
  exclusions: string[];
  industry: string;
  minExp: number;
  maxExp: number;
  location: string;
  zipCode: string;
  radius: number;
  generatedQuery: string;
  titleSuggestions: string[];
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  assigneeId: string;
  assigneeName?: string;
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  dueDate?: string;
}
