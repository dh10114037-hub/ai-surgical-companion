import type { Expert, Message, Source } from '@/types';

// OllamaModel type kept for compatibility
export interface OllamaModel {
  name: string;
}

// ---- Bailian (DashScope) config ----
const BAILIAN_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// Available models on Alibaba Cloud Bailian
export const BAILIAN_MODELS = [
  { value: 'qwen-plus', label: 'Qwen Plus（推荐）', desc: '综合能力强，适合医学问答' },
  { value: 'qwen-turbo', label: 'Qwen Turbo（快速）', desc: '响应速度快，适合演示' },
  { value: 'qwen-max', label: 'Qwen Max（最强）', desc: '最强推理能力，复杂病例分析' },
  { value: 'qwen-long', label: 'Qwen Long（长文）', desc: '超长上下文，适合文献解读' },
];

// Local storage key for API key
const API_KEY_STORAGE_KEY = 'bailian_api_key';
const DEFAULT_API_KEY = 'sk-82cd03d1eaff4791bbe7201b9c7f4086';

export function getBailianApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || DEFAULT_API_KEY;
}

export function setBailianApiKey(key: string) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export async function testBailianConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BAILIAN_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 5,
        stream: false,
      }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json();
    return { ok: false, error: data?.error?.message || `HTTP ${res.status}` };
  } catch (e: any) {
    return { ok: false, error: e.message || '网络连接失败' };
  }
}

// Compatibility shim: still exported so Settings.tsx doesn't break
export async function getOllamaModels(): Promise<OllamaModel[]> {
  return [];
}

export async function* streamOllamaChat(
  model: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): AsyncGenerator<string> {
  const apiKey = getBailianApiKey();
  if (!apiKey) throw new Error('未配置 API Key，请前往"系统设置"填写阿里云百炼 API Key');

  const res = await fetch(`${BAILIAN_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'qwen-plus',
      messages,
      stream: true,
    }),
    signal,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errMsg = (errData as any)?.error?.message || `请求失败 (HTTP ${res.status})`;
    throw new Error(errMsg);
  }
  if (!res.body) throw new Error('无响应体');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch { /* ignore parse errors */ }
    }
  }
}

// Build expert system prompt with knowledge context
export function buildSystemPrompt(expert: Expert, _userQuery: string): string {
  const knowledgeSummary = expert.knowledgeFiles.length > 0
    ? `\n\n你的知识库包含以下资料：\n${expert.knowledgeFiles.map(f =>
        `- ${f.name}（${f.type.toUpperCase()}）${f.content ? `\n  内容摘要：${f.content.slice(0, 200)}...` : ''}`
      ).join('\n')}`
    : '';

  return `你是${expert.name}教授的AI智能体，是一位资深${expert.specialty}专家，现任职于${expert.hospital}。
职称：${expert.title}

你的角色定位：
- 以${expert.name}教授的专业视角和风格回答学员问题
- 优先引用知识库中的内容给出答案
- 每个重要结论都要标注来源（视频时间轴/文献章节）
- 回答要专业、简洁、实用，适合临床医生使用
- 遇到超出知识库范围的问题，诚实说明并给出通用建议

专家简介：${expert.description}
${knowledgeSummary}

${expert.systemPrompt ? `\n额外指令：${expert.systemPrompt}` : ''}

注意：仅供医学学习参考，不构成诊疗建议。`;
}

// Simulate source extraction from knowledge files
export function extractSources(expert: Expert, query: string): Source[] {
  if (expert.knowledgeFiles.length === 0) return [];

  const keywords = query.split(/[\s，。、？！]/);
  const matched = expert.knowledgeFiles
    .filter(f => keywords.some(k => k.length > 1 && f.name.includes(k) || (f.content && f.content.includes(k))))
    .slice(0, 2);

  return matched.map(f => ({
    title: f.name,
    excerpt: f.content ? f.content.slice(0, 80) + '...' : `来自 ${f.name} 的相关内容`,
    type: f.type === 'video' ? 'video' : 'pdf',
    timestamp: f.type === 'video' ? '12:34' : undefined,
    page: f.type === 'pdf' ? Math.floor(Math.random() * 20) + 1 : undefined,
  }));
}

// Local storage helpers
export function saveExperts(experts: Expert[]) {
  localStorage.setItem('surgical_ai_experts', JSON.stringify(experts));
}

export function loadExperts(): Expert[] {
  try {
    const data = localStorage.getItem('surgical_ai_experts');
    return data ? JSON.parse(data) : getDefaultExperts();
  } catch {
    return getDefaultExperts();
  }
}

export function saveMessages(expertId: string, messages: Message[]) {
  localStorage.setItem(`chat_${expertId}`, JSON.stringify(messages));
}

export function loadMessages(expertId: string): Message[] {
  try {
    const data = localStorage.getItem(`chat_${expertId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function getDefaultExperts(): Expert[] {
  return [
    {
      id: 'expert-1',
      name: '王锡山',
      title: '主任医师 · 教授',
      hospital: '国家癌症中心',
      specialty: '普外科',
      avatar: '👨‍⚕️',
      avatarColor: '#E53E3E',
      description: '国家癌症中心/国家肿瘤临床医学研究中心/中国医学科学院北京协和医院肿瘤医院结直肠外科主任医师、教授。中国医师协会结直肠肿瘤专业委员会主任委员，在结直肠癌腹膜转移诊治领域具有深厚造诣。',
      systemPrompt: `你是王锡山教授的AI智能体，专注于结直肠癌腹膜转移的诊治。回答问题时请遵循以下规则：

1、回答的范围仅能从知识库中进行回答，不得超出；
2、如果用户的提问超出了知识库的内容范畴，直接给出回答"提问内容超出当前专家领域，请更换专家进行重新提问"；
3、回答的内容中需要注明具体引用的文献，以[1]这样的格式进行展示；
4、回答的结尾附上当前回答具体参考的文献，展示格式为：[{序号}]{文献名称}。其中的{序号}即为对应的引用序值
5、回答结尾附上的参考文献，只需显示"参考文献名称"，不用包含其他信息（如章节、页码、段落等）。

知识库内容：
《结直肠癌腹膜转移诊治专家共识（2025版）》- 中国医师协会结直肠肿瘤专业委员会`,
      ollamaModel: 'qwen-plus',
      knowledgeFiles: [
        { 
          id: 'k1', 
          name: '结直肠癌腹膜转移诊治专家共识（2025版）.pdf', 
          type: 'pdf', 
          size: '4.7MB', 
          uploadedAt: '2026-03-25', 
          content: '结直肠癌是我国常见的恶性肿瘤之一，发病率和死亡率分别位居全部恶性肿瘤的第2位和第4位。腹膜是结直肠癌常见的转移部位，仅次于肝转移和肺转移，但其预后远差于肝转移和肺转移。结直肠癌腹膜转移是指结直肠癌原发灶的癌细胞直接脱落和（或）经血管、淋巴管脱落种植于腹膜形成新病灶。有7%~15%的结直肠癌初诊时即伴有腹膜转移，4%~19%的患者在根治术后发生腹膜转移。结直肠癌腹膜转移患者预后差，确诊后如果得不到积极治疗，其中位总生存时间仅为6~9个月。' 
        },
      ],
      stats: {
        totalQuestions: 129,
        totalSessions: 47,
        avgResponseTime: 2.1,
        topTopics: ['腹膜转移', '结直肠癌', 'CRS+HIPEC', '分子分型', '免疫治疗'],
        weeklyQuestions: [15, 22, 18, 25, 21, 28, 19],
      },
      createdAt: '2026-03-25',
    },
  ];
}
