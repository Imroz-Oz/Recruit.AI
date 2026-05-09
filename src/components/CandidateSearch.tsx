import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  Search, 
  Users, 
  ArrowRight, 
  Copy, 
  Terminal,
  Zap,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  ChevronDown,
  Eye,
  Info,
  X,
  Upload,
  DollarSign,
  Brain,
  Monitor,
  Globe,
  ClipboardCheck,
  FileSearch,
  Lightbulb,
  MousePointer2,
  Trash2,
  Link2
} from 'lucide-react';
import { 
  generateBooleanFromJD, 
  analyzeResumeMatch, 
  extractProfileData,
  BooleanResponse, 
  ResumeMatchResult 
} from '@/src/services/geminiService';
import { IndustryType } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot, deleteDoc, doc, getDoc, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

interface CandidateSearchProps {
  onMatchesFound: (matches: any[]) => void;
  isLinkedInConnected?: boolean;
  onConnectLinkedIn?: () => void;
}

export default function CandidateSearch({ onMatchesFound, isLinkedInConnected, onConnectLinkedIn }: CandidateSearchProps) {
  const [jd, setJd] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'orbit' | 'xray'>('orbit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BooleanResponse | null>(null);
  const [generatorView, setGeneratorView] = useState<'input' | 'results'>('input');
  const [editableQuery, setEditableQuery] = useState('');
  const [geoPrecision, setGeoPrecision] = useState<'city' | 'state' | 'country'>('city');
  const [geoParams, setGeoParams] = useState({ city: '', state: '', country: '', zip: '', radius: '25' });
  const [showLocationError, setShowLocationError] = useState(false);
  
  // Copilot Navigation
  const [activeTab, setActiveTab] = useState<'boolean' | 'resume' | 'insights' | 'admin'>('boolean');
  
  // Advanced Filters
  const [title, setTitle] = useState('');
  const [minExp, setMinExp] = useState<number>(0);
  const [maxExp, setMaxExp] = useState<number>(20);
  const [skillQuery, setSkillQuery] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [degree, setDegree] = useState('Any Degree');
  const [gradYear, setGradYear] = useState('');
  const [companies, setCompanies] = useState('');
  const [relocation, setRelocation] = useState(false);
  const [certifications, setCertifications] = useState('');
  const [visaStatus, setVisaStatus] = useState('any');
  const [remotePreference, setRemotePreference] = useState('any');

  const [clientDomains, setClientDomains] = useState<string[]>([]);
  const [isDomainSelectOpen, setIsDomainSelectOpen] = useState(false);
  const [jobType, setJobType] = useState('all');

  const DOMAIN_OPTIONS = [
    'Manufacturing', 'Semiconductor', 'Aerospace', 'Utility', 'Oil & Gas', 
    'Power Generation', 'Telecom', 'BFSI', 'Banking Software', 'IT Services', 
    'Healthcare', 'Life Sciences', 'Retail & E-commerce', 'Logistics & Supply Chain', 
    'Automotive', 'FMCG', 'Media & Entertainment', 'Real Estate & Construction', 
    'EdTech & Education', 'Government & Defense', 'Consulting & Professional Services'
  ];

  const JOB_TYPE_OPTIONS = [
    'all', 'IT', 'Non-IT', 'Healthcare', 'Engineering', 'Finance', 'Operations', 
    'Sales & Marketing', 'Human Resources', 'Legal', 'Administration', 'R&D', 
    'Product Management', 'Design'
  ];

  // Resume Matching State
  const [resumeMatchText, setResumeMatchText] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<ResumeMatchResult | null>(null);

  // Sync Boolean with Filters
  useEffect(() => {
    if (searchMode === 'orbit' && result) {
      // Create a master keywords block
      let keywordsBlock = result.extractedKeywords;

      // Add Vector Filters directly into the keywords if they exist
      const vectors: string[] = [];
      if (skillQuery.trim()) {
        const skillsArray = skillQuery.split(',').map(s => `"${s.trim()}"`).join(' AND ');
        vectors.push(`(${skillsArray})`);
      }
      if (additionalKeywords.trim()) {
        const keywordsArray = additionalKeywords.split(',').map(s => `"${s.trim()}"`).join(' AND ');
        vectors.push(`(${keywordsArray})`);
      }
      if (certifications.trim()) {
        const certsArray = certifications.split(',').map(c => `"${c.trim()}"`).join(' OR ');
        vectors.push(`(${certsArray})`);
      }

      const vectorString = vectors.length > 0 ? ` AND ${vectors.join(' AND ')}` : '';
      
      // Update the full query
      let finalQuery = `("${result.extractedTitle}") AND ${keywordsBlock}`;
      if (vectorString) {
        finalQuery += vectorString;
      }
      
      // Basic cleanup of redundant parentheses
      finalQuery = finalQuery.replace(/\(\(([^()]+)\)\)/g, '($1)');
      
      setEditableQuery(finalQuery);
    }
  }, [result, skillQuery, additionalKeywords, certifications, searchMode]);

  const handleXRaySearch = (platform: string = 'linkedin') => {
    // Construct a structured query block using individual filter fields
    const parts: string[] = [];

    // Prioritize extracted or edited fields
    const searchTitle = result?.extractedTitle || title;
    const searchLocation = result?.extractedLocation || geoParams.city;
    const searchCountry = result?.extractedCountry || geoParams.country;
    const searchKeywords = editableQuery || manualQuery;

    if (searchTitle) parts.push(`intitle:"${searchTitle}"`);
    
    // Geographic precision - Limit to ONE as per requirement
    if (geoPrecision === 'city' && searchLocation) parts.push(`"${searchLocation}"`);
    else if (geoPrecision === 'state' && geoParams.state) parts.push(`"${geoParams.state}"`);
    else if (geoPrecision === 'country' && searchCountry) parts.push(`"${searchCountry}"`);

    if (searchKeywords) parts.push(searchKeywords);

    const searchQuery = parts.join(' ');
    
    // Platform filters matching recruitin.net / industry standards
    const platformOperators: Record<string, string> = {
      linkedin: 'site:linkedin.com/in/ OR site:linkedin.com/pub/ -intitle:profiles -inurl:dir -inurl:groups -inurl:jobs -inurl:posts',
      github: 'site:github.com -inurl:tab -inurl:stars -inurl:followers -inurl:following',
      dribbble: 'site:dribbble.com -inurl:jobs -inurl:hiring',
      coroflot: 'site:coroflot.com/people',
      behance: 'site:behance.net -inurl:projects -inurl:collections',
      stackoverflow: 'site:stackoverflow.com/users'
    };

    const filter = platformOperators[platform] || platformOperators.linkedin;
    const finalUrl = `https://www.google.com/search?q=${encodeURIComponent(`${filter} ${searchQuery}`)}`;
    
    window.open(finalUrl, '_blank', 'noreferrer');
  };
  
  // Suggestions State
  const [activeSuggestionField, setActiveSuggestionField] = useState<string | null>(null);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const SUGGESTIONS_DATA: Record<string, string[]> = {
    title: [
      'Software Engineer', 'Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 
      'DevOps Engineer', 'Product Manager', 'Data Scientist', 'Project Manager', 
      'UX Designer', 'Solution Architect', 'Engineering Manager', 'SRE', 
      'Machine Learning Engineer', 'Product Designer', 'QA Engineer', 'Security Engineer',
      'Data Engineer', 'Mobile Developer', 'React Native Developer', 'Cloud Architect'
    ],
    city: [
      'San Francisco', 'New York', 'London', 'Berlin', 'Austin', 'Seattle', 'Toronto', 
      'Chicago', 'San Jose', 'Boston', 'Los Angeles', 'Amsterdam', 'Paris', 'Stockholm',
      'Dublin', 'Singapore', 'Sydney', 'Tokyo', 'Munich', 'Tel Aviv', 'Barcelona'
    ],
    industry: [
      'Fintech', 'SaaS', 'Healthcare', 'E-commerce', 'Cybersecurity', 'Edtech', 
      'Adtech', 'Proptech', 'Automotive', 'Logistics', 'Biotech', 'GreenTech', 
      'Gaming', 'SpaceTech', 'Artificial Intelligence', 'Blockchain'
    ],
    companies: [
      'Google', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Microsoft', 'NVIDIA', 
      'Salesforce', 'Uber', 'Airbnb', 'Stripe', 'Shopify', 'Tesla', 'SpaceX', 
      'Palantir', 'Snowflake', 'Datadog', 'Coinbase', 'Discord'
    ]
  };

  const handleSuggestionSelect = (field: string, value: string) => {
    if (field === 'title') setTitle(value);
    else if (field === 'city') setGeoParams({ ...geoParams, city: value });
    else if (field === 'companies') setCompanies(value);
    setActiveSuggestionField(null);
  };

  const updateSuggestions = (field: string, input: string) => {
    setActiveSuggestionField(field);
    if (!input.trim()) {
      setFilteredSuggestions([]);
      return;
    }
    const filtered = SUGGESTIONS_DATA[field]?.filter(item => 
      item.toLowerCase().includes(input.toLowerCase())
    ) || [];
    setFilteredSuggestions(filtered);
  };

  // Internal Pool State
  const [talentPool, setTalentPool] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStats, setUploadStats] = useState({ progress: 0, total: 0, current: 0, eta: 'Calculating...' });
  const [userRole, setUserRole] = useState<'recruiter' | 'admin' | 'universal'>('recruiter');

  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'enterprise'>('free');

  // Fetch User Role & Plan
  useEffect(() => {
    if (!auth.currentUser) return;
    
    const fetchRole = async () => {
      try {
        // Universal Admin Check (Hardcoded for requestor)
        if (auth.currentUser!.email === 'king007.2311@gmail.com') {
          setUserRole('universal');
          setUserPlan('enterprise');
          return;
        }

        const userRef = doc(db, 'users', auth.currentUser!.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserRole(data.role || 'recruiter');
          setUserPlan(data.userPlan || 'free'); // Default to free
        }
      } catch (err) {
        console.error("Error fetching role:", err);
      }
    };
    
    fetchRole();
  }, [auth.currentUser]);

  useEffect(() => {
    if (!auth.currentUser) return;

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const fetchUserAndCandidates = async () => {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (!isMounted) return;
      const orgId = userDoc.data()?.organizationId || 'global';

      // Scoped Candidate Stream
      const q = query(
        collection(db, 'candidates'),
        orderBy('createdAt', 'desc')
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTalentPool(fetched);
        
        if (matches.length === 0) {
          setMatches(fetched);
        }
        setIsSyncing(false);
      }, (error) => {
        console.warn('Candidate sync error:', error);
        handleFirestoreError(error, OperationType.LIST, 'candidates');
      });
    };

    fetchUserAndCandidates();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [auth.currentUser]);

  const [matches, setMatches] = useState<any[]>([]);

  const handleQueryEdit = async (newVal: string) => {
    setEditableQuery(newVal);
    // Debounce or trigger logic to learn from this edit
    if (auth.currentUser && result) {
      // We could log this to a feedback collection
      console.log("Feedback logged: User edited query.");
    }
  };

  const handleLaunchSearch = async (platform: string) => {
    // Record the final state before leaving
    if (auth.currentUser && result) {
      await addDoc(collection(db, 'interactions'), {
        userId: auth.currentUser.uid,
        type: 'search_launch',
        originalOutput: result.query,
        finalOutput: editableQuery,
        resultCount: matches.length,
        platform,
        timestamp: serverTimestamp()
      });
    }
    platform === 'all' ? handleXRaySearch('all') : handleXRaySearch(platform);
  };
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);

  const handleResumeMatch = async () => {
    if (!resumeMatchText.trim() || !jd.trim()) return;
    setIsMatching(true);
    try {
      const data = await analyzeResumeMatch(resumeMatchText, jd);
      setMatchResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleGenerate = async () => {
    if (searchMode === 'orbit' && !jd.trim()) return;
    if (searchMode === 'xray' && !manualQuery.trim()) return;

    setIsGenerating(true);
    try {
      if (searchMode === 'orbit') {
        // Fetch interactions for learning
        let interactions: any[] = [];
        if (auth.currentUser) {
          try {
            const iQ = query(
              collection(db, 'interactions'),
              where('userId', '==', auth.currentUser.uid),
              where('type', '==', 'search_launch'),
              orderBy('timestamp', 'desc'),
              limit(5)
            );
            const iSnap = await getDocs(iQ);
            interactions = iSnap.docs.map(d => d.data());
          } catch (e) {
            console.warn("Could not fetch interactions for learning:", e);
          }
        }

        const data = await generateBooleanFromJD(jd, interactions);
        setResult(data);
        setGeneratorView('results');
        
        // Track the interaction for learning
        if (auth.currentUser) {
          await addDoc(collection(db, 'interactions'), {
            userId: auth.currentUser.uid,
            type: 'boolean_generation',
            input: jd,
            output: data.query,
            timestamp: serverTimestamp()
          });
        }

        // --- ENHANCED MATCHING LOGIC ---
        const scoredCandidates = talentPool.map(c => {
          const haystack = (c.name + ' ' + c.title + ' ' + c.resumeSnippet + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
          
          // 1. Title Match (0-30 points)
          const titleScore = data.suggestedTitles.some(t => haystack.includes(t.toLowerCase())) ? 30 : 0;
          
          // 2. Keyword Match (0-40 points)
          const queryTerms = data.query
            .replace(/[()"]/g, '')
            .split(/\s+OR\s+|\s+AND\s+/)
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 2);
            
          const keywordMatchCount = queryTerms.filter(k => haystack.includes(k)).length;
          const keywordScore = queryTerms.length > 0 ? (keywordMatchCount / queryTerms.length) * 40 : 0;

          // 3. Domain/Type/Exp Match (0-30 points - Simulated systemization)
          const domainMatch = clientDomains.length === 0 || clientDomains.some(d => (c.clientDomain || c.industry || '').toLowerCase().includes(d.toLowerCase()));
          const typeMatch = jobType === 'all' || (c.jobType || '').toLowerCase() === jobType.toLowerCase();
          const expMatch = (c.experience >= minExp && c.experience <= maxExp);
          const metaScore = (domainMatch ? 10 : 0) + (typeMatch ? 10 : 0) + (expMatch ? 10 : 0);
          
          const totalScore = Math.round(titleScore + keywordScore + metaScore);
          return { ...c, score: Math.min(totalScore, 100) };
        });

        // Only show results with matching > 50%
        const finalMatches = scoredCandidates
          .filter(c => c.score >= 50)
          .sort((a, b) => b.score - a.score);

        // Automated LinkedIn Leads (Simulated)
        let linkedinLeads: any[] = [];
        if (isLinkedInConnected) {
          linkedinLeads = [
            {
              id: `li-${Date.now()}-1`,
              name: 'Johnathan "JD" Doe (LinkedIn 1st)',
              title: data.suggestedTitles[0] || 'Senior Engineer',
              score: 99,
              location: 'San Francisco (Connected Network)',
              isInternal: false,
              experience: 8,
              isLinkedInLead: true,
              resumeSnippet: 'Top match from your LinkedIn 1st degree connections.',
              highlightedMatches: data.extractedKeywords.split(',').slice(0, 3),
              keywords: data.extractedKeywords.split(','),
              createdAt: serverTimestamp()
            }
          ];
        }

        const consolidated = [...linkedinLeads, ...finalMatches];
        
        // If no matches > 50%, message to user is handled in UI
        setMatches(consolidated);
        onMatchesFound(consolidated);
      } else {
        // X-Ray / Manual Boolean Search Logic
        const keywords = manualQuery.replace(/[()"]/g, '').split(/\s+OR\s+|\s+AND\s+/).map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
        const found = talentPool.filter(c => {
          const text = (c.name + ' ' + c.title + ' ' + c.resumeSnippet + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
          return keywords.length === 0 || keywords.some(k => text.includes(k)); // OR matching for manual preview
        });
        setMatches(found);
        onMatchesFound(found);
        setResult({ 
          query: manualQuery, 
          suggestedTitles: [title || 'Manual Search Result'],
          roleBlueprint: {
            software: skillQuery.split(',').map(s => s.trim()),
            skillSet: [title, industry, ...skillQuery.split(',')].filter(Boolean).slice(0, 10),
            industry: [industry].filter(Boolean),
            brief: `Manual sourcing session for ${title || 'unspecified role'} in ${geoParams.city || 'global'} location.`
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTalentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !auth.currentUser) return;

    const fileList = Array.from(files as unknown as File[]);
    setIsSyncing(true);
    setUploadStats({ progress: 0, total: fileList.length, current: 0, eta: 'Calculating...' });

    const startTime = Date.now();
    
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Progress update...
        setUploadStats(prev => ({ ...prev, current: i + 1, progress: Math.round((i / fileList.length) * 100) }));

        const reader = new FileReader();
        const textPromise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string || '');
          reader.readAsText(file);
        });
        
        const text = await textPromise;
        const profile = await extractProfileData(text);

        // 1. Validate: Is it a resume?
        if (!profile.isResume) {
          console.warn(`File ${file.name} is not a valid resume. Skipping.`);
          continue;
        }

        // 2. Validate: Must have email or phone
        if (!profile.email && !profile.phone) {
          console.warn(`Resume ${file.name} missing contact info. Skipping.`);
          continue;
        }

        // 3. Duplicate Detection
        const dupQuery = query(
          collection(db, 'candidates'),
          where('email', '==', profile.email || 'NO_EMAIL'),
          where('phone', '==', profile.phone || 'NO_PHONE')
        );
        const dupSnap = await getDocs(dupQuery);
        
        if (!dupSnap.empty) {
          console.warn(`Duplicate found for ${profile.name}. Replacing.`);
          // Delete existing for replacement if desired, or skip
          await Promise.all(dupSnap.docs.map(d => deleteDoc(d.ref)));
        }

        const talent = {
          recruiterId: auth.currentUser?.uid,
          name: profile.name || file.name.split('.')[0], // Name after candidate
          email: profile.email,
          phone: profile.phone,
          title: profile.title,
          score: 100,
          location: profile.location,
          isInternal: true,
          experience: profile.experience,
          degree: profile.degree,
          resumeSnippet: profile.summary,
          keywords: profile.skills,
          jobType: profile.jobType || '',
          clientDomain: profile.clientDomain || '',
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'candidates'), talent);
      }
      
      setUploadStats(prev => ({ ...prev, progress: 100, eta: 'Done' }));

      // Notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; background: #111827; color: white; padding: 16px 24px; border-radius: 16px; font-weight: bold; font-family: sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 9999; animation: slideUp 0.3s ease-out;">
          <style>@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }</style>
          🛸 Orbit Sync: ${fileList.length} Assets Ingested
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);

      setTimeout(() => setIsSyncing(false), 2000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'candidates');
      setIsSyncing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJd(`Extracted JD: ${event.target?.result as string}`);
    };
    reader.readAsText(file);
  };

  const renderFilters = () => (
    <div className="space-y-8">
      {/* Search Actions */}
      <div className="flex gap-2">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl text-base font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-coral transition-all disabled:opacity-50 shadow-lg shadow-midnight/10"
        >
          {isGenerating ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Run AI Vector Sourcing
        </button>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h5 className="text-base font-black uppercase text-[#0f172a]/20 tracking-[0.2em] border-b border-slate-300/5 pb-2">Core Identification</h5>
          <div className="space-y-2 relative">
            <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Primary Role</label>
            <input 
              value={title} 
              onChange={(e) => {
                setTitle(e.target.value);
                updateSuggestions('title', e.target.value);
              }} 
              onFocus={() => updateSuggestions('title', title)}
              onBlur={() => setTimeout(() => setActiveSuggestionField(null), 200)}
              placeholder="e.g. Lead Software Engineer" 
              className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-midnight/5 transition-all" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Must-Have Skills</label>
            <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} 
              placeholder="React, Node.js, AWS..." 
              className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-midnight/5" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Additional Keywords</label>
            <input value={additionalKeywords} onChange={(e) => setAdditionalKeywords(e.target.value)} 
              placeholder="Startup, B2B, SaaS..." 
              className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-midnight/5" 
            />
          </div>
        </section>

        <section className="space-y-4">
          <h5 className="text-base font-black uppercase text-[#0f172a]/20 tracking-[0.2em] border-b border-slate-300/5 pb-2">Domain & Experience</h5>
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Client Domain (Industry)</label>
              
              <div 
                className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none cursor-pointer flex justify-between items-center"
                onClick={() => setIsDomainSelectOpen(!isDomainSelectOpen)}
              >
                <div className="flex-1 truncate">
                  {clientDomains.length === 0 ? 'All Domains' : clientDomains.join(', ')}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-[#0f172a]/50 transition-transform", isDomainSelectOpen && "rotate-180")} />
              </div>
              
              {isDomainSelectOpen && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2">
                  {DOMAIN_OPTIONS.map(domain => (
                    <label key={domain} className="flex flex-row items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer rounded-xl transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded accent-indigo-electric shrink-0"
                        checked={clientDomains.includes(domain)}
                        onChange={(e) => {
                          if (e.target.checked) setClientDomains([...clientDomains, domain]);
                          else setClientDomains(clientDomains.filter(d => d !== domain));
                        }}
                      />
                      <span className="text-sm font-bold text-[#0f172a]">{domain}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Job Nature (Type)</label>
              <select 
                value={jobType} 
                onChange={(e) => setJobType(e.target.value)} 
                className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none appearance-none cursor-pointer"
              >
                {JOB_TYPE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt === 'all' ? 'Every Job Type' : opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 flex justify-between">
              Experience Range <span>{minExp} - {maxExp} yrs</span>
            </label>
            <div className="px-2">
              <input 
                type="range" min="0" max="25" value={maxExp} 
                onChange={(e) => setMaxExp(parseInt(e.target.value))}
                className="w-full accent-midnight cursor-pointer" 
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h5 className="text-base font-black uppercase text-[#0f172a]/20 tracking-[0.2em] border-b border-slate-300/5 pb-2">Location & Logistics</h5>
          <div className="space-y-4">
            <div className="flex gap-1 p-1 bg-warm-gray rounded-xl">
               {['city', 'state', 'country'].map((p) => (
                  <button key={p} onClick={() => setGeoPrecision(p as any)}
                    className={cn("flex-1 py-2 rounded-lg text-base font-bold uppercase transition-all", geoPrecision === p ? "bg-[#1e293b] text-white shadow-sm" : "text-[#0f172a]/40 hover:text-[#0f172a]")}
                  >
                    {p}
                  </button>
               ))}
            </div>
            <input value={geoPrecision === 'city' ? geoParams.city : geoPrecision === 'state' ? geoParams.state : geoParams.country} 
              onChange={(e) => {
                const val = e.target.value;
                if (geoPrecision === 'city') setGeoParams({...geoParams, city: val});
                else if (geoPrecision === 'state') setGeoParams({...geoParams, state: val});
                else setGeoParams({...geoParams, country: val});
              }} 
              placeholder={`Enter ${geoPrecision}...`}
              className="w-full p-4 bg-warm-gray text-sm font-bold rounded-2xl outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Visa Status</label>
              <select value={visaStatus} onChange={(e) => setVisaStatus(e.target.value)} className="w-full p-3 bg-warm-gray text-base font-bold rounded-xl outline-none">
                <option value="any">Any</option>
                <option value="citizen">Citizen</option>
                <option value="sponsorship">Sponsor</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Remote</label>
              <select value={remotePreference} onChange={(e) => setRemotePreference(e.target.value)} className="w-full p-3 bg-warm-gray text-base font-bold rounded-xl outline-none">
                <option value="any">Any</option>
                <option value="remote">Yes</option>
                <option value="onsite">No</option>
              </select>
            </div>
          </div>
        </section>

        <div className="pt-4 space-y-4">
           <label className="flex items-center gap-3 cursor-pointer group p-3 bg-warm-gray/50 rounded-2xl hover:bg-warm-gray transition-colors">
            <input type="checkbox" checked={relocation} onChange={(e) => setRelocation(e.target.checked)} className="w-4 h-4 rounded accent-midnight" />
            <span className="text-base font-bold text-[#0f172a]/60 uppercase tracking-widest">Willing to Relocate</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBooleanGenerator = () => (
    <div className="h-full flex flex-col space-y-6">
      {generatorView === 'input' ? (
        <div className="flex-1 bg-[#1e293b] p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden group flex flex-col">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-coral/20 rounded-lg flex items-center justify-center">
                <Terminal className="w-4 h-4 text-coral" />
              </div>
              <h4 className="text-white font-serif font-bold italic text-lg tracking-wide">AI Selection Orbit</h4>
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !jd.trim()}
              className="px-8 py-3 bg-indigo-electric hover:bg-white text-white hover:text-[#0f172a] rounded-full text-base font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50"
            >
              {isGenerating ? 'Parsing...' : 'Analyze JD'}
            </button>
          </div>

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste Job Description here... AI will extract title, location, and keywords automatically."
            className="w-full flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 text-indigo-100 font-mono text-base leading-relaxed outline-none focus:border-indigo-electric/40 transition-all resize-none mt-4"
          />
        </div>
      ) : (
        <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
          {/* RESULTS VIEW - MATCHING SCREENSHOT */}
          <div className="bg-white p-10 rounded-3xl border border-slate-300/5 shadow-xl space-y-10">
            <div className="flex justify-between items-center">
               <h3 className="text-3xl font-serif font-bold italic text-[#0f172a]">Recruit AI: Synthesis</h3>
               <button onClick={() => setGeneratorView('input')} className="text-base font-bold uppercase text-[#0f172a]/40 hover:text-[#0f172a]">Back to JD</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Extracted Job Title</label>
                 <input 
                   value={result?.extractedTitle} 
                   onChange={(e) => setResult(prev => prev ? {...prev, extractedTitle: e.target.value} : null)}
                   className="w-full p-4 bg-warm-gray rounded-xl text-base font-bold outline-none border-2 border-transparent focus:border-slate-300/10"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Extracted Location</label>
                 <input 
                   value={result?.extractedLocation} 
                   onChange={(e) => setResult(prev => prev ? {...prev, extractedLocation: e.target.value} : null)}
                   className="w-full p-4 bg-warm-gray rounded-xl text-base font-bold outline-none border-2 border-transparent focus:border-slate-300/10"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Extracted Country</label>
                 <input 
                   value={result?.extractedCountry} 
                   onChange={(e) => setResult(prev => prev ? {...prev, extractedCountry: e.target.value} : null)}
                   className="w-full p-4 bg-warm-gray rounded-xl text-base font-bold outline-none border-2 border-transparent focus:border-slate-300/10"
                 />
               </div>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Precise Boolean String</label>
                    <button onClick={() => navigator.clipboard.writeText(result?.preciseQuery || editableQuery)} className="flex items-center gap-2 text-base font-bold uppercase text-indigo-electric hover:text-emerald-600 transition-colors">
                      <Copy className="w-3 h-3" /> Copy Precise
                    </button>
                  </div>
                  <textarea 
                    value={result?.preciseQuery || editableQuery}
                    onChange={(e) => {
                      if (result) {
                        setResult({...result, preciseQuery: e.target.value});
                      } else {
                        handleQueryEdit(e.target.value);
                      }
                    }}
                    className="w-full h-32 p-6 bg-warm-gray rounded-2xl text-base font-mono leading-relaxed outline-none border-2 border-transparent focus:border-slate-300/10"
                  />
                  <p className="text-sm text-[#0f172a]/40 italic">Strict matching including titles and exact keywords.</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Broad / Alternative String</label>
                    <button onClick={() => navigator.clipboard.writeText(result?.broadQuery || '')} className="flex items-center gap-2 text-base font-bold uppercase text-indigo-electric hover:text-emerald-600 transition-colors">
                      <Copy className="w-3 h-3" /> Copy Broad
                    </button>
                  </div>
                  <textarea 
                    value={result?.broadQuery || ''}
                    onChange={(e) => {
                      if (result) {
                        setResult({...result, broadQuery: e.target.value});
                      }
                    }}
                    className="w-full h-32 p-6 bg-warm-gray rounded-2xl text-base font-mono leading-relaxed outline-none border-2 border-transparent focus:border-slate-300/10"
                  />
                  <p className="text-sm text-[#0f172a]/40 italic">Relaxed matching for more volume. Often drops title or specific education requirements.</p>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">Skill-Heavy String</label>
                    <button onClick={() => navigator.clipboard.writeText(result?.skillQuery || '')} className="flex items-center gap-2 text-base font-bold uppercase text-indigo-electric hover:text-emerald-600 transition-colors">
                      <Copy className="w-3 h-3" /> Copy Skills
                    </button>
                  </div>
                  <textarea 
                    value={result?.skillQuery || ''}
                    onChange={(e) => {
                      if (result) {
                        setResult({...result, skillQuery: e.target.value});
                      }
                    }}
                    className="w-full h-32 p-6 bg-warm-gray rounded-2xl text-base font-mono leading-relaxed outline-none border-2 border-transparent focus:border-slate-300/10"
                  />
                  <p className="text-sm text-[#0f172a]/40 italic">Exclusively focuses on skills, tools, and tech stacks. No titles.</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6">
               <button 
                 onClick={() => isLinkedInConnected ? handleXRaySearch('linkedin') : onConnectLinkedIn?.()} 
                 className={cn(
                   "py-5 text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg",
                   isLinkedInConnected ? "bg-[#00a36e] shadow-emerald-200" : "bg-[#0077b5] shadow-blue-200 animate-pulse"
                 )}
               >
                 {isLinkedInConnected ? (
                   <>
                     <Search className="w-4 h-4" /> Generate LinkedIn Search
                   </>
                 ) : (
                   <>
                     <Link2 className="w-4 h-4" /> Connect LinkedIn for AI Sourcing
                   </>
                 )}
               </button>
               <button onClick={() => handleXRaySearch('all')} className="py-5 bg-[#1e293b] text-white rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3">
                 <Globe className="w-4 h-4" /> Global X-Ray Sweep
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderResumeMatch = () => (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex-1 bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-electric/10 text-indigo-electric rounded-xl flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <h4 className="text-[#0f172a] font-serif font-bold italic text-xl">Resume Matching Engine</h4>
          </div>
          <button 
            onClick={handleResumeMatch}
            disabled={isMatching || !resumeMatchText || !jd}
            className="px-6 py-2 bg-indigo-electric text-white rounded-full text-base font-black uppercase tracking-widest hover:bg-[#1e293b] transition-all disabled:opacity-50"
          >
            {isMatching ? 'Analyzing...' : 'Calculate Score'}
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
          <div className="flex flex-col space-y-3 relative">
            <div className="flex justify-between items-center">
              <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40">Candidate Resume Content</label>
              <label className="cursor-pointer text-indigo-electric hover:text-[#0f172a] transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-widest">
                <Upload className="w-3 h-3" /> Upload File
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".txt,.md,.rtf" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => setResumeMatchText(event.target?.result as string);
                    reader.readAsText(file);
                  }} 
                />
              </label>
            </div>
            <textarea
              value={resumeMatchText}
              onChange={(e) => setResumeMatchText(e.target.value)}
              placeholder="Paste candidate resume or profile text here or upload a file..."
              className="flex-1 w-full bg-warm-gray rounded-2xl p-6 text-base outline-none focus:bg-white focus:shadow-inner transition-all resize-none border border-transparent focus:border-indigo-electric/10"
            />
          </div>
          <div className="flex flex-col space-y-3">
            <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40">Comparison Job Description</label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="JD will sync from Boolean tab or paste here..."
              className="flex-1 w-full bg-warm-gray rounded-2xl p-6 text-base outline-none focus:bg-white focus:shadow-inner transition-all resize-none border border-transparent focus:border-indigo-electric/10"
            />
          </div>
        </div>

        {matchResult && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            <div className="p-6 bg-[#1e293b] text-white rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center justify-center border-r border-white/5 pr-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * matchResult.score) / 100} className="text-emerald-400" strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-3xl font-serif font-bold italic">{matchResult.score}</span>
                </div>
                <span className="text-base font-bold uppercase tracking-widest text-white/40 mt-4">Match Affinity Score</span>
                <p className="text-base text-white/50 text-center mt-3 font-medium italic">"{matchResult.humanSummary}"</p>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-x-12 gap-y-4">
                {Object.entries(matchResult.breakdown).map(([key, val]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black uppercase text-white/30 tracking-widest">{key}</span>
                      <span className="text-base font-bold">{val}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} className={cn("h-full", (val as number) > 75 ? "bg-emerald-400" : (val as number) > 50 ? "bg-amber-400" : "bg-red-400")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                <h5 className="text-base font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Core Strengths
                </h5>
                <ul className="space-y-2">
                  {matchResult.strengths.map((s, i) => (
                    <li key={i} className="text-base text-emerald-900 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-red-50 rounded-3xl border border-red-100 space-y-4">
                <h5 className="text-base font-bold uppercase tracking-widest text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Identified Gaps
                </h5>
                <ul className="space-y-2">
                  {matchResult.gaps.map((g, i) => (
                    <li key={i} className="text-base text-red-900 font-medium leading-relaxed flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {(matchResult.bridgeExperience?.length > 0 || matchResult.optimizationTips?.length > 0) && (
              <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-6">
                <h5 className="text-base font-bold uppercase tracking-widest text-indigo-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> Gap Mitigation & Optimization
                </h5>
                
                {matchResult.bridgeExperience?.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-base font-bold text-indigo-900 uppercase">Bridge Experience</p>
                    {matchResult.bridgeExperience.map((be, i) => (
                       <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100/50">
                         <p className="text-base font-bold text-indigo-400 uppercase mb-1">Gap: {be.gap}</p>
                         <p className="text-base text-indigo-900 font-medium">{be.mitigation}</p>
                       </div>
                    ))}
                  </div>
                )}

                {matchResult.optimizationTips?.length > 0 && (
                   <div className="space-y-3">
                    <p className="text-base font-bold text-indigo-900 uppercase pt-2">Optimization Roadmap</p>
                    <ul className="space-y-2">
                      {matchResult.optimizationTips.map((tip, i) => (
                        <li key={i} className="text-base text-indigo-900 font-medium leading-relaxed flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">{i + 1}.</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderAdminMatrix = () => (
    <div className="h-full space-y-6">
      <div className="bg-white p-10 rounded-3xl border border-slate-300/5 shadow-xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-serif font-bold italic text-[#0f172a]">Admin Matrix</h3>
            <p className="text-base uppercase font-bold text-[#0f172a]/30 tracking-widest mt-1">Universal Control & Org Insights</p>
          </div>
          <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-base font-black uppercase tracking-widest">
            {userRole === 'universal' ? 'Universal Head' : 'Admin Head'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Internal Pool', value: talentPool.length, icon: Users },
            { label: 'System Matches', value: matches.length, icon: Sparkles },
            { label: 'Organization Health', value: 'Optimal', icon: Brain }
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-warm-gray rounded-3xl space-y-2 border border-transparent hover:border-slate-300/5 transition-all">
              <stat.icon className="w-4 h-4 text-[#0f172a]/40" />
              <div className="text-2xl font-serif font-bold text-[#0f172a]">{stat.value}</div>
              <div className="text-base font-black uppercase text-[#0f172a]/30 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {userRole === 'universal' && (
          <div className="space-y-4 pt-4">
            <h5 className="text-base font-black uppercase tracking-widest text-[#0f172a]/60">Manage User Permissions</h5>
            <div className="bg-warm-gray p-6 rounded-3xl space-y-4">
              <p className="text-base text-[#0f172a]/50 leading-relaxed italic">As Universal Head, you can restrict or grant access to organizational heads and standard recruiters. Profiles are automatically deduplicated and validated during ingestion for all members.</p>
              <button className="w-full py-4 border-2 border-dashed border-slate-300/10 rounded-2xl text-base font-bold uppercase text-[#0f172a]/40 hover:bg-white transition-all">
                Access Member Management Console
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCandidateInsights = () => (
    <div className="h-full flex flex-col space-y-6">
      {matchResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-8 overflow-y-auto scrollbar-hide">
             <div className="space-y-4">
                <h4 className="text-base font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Strategic Strengths
                </h4>
                <div className="space-y-3">
                  {matchResult.strengths.map((s, i) => (
                    <div key={i} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-base shrink-0">✓</div>
                      <p className="text-base text-emerald-900 font-medium leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-base font-black uppercase tracking-widest text-coral flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Market Gaps & Risks
                </h4>
                <div className="space-y-3">
                  {matchResult.gaps.map((g, i) => (
                    <div key={i} className="p-4 bg-coral/5 rounded-2xl border border-coral/10 flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-coral text-white flex items-center justify-center text-base shrink-0">!</div>
                      <p className="text-base text-coral font-medium leading-relaxed">{g}</p>
                    </div>
                  ))}
                  {matchResult.redFlags.map((r, i) => (
                    <div key={i} className="p-4 bg-[#1e293b] rounded-2xl border border-white/5 flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-base shrink-0">⚡</div>
                      <p className="text-base text-white/80 font-medium leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="bg-indigo-electric p-8 rounded-3xl shadow-2xl space-y-8 overflow-y-auto scrollbar-hide text-white">
            <div className="space-y-2">
              <h4 className="text-base font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Optimization Roadmap
              </h4>
              <p className="text-base text-white/60 leading-relaxed italic">Strategic advice to maximize this candidate's selection probability.</p>
            </div>
            
            <div className="space-y-4">
              {matchResult.optimizationTips.map((tip, i) => (
                <div key={i} className="flex gap-4 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                  <div className="text-2xl font-serif italic text-white/20">{i+1}</div>
                  <p className="text-base font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>

            <div className="p-8 bg-white/10 rounded-3xl border border-white/10 mt-auto">
               <h5 className="text-base font-black uppercase tracking-widest mb-4">Selection Probability</h5>
               <div className="flex items-end gap-3 mb-4">
                  <div className="text-5xl font-serif font-bold italic">{matchResult.score}%</div>
                  <span className="text-base font-bold text-white/40 mb-2">High Confidence Match</span>
               </div>
               <button className="w-full py-4 bg-white text-indigo-electric rounded-xl text-base font-black uppercase tracking-widest hover:bg-coral hover:text-white transition-all">Generate Outreach Strategy</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#0f172a]/20 opacity-40">
          <Brain className="w-20 h-20 mb-6" />
          <h3 className="text-2xl font-serif font-bold italic">Awaiting Synthesis</h3>
          <p className="text-base font-bold uppercase tracking-widest mt-2">Run a Resume Match to unlock deep talent insights</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-screen overflow-hidden pb-10">
      {/* Copilot Navigation Bar */}
      <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-slate-300/5 shadow-sm shrink-0">
        <div className="flex gap-2 p-1 bg-warm-gray rounded-full">
          <button 
            onClick={() => setActiveTab('boolean')}
            className={cn(
              "px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'boolean' ? "bg-[#1e293b] text-white shadow-lg" : "text-[#0f172a]/40 hover:text-[#0f172a]"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> Boolean Generator
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={cn(
              "px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'resume' ? "bg-indigo-electric text-white shadow-lg" : "text-[#0f172a]/40 hover:text-[#0f172a]"
            )}
          >
            <ClipboardCheck className="w-3.5 h-3.5" /> Resume Match
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={cn(
              "px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === 'insights' ? "bg-coral text-white shadow-lg" : "text-[#0f172a]/40 hover:text-[#0f172a]"
            )}
          >
            <Brain className="w-3.5 h-3.5" /> Candidate Insights
          </button>
          {(userRole === 'admin' || userRole === 'universal') && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={cn(
                "px-6 py-2 rounded-full text-base font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                activeTab === 'admin' ? "bg-amber-400 text-[#0f172a] shadow-lg" : "text-[#0f172a]/40 hover:text-[#0f172a]"
              )}
            >
              <Users className="w-3.5 h-3.5" /> Admin Matrix
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 px-4">
          <div className="flex flex-col items-end">
            <span className="text-base font-black uppercase text-[#0f172a]/20 tracking-widest">System Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-base font-bold text-[#0f172a]/60">AI Recruiter Copilot Active</span>
            </div>
          </div>
          <div className="h-8 w-px bg-[#1e293b]/5" />
          <button 
            onClick={() => setSearchMode(searchMode === 'orbit' ? 'xray' : 'orbit')}
            className="flex items-center gap-2 px-4 py-2 bg-warm-gray rounded-xl group transition-all"
          >
            <span className="text-base font-bold uppercase text-[#0f172a]/40 group-hover:text-[#0f172a]">Mode: {searchMode === 'orbit' ? 'AI Auto' : 'Manual X-Ray'}</span>
            <Zap className={cn("w-3.5 h-3.5 transition-colors", searchMode === 'orbit' ? "text-coral" : "text-indigo-electric")} />
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
        {/* LEFT PANEL: Filters */}
        <section className="w-[20%] bg-white p-6 rounded-3xl border border-slate-300/5 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-electric/5 rounded flex items-center justify-center">
                <Search className="w-3 h-3 text-indigo-electric" />
              </div>
              <h3 className="text-base font-black uppercase tracking-[0.2em] text-[#0f172a]/80">Vector Filters</h3>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            {renderFilters()}
          </div>
        </section>

        {/* CENTER PANEL: Core Logic */}
        <section className="flex-1 flex flex-col overflow-hidden">
           <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
              {activeTab === 'boolean' && renderBooleanGenerator()}
              {activeTab === 'resume' && renderResumeMatch()}
              {activeTab === 'insights' && renderCandidateInsights()}
              {activeTab === 'admin' && renderAdminMatrix()}
           </div>
        </section>

        {/* RIGHT PANEL: Output & Archive */}
        <section className="w-[30%] bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-electric text-white rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold italic">Internal Archive</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-base font-bold text-emerald-500 uppercase tracking-widest">{matches.length} Matches</span>
              <p className="text-base text-[#0f172a]/20 font-bold uppercase mt-1">Real-time Sync</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {(userPlan === 'free' ? matches.slice(0, 3) : matches).length > 0 ? (userPlan === 'free' ? matches.slice(0, 3) : matches).map((c) => (
              <div key={c.id} className="p-5 bg-warm-gray/30 rounded-[1.5rem] border border-transparent hover:border-indigo-electric/20 hover:bg-white transition-all group flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-electric text-white rounded-2xl flex items-center justify-center font-serif font-bold text-xl italic shrink-0 shadow-lg shadow-indigo-500/10">
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-base font-bold text-[#0f172a] truncate">{c.name}</h4>
                      <p className="text-base text-[#0f172a]/60 font-bold uppercase">{c.title}</p>
                    </div>
                    <div className="text-base font-bold text-indigo-electric">{c.score}%</div>
                  </div>
                  <p className="text-base text-[#0f172a]/60 line-clamp-2 italic mb-3 leading-relaxed">
                    {c.resumeSnippet}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewCandidate(c)} className="px-3 py-1 bg-[#1e293b] text-white rounded-lg text-base font-bold uppercase">View</button>
                    <button className="px-3 py-1 bg-white border border-slate-300/5 rounded-lg text-base font-bold uppercase">Save</button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                <Users className="w-16 h-16 mb-4" />
                <p className="text-base font-bold uppercase tracking-widest">Archive Empty</p>
              </div>
            )}
            
            {userPlan === 'free' && matches.length > 3 && (
              <div className="p-5 bg-indigo-electric/5 border border-indigo-100 rounded-[1.5rem] flex flex-col items-center text-center">
                <Sparkles className="w-6 h-6 text-indigo-electric mb-2" />
                <h4 className="text-base font-black uppercase text-[#0f172a] tracking-widest mb-1">Unlock {matches.length - 3} More Matches</h4>
                <p className="text-base text-[#0f172a]/60 mb-3">Upgrade to Pro to see your full candidate pipeline and access deep AI insights.</p>
                <button className="w-full py-2 bg-indigo-electric text-white text-base font-bold uppercase tracking-widest rounded-lg hover:bg-[#1e293b] transition-colors">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-300/5">
            <div className="flex gap-2 mb-4">
               {isSyncing && uploadStats.total > 0 && (
                <div className="flex-1 space-y-2">
                   <div className="flex justify-between">
                     <span className="text-base font-bold uppercase text-indigo-electric">Syncing Archive</span>
                     <span className="text-base font-bold text-indigo-electric">{uploadStats.eta}</span>
                   </div>
                   <div className="h-1 bg-indigo-50 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${uploadStats.progress}%` }} className="h-full bg-indigo-electric" />
                   </div>
                </div>
               )}
            </div>
            <label className="cursor-pointer w-full py-4 bg-indigo-electric/5 text-indigo-electric rounded-2xl flex items-center justify-center gap-2 text-base font-bold uppercase tracking-widest hover:bg-indigo-electric/10 transition-all">
              <Upload className="w-3.5 h-3.5" /> 
              {isSyncing ? 'Sync in Progress' : 'Bulk Archive Upload'}
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" multiple onChange={handleTalentUpload} />
            </label>
          </div>
        </section>
      </div>

      {/* Quick Preview Modal (Overlays Everything) */}
      <AnimatePresence>
        {previewCandidate && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#1e293b]/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setPreviewCandidate(null)}
                className="absolute top-8 right-8 w-10 h-10 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-[#1e293b] text-white rounded-[1.5rem] flex items-center justify-center font-serif font-bold text-3xl italic">
                  {previewCandidate.name[0]}
                </div>
                <div>
                  <h3 className="text-3xl font-serif font-bold italic">{previewCandidate.name}</h3>
                  <p className="text-lg text-[#0f172a]/40 font-medium italic">{previewCandidate.title}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-warm-gray/30 p-4 rounded-xl">
                      <span className="text-base font-bold uppercase text-[#0f172a]/30">Experience</span>
                      <p className="text-base font-bold">{previewCandidate.experience}Y</p>
                   </div>
                   <div className="bg-warm-gray/30 p-4 rounded-xl">
                      <span className="text-base font-bold uppercase text-[#0f172a]/30">Degree</span>
                      <p className="text-base font-bold truncate">{previewCandidate.degree}</p>
                   </div>
                   <div className="bg-warm-gray/30 p-4 rounded-xl">
                      <span className="text-base font-bold uppercase text-[#0f172a]/30">Location</span>
                      <p className="text-base font-bold truncate">{previewCandidate.location}</p>
                   </div>
                </div>
                <div className="p-6 bg-indigo-electric/5 rounded-2xl border border-indigo-100">
                  <p className="text-base text-[#0f172a] font-medium leading-relaxed italic">
                    {previewCandidate.resumeSnippet}
                  </p>
                </div>
                <button className="w-full py-4 bg-[#1e293b] text-white rounded-xl font-bold text-base uppercase tracking-widest hover:bg-coral">
                  Unlock Full Metadata
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
