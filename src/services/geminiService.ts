import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export interface AnalysisResponse {
  score: number;
  strengths: string[];
  gaps: string[];
  bridgeExperience: {
    gap: string;
    mitigation: string;
  }[];
  recommendations: string[];
  optimizationRoadmap: string[];
  humanSummary: string;
}

export interface BooleanResponse {
  preciseQuery?: string;
  broadQuery?: string;
  skillQuery?: string;
  query: string;
  suggestedTitles: string[];
  extractedTitle: string;
  extractedLocation: string;
  extractedCountry: string;
  extractedKeywords: string;
  roleBlueprint: {
    software: string[];
    skillSet: string[];
    industry: string[];
    brief: string;
    mustHave: string[];
    niceToHave: string[];
  };
}

export interface CandidateExtraction {
  name: string;
  email: string;
  phone: string;
  isResume: boolean;
  title: string;
  experience: number;
  location: string;
  degree: string;
  skills: string[];
  summary: string;
  jobType?: string;
  clientDomain?: string;
}

export const extractProfileData = async (text: string): Promise<CandidateExtraction> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze this text and determine if it is a professional resume. 
      Extract the requested details if they exist.
      
      Stricly validate:
      1. Is this a resume? (TRUE if it looks like a professional CV/Resume, FALSE otherwise).
      2. Does it have an email? (Empty string if not found).
      3. Does it have a phone number? (Empty string if not found).

      Text: ${text.slice(0, 5000)}

      Return JSON only:
      {
        "name": "string",
        "email": "string",
        "phone": "string",
        "isResume": boolean,
        "title": "string (Current or target job title)",
        "experience": number (Years),
        "location": "string",
        "degree": "string",
        "skills": ["skill1", "skill2"...],
        "summary": "string (Short 1-2 sentence bio)",
        "jobType": "string (e.g. IT, Non-IT, Healthcare, Engineering, Finance)",
        "clientDomain": "string (e.g. Manufacturing, Semiconductor, Aerospace, Utility, Telecom, BFSI)"
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const generateBooleanFromJD = async (jd: string, previousInteractions: any[] = []): Promise<BooleanResponse> => {
  const ai = getAI();
  
  const learningContext = previousInteractions.length > 0 
    ? `
      LEARNED PREFERENCES (based on user edits to your previous outputs):
      ${previousInteractions.map(i => `- User previously edited "${i.originalOutput}" to "${i.finalOutput}"`).join('\n')}
      Ensure the new string follows these stylistic or keyword preferences where applicable.
    `
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview", // Upgraded model for better reasoning
    contents: `
      As a Senior Sourcing Architect, analyze this Job Description (JD):
      "${jd}"

      ${learningContext}

      STRICT RULES for Boolean String Construction:
      1. Use precise Boolean operators: AND, OR, NOT. Cluster using parentheses. Do NOT nest brackets deeply like ((...)).
      2. TIERED STRINGS: Generate three logical strings.
         - "preciseQuery": A strict string including exact titles, mandatory skills, location/industry constraints.
         - "broadQuery": A wider string that drops the title or specific education requirements, focusing on broad skills and variations. Add similar overlapping industries in the broadQuery (e.g., aerospace if automotive).
         - "skillQuery": A string exclusively composed of skills, tools, and algorithms. NO titles.
      3. CRITICAL SOURCING RULES:
         - For Engineering Roles: Often we DO NOT put in titles. Focus primarily on stacks, tools, and algorithms.
         - For Functional/Clerical (e.g. Assembler, Admin): Title CAN be added.
         - For IT roles: Start with title, but the "broadQuery" should remove it to see more resumes.
         - For Roles requiring Basic Skills (No degree needed): DO NOT use title. Focus only on skills/software.
         - For Manager/TPM Logic: Focus on experience, tools, and budget size over exact titles.
         - For Nursing (or universal professions): Focus on certificates and experience level, but DO NOT hardcode years of experience numbers.
         - NEVER use degree (e.g. Bachelor, BS) as a boolean requirement unless strictly requested.
      
      Extract specifically:
      - A primary Job Title.
      - A Location (City/State).
      - A Country.
      - preciseQuery: strict boolean string.
      - broadQuery: loose boolean string dropping titles or secondary requirements.
      - skillQuery: boolean string containing only skills, NO titles.

      Generate a "Role Blueprint" for the Recruiter:
      - software: Full tech stack and proprietary tools.
      - skillSet: Core technical competencies.
      - industry: The vertical context.
      - brief: A 1-2 sentence veteran recruiter's take.
      - mustHave: Critical, non-negotiable keywords.
      - niceToHave: Bonus/Preferred keywords.

      Return JSON only:
      {
        "preciseQuery": "string (The strict boolean string)",
        "broadQuery": "string (The relaxed boolean string)",
        "skillQuery": "string (The skill-heavy boolean string, no titles)",
        "query": "string (The preciseQuery again, for backward compatibility)",
        "suggestedTitles": ["title1", "title2", ...],
        "extractedTitle": "string",
        "extractedLocation": "string",
        "extractedCountry": "string",
        "extractedKeywords": "string (Core skills without titles)",
        "roleBlueprint": {
          "software": ["tool1", "stack1"...],
          "skillSet": ["skill1", "skill2"...],
          "industry": ["vertical1"...],
          "brief": "recruiter summary",
          "mustHave": ["key1", "key2"...],
          "niceToHave": ["key1", "key2"...]
        }
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};
export interface ResumeMatchResult {
  score: number;
  breakdown: {
    skills: number;
    tools: number;
    industry: number;
    experience: number;
    stability: number;
  };
  strengths: string[];
  gaps: string[];
  bridgeExperience: { gap: string; mitigation: string }[];
  redFlags: string[];
  optimizationTips: string[];
  humanSummary: string;
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

export const extractJDFromHtml = async (html: string, url: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      As a specialist in talent acquisition systems, extract the core Job Description (JD) from this raw HTML content.
      Ignore navigation, footers, ads, and unrelated sidebar content. 
      Focus on: Job Title, Responsibilities, Requirements, and Company context.
      
      URL Source: ${url}
      HTML Content: ${html.slice(0, 10000)}

      Return the extracted JD text only.
    `
  });

  return response.text || "Failed to extract job description.";
};

export const analyzeMatch = async (resume: string, jd: string): Promise<AnalysisResponse> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Analyze the match between this resume and job description.
      Perform a deep-tissue semantic comparison.
      
      Resume: ${resume}
      JD: ${jd}

      TASK:
      1. Overall Score (0-100).
      2. Strengths: What makes them a great fit?
      3. Gaps: What is strictly missing?
      4. Bridge Experience: Identify skills or past experiences on the resume that aren't exact matches but "bridge the gap" or act as strong predictors of success in the missing areas.
      5. Optimization Roadmap: Provide a 3-step technical and presentational plan to improve this resume's matching probability for THIS role.
      6. Human Summary: A warm, expert recruiter-to-recruiter summary.

      Return JSON only:
      {
        "score": number (0-100),
        "strengths": ["strength1", "strength2"...],
        "gaps": ["gap1", "gap2"...],
        "bridgeExperience": [
          { "gap": "The identified missing skill", "mitigation": "Why their existing experience compensates for it" }
        ],
        "recommendations": ["General reco 1", "General reco 2"...],
        "optimizationRoadmap": ["Step 1: Action", "Step 2: Action", "Step 3: Action"],
        "humanSummary": "string"
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const analyzeResumeMatch = async (resume: string, jd: string): Promise<ResumeMatchResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Perform a deep-tissue comparison between this Resume and Job Description (JD).
      
      Resume: ${resume}
      JD: ${jd}

      Analyze:
      1. Overall Match Score (0-100).
      2. Factor Breakdown (0-100 for each): 
         - Skills (Keyword alignment)
         - Tools (Stack compatibility)
         - Industry (Relatability)
         - Experience (Seniority fit)
         - Stability (Tenure/Pattern analysis)
      3. Strengths: 3 key value propositions of this candidate.
      4. Gaps: Top 3 critical missing pieces.
      5. Bridge Experience: Identify skills or past experiences on the resume that aren't exact matches but "bridge the gap" or act as strong predictors of success in the missing areas.
      6. Red Flags: Any concerning patterns (tenure issues, lack of core tech, etc).
      7. Optimization: Specific technical advice to help them improve their profile for THIS SPECIFIC ROLE, and how to address gaps.
      8. Human Summary: A brief textual summary for the human recruiter.

      Return JSON only:
      {
        "score": number,
        "breakdown": {
          "skills": number,
          "tools": number,
          "industry": number,
          "experience": number,
          "stability": number
        },
        "strengths": string[],
        "gaps": string[],
        "bridgeExperience": [ { "gap": "...", "mitigation": "..." } ],
        "redFlags": string[],
        "optimizationTips": string[],
        "humanSummary": "string"
      }
    `,
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
};

export const suggestOutreach = async (candidateName: string, jobTitle: string, strengths: string[]): Promise<string> => {
  const ai = getAI();
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
  const ai = getAI();
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
  const ai = getAI();
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

export const adaptResumeToJD = async (baseResume: string, jd: string): Promise<string> => {
  const ai = getAI();
  const prompt = `
    You are an elite executive resume writer who specializes in bypassing enterprise ATS filters.
    Your task is to take a Base Resume and adapt it to match a Target Job Description (JD).
    
    CRITICAL RULES:
    1. DO NOT invent false experience. You must reframe their existing truth to match the JD's taxonomy.
    2. Incorporate exact keywords from the JD where contextually accurate.
    3. Remove fluff. Use high-impact action verbs.
    4. Ensure standard layout. Return the adapted content in plain Markdown format, organized with clear sections (Professional Experience, Skills, Education).
    
    BASE RESUME:
    ${baseResume}
    
    TARGET JD:
    ${jd}
    
    Return the fully rewritten, hyper-optimized resume down below mapping to the JD perfectly. Do not output anything else.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate.";
  } catch (err) {
    console.error("Adaptation failed:", err);
    return "Error adapting resume.";
  }
};
