export type AppMode = 'recruiter' | 'hunter';
export type SearchMode = 'candidate-for-job' | 'job-for-candidate';
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
  | 'privacy'
  | 'profile';

export interface User {
  id: string;
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
  bio?: string;
  location?: string;
  skills?: string[];
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
  description: string;
  requirements: string[];
  location: string;
  salary?: string;
  postedDate: string;
  url?: string;
  notes?: Note[];
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
