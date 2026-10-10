import apiClient from './api';

// Initial educational mock dataset representing authentic K-12 materials
let mockGenerations = [
  {
    id: 'gen_001',
    title: 'Photosynthesis & Chloroplast Diagram',
    prompt: 'Clean black-and-white outline colouring worksheet illustrating light reaction and Calvin cycle for 5th grade biology.',
    category: 'worksheet',
    categoryLabel: 'Colouring Worksheet',
    gradeLevel: 'Grade 5 (Elementary)',
    modelUsed: 'Imagen 3 Fast (Line-Art Pruned)',
    modelId: 'imagen-3-fast',
    status: 'completed',
    qualityScore: 98,
    reviewStatus: 'approved',
    tokensUsed: 142,
    cost: 0.0032,
    dimensions: '2048 x 2048',
    aspectRatio: '1:1',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    guardrailStatus: 'K-5 Safe',
    downloadUrl: '#',
    sampleColor: 'bg-emerald-50 text-emerald-700',
  },
  {
    id: 'gen_002',
    title: 'World War II Allied Pacific Timeline',
    prompt: 'Educational poster diagram charting the major naval engagements from Pearl Harbor to Midway with clear date callouts.',
    category: 'poster',
    categoryLabel: 'Educational Poster',
    gradeLevel: 'Grade 8 (Middle School)',
    modelUsed: 'Gemini 3 Pro Vision Router',
    modelId: 'gemini-3-pro',
    status: 'completed',
    qualityScore: 96,
    reviewStatus: 'approved',
    tokensUsed: 215,
    cost: 0.0058,
    dimensions: '1920 x 1080',
    aspectRatio: '16:9',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    guardrailStatus: 'Middle School Approved',
    downloadUrl: '#',
    sampleColor: 'bg-blue-50 text-blue-700',
  },
  {
    id: 'gen_003',
    title: 'Geometry Angle Relationships Memory Cards',
    prompt: 'Print-ready paired flashcard set demonstrating supplementary, complementary, and alternate interior angles.',
    category: 'flashcard',
    categoryLabel: 'Flashcards & Vocab',
    gradeLevel: 'Grade 7 (Middle School)',
    modelUsed: 'SDXL Turbo Education',
    modelId: 'sdxl-turbo',
    status: 'completed',
    qualityScore: 94,
    reviewStatus: 'approved',
    tokensUsed: 118,
    cost: 0.0024,
    dimensions: '1200 x 1800',
    aspectRatio: '2:3',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    guardrailStatus: 'Middle School Approved',
    downloadUrl: '#',
    sampleColor: 'bg-purple-50 text-purple-700',
  },
  {
    id: 'gen_004',
    title: 'Human Circulatory & Heart Ventricle Cross-Section',
    prompt: 'Medical curriculum illustration showing deoxygenated and oxygenated blood flow arrows for High School Anatomy.',
    category: 'illustration',
    categoryLabel: 'Learning Illustration',
    gradeLevel: 'Grade 11 (High School)',
    modelUsed: 'Gemini 3 Pro Vision Router',
    modelId: 'gemini-3-pro',
    status: 'completed',
    qualityScore: 91,
    reviewStatus: 'pending',
    tokensUsed: 310,
    cost: 0.0075,
    dimensions: '2048 x 2048',
    aspectRatio: '1:1',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    guardrailStatus: 'High School / Advanced',
    downloadUrl: '#',
    sampleColor: 'bg-rose-50 text-rose-700',
  },
  {
    id: 'gen_005',
    title: 'Solar System Planetary Orbit Scales',
    prompt: 'High resolution astronomical infographic poster contrasting terrestrial vs Jovian planet radii.',
    category: 'poster',
    categoryLabel: 'Educational Poster',
    gradeLevel: 'Grade 4 (Elementary)',
    modelUsed: 'Imagen 3 Fast (Line-Art Pruned)',
    modelId: 'imagen-3-fast',
    status: 'completed',
    qualityScore: 97,
    reviewStatus: 'approved',
    tokensUsed: 180,
    cost: 0.0041,
    dimensions: '1920 x 1080',
    aspectRatio: '16:9',
    createdAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    guardrailStatus: 'K-5 Safe',
    downloadUrl: '#',
    sampleColor: 'bg-amber-50 text-amber-700',
  },
  {
    id: 'gen_006',
    title: 'Spanish Kitchen Utensils Bilingual Flashcards',
    prompt: 'Spanish vocab flashcards with illustrated cutlery, pan, and stove with pronunciation phonetic keys.',
    category: 'flashcard',
    categoryLabel: 'Flashcards & Vocab',
    gradeLevel: 'Grade 6 (Middle School)',
    modelUsed: 'SDXL Turbo Education',
    modelId: 'sdxl-turbo',
    status: 'completed',
    qualityScore: 88,
    reviewStatus: 'pending',
    tokensUsed: 135,
    cost: 0.0028,
    dimensions: '1200 x 1800',
    aspectRatio: '2:3',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    guardrailStatus: 'Middle School Approved',
    downloadUrl: '#',
    sampleColor: 'bg-indigo-50 text-indigo-700',
  },
];

let mockRoutingRules = [
  {
    id: 'rule_1',
    name: 'Print Worksheet Vector Line-Art Optimizer',
    category: 'worksheet',
    targetModel: 'Imagen 3 Fast (Line-Art Pruned)',
    targetModelId: 'imagen-3-fast',
    priority: 1,
    active: true,
    condition: 'Prompt contains "coloring", "worksheet", or "outline"',
    maxCostCap: '$0.0040',
    latencyTarget: '< 3.2s',
  },
  {
    id: 'rule_2',
    name: 'High School STEM Diagram Specialist',
    category: 'illustration',
    targetModel: 'Gemini 3 Pro Vision Router',
    targetModelId: 'gemini-3-pro',
    priority: 2,
    active: true,
    condition: 'Grade >= 9 OR domain == "anatomy/physics"',
    maxCostCap: '$0.0080',
    latencyTarget: '< 4.5s',
  },
  {
    id: 'rule_3',
    name: 'Bilingual Flashcard Grid Batching',
    category: 'flashcard',
    targetModel: 'SDXL Turbo Education',
    targetModelId: 'sdxl-turbo',
    priority: 3,
    active: true,
    condition: 'Category == "flashcard" AND batchCount >= 4',
    maxCostCap: '$0.0030',
    latencyTarget: '< 2.1s',
  },
  {
    id: 'rule_4',
    name: 'Large Format Infographic Posters',
    category: 'poster',
    targetModel: 'Gemini 3 Pro Vision Router',
    targetModelId: 'gemini-3-pro',
    priority: 4,
    active: false,
    condition: 'Resolution == "1920x1080" OR aspect == "16:9"',
    maxCostCap: '$0.0065',
    latencyTarget: '< 3.8s',
  },
];

let mockModels = [
  {
    id: 'imagen-3-fast',
    name: 'Imagen 3 Fast',
    provider: 'Google DeepMind',
    specialty: 'High-contrast line art, colouring pages, vector diagrams',
    latency: '2.8s avg',
    costPerImage: '$0.0032',
    status: 'operational',
    rating: '99.4% K-12 Safe',
    supportedCategories: ['worksheet', 'poster'],
    contextWindow: '8k tokens',
  },
  {
    id: 'gemini-3-pro',
    name: 'Gemini 3 Pro Vision',
    provider: 'Google DeepMind',
    specialty: 'Complex curriculum science charts, multi-lingual vocab, STEM',
    latency: '3.6s avg',
    costPerImage: '$0.0058',
    status: 'operational',
    rating: '99.8% K-12 Safe',
    supportedCategories: ['illustration', 'poster', 'flashcard'],
    contextWindow: '32k tokens',
  },
  {
    id: 'sdxl-turbo',
    name: 'SDXL Turbo Education',
    provider: 'Stability AI / Edu Fine-tune',
    specialty: 'Rapid prototyping, classroom flashcards, icon sets',
    latency: '1.9s avg',
    costPerImage: '$0.0024',
    status: 'operational',
    rating: '98.9% K-12 Safe',
    supportedCategories: ['flashcard', 'worksheet'],
    contextWindow: '4k tokens',
  },
  {
    id: 'router-v2',
    name: 'EduGenAI Autonomous Router v2',
    provider: 'EduGenAI Engine',
    specialty: 'Real-time prompt token evaluation and least-cost model routing',
    latency: '0.15s overhead',
    costPerImage: 'Free (In-platform)',
    status: 'operational',
    rating: '100% Policy Aligned',
    supportedCategories: ['All Formats'],
    contextWindow: 'Real-time',
  },
];

export const generationService = {
  // Generation Studio Execution
  async generateVisual(params) {
    try {
      const response = await apiClient.post('/generation/create', params);
      return response.data;
    } catch (err) {
      console.warn('Backend /generation/create unavailable. Emulating via educational engine fallback.');
      // Simulate real-world 1.5s generation delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newGen = {
        id: 'gen_' + Date.now().toString(36),
        title: params.prompt.length > 40 ? params.prompt.substring(0, 40) + '...' : params.prompt,
        prompt: params.prompt,
        category: params.category || 'worksheet',
        categoryLabel:
          params.category === 'worksheet'
            ? 'Colouring Worksheet'
            : params.category === 'flashcard'
            ? 'Flashcards & Vocab'
            : params.category === 'poster'
            ? 'Educational Poster'
            : 'Learning Illustration',
        gradeLevel: params.gradeLevel || 'Grade 5 (Elementary)',
        modelUsed:
          params.modelMode === 'manual' && params.selectedModel
            ? params.selectedModel
            : 'Imagen 3 Fast (Smart Routed)',
        modelId: params.modelMode === 'manual' ? params.selectedModelId : 'imagen-3-fast',
        status: 'completed',
        qualityScore: 97,
        reviewStatus: 'approved',
        tokensUsed: Math.floor(Math.random() * 80) + 110,
        cost: 0.0034,
        dimensions: params.aspectRatio === '16:9' ? '1920 x 1080' : '2048 x 2048',
        aspectRatio: params.aspectRatio || '1:1',
        createdAt: new Date().toISOString(),
        guardrailStatus: 'K-5 Safe',
        downloadUrl: '#',
        sampleColor: 'bg-brand-tint text-brand',
      };

      mockGenerations.unshift(newGen);
      return { success: true, data: newGen };
    }
  },

  // Generation History
  async getHistory(filters = {}) {
    try {
      const response = await apiClient.get('/generation/history', { params: filters });
      return response.data;
    } catch (err) {
      let filtered = [...mockGenerations];
      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (g) => g.title.toLowerCase().includes(q) || g.prompt.toLowerCase().includes(q)
        );
      }
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((g) => g.category === filters.category);
      }
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((g) => g.reviewStatus === filters.status);
      }
      return { items: filtered, total: filtered.length };
    }
  },

  // Delete Generation Record
  async deleteGeneration(id) {
    try {
      await apiClient.delete(`/generation/${id}`);
    } catch (err) {
      mockGenerations = mockGenerations.filter((g) => g.id !== id);
    }
    return { success: true };
  },

  // Quality Review Items
  async getQualityReviews() {
    try {
      const response = await apiClient.get('/quality/reviews');
      return response.data;
    } catch (err) {
      const pending = mockGenerations.filter((g) => g.reviewStatus === 'pending');
      const approved = mockGenerations.filter((g) => g.reviewStatus === 'approved');
      return { pending, approved, total: mockGenerations.length };
    }
  },

  async updateReviewStatus(id, newStatus, feedback = '') {
    try {
      const response = await apiClient.patch(`/quality/reviews/${id}`, { status: newStatus, feedback });
      return response.data;
    } catch (err) {
      const item = mockGenerations.find((g) => g.id === id);
      if (item) {
        item.reviewStatus = newStatus;
        item.reviewFeedback = feedback;
      }
      return { success: true, item };
    }
  },

  // Routing Rules
  async getRoutingRules() {
    try {
      const response = await apiClient.get('/rules');
      return response.data;
    } catch (err) {
      return { rules: mockRoutingRules };
    }
  },

  async toggleRuleStatus(id, active) {
    try {
      const response = await apiClient.patch(`/rules/${id}`, { active });
      return response.data;
    } catch (err) {
      const rule = mockRoutingRules.find((r) => r.id === id);
      if (rule) rule.active = active;
      return { success: true, rule };
    }
  },

  async addRoutingRule(ruleData) {
    try {
      const response = await apiClient.post('/rules', ruleData);
      return response.data;
    } catch (err) {
      const newRule = {
        id: 'rule_' + Date.now(),
        ...ruleData,
        priority: mockRoutingRules.length + 1,
        active: true,
      };
      mockRoutingRules.push(newRule);
      return { success: true, rule: newRule };
    }
  },

  // Model Library
  async getModels() {
    try {
      const response = await apiClient.get('/models');
      return response.data;
    } catch (err) {
      return { models: mockModels };
    }
  },

  // Budget & Usage Statistics
  async getBudgetSummary() {
    try {
      const response = await apiClient.get('/budget/summary');
      return response.data;
    } catch (err) {
      return {
        totalAllocatedTokens: 50000,
        usedTokens: 14250,
        remainingTokens: 35750,
        projectedSavingsPercent: 38.4,
        totalCostUSD: 48.62,
        savingsUSD: 30.15,
        departments: [
          { name: 'Elementary Science & Math', allocated: 20000, used: 6420, teachers: 18 },
          { name: 'Middle School STEM', allocated: 18000, used: 5120, teachers: 14 },
          { name: 'High School Humanities & Arts', allocated: 12000, used: 2710, teachers: 9 },
        ],
      };
    }
  },

  // Cost Analytics Data
  async getAnalyticsData() {
    try {
      const response = await apiClient.get('/analytics');
      return response.data;
    } catch (err) {
      return {
        totalGenerations: 1248,
        averageCostPerImage: 0.0039,
        totalSpendUSD: 48.62,
        savingsPercent: 38.4,
        monthlyTrends: [
          { month: 'May', generations: 180, spend: 7.2, savings: 4.5 },
          { month: 'Jun', generations: 140, spend: 5.6, savings: 3.8 },
          { month: 'Jul', generations: 90, spend: 3.6, savings: 2.1 },
          { month: 'Aug', generations: 290, spend: 11.4, savings: 7.2 },
          { month: 'Sep', generations: 340, spend: 13.2, savings: 8.4 },
          { month: 'Oct', generations: 208, spend: 7.62, savings: 4.15 },
        ],
        modelDistribution: [
          { name: 'Imagen 3 Fast', percent: 54, cost: '$0.0032/img', count: 674 },
          { name: 'SDXL Turbo Education', percent: 28, cost: '$0.0024/img', count: 349 },
          { name: 'Gemini 3 Pro Vision', percent: 18, cost: '$0.0058/img', count: 225 },
        ],
        formatDistribution: [
          { format: 'Colouring Worksheets', count: 520, percent: 42 },
          { format: 'Educational Posters', count: 340, percent: 27 },
          { format: 'Flashcards & Vocab', count: 260, percent: 21 },
          { format: 'Learning Illustrations', count: 128, percent: 10 },
        ],
      };
    }
  },
};
