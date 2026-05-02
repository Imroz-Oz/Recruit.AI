import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResponse {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  humanSummary: string;
}

export interface BooleanResponse {
  query: string;
  suggestedTitles: string[];
}

export interface PersonalProfileAnalysis {
  score: number;
  reachEstimate: string;
  reachImprovementSuggestions: string[];
  contentGaps: string[];
  keywordOptimizations: string[];
  humanReview: string;
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

export const analyzeMatch = async (resume: string, jd: string): Promise<AnalysisResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze the match between this resume and job description.
      Provide a professional, humanistic evaluation. 
      Avoid robotic language. Focus on character, potential, and specific skill alignment.
      
      Resume: ${resume}
      JD: ${jd}
      
      Return JSON only:
      {
        "score": number (0-100),
        "strengths": string[],
        "gaps": string[],
        "recommendations": string[],
        "humanSummary": string (A warm, expert recruiter-to-recruiter summary)
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateBooleanFromJD = async (jd: string): Promise<BooleanResponse> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Based on this job description, create a highly optimized LinkedIn/JobDiva Boolean string.
      Also, suggest 10 alternate yet relevant job titles that a recruiter should search for to find this profile, as titles vary across companies.
      
      JD: ${jd}
      
      Return JSON only:
      {
        "query": "string",
        "suggestedTitles": ["title1", "title2", ...]
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const suggestOutreach = async (candidateName: string, jobTitle: string, strengths: string[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Create a personalized, Gen-Z modern but professional recruiter outreach message for ${candidateName} for the position of ${jobTitle}.
      Mention these strengths: ${strengths.join(', ')}.
      Make it feel human, not like a bot. Speak with personality.
    `
  });

  return response.text || "";
};

export const analyzeMultipleResumes = async (resumes: string[], jd: string): Promise<MultiResumeAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze these ${resumes.length} resumes against this job description.
      Identify the top 5 (or fewer if less provided) candidates who fit best.
      Provide detailed reasoning and improvement suggestions for each profile.
      
      Job Description: ${jd}
      
      Resumes:
      ${resumes.map((r, i) => `--- RESUME ${i + 1} ---\n${r}`).join("\n\n")}
      
      Return JSON only:
      {
        "topPicks": [
          {
            "candidateName": "string",
            "score": number (0-100),
            "reasoning": "string (Why they are a top pick)",
            "recommendations": string[] (Specific improvements for this profile to match this role better)
          }
        ],
        "generalObservations": "string (A meta-analysis of the talent pool provided)"
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzePersonalProfile = async (profileText: string, targetRole: string): Promise<PersonalProfileAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze this professional profile (Resume/LinkedIn) for someone targeting the role of: ${targetRole}.
      Provide strategic insights to improve their reach and visibility to recruiters.
      
      Profile: ${profileText}
      
      Return JSON only:
      {
        "score": number (0-100 - Current market readiness),
        "reachEstimate": "string (Current visibility level)",
        "reachImprovementSuggestions": string[] (Tactical advice for LinkedIn algorithms/Recruiter reach),
        "contentGaps": string[] (What's missing for their target role),
        "keywordOptimizations": string[] (Specific keywords and phrases to sprinkle in),
        "humanReview": "string (A supportive, expert career coach review)"
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};
