import { useState, useEffect, useRef } from 'react';
import type { Expert, KnowledgeFile } from '@/types';
import { getBailianApiKey, BAILIAN_MODELS } from '@/lib/ollama';
import { toast } from 'sonner';
import { ChevronLeft, Upload, X, FileText, Video, Presentation, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

const SPECIALTIES = ['胸外科', '心外科', '普外科', '神经外科', '骨科', '泌尿外科', '妇产科', '头颈外科'];
const AVATAR_EMOJIS = ['👨‍⚕️', '👩‍⚕️', '🧑‍⚕️', '👨‍🔬', '👩‍🔬', '🩺', '⚕️', '🔬'];
const AVATAR_COLORS = ['#1a6cf6', '#6c3fd6', '#00c9a7', '#f7b731', '#ff6b6b', '#ec4899', '#14b8a6', '#f97316'];

interface CreateExpertProps {
  editingExpert: Expert | null;
  onSave: (expert: Expert) => void;
  onCancel: () => void;
}

export default function CreateExpert({ editingExpert, onSave, onCancel }: CreateExpertProps) {
  const [step, setStep] = useState(1);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<Expert>>({
    name: '',
    title: '',
    hospital: '',
    specialty: '胸外科',
    avatar: '👨‍⚕️',
    avatarColor: '#1a6cf6',
    description: '',
    systemPrompt: '',
    ollamaModel: 'qwen-plus',
    knowledgeFiles: [],
    stats: { totalQuestions: 0, totalSessions: 0, avgResponseTime: 0, topTopics: [], weeklyQuestions: [0,0,0,0,0,0,0] },
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (editingExpert) setForm(editingExpert);
  }, [editingExpert]);

  useEffect(() => {
    const key = getBailianApiKey();
    setApiKeySet(!!key);
    if (!form.ollamaModel) {
      setForm(f => ({ ...f, ollamaModel: 'qwen-plus' }));
    }
  }, []);

  const set = (key: keyof Expert, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: KnowledgeFile[] = files.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.name.endsWith('.pdf') ? 'pdf' : f.name.match(/\.(mp4|mov|avi)$/) ? 'video' : f.name.match(/\.(ppt|pptx)$/) ? 'ppt' : 'text',
      size: formatSize(f.size),
      uploadedAt: new Date().toISOString().split('T')[0],
      content: '',
    }));
    set('knowledgeFiles', [...(form.knowledgeFiles || []), ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    set('knowledgeFiles', (form.knowledgeFiles || []).filter((f: KnowledgeFile) => f.id !== id));
  };

  const handleSubmit = () => {
    if (!form.name || !form.hospital) {
      toast.error('请填写专家姓名和所在医院');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const expert: Expert = { ...form as Expert, id: editingExpert?.id || `expert-${Date.now()}` };
      onSave(expert);
      toast.success(editingExpert ? '智能体已更新' : '专家智能体创建成功！');
      setLoading(false);
    }, 800);
  };

  const isEditing = !!editingExpert;
  const apiKeySetClass = apiKeySet ? 'bg-[hsl(var(--success))]' : 'bg-[hsl(var(--warning))]';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur flex items-center p-4 border-b border-border/50">
        <button onClick={onCancel} className="inline-flex items-center justify-center h-8 w-8 hover:bg-muted rounded-md transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center font-medium mr-8">{isEditing ? '编辑专家智能体' : '创建专家智能体'}</span>
      </div>

      {/* Steps */}
      <div className="px-5 py-4 border-b border-border/50">
        <div className="flex gap-6">
          {[{n:1,label:'基本信息'},{n:2,label:'知识库'},{n:3,label:'AI 配置'}].map(s => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 text-sm transition-all pb-2 border-b-2 ${
                step === s.n ? 'text-primary border-primary' : 'text-muted-foreground/40 border-transparent hover:text-muted-foreground'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                step === s.n ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              }`}>{s.n}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-6 max-w-2xl space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="text-muted-foreground mb-3 block text-xs font-medium">专家头像</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: (form.avatarColor || '#1a6cf6') + '20' }}
                  >
                    {form.avatar}
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {AVATAR_EMOJIS.map(e => (
                        <button key={e} onClick={() => set('avatar', e)}
                          className={`w-9 h-9 rounded-xl text-lg hover:bg-muted transition-all ${form.avatar === e ? 'bg-primary/15 ring-2 ring-primary' : ''}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map(c => (
                        <button key={c} onClick={() => set('avatarColor', c)}
                          className={`w-6 h-6 rounded-full transition-all ${form.avatarColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                          style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-medium">专家姓名 *</label>
                  <input placeholder="例：张建国" value={form.name} onChange={e => set('name', e.target.value)}
                    className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-medium">职称</label>
                  <input placeholder="例：主任医师 · 教授" value={form.title} onChange={e => set('title', e.target.value)}
                    className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-medium">所在医院 *</label>
                  <input placeholder="例：北京协和医院" value={form.hospital} onChange={e => set('hospital', e.target.value)}
                    className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl" />
                </div>
                <div>
                  <label className="text-muted-foreground mb-2 block text-xs font-medium">专科方向</label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTIES.map(s => (
                      <button
                        key={s}
                        onClick={() => set('specialty', s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          form.specialty === s
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium">专家简介</label>
                <textarea
                  placeholder="介绍专家的从业经历、擅长领域、学术成就等..."
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                  className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none rounded-xl"
                />
              </div>

              <button onClick={() => setStep(2)} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 h-12 rounded-xl font-bold text-sm gradient-medical shadow-lg shadow-primary/20">
                下一步：上传知识库
              </button>
            </div>
          )}

          {/* Step 2: Knowledge Files */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm">
                <div className="font-semibold mb-1 text-foreground">💡 知识库说明</div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  上传专家的手术视频（带解说）、讲课录像、PDF 文献、PPT 课件。
                  AI 将从这些内容中检索信息来回答学员问题，并标注引用来源。
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
              >
                <Upload size={32} className="text-muted-foreground/40 mx-auto mb-3" />
                <div className="font-medium text-muted-foreground mb-1">点击上传知识库文件</div>
                <div className="text-xs text-muted-foreground/60">支持 MP4、PDF、PPT、TXT · 可多选</div>
              </div>
              <input ref={fileInputRef} type="file" multiple accept=".pdf,.mp4,.mov,.ppt,.pptx,.txt" className="hidden" onChange={handleAddFile} />

              {(form.knowledgeFiles || []).length > 0 && (
                <div className="space-y-2">
                  {(form.knowledgeFiles as KnowledgeFile[]).map(file => (
                    <div key={file.id} className="flex items-center gap-3 bg-background rounded-xl px-4 py-3 border border-border/50">
                      <FileTypeIcon type={file.type} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">{file.size} · {file.uploadedAt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs px-2 py-0.5 rounded bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] flex items-center gap-1">
                          <CheckCircle2 size={12} /> 已上传
                        </div>
                        <button onClick={() => handleRemoveFile(file.id)} className="p-1 hover:bg-destructive/10 rounded-lg transition-all">
                          <X size={14} className="text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(form.knowledgeFiles || []).length === 0 && (
                <p className="text-center text-muted-foreground/60 text-sm py-4">暂未添加文件，可跳过直接使用专家简介进行问答</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-input bg-transparent hover:bg-muted px-4 py-3 rounded-xl font-medium text-sm">上一步</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-xl font-medium text-sm">下一步：AI 配置</button>
              </div>
            </div>
          )}

          {/* Step 3: AI Config */}
          {step === 3 && (
            <div className="space-y-6">
              {!apiKeySet && (
                <div className="bg-[hsl(var(--warning))]/5 border border-[hsl(var(--warning))]/20 rounded-xl p-4">
                  <div className="font-semibold text-[hsl(var(--warning))] text-sm mb-1">⚠️ 未配置 API Key</div>
                  <div className="text-xs text-muted-foreground">
                    请前往「系统设置」填写阿里云百炼 API Key，否则无法进行真实 AI 对话。
                  </div>
                </div>
              )}

              <div>
                <label className="text-muted-foreground mb-2 block text-xs font-medium">选择对话模型</label>
                <div className="space-y-2">
                  {BAILIAN_MODELS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => set('ollamaModel', m.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                        form.ollamaModel === m.value
                          ? 'bg-primary/10 border-primary/30 text-foreground'
                          : 'bg-background border-border/50 text-muted-foreground hover:border-border'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        form.ollamaModel === m.value ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                        {form.ollamaModel === m.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{m.label}</div>
                        <div className="text-xs text-muted-foreground">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-muted-foreground text-xs font-medium">补充指令（可选）</label>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Sparkles size={12} /> 个性化调整</span>
                </div>
                <textarea
                  placeholder="例：回答时优先引用视频资料，每次回答结尾附上3个相关进一步学习的问题建议..."
                  value={form.systemPrompt}
                  onChange={e => set('systemPrompt', e.target.value)}
                  rows={3}
                  className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none rounded-xl"
                />
              </div>

              {/* Preview */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">配置预览</div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: (form.avatarColor || '#1a6cf6') + '20' }}>
                    {form.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{form.name || '专家姓名'}</div>
                    <div className="text-sm text-muted-foreground">{form.title} · {form.hospital}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {form.specialty} · {(form.knowledgeFiles || []).length} 个知识文件 · {BAILIAN_MODELS.find(m => m.value === form.ollamaModel)?.label || form.ollamaModel}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 border border-input bg-transparent hover:bg-muted px-4 py-3 rounded-xl font-medium text-sm">上一步</button>
                <button onClick={handleSubmit} disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-xl font-bold text-sm gradient-medical shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <><Loader2 size={16} className="animate-spin" /> 创建中...</> : <><CheckCircle2 size={16} /> {isEditing ? '保存更新' : '完成创建'}</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* API Key status indicator */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background shadow-md border border-border/50 text-xs z-40">
        <div className={`w-2 h-2 rounded-full ${apiKeySetClass} ${apiKeySet ? 'animate-pulse' : ''}`} />
        <span className={apiKeySet ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--warning))]'}>
          {apiKeySet ? '百炼 API 已配置' : '未配置 API Key'}
        </span>
      </div>
    </div>
  );
}

function FileTypeIcon({ type }: { type: KnowledgeFile['type'] }) {
  if (type === 'video') return <Video size={20} className="text-purple-500 flex-shrink-0" />;
  if (type === 'ppt') return <Presentation size={20} className="text-orange-500 flex-shrink-0" />;
  return <FileText size={20} className="text-blue-500 flex-shrink-0" />;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / 1024 / 1024).toFixed(1) + 'MB';
}
