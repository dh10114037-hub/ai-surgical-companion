import { useState } from 'react';
import { 
  ChevronLeft, Play, Volume2, Settings, Maximize, 
  Sparkles, Copy, Share2, Download, FileText, MessageSquare, Users,
  ChevronRight, ChevronUp, ChevronDown, BookMarked, CircleCheck
} from 'lucide-react';
import type { Video, VideoKeyNode, Citation } from '@/types/video';
import { mockKeyNodes, mockCitations } from '@/types/video';

interface VideoDetailProps {
  video: Video;
  onBack: () => void;
}

type TabType = 'summary' | 'transcript' | 'discussion';

export default function VideoDetail({ video, onBack }: VideoDetailProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [isPlaying, setIsPlaying] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview', 'techniques']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatViews = (views: number) => views.toLocaleString();

  return (
    <div className="flex-1 flex flex-col pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold truncate">视频AI解析</h2>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <button onClick={onBack} className="flex items-center gap-1 hover:text-foreground">
            <Play className="w-3.5 h-3.5" />
            视频库
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1 text-foreground">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            AI解析
          </span>
        </nav>
      </div>

      <div className="flex-1 px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Video Player Section */}
          <div className="space-y-4">
            {/* Video Player */}
            <div className="space-y-4">
              <div className="w-full aspect-video bg-black rounded-lg relative overflow-hidden group">
                <img 
                  src={video.coverUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {/* Play Button Overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors cursor-pointer"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <button className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </button>
                </div>
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full bg-primary w-1/3"></div>
                    </div>
                    <div className="flex justify-between text-xs text-white/70 mt-1">
                      <span>00:00</span>
                      <span>00:00 / {video.duration}</span>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-white hover:bg-white/20 rounded-full">
                        <Play className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-2 group/volume">
                        <button className="p-2 text-white hover:bg-white/20 rounded-full">
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                      <span className="text-sm text-white/70 ml-2">00:00 / {video.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-white hover:bg-white/20 rounded-full">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-white hover:bg-white/20 rounded-full">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Nodes */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">关键操作节点</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mockKeyNodes.map(node => (
                    <button
                      key={node.id}
                      className="p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-primary flex-shrink-0 mt-0.5">{node.time}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{node.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{node.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Video Metadata Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 space-y-4">
                {/* Title */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl font-bold text-foreground leading-tight">{video.title}</h1>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground gap-1 flex-shrink-0">
                    <Sparkles className="w-3 h-3" />
                    AI已解析
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">讲师</p>
                    <p className="text-sm font-semibold text-foreground">{video.expert.name} {video.expert.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">科室</p>
                    <p className="text-sm font-semibold text-foreground">{video.expert.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">术式</p>
                    <p className="text-sm font-semibold text-foreground">{video.tags[0]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">时长</p>
                    <p className="text-sm font-semibold text-foreground">{video.duration}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-primary">{formatViews(video.views)}</div>
                    <p className="text-xs text-muted-foreground mt-1">次观看</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-accent">{mockKeyNodes.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">关键节点</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <div className="text-lg font-bold text-success">{video.analyzeTime}</div>
                    <p className="text-xs text-muted-foreground mt-1">发布日期</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                    <BookMarked className="w-4 h-4" />
                    收藏
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                    <Share2 className="w-4 h-4" />
                    分享
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                    <Download className="w-4 h-4" />
                    下载
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
              <div className="flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-3">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                    activeTab === 'summary' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'hover:text-foreground'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  AI摘要
                </button>
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                    activeTab === 'transcript' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  解说提词
                </button>
                <button
                  onClick={() => setActiveTab('discussion')}
                  className={`inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                    activeTab === 'discussion' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'hover:text-foreground'
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  讨论
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'summary' && (
                <div className="space-y-4 mt-6">
                  {/* AI Analysis Card */}
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20">
                      <Sparkles className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">AI智能解析</h3>
                      <p className="text-sm text-muted-foreground">基于医学知识图谱的自动提纯总结</p>
                    </div>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground gap-1">
                      <CircleCheck className="w-3 h-3" />
                      已验证
                    </span>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-3">
                    {/* 手术概述 */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => toggleSection('overview')}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                      >
                        <h4 className="font-semibold text-foreground">手术概述</h4>
                        {expandedSections.includes('overview') ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      {expandedSections.includes('overview') && (
                        <div className="px-4 pb-4 border-t border-border bg-muted/20 space-y-3">
                          <p className="text-sm text-foreground leading-relaxed">
                            本视频详细演示了单孔胸腔镜下左肺上叶切除术。该术式具有创伤小、恢复快的优点，是现代胸外科的标准术式。
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                              <Copy className="w-4 h-4" />
                              复制
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                              <Share2 className="w-4 h-4" />
                              分享
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 关键技术要点 */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <button 
                        onClick={() => toggleSection('techniques')}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                      >
                        <h4 className="font-semibold text-foreground">关键技术要点</h4>
                        {expandedSections.includes('techniques') ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      {expandedSections.includes('techniques') && (
                        <div className="px-4 pb-4 border-t border-border bg-muted/20 space-y-3">
                          <p className="text-sm text-foreground leading-relaxed">
                            重点包括：(1) 支气管血管的处理顺序 - 先处理肺动脉，再处理支气管，最后处理肺静脉；(2) 淋巴结清扫的彻底性 - 第7组、10组、11组淋巴结的完整清扫；(3) 胸膜翻转技巧 - 充分暴露肺门结构。
                          </p>
                          <div className="flex gap-2 pt-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                              <Copy className="w-4 h-4" />
                              复制
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                              <Share2 className="w-4 h-4" />
                              分享
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Export Buttons */}
                  <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-3">
                    <h4 className="font-semibold text-foreground text-sm">导出摘要</h4>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                        <Download className="w-4 h-4" />
                        导出PDF
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                        <FileText className="w-4 h-4" />
                        导出JSON
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Citation References */}
            <div className="rounded-lg border bg-card shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-2">
                  <BookMarked className="w-5 h-5" />
                  引用来源
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{mockCitations.length} 个参考资料</p>

                <div className="space-y-3">
                  {mockCitations.map(citation => (
                    <div 
                      key={citation.id}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          citation.type === 'GUIDELINE' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {citation.type === 'GUIDELINE' ? (
                            <Play className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {citation.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{citation.authors}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex gap-1 items-center rounded-full px-2.5 py-0.5 text-xs bg-secondary text-secondary-foreground">
                          {citation.type === 'GUIDELINE' ? '临床指南' : '学术文献'}
                        </span>
                        <span className="text-xs text-muted-foreground">{citation.year}</span>
                        <span className="text-xs text-muted-foreground">{citation.journal}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">总引用数</span>
                    <span className="font-semibold text-foreground">{mockCitations.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">溯源完整度</span>
                    <span className="font-semibold text-success">100%</span>
                  </div>
                </div>

                <button className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-4 border border-input bg-transparent hover:bg-accent rounded-md text-sm">
                  <Download className="w-4 h-4" />
                  导出参考文献
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}