import { useState, useEffect, useRef, useCallback } from 'react';
import type { Expert, Message } from '@/types';
import { streamOllamaChat, buildSystemPrompt, extractSources, saveMessages, loadMessages } from '@/lib/ollama';
import { ArrowLeft, Send, Mic, Paperclip, StopCircle, AlertCircle, Lightbulb, EllipsisVertical } from 'lucide-react';

const SUGGESTED_QUESTIONS = {
  '胸外科': ['肺段切除中段间平面如何处理？', '如何系统性清扫纵隔淋巴结？', '单孔胸腔镜手术的技术要点？', '处理肺门解剖变异的技巧？'],
  '心外科': ['体外循环建立的注意事项？', '瓣膜置换手术操作要点？'],
  '普外科': ['腹腔镜胆囊切除术操作要点？', '解剖性肝切除的手术步骤？'],
};

interface ChatRoomProps {
  expert: Expert;
  onBack: () => void;
}

export default function ChatRoom({ expert, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadMessages(expert.id));
    setErrorMsg('');
  }, [expert.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isStreaming) return;
    setInput('');
    setErrorMsg('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      sources: [],
    };

    const newMessages = [...messages, userMsg, assistantMsg];
    setMessages(newMessages);
    setIsStreaming(true);

    expert.stats.totalQuestions += 1;

    try {
      const systemPrompt = buildSystemPrompt(expert, content);
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      chatHistory.push({ role: 'user', content });

      abortRef.current = new AbortController();
      let fullContent = '';

      for await (const chunk of streamOllamaChat(
        expert.ollamaModel || 'qwen-plus',
        [{ role: 'system', content: systemPrompt }, ...chatHistory],
        abortRef.current.signal
      )) {
        fullContent += chunk;
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: fullContent } : m
        ));
      }

      const sources = extractSources(expert, content);
      const finalMessages = newMessages.map(m =>
        m.id === assistantId
          ? { ...m, content: fullContent, isStreaming: false, sources }
          : m
      );
      setMessages(finalMessages);
      saveMessages(expert.id, finalMessages);

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, isStreaming: false, content: m.content + '\n\n*（已停止）*' } : m
        ));
      } else {
        const errorText = err.message?.includes('Failed to fetch')
          ? '网络连接失败，请检查网络后重试。'
          : err.message?.includes('未配置 API Key')
          ? err.message
          : err.message || '请求失败，请检查 API Key 是否正确';
        setErrorMsg(errorText);
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, messages, expert, isStreaming]);

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQs = (SUGGESTED_QUESTIONS as any)[expert.specialty] || SUGGESTED_QUESTIONS['胸外科'];

  return (
    <div className="flex flex-col h-full flex-1">
      {/* Chat Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center h-10 w-10 hover:bg-muted rounded-md transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl ring-2 ring-primary/20"
                    style={{ background: expert.avatarColor + '20' }}
                  >
                    {expert.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[hsl(var(--success))] border-2 border-background" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">{expert.name}</h2>
                  <p className="text-sm text-muted-foreground">{expert.title} · {expert.specialty}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
                isStreaming ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]' : 'bg-muted text-muted-foreground'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[hsl(var(--success))] animate-pulse' : 'bg-muted-foreground/30'}`} />
                {isStreaming ? '正在回答...' : '在线'}
              </div>
              <button className="inline-flex items-center justify-center h-10 w-10 hover:bg-muted rounded-md transition-colors">
                <EllipsisVertical size={20} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
        <div className="bg-border h-px w-full" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
                style={{ background: expert.avatarColor + '20' }}
              >
                {expert.avatar}
              </div>
              <h3 className="text-lg font-bold mb-2">你好，我是 {expert.name} 的 AI 智能体</h3>
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                我掌握了{expert.name}的{expert.knowledgeFiles.length > 0 ? `${expert.knowledgeFiles.length}份知识资料` : '专业知识'}，
                可以为你解答{expert.specialty}相关的学术问题，并标注答案来源。
              </p>
              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive mb-6 max-w-md text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                </div>
              )}
              <div className="w-full max-w-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={16} className="text-[hsl(var(--warning))]" />
                  <span className="text-xs text-muted-foreground font-medium">推荐问题</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {suggestedQs.map((q: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left text-sm bg-muted/50 hover:bg-muted border border-border/50 rounded-xl px-4 py-3 text-muted-foreground hover:text-foreground transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} expert={expert} />
              ))}
              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm text-destructive flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>{errorMsg}</div>
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-border bg-background">
        <div className="max-w-3xl mx-auto py-4">
          {messages.length > 0 && !isStreaming && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {suggestedQs.slice(0, 3).map((q: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs bg-muted hover:bg-muted/80 border border-border/50 rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入您的问题... (Enter 发送，Shift+Enter 换行)"
              disabled={isStreaming}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center justify-center border border-input bg-transparent hover:bg-muted h-10 w-10 rounded-md transition-colors" title="语音输入">
                  <Mic size={20} className="text-muted-foreground" />
                </button>
                <button className="inline-flex items-center justify-center border border-input bg-transparent hover:bg-muted h-10 w-10 rounded-md transition-colors" title="附加文件">
                  <Paperclip size={20} className="text-muted-foreground" />
                </button>
              </div>
              {isStreaming ? (
                <button
                  onClick={handleStop}
                  className="inline-flex items-center justify-center gap-2 bg-destructive text-white hover:bg-destructive/90 h-10 px-4 py-2 rounded-md font-medium text-sm"
                >
                  <StopCircle size={18} /> 停止
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">发送</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              💡 提示：您可以提出具体的临床问题，AI将基于专家知识库为您提供循证回答
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, expert }: { message: Message; expert: Expert }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">我</span>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: expert.avatarColor + '20' }}
          >
            {expert.avatar}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <div className={`max-w-2xl px-4 py-3 rounded-lg ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        }`}>
          {message.isStreaming && !message.content ? (
            <div className="flex gap-1 items-center h-5">
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              <MarkdownContent content={message.content} />
            </p>
          )}
          {message.isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : ''}`}>
          {message.timestamp}
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.startsWith('### ')) return <div key={i} className="font-bold mt-2">{line.slice(4)}</div>;
        if (line.startsWith('## ')) return <div key={i} className="font-bold text-base mt-2">{line.slice(3)}</div>;
        if (line.startsWith('# ')) return <div key={i} className="font-bold text-lg mt-2">{line.slice(2)}</div>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const inline = renderInline(line.slice(2));
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary flex-shrink-0">•</span>
              <span>{inline}</span>
            </div>
          );
        }
        if (/^\d+\. /.test(line)) {
          const num = line.match(/^(\d+)\. /)?.[1];
          return (
            <div key={i} className="flex gap-2">
              <span className="text-primary flex-shrink-0 font-bold">{num}.</span>
              <span>{renderInline(line.replace(/^\d+\. /, ''))}</span>
            </div>
          );
        }
        if (line === '') return <div key={i} className="h-2" />;
        return <div key={i}>{renderInline(line)}</div>;
      })}
    </>
  );
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="bg-muted-foreground/10 rounded px-1 text-xs">{part.slice(1, -1)}</code>;
    }
    return <span key={i}>{part}</span>;
  });
}
