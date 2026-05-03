import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateProfessionalSummary(data: { title: string, bio: string, skills: string[] }) {
  try {
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
    const prompt = `
      As an elite executive interviewer, generate 5 high-pressure, behavioral and technical interview questions for the following scenario: ${scenario}.
      Focus on leadership, problem-solving under duress, and architectural depth.
      Return the questions as a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

export async function generatePipelineBriefing(candidates: any[]) {
  try {
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
