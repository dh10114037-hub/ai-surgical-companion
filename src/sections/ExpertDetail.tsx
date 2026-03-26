import type { Expert } from '@/types';
import { ChevronLeft, Star, Video, FileText, MessageCircle, Zap, Trash2, Pencil } from 'lucide-react';

interface ExpertDetailProps {
  expert: Expert;
  onBack: () => void;
  onStartChat: (e: Expert) => void;
  onEdit: (e: Expert) => void;
  onDelete: (id: string) => void;
}

export default function ExpertDetail({ expert, onBack, onStartChat, onEdit, onDelete }: ExpertDetailProps) {
  const handleDelete = () => {
    if (confirm(`确认删除"${expert.name}"智能体？`)) {
      onDelete(expert.id);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[calc(100vh)] bg-background relative shadow-xl overflow-x-hidden pb-48 border-x border-border">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur flex items-center p-4 border-b border-border/50">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center h-8 w-8 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center font-medium mr-8">专家详情</span>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <div className="relative mb-4">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl ring-2 ring-primary/10"
                style={{ background: expert.avatarColor + '20' }}
              >
                {expert.avatar}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[hsl(var(--success))]/20 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--success))]" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{expert.name}</h1>
            <p className="text-sm text-primary font-medium mb-1">{expert.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {expert.hospital} · {expert.specialty}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 px-4 py-2 bg-[hsl(var(--success))]/5 rounded-full border border-[hsl(var(--success))]/10 mb-8">
            <div className="flex items-center">
              <Star size={14} className="text-[hsl(var(--warning))] fill-[hsl(var(--warning))]" />
              <span className="text-xs font-bold ml-1">4.9</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <span className="text-[10px] text-muted-foreground">专家满意度评分</span>
          </div>

          {/* Info Sections */}
          <div className="w-full space-y-6">
            {/* Background */}
            {expert.description && (
              <div>
                <h2 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-1 h-4 bg-accent rounded-full" />
                  医学背景
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed px-1">
                  {expert.description}
                </p>
              </div>
            )}

            {/* Specialty Tags */}
            <div>
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full" />
                专业方向
              </h2>
              <div className="flex flex-wrap gap-2 px-1">
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 border-transparent bg-secondary text-secondary-foreground text-[11px]">
                  {expert.specialty}
                </span>
                {expert.knowledgeFiles.map(f => (
                  <span key={f.id} className="inline-flex items-center rounded-full border px-2.5 py-0.5 border-transparent bg-secondary text-secondary-foreground text-[11px]">
                    {f.type === 'video' ? '手术视频' : f.type === 'pdf' ? '学术文献' : f.type === 'ppt' ? '课件资料' : '其他资料'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-3 gap-2 bg-muted/30 rounded-xl p-4">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground mb-1">知识文件</span>
            <span className="text-lg font-bold text-foreground leading-none">{expert.knowledgeFiles.length}</span>
            <div className="mt-2 text-muted-foreground/40">
              <FileText size={14} />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground mb-1">对话轮次</span>
            <span className="text-lg font-bold text-foreground leading-none">{expert.stats.totalSessions}</span>
            <div className="mt-2 text-muted-foreground/40">
              <MessageCircle size={14} />
            </div>
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-muted-foreground mb-1">累计提问</span>
            <span className="text-lg font-bold text-foreground leading-none">{expert.stats.totalQuestions}</span>
            <div className="mt-2 text-muted-foreground/40">
              <Video size={14} />
            </div>
          </div>
        </div>

        {/* Knowledge Base Preview */}
        {expert.knowledgeFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full" />
                知识库资源
              </h2>
              <span className="text-xs text-muted-foreground">
                全部 ({expert.knowledgeFiles.length})
              </span>
            </div>
            <div className="divide-y divide-border/50 border-t border-b border-border/50">
              {expert.knowledgeFiles.map(file => (
                <div key={file.id} className="flex items-start gap-3 py-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded bg-muted/60 flex-shrink-0 mt-0.5">
                    {file.type === 'video' ? (
                      <Video size={18} className="text-muted-foreground" />
                    ) : (
                      <FileText size={18} className="text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-1">{file.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        file.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      }`}>
                        {file.type === 'video' ? '手术视频' : file.type === 'pdf' ? 'PDF文献' : file.type === 'ppt' ? 'PPT课件' : '文件'}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{file.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit/Delete Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onEdit(expert)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <Pencil size={16} /> 编辑智能体
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-destructive/20 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
          >
            <Trash2 size={16} /> 删除
          </button>
        </div>
      </div>

      {/* Bottom CTA - 考虑到底部Tab导航栏高度(64px) */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-md p-4 border-t border-border shadow-[0_-8px_30px_rgb(0,0,0,0.06)] z-50">
        <div className="mb-2">
          <button
            onClick={() => onStartChat(expert)}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 w-full h-12 rounded-xl gradient-medical shadow-lg shadow-primary/20 font-bold text-sm"
          >
            <Zap size={18} className="fill-current" /> 立即提问
          </button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground">
          基于专家私域知识库 · AI即时响应 · 100%可溯源
        </p>
      </div>
    </div>
  );
}
