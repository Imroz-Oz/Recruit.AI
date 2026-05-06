import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function generateProfessionalSummary(data: { title: string, bio: string, skills: string[] }) {
  try {
    const ai = getAI();
    const prompt = `
      You are an elite career strategist. 
      Generate a punchy, 2-sentence professional executive summary for a person with the following details:
      Title: ${data.title}
      Bio: ${data.bio}
      Skills: ${data.skills.join(', ')}
      
      The summary should sound authoritative, modern, and high-impact. 
      Do not use generic buzzwords like "passionate" or "team player".
      Focus on value proposition and expertise.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('AI Summary Error:', error);
    return null;
  }
}

export async function generateCandidateIntelligence(candidate: any) {
  try {
    const ai = getAI();
    const prompt = `
      As a elite talent strategist, provide a 3-bullet point "Intelligence Summary" for this candidate:
      Name: ${candidate.name}
      Title: ${candidate.title}
      Skills: ${(candidate.keywords || []).join(', ')}
      Bio Snippet: ${candidate.resumeSnippet}
      
      Format:
      - Trajectory: (1 sentence on career growth)
      - Key Edge: (1 sentence on their unique value)
      - Best Fit: (1 sentence on ideal role/environment)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Candidate Intelligence Error:', error);
    return null;
  }
}

export async function analyzeCandidateMatch(job: any, candidate: any) {
  try {
    const ai = getAI();
    const prompt = `
      As an expert recruiter AI, analyze the semantic match between this job and candidate.
      
      JOB BRIEF:
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements.join(', ')}
      
      CANDIDATE PROFILE:
      Name: ${candidate.name}
      Title: ${candidate.title}
      Bio: ${candidate.bio || 'Not provided'}
      Skills: ${(candidate.skills || []).join(', ')}
      Experience: ${candidate.experience} years
      
      Provide a match score (0-100) and a 1-sentence "Semantic Insight" explaining why they match or what's missing.
      Return JSON format: { "score": number, "insight": string }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('AI Match Error:', error);
    return null;
  }
}

export async function generateInterviewQuestions(scenario: string) {
  try {
    const ai = getAI();
    const prompt = `
      As an elite executive interviewer, generate 5 high-pressure, behavioral and technical interview questions for the following scenario: ${scenario}.
      Focus on leadership, problem-solving under duress, and architectural depth.
      Return the questions as a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('AI Interview Questions Error:', error);
    return [];
  }
}

export async function evaluateInterviewAnswer(question: string, answer: string) {
  try {
    const ai = getAI();
    const prompt = `
      Evaluate the candidate's answer to the interview question below. 
      Question: "${question}"
      Candidate Answer: "${answer}"
      
      Provide a strict, professional evaluation.
      Return JSON:
      {
        "score": 50, // integer from 0-100 indicating quality
        "feedback": "string (2-3 sentences of constructive strategic criticism)",
        "modelAnswer": "string (2-3 sentences describing a 100/100 answer)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{"score": 50, "feedback": "Evaluation failed.", "modelAnswer": ""}');
  } catch (error) {
    console.error('AI Evaluation Error:', error);
    return { score: 50, feedback: "Error evaluating response.", modelAnswer: "" };
  }
}

export async function generatePipelineBriefing(candidates: any[]) {
  try {
    const ai = getAI();
    const prompt = `
      Analyze this candidate pipeline and provide a "Strategic Deployment Briefing" (max 3 sentences).
      Highlight overall strength, potential gaps, and priority action for the recruiter.
      
      Candidates: ${candidates.map(c => `${c.name} (${c.title}, Stage: ${c.stage})`).join('; ')}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error('Pipeline Briefing Error:', error);
    return null;
  }
}

export async function generateLinkedInOptimizations(targetRole: string, targetCompany: string) {
  try {
    const ai = getAI();
    const prompt = `
      You are an elite Career Advisor AI. I am aiming for a "${targetRole}" position at "${targetCompany}".
      Provide tactical LinkedIn profile modifications to bypass recruiter screening and appeal to their corporate DNA.
      Return the response as a JSON object with this exact structure:
      {
        "headlineSuggestions": ["string", "string", "string"],
        "summaryTwist": "string (a strategic paragraph on how to tweak the about section)",
        "connectionStrategy": "string (tactics on how to leverage 2nd-degree connections or alumni at the company)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('LinkedIn AI Error:', error);
    return null;
  }
}

export async function validateResumeContent(text: string) {
  try {
    const ai = getAI();
    const prompt = `
      Analyze the following text and determine if it is a professional resume/CV. 
      It is common to receive "Confirmation of Interest" (COI) or other legal documents that are NOT resumes. 
      Be strict. A resume MUST contain career history, skills, or education.
      
      TEXT:
      ${text.slice(0, 4000)}
      
      Return JSON: { "isResume": boolean, "confidence": number, "documentType": "resume" | "coi" | "other", "reason": "string" }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('AI Resume Validation Error:', error);
    return { isResume: false, confidence: 0, documentType: 'other' };
  }
}

export async function detectDuplicateResume(newText: string, existingSummaries: string[]) {
  try {
    if (existingSummaries.length === 0) return { isDuplicate: false };
    
    const ai = getAI();
    const prompt = `
      Compare this new resume content with the list of existing candidate summaries.
      Determine if this new candidate is already represented in the existing pool.
      Look for unique identifiers like name, email, or specific experience combinations.
      
      NEW RESUME:
      ${newText.slice(0, 2000)}
      
      EXISTING CANDIDATES:
      ${existingSummaries.join('\n---\n')}
      
      Return JSON: { "isDuplicate": boolean, "duplicateId": "string | null", "confidence": number }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{ "isDuplicate": false }');
  } catch (error) {
    console.error('AI Duplicate Detection Error:', error);
    return { isDuplicate: false };
  }
}

export async function generateAdaptiveBooleanQuery(goal: string, previousInteractions: any[]) {
  try {
    const ai = getAI();
    
    // Learning context
    const feedbackSummary = previousInteractions
      .filter(i => i.userEdit)
      .map(i => `User changed "${i.output}" to "${i.userEdit}" because ${i.userRating < 3 ? 'it was poor' : 'they preferred specific terms'}`)
      .join('\n');

    const prompt = `
      You are an elite Recruitment Automation AI. 
      Generate a Google X-Ray / Boolean search string for: ${goal}
      
      LEARNED PREFERENCES FROM PREVIOUS SESSIONS:
      ${feedbackSummary || 'No specific preferences learned yet. Follow industry best practices.'}
      
      Include common variations, specific platform operators (site:linkedin.com/in), and exclusions like -jobs -template.
      
      Return JSON: { "query": "string", "reasoning": "string", "alternativeKeywords": ["string"] }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('AI Adaptive Query Error:', error);
    return null;
  }
}
