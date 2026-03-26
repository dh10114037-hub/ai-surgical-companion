import type { Expert } from '@/types';
import { useState } from 'react';
import { Plus, Users, Search, Sparkles, ChevronRight } from 'lucide-react';

interface ExpertListProps {
  experts: Expert[];
  onSelect: (e: Expert) => void;
  onCreateNew: () => void;
}

const FILTER_CATEGORIES = ['全部科室', '胸外科', '普通外科', '心脏外科', '血管外科', '神经外科'];

export default function ExpertList({ experts, onSelect, onCreateNew }: ExpertListProps) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('全部科室');

  const filteredExperts = experts.filter(e => {
    const matchSearch = !searchText ||
      e.name.includes(searchText) ||
      e.specialty.includes(searchText) ||
      e.hospital.includes(searchText);
    const matchFilter = activeFilter === '全部科室' || e.specialty === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 h-14 bg-background/80 backdrop-blur border-b flex items-center justify-between px-4 shrink-0">
        <h1 className="text-lg font-bold">专家智能体广场</h1>
        <div className="flex items-center gap-1">
          <button className="p-2" onClick={onCreateNew}>
            <Plus size={20} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 px-5 bg-gradient-to-br from-primary/10 via-accent/5 to-background overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles size={14} className="text-accent" />
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">AI Expert Agents</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground leading-tight tracking-tight">
              连接顶尖外科专家<br />
              <span className="text-primary tracking-normal">7×24h 智能咨询</span>
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              基于专家视频与文献构建的AI，为您的临床疑惑提供可溯源的专业解答。
            </p>
          </div>
          <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20">
            <div className="flex flex-col items-center flex-1 border-r border-border/50">
              <div className="text-lg font-black text-primary leading-none">{experts.length}+</div>
              <div className="text-[10px] text-muted-foreground mt-1 text-center">专家智能体</div>
            </div>
            <div className="flex flex-col items-center flex-1 border-r border-border/50">
              <div className="text-lg font-black text-accent leading-none">{experts.reduce((s, e) => s + e.knowledgeFiles.length, 0)}+</div>
              <div className="text-[10px] text-muted-foreground mt-1 text-center">教学资源</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-lg font-black text-[hsl(var(--success))] leading-none">4.9</div>
              <div className="text-[10px] text-muted-foreground mt-1 text-center">均分</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm">
        <section className="border-b border-border bg-background">
          <div className="px-5 py-4 space-y-4">
            {/* Search */}
            <div className="relative group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="flex w-full border border-input px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-9 h-11 bg-muted/50 border-none rounded-xl text-sm placeholder:text-muted-foreground/60"
                placeholder="搜索专家、科室或术式..."
              />
            </div>
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 py-0.5">
              {FILTER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                    activeFilter === cat
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Expert List */}
      <section className="py-6 px-5 bg-background min-h-[50vh]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground">全部专家智能体</h2>
          <span className="text-xs text-muted-foreground">
            共 <span className="font-bold text-primary">{filteredExperts.length}</span> 位
          </span>
        </div>

        {filteredExperts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users size={28} className="text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold mb-2">还没有专家智能体</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              创建第一个专家智能体，导入手术视频和文献，开始 7×24 小时智能问答
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20"
            >
              创建第一个智能体
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredExperts.map(expert => (
              <ExpertCard key={expert.id} expert={expert} onSelect={onSelect} />
            ))}
          </div>
        )}

        {filteredExperts.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground/60 italic">已经看到底了哦 ~</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ExpertCard({ expert, onSelect }: { expert: Expert; onSelect: (e: Expert) => void }) {
  return (
    <button
      onClick={() => onSelect(expert)}
      className="w-full text-left p-4 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors active:scale-[0.98]"
    >
      <div className="flex gap-4">
        <div className="relative shrink-0">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl ring-2 ring-primary/10 shadow-sm"
            style={{ background: expert.avatarColor + '20' }}
          >
            {expert.avatar}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background bg-[hsl(var(--success))]" />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground truncate">{expert.name}</h3>
            <div className="flex items-center text-[10px] text-[hsl(var(--warning))] bg-[hsl(var(--warning))]/5 px-1.5 py-0.5 rounded">
              ★ 4.9
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground truncate mb-2">
            {expert.title} | {expert.hospital}
          </p>
          <div className="flex flex-wrap gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{expert.specialty}</span>
            {expert.knowledgeFiles.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {expert.knowledgeFiles.length}个知识文件
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs font-bold">{expert.knowledgeFiles.length}</div>
            <div className="text-[9px] text-muted-foreground">资源</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold">{expert.stats.totalQuestions}</div>
            <div className="text-[9px] text-muted-foreground">咨询</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground/30" />
      </div>
    </button>
  );
}
