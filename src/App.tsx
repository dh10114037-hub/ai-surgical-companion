import { useState, useEffect } from 'react';
import type { Expert, Video } from '@/types';
import { loadExperts, saveExperts } from '@/lib/ollama';
import ExpertList from '@/sections/ExpertList';
import ExpertDetail from '@/sections/ExpertDetail';
import CreateExpert from '@/sections/CreateExpert';
import ChatRoom from '@/sections/ChatRoom';
import Settings from '@/sections/Settings';
import VideoLibrary from '@/sections/VideoLibrary';
import VideoDetail from '@/sections/VideoDetail';
import { Video, Users, Search, User } from 'lucide-react';

export type View = 'list' | 'detail' | 'create' | 'chat' | 'settings' | 'video-library' | 'video-detail';

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  view?: View;
}

const TABS: TabItem[] = [
  { id: 'video', label: '视频中心', icon: <Video size={20} /> },
  { id: 'expert', label: '专家咨询', icon: <Users size={20} />, view: 'list' },
  { id: 'search', label: '智库搜索', icon: <Search size={20} /> },
  { id: 'profile', label: '我的学习', icon: <User size={20} /> },
];

export default function App() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [activeView, setActiveView] = useState<View>('list');
  const [activeTab, setActiveTab] = useState('expert');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    setExperts(loadExperts());
  }, []);

  const handleSaveExperts = (updated: Expert[]) => {
    setExperts(updated);
    saveExperts(updated);
  };

  const handleCreateExpert = (expert: Expert) => {
    const updated = [...experts, expert];
    handleSaveExperts(updated);
    setSelectedExpert(expert);
    setActiveView('chat');
  };

  const handleUpdateExpert = (expert: Expert) => {
    const updated = experts.map(e => e.id === expert.id ? expert : e);
    handleSaveExperts(updated);
    setSelectedExpert(expert);
    setEditingExpert(null);
    if (activeView === 'create') setActiveView('detail');
  };

  const handleDeleteExpert = (id: string) => {
    const updated = experts.filter(e => e.id !== id);
    handleSaveExperts(updated);
    if (selectedExpert?.id === id) {
      setSelectedExpert(null);
      setActiveView('list');
    }
  };

  const handleSelectExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setActiveView('detail');
  };

  const handleStartChat = (expert: Expert) => {
    setSelectedExpert(expert);
    setActiveView('chat');
  };

  const handleTabClick = (tab: TabItem) => {
    setActiveTab(tab.id);
    if (tab.id === 'expert') {
      setActiveView('list');
      setSelectedExpert(null);
    } else if (tab.id === 'video') {
      setActiveView('video-library');
      setSelectedVideo(null);
    }
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setActiveView('video-detail');
  };

  const handleBack = () => {
    if (activeView === 'video-detail') {
      setActiveView('video-library');
      setSelectedVideo(null);
    } else if (activeView === 'chat') {
      setActiveView('detail');
    } else if (activeView === 'detail') {
      setActiveView('list');
      setSelectedExpert(null);
    } else if (activeView === 'create') {
      setActiveView(editingExpert ? 'detail' : 'list');
      setEditingExpert(null);
    } else if (activeView === 'settings') {
      setActiveView('list');
    }
  };

  // Hide bottom nav when in chat/create/settings/views views
  const showBottomNav = activeView === 'list' || activeView === 'detail' || activeView === 'settings' || activeView === 'video-library';

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* H5 Container */}
      <div className="max-w-md mx-auto min-h-screen bg-background flex flex-col shadow-2xl relative overflow-hidden border-x border-border">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20">
          {activeView === 'video-library' && (
            <VideoLibrary onSelectVideo={handleSelectVideo} />
          )}
          {activeView === 'video-detail' && selectedVideo && (
            <VideoDetail video={selectedVideo} onBack={handleBack} />
          )}
          {activeView === 'list' && (
            <ExpertList
              experts={experts}
              onSelect={handleSelectExpert}
              onCreateNew={() => { setEditingExpert(null); setActiveView('create'); }}
            />
          )}
          {activeView === 'detail' && selectedExpert && (
            <ExpertDetail
              expert={selectedExpert}
              onBack={handleBack}
              onStartChat={handleStartChat}
              onEdit={(e) => { setEditingExpert(e); setActiveView('create'); }}
              onDelete={handleDeleteExpert}
            />
          )}
          {activeView === 'create' && (
            <CreateExpert
              editingExpert={editingExpert}
              onSave={editingExpert ? handleUpdateExpert : handleCreateExpert}
              onCancel={handleBack}
            />
          )}
          {activeView === 'chat' && selectedExpert && (
            <ChatRoom
              expert={selectedExpert}
              onBack={handleBack}
            />
          )}
          {activeView === 'settings' && (
            <Settings onBack={handleBack} />
          )}
        </main>

        {/* Bottom Nav (H5 Style) */}
        {showBottomNav && (
          <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-16 bg-background border-t flex items-center justify-around z-50">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'profile') {
                    setActiveView('settings');
                  } else {
                    handleTabClick(tab);
                  }
                }}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  (activeTab === tab.id && activeView !== 'settings') || (tab.id === 'profile' && activeView === 'settings')
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {tab.icon}
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
