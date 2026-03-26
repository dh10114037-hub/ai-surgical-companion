import { useState, useEffect } from 'react';
import { getBailianApiKey, setBailianApiKey, testBailianConnection, BAILIAN_MODELS } from '@/lib/ollama';
import { toast } from 'sonner';
import { ChevronLeft, RefreshCw, CheckCircle2, XCircle, Key, ExternalLink, Eye, EyeOff, Cpu } from 'lucide-react';

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const key = getBailianApiKey();
    setApiKey(key);
    setSavedKey(key);
    if (key) {
      handleCheck(key);
    }
  }, []);

  const handleCheck = async (key?: string) => {
    const k = key ?? apiKey;
    if (!k.trim()) { toast.error('请先输入 API Key'); return; }
    setLoading(true);
    setErrorMsg('');
    const result = await testBailianConnection(k.trim());
    setConnected(result.ok);
    if (result.ok) {
      toast.success('API Key 验证成功');
    } else {
      setErrorMsg(result.error || '验证失败');
      toast.error('验证失败：' + (result.error || '请检查 API Key'));
    }
    setLoading(false);
  };

  const handleSave = () => {
    if (!apiKey.trim()) { toast.error('API Key 不能为空'); return; }
    setBailianApiKey(apiKey.trim());
    setSavedKey(apiKey.trim());
    toast.success('API Key 已保存');
    handleCheck(apiKey.trim());
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur flex items-center p-4 border-b border-border/50">
        <button onClick={onBack} className="inline-flex items-center justify-center h-8 w-8 hover:bg-muted rounded-md transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="flex-1 text-center font-medium mr-8">系统设置</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* API Key Card */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="font-bold mb-1 flex items-center gap-2 text-foreground">
            <Key size={18} className="text-primary" /> 阿里云百炼 API Key
          </h3>
          <p className="text-muted-foreground text-xs mb-5">
            前往
            <a href="https://bailian.console.aliyun.com/" target="_blank" rel="noreferrer"
              className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 mx-1">
              百炼控制台 <ExternalLink size={12} />
            </a>
            → 右上角头像 → API-KEY 管理 → 创建并复制
          </p>

          {/* Status badge */}
          {connected !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm mb-4 w-fit ${
              connected
                ? 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border border-[hsl(var(--success))]/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
              {connected ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {connected ? '已连接，API Key 有效' : `连接失败：${errorMsg}`}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-muted-foreground mb-2 block text-xs font-medium">API Key</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="flex w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10 font-mono rounded-xl"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {savedKey && !showKey && (
                <p className="text-xs text-muted-foreground/60 mt-1.5 font-mono">已保存：{maskKey(savedKey)}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 h-11 rounded-xl font-medium text-sm">
                <Key size={16} /> 保存 Key
              </button>
              <button onClick={() => handleCheck()} disabled={loading} className="inline-flex items-center justify-center gap-2 border border-input bg-transparent hover:bg-muted px-4 py-2.5 h-11 rounded-xl font-medium text-sm">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                验证
              </button>
            </div>
          </div>
        </div>

        {/* Model List */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
            <Cpu size={18} className="text-muted-foreground" /> 支持的模型
          </h3>
          <div className="space-y-2">
            {BAILIAN_MODELS.map(m => (
              <div key={m.value} className="flex items-center justify-between bg-background rounded-xl px-4 py-3 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.desc}</div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground/60 font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Guide */}
        <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
          <h3 className="font-bold mb-4 text-sm text-muted-foreground">获取 API Key 步骤</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            {[
              { step: '1', text: '访问 阿里云百炼控制台', link: 'https://bailian.console.aliyun.com/', linkText: 'bailian.console.aliyun.com' },
              { step: '2', text: '登录阿里云账号（支持个人/企业）' },
              { step: '3', text: '点击右上角头像 → 「API-KEY 管理」' },
              { step: '4', text: '创建新的 API Key，复制后粘贴到上方输入框' },
              { step: '5', text: '点击「保存 Key」并验证连接' },
            ].map(item => (
              <li key={item.step} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold">
                  {item.step}
                </span>
                <span>
                  {item.text}
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noreferrer"
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-0.5 ml-1">
                      {item.linkText} <ExternalLink size={12} />
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
