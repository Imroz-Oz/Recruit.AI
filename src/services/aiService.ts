import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export function getAI() {
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
      You are an elite, top-tier executive career strategist working with Silicon Valley's top talent and Fortune 500 C-suites.
      Generate an incredibly punchy, high-impact, 2-sentence professional executive summary for a person with the following details:
      
      Title: ${data.title}
      Bio: ${data.bio}
      Skills: ${data.skills.join(', ')}
      
      CRITICAL INSTRUCTIONS:
      - The tone MUST be authoritative, modern, and demonstrate immense domain mastery.
      - NEVER use cliché or generic buzzwords like "passionate", "team player", "driven", "results-oriented", or "guru".
      - Focus heavily on hard value proposition, unique leverage, and explicit technical/business outcomes capabilities.
      - Make it sound like they are the absolute 1% in their field.
      - 2 sentences max. Keep it crisp.
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
      You are an elite, highly analytical Talent Intelligence Director at a top FAANG recruitment firm.
      Provide a devastatingly accurate, high-signal 3-bullet point "Intelligence Summary" for this candidate:
      
      Name: ${candidate.name}
      Title: ${candidate.title}
      Skills: ${(candidate.keywords || []).join(', ')}
      Bio Snippet: ${candidate.resumeSnippet}
      
      REQUIREMENTS:
      1. Analyze the context of their skills to identify their actual trajectory and potential hidden value.
      2. Identify the specific environment where this candidate would provide 10x ROI (e.g. "Series B hyper-growth", "legacy enterprise turnaround").
      3. Point out one potential "flight risk" or area of concern if applicable based on timeline or skill spread.
      
      Format your response EXACTLY as these 3 bullets:
      - Trajectory: (1 precise sentence analyzing their career momentum and systemic value)
      - Key Edge: (1 sentence identifying their unique, non-obvious leverage or technical crossover)
      - Deployment: (1 sentence on the exact corporate environment/mission they are a silver bullet for)
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
      You are an elite AI technical recruiter capable of deep semantic inference. Analyze the true alignment between this job and candidate, bypassing keyword stuffing.
      
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
      
      CRITICAL INSTRUCTIONS:
      1. Analyze implied skills. If a candidate knows React, they know JS. If they built a distributed system at scale, they know concurrency.
      2. Factor in the seniority disconnect. If a role is Staff Level and the candidate is a Mid-level with 3 years, penalize severely.
      3. Identify "false positives" where the title matches but the core tech stack operates in completely different domains (e.g. Java Enterprise dev vs Java Android app dev).
      
      Return a STRICT JSON response: 
      { 
        "score": number (0-100, be extremely rigorous, top 1% get >90), 
        "insight": "string (A sharp, 1-2 sentence analysis on the precise point of alignment or catastrophic failure)",
        "hiddenRisk": "string (Identify one potential hidden risk)",
        "cultureFit": "string (Infer culture fit based on phrasing and background)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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

export async function extractJobDetailsFromText(rawText: string) {
  try {
    const ai = getAI();
    const prompt = `
      You are an elite NLP model specializing in tech recruitment data extraction. 
      Extract the core attributes from the following noisy job description text.
      
      RAW TEXT:
      ${rawText}

      CRITICAL INSTRUCTIONS:
      1. Normalize tech stacks (e.g., "NodeJS", "Node.js", "Node" -> "Node.js").
      2. Identify implicit seniority (e.g., if it mentions "lead a team" -> inferred Staff/Lead).
      3. Strip out marketing fluff from the company details.

      Return a JSON object:
      {
        "title": "Normalized Job Title",
        "company": "Company Name (if available, else 'Unknown')",
        "location": "Location (if available, else 'Remote')",
        "salary": "Clean numerical salary range or 'Undisclosed'",
        "type": "FTE, Contract, or C2H",
        "skills": ["Normalized Skill 1", "Normalized Skill 2"],
        "experience": "e.g. 5+ years"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Job Extraction Error:', error);
    return null;
  }
}

export async function evaluateResumeAgainstJD(resumeText: string, jobDetails: any) {
  try {
    const ai = getAI();
    const prompt = `
      Act as an elite applicant ATS screener. Evaluate the following resume against the job description details.
      
      JOB DETAILS:
      ${JSON.stringify(jobDetails)}
      
      RESUME TEXT/CONTENT:
      ${resumeText}
      
      Return a detailed JSON evaluation with:
      {
        "score": number (0-100),
        "matchReason": "1 sentence on why it's a fit",
        "gaps": ["gap 1 missing skill or exp", "gap 2"],
        "recommendation": "Proceed, Phone Screen, or Reject"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Resume Evaluation Error:', error);
    return null;
  }
}

export async function generateInterviewQuestions(scenario: string) {
  try {
    const ai = getAI();
    const prompt = `
      You are an elite executive and technical interviewer specializing in FAANG and high-growth unicorn evaluations.
      Generate 5 incredibly high-pressure, multi-layered behavioral and technical interview questions for the following scenario: ${scenario}.
      
      CRITICAL INSTRUCTIONS:
      - The questions MUST NOT be generic. "Tell me about a time..." is banned.
      - Frame the questions around forced trade-offs, ambiguous constraints, and system failure.
      - Test for leadership, architectural depth, and psychological resilience.
      - Make each question a mini-scenario or architectural puzzle (e.g., "Production is down, your lead engineer is unreachable, and the Board wants an update. Walk me through the first 15 minutes.").
      
      Return STRICTLY a JSON array of strings containing ONLY the questions.
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
      You are an elite, highly critical technical Bar Raiser. Evaluate the candidate's answer to the following question. 
      Question: "${question}"
      Candidate Answer: "${answer}"
      
      CRITICAL INSTRUCTIONS:
      1. Be brutally objective. Did they actually directly answer the core constraint of the question, or did they pivot to something safe?
      2. Analyze the depth of their technical or leadership framing.
      3. Provide a model answer that demonstrates what a Top 1% candidate would have said.
      
      Return a STRICT JSON evaluation:
      {
        "score": number (0-100, >90 implies mind-blowing competence, 50-70 is average),
        "feedback": "string (1-2 sentences of brutal, constructive analysis)",
        "modelAnswer": "string (A punchy, genius-level approach to the problem)"
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
      You are the Head of Executive Search at a tier-1 firm. Analyze this candidate pipeline and provide a "Strategic Deployment Briefing".
      
      Pipeline Context:
      ${candidates.map(c => `- ${c.name} (${c.title}, Stage: ${c.stage})`).join('\n')}
      
      CRITICAL INSTRUCTIONS:
      1. Deliver a hyper-condensed, 3-sentence brutal analysis of the pipeline's health.
      2. Identify the biggest systemic gap (e.g., "Over-indexing on frontend talent but missing core platform architecture").
      3. Dictate the immediate tactical next step to close the pipeline.
      
      Be ruthless, strategic, and definitive.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
      Also, generate exactly 6 highly realistic hypothetical connection profiles of people currently working in this role.
      Return the response as a JSON object with this exact structure:
      {
        "headlineSuggestions": ["string", "string", "string"],
        "summaryTwist": "string (a strategic paragraph on how to tweak the about section)",
        "connectionStrategy": "string (tactics on how to leverage 2nd-degree connections or alumni at the company)",
        "contentIdeas": ["string", "string", "string"],
        "networkingMessages": {
          "coldOutreach": "string",
          "followUp": "string"
        },
        "iceBreakers": ["string", "string", "string"],
        "mockConnections": [
          {
            "name": "string",
            "title": "string",
            "linkedInMockUrl": "string (e.g. linkedin.com/in/first-last)",
            "insight": "string (why connecting with them helps)"
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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
      model: "gemini-3.1-pro-preview",
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
      model: "gemini-3.1-pro-preview",
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
      You are an elite, highly technical recruitment AI with mastery over advanced Google X-Ray and Boolean logic. 
      Generate the ultimate, flawless search string for: "${goal}"
      
      LEARNED PREFERENCES FROM PREVIOUS SESSIONS:
      ${feedbackSummary || 'No specific preferences learned yet. Optimize for ultra-high precision.'}
      
      CRITICAL INSTRUCTIONS:
      1. Exploit obscure indexing patterns and site operators (e.g., site:github.com, intitle:resume NOT jobs).
      2. Group related skills into massively comprehensive OR/AND blocks without causing boolean engine failure.
      3. Identify and exclude all recruiter spam (-"job opportunity", -"apply now", -"send your resume").
      
      Return a STRICT JSON response: 
      { 
        "query": "string (the fully assembled Boolean string)", 
        "reasoning": "string (1-2 sentences on why this exact structure forces Google to reveal hidden talent)", 
        "alternativeKeywords": ["string", "string", "string"] 
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
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

export async function generateFunNameTag(userData: any, previousTags: string[], isGodMode: boolean = false) {
  try {
    const ai = getAI();
    let prompt = `
      You are a brilliant, witty AI observing a user named ${userData.name}.
      They work as a ${userData.title || 'Professional'} and have skills in ${userData.skills?.join(', ') || 'various domains'}.
      They have been using our career intelligence app extensively.
      
      Create a "fun name tag" or nickname for them. It should be punchy, cool, slightly edgy but extremely professional.
      Examples: "The Boolean Barbarian", "React Final Boss", "Talent Sniper", "The TypeScript Whisperer".
    `;

    if (isGodMode) {
      prompt = `
        You are a brilliant, witty AI observing a user named ${userData.name} who is the Supreme Creator / God Admin of the system.
        Create a "fun name tag" or nickname for them. It MUST be extremely royal, cool, and the absolute "best of the best".
        Examples: "The Supreme Architect", "God Emperor of Code", "Alpha & Omega", "The Royal Vanguard".
      `;
    }

    prompt += `
      Previous tags they had (do not reuse): ${previousTags.join(', ') || 'None'}
      
      Return a JSON containing:
      {
        "tag": "String (max 3 words)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Fun Name Tag Generation Error:', error);
    return null;
  }
}

export async function generateBuddyIcebreaker(myProfile: any, buddyProfile: any) {
  try {
    const ai = getAI();
    let prompt = `
      You are an expert networking AI. 
      I am ${myProfile.name || 'User'}, a ${myProfile.title || 'Professional'} skilled in ${myProfile.skills?.join(', ') || 'various domains'}.
      I want to connect with ${buddyProfile.name}, a ${buddyProfile.title || 'Professional'}.
      
      Suggest a highly personalized, smart, and fresh icebreaker message (max 2 sentences) that I can send them. 
      It should highlight our potential synergy or shared industry context.
      Make it professional yet engaging, avoiding generic greetings.
      
      Return a JSON containing:
      {
        "icebreaker": "String",
        "synergy": "String (1 short sentence explaining why we should connect)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('generateBuddyIcebreaker Error:', error);
    return null;
  }
}

export async function generateHeadshot(profileData: any) {
  try {
    const ai = getAI();
    const prompt = `A super professional yet slightly stylized and elegant cartoonish headshot sketch of a ${profileData.title} in the ${profileData.domain} industry. Modern corporate avatar, clean background, sharp, high quality.`;
    
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1'
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
  } catch (error) {
    console.error('generateHeadshot Error:', error);
  }
  return null;
}

export async function generatePersonalizedOutreach(targetProfile: any, myProfile: any, contextUrl: string) {
  try {
    const ai = getAI();
    let prompt = `
      You are an expert AI Outreach strategist. Generate a highly personalized and compelling connection message or email.
      
      My Profile: ${myProfile.name || 'User'}, ${myProfile.title || 'Professional'}, ${myProfile.domain || 'Tech'} expert.
      Target: ${targetProfile.name}, ${targetProfile.title}.
      Target Context URL: ${contextUrl}
      
      CRITICAL: Use the Google Search tool to look up the Target Context URL and the Target person's recent work, company news, and background.
      
      Generate a smart, fresh outreach message (Subject and Body) that references their specific work or context found via search.
      Make it professional yet engaging, avoiding generic greetings.
      
      Return a JSON containing:
      {
        "subject": "String",
        "body": "String (multi-line)",
        "strategy": "String (1 short sentence explaining why this approach works based on the context found)"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('generatePersonalizedOutreach Error:', error);
    return null;
  }
}

export async function generateRoleIntelligenceBrief(jobDescription: string, companyName: string, roleNotes: string) {

  try {
    const ai = getAI();
    let promptContext = "Analyze the following role requirement.";
    if (jobDescription) promptContext += `\nJob Description: ${jobDescription}`;
    if (companyName) promptContext += `\nCompany: ${companyName}`;
    if (roleNotes) promptContext += `\nInternal Notes: ${roleNotes}`;

    const prompt = `
      You are an elite Talent Intelligence AI. ${promptContext}
      Provide a highly strategic "Role Intelligence Briefing" for the recruiter.
      
      Respond STRICTLY in the JSON format:
      {
        "coreBrief": "string (A sharp, 2-to-3 sentence summary of the absolute core of the position, minus the fluff)",
        "topSkills": ["string", "string", "string", "string", "string"],
        "targetCompanies": [
          { "name": "string", "talentCount": 0, "why": "string (Why they are a good source)" }
        ],
        "marketInsights": {
          "demandLevel": "High" | "Medium" | "Low",
          "avgTimeToHire": "string (e.g. 45 days)",
          "compensationEstimate": "string (e.g. $150k - $180k)",
          "hiddenKeywords": ["string", "string", "string"]
        }
      }
    `;
    
    if (!process.env.GEMINI_API_KEY) {
      return {
        coreBrief: "This role requires a highly adaptable professional navigating complex, ambiguous requirements to deliver scalable solutions under tight deadlines.",
        topSkills: ["System Design", "Cloud Native", "Go", "Kubernetes", "Architecture"],
        targetCompanies: [
          { name: "Uber", talentCount: 420, why: "Strong culture of microservices and scale." },
          { name: "Stripe", talentCount: 310, why: "Excellent pedigree in API design." },
          { name: "Airbnb", talentCount: 280, why: "Deep expertise in hyper-growth architecture." }
        ],
        marketInsights: {
          demandLevel: "High",
          avgTimeToHire: "55 days",
          compensationEstimate: "$175k - $220k Base",
          hiddenKeywords: ["Kafka", "gRPC", "Observability"]
        }
      };
    }

    const techReq = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a Technical Sourcing Agent. Extract top 5 hard skills from: \n${promptContext}\n. Return JSON: {"skills": ["A"]}`,
      config: { responseMimeType: "application/json" }
    });

    const marketReq = ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a Market Intel Agent. Identify target companies & compensation for: \n${promptContext}\n. Return JSON: {"companies": [{"name":"A", "why":"B", "talentCount":100}], "comp":"100k"}`,
      config: { responseMimeType: "application/json" }
    });

    const [techRes, marketRes] = await Promise.all([techReq, marketReq]);
    
    const synthesisPrompt = `
      You are the Master Sourcing Orchestrator AI. Synthesize findings from sub-agents.
      Context: ${promptContext}
      Tech Output: ${techRes.text}
      Market Output: ${marketRes.text}
      
      Respond STRICTLY in the JSON format:
      {
        "coreBrief": "string (A sharp, 2-to-3 sentence summary of the absolute core of the position, minus the fluff)",
        "topSkills": ["string", "string", "string", "string", "string"],
        "targetCompanies": [
          { "name": "string", "talentCount": 0, "why": "string (Why they are a good source)" }
        ],
        "marketInsights": {
          "demandLevel": "High" | "Medium" | "Low",
          "avgTimeToHire": "string (e.g. 45 days)",
          "compensationEstimate": "string",
          "hiddenKeywords": ["string", "string", "string"]
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: synthesisPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Role Intelligence Error:', error);
    return null;
  }
}
