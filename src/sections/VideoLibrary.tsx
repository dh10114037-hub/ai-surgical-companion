import { useState } from 'react';
import { Search, Play, CheckCircle, Eye, Bookmark, Grid, List } from 'lucide-react';
import { Video, Sparkles, Users } from 'lucide-react';
import { mockVideos, mockVideoStats, type Video } from '@/types/video';

interface VideoLibraryProps {
  onSelectVideo: (video: Video) => void;
}

export default function VideoLibrary({ onSelectVideo }: VideoLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredVideos = mockVideos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}k`;
    }
    return views.toString();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <section className="py-6 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
          手术视频中心
        </h1>
        <p className="text-sm text-muted-foreground mb-4">
          支持AI智能解析与精准导航，助力临床技能提升。
        </p>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <Video className="w-5 h-5 text-primary mb-1" />
            <span className="text-lg font-bold">{mockVideoStats.totalVideos}</span>
            <span className="text-[10px] text-muted-foreground">视频</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <Sparkles className="w-5 h-5 text-accent mb-1" />
            <span className="text-lg font-bold">{mockVideoStats.analyzedCount}</span>
            <span className="text-[10px] text-muted-foreground">已解析</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-card border border-border/50 shadow-sm">
            <Users className="w-5 h-5 text-success mb-1" />
            <span className="text-lg font-bold">{mockVideoStats.expertCount}</span>
            <span className="text-[10px] text-muted-foreground">专家</span>
          </div>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="border-y border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-4 py-4">
        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索术式、专家..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs whitespace-nowrap">
            排序
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border bg-background rounded-full text-xs whitespace-nowrap">
            术式
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border bg-background rounded-full text-xs whitespace-nowrap">
            专家
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 border border-border bg-background rounded-full text-xs whitespace-nowrap">
            AI状态
            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Video List Section */}
      <section className="py-6 px-4">
        {/* Results Header */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            共 <span className="font-semibold text-foreground">{filteredVideos.length}</span> 个视频
          </p>
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-5">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="rounded-lg border border-none shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col bg-card overflow-hidden"
              >
                {/* Cover */}
                <div className="relative overflow-hidden bg-muted aspect-video">
                  <img
                    src={video.coverUrl}
                    alt={video.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* AI Badge */}
                  {video.isAnalyzed && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-success/90 text-white">
                      <CheckCircle className="w-3.5 h-3.5" />
                      AI已解析
                    </div>
                  )}
                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 text-xs font-medium bg-black/70 text-white rounded">
                    {video.duration}
                  </div>
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2 mb-3">
                    {video.title}
                  </h3>
                  
                  {/* Expert Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-medium">
                        {video.expert.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {video.expert.name} {video.expert.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {video.expert.department}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 mb-3">
                    {video.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex gap-1 items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 w-fit text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{formatViews(video.views)} 次观看</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center p-4 pt-0 border-t border-border">
                  <button className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground rounded-md text-sm">
                    <Bookmark className="w-4 h-4" />
                    收藏
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredVideos.map(video => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="flex gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
              >
                <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={video.coverUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {video.isAnalyzed && (
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-success/90 text-white">
                      <CheckCircle className="w-2.5 h-2.5" />
                      AI
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 px-1 py-0.5 text-[10px] font-medium bg-black/70 text-white rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">
                    {video.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    {video.expert.name} {video.expert.title} · {video.expert.department}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(video.views)} 次观看</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}