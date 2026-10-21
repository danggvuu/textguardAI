import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import HumanizerView from './components/HumanizerView';
import DetectorView from './components/DetectorView';
import DiffViewer from './components/DiffViewer';
import PresetsModal from './components/PresetsModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { translations } from './lib/i18n';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('humanize');
  const [lang, setLang] = useState('vi');
  const t = translations[lang];

  // Editor states
  const [inputText, setInputText] = useState('');
  const [humanizedText, setHumanizedText] = useState('');
  const [beforeStats, setBeforeStats] = useState(null);
  const [afterStats, setAfterStats] = useState(null);

  // Detector states & Tier
  const [detectorText, setDetectorText] = useState('');
  const [detectorData, setDetectorData] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectorMode, setDetectorMode] = useState(() => {
    return localStorage.getItem('tg_detector_mode') || 'pro';
  });
  const [detectorDomain, setDetectorDomain] = useState('academic'); // 'academic' | 'general'
  const [activeModel, setActiveModel] = useState(() => {
    return localStorage.getItem('tg_model') || 'claude';
  });

  // Processing state & stage text
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  // Modals & Toast
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (toastData) => {
    setToast(toastData);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial default sample & proactive 9Router migration
  useEffect(() => {
    // Proactively initialize & clean up 9Router credentials on web
    const isCloud = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    const defaultTunnel = 'https://r74fefq.abc-tunnel.us/v1';
    const defaultKey = 'sk-45245fa5a3b0a8f8-rrjkfm-9ecb8a7d';

    const currentUrl = localStorage.getItem('tg_openrouter_url') || '';
    const currentKey = localStorage.getItem('tg_openrouter_key') || '';

    if (isCloud) {
      if (!currentUrl || currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1') || currentUrl.includes('trycloudflare.com')) {
        localStorage.setItem('tg_openrouter_url', defaultTunnel);
      }
      if (!currentKey || !currentKey.startsWith('sk-')) {
        localStorage.setItem('tg_openrouter_key', defaultKey);
      }
    } else {
      if (!currentUrl) localStorage.setItem('tg_openrouter_url', 'http://localhost:20128/v1');
      if (!currentKey) localStorage.setItem('tg_openrouter_key', defaultKey);
    }

    if (!localStorage.getItem('tg_provider')) {
      localStorage.setItem('tg_provider', 'pro');
    }

    if (!inputText) {
      setInputText(
        `Không thể phủ nhận rằng trong kỷ nguyên số hiện nay, trí tuệ nhân tạo đang đóng một vai trò vô cùng quan trọng đối với sự phát triển kinh tế toàn cầu. Các giải pháp tự động hóa thông minh không chỉ giúp tối ưu hóa chi phí sản xuất mà còn nâng cao hiệu suất làm việc của người lao động một cách toàn diện. Hơn nữa, việc ứng dụng công nghệ điện toán đám mây kết hợp cùng thuật toán máy học đã mở ra một kỷ nguyên mới cho ngành quản trị kinh doanh.`
      );
    }

    const storedEngine = localStorage.getItem('tg_provider');
    if (storedEngine === 'pro') {
      setDetectorMode('pro');
    }
    const storedModel = localStorage.getItem('tg_openrouter_model') || 'kr/claude-sonnet-4.5';
    setActiveModel(storedModel);
  }, [isSettingsOpen]);

  // Handle Humanize
  const handleHumanize = async (options) => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setProcessingStage(t.stages[0]);

    const stageTimer1 = setTimeout(() => {
      setProcessingStage(t.stages[1].replace('{readability}', options.readability));
    }, 400);

    const stageTimer2 = setTimeout(() => {
      setProcessingStage(t.stages[2].replace('{purpose}', options.purpose));
    }, 800);

    const stageTimer3 = setTimeout(() => {
      setProcessingStage(t.stages[3].replace('{strength}', options.strength));
    }, 1200);

    try {
      const storedProvider = localStorage.getItem('tg_provider') || 'free';
      const storedKey = localStorage.getItem('tg_openrouter_key') || localStorage.getItem('tg_api_key') || '';
      const storedUrl = localStorage.getItem('tg_openrouter_url') || 'https://openrouter.ai/api/v1';
      const storedModel = localStorage.getItem('tg_openrouter_model') || 'google/gemini-2.0-flash-001';

      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          strength: options.strength,
          readability: options.readability,
          purpose: options.purpose,
          apiKey: storedKey,
          provider: storedProvider === 'pro' ? 'openrouter' : 'local',
          model: storedModel,
          baseUrl: storedUrl
        })
      });

      const data = await res.json();

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      if (data.humanizedText) {
        setHumanizedText(data.humanizedText);
        setBeforeStats(data.beforeStats);
        setAfterStats(data.afterStats);

        showToast({ message: 'Văn bản đã được nhân bản hóa thành công!', type: 'success' });

        // Celebration confetti if human score is high
        if (data.afterStats?.humanScore >= 80) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }
      } else if (data.error) {
        showToast({ message: data.error, type: 'error' });
      }
    } catch (err) {
      showToast({ message: 'Lỗi kết nối máy chủ: ' + err.message, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Detect
  const handleDetect = async (textToScan) => {
    const text = textToScan || detectorText;
    if (!text.trim()) return;

    setIsDetecting(true);
    try {
      const storedKey = localStorage.getItem('tg_openrouter_key') || '';
      const storedUrl = localStorage.getItem('tg_openrouter_url') || '';
      const storedModel = localStorage.getItem('tg_openrouter_model') || '';

      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          tier: detectorMode,
          domain: detectorDomain,
          openRouterKey: storedKey,
          openRouterBaseUrl: storedUrl,
          openRouterModel: storedModel
        })
      });

      const data = await res.json();
      if (data.error) {
        showToast({ message: data.error, type: 'error' });
      } else {
        setDetectorData(data);
        showToast({
          message: `Phân tích hoàn tất: ${data.humanScore}% Điểm người viết (${data.tier === 'pro' ? 'Bản PRO' : 'Model Miễn phí'})`,
          type: 'success'
        });
      }
    } catch (err) {
      showToast({ message: 'Lỗi khi phân tích: ' + err.message, type: 'error' });
    } finally {
      setIsDetecting(false);
    }
  };

  // Switch to detector tab and run analysis on humanized text
  const handleCheckAI = () => {
    if (!humanizedText) return;
    setDetectorText(humanizedText);
    setActiveTab('detect');
    handleDetect(humanizedText);
  };

  // Send a flagged sentence back to humanizer
  const handleSendToHumanizer = (sentence) => {
    setInputText(sentence);
    setActiveTab('humanize');
    showToast({ message: 'Đã chuyển câu vào Trình nhân bản hóa', type: 'info' });
  };

  const storedProvider = typeof window !== 'undefined' ? localStorage.getItem('tg_provider') : 'free';

  return (
    <div className="min-h-screen bg-[#fbfbfd] flex flex-col justify-between selection:bg-indigo-500/20 selection:text-indigo-900">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPresets={() => setIsPresetsOpen(true)}
          currentEngine={detectorMode}
          activeModel={activeModel}
          t={t}
        />

        {/* Hero Section */}
        {activeTab === 'humanize' && <HeroBanner t={t} />}

        {/* Tab 1: Humanizer View */}
        {activeTab === 'humanize' && (
          <HumanizerView
            inputText={inputText}
            setInputText={setInputText}
            humanizedText={humanizedText}
            setHumanizedText={setHumanizedText}
            beforeStats={beforeStats}
            afterStats={afterStats}
            onHumanize={handleHumanize}
            isProcessing={isProcessing}
            processingStage={processingStage}
            onCheckAI={handleCheckAI}
            onViewDiff={() => setActiveTab('diff')}
            onOpenPresets={() => setIsPresetsOpen(true)}
            onShowToast={showToast}
            t={t}
          />
        )}

        {/* Tab 2: AI Detector View */}
        {activeTab === 'detect' && (
          <div className="pt-8">
            <DetectorView
              text={detectorText || inputText}
              setText={setDetectorText}
              detectorData={detectorData}
              onRunDetect={handleDetect}
              isDetecting={isDetecting}
              onSendToHumanizer={handleSendToHumanizer}
              detectorMode={detectorMode}
              setDetectorMode={(mode) => {
                setDetectorMode(mode);
                localStorage.setItem('tg_detector_mode', mode);
                localStorage.setItem('tg_provider', mode);
              }}
              detectorDomain={detectorDomain}
              setDetectorDomain={setDetectorDomain}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onShowToast={showToast}
              t={t}
            />
          </div>
        )}

        {/* Tab 3: Diff Comparison View */}
        {activeTab === 'diff' && (
          <div className="pt-8">
            <DiffViewer
              originalText={inputText}
              humanizedText={humanizedText}
              onBack={() => setActiveTab('humanize')}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 bg-white py-6 px-4 text-center text-xs text-zinc-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TextGuard AI • Thiết kế theo chuẩn giao diện hiện đại Shadcn & Vercel AI Elements</p>
          <div className="flex items-center gap-4 text-zinc-600">
            <span className="hover:text-zinc-950 cursor-pointer">Bảo mật</span>
            <span>•</span>
            <span className="hover:text-zinc-950 cursor-pointer">Chuẩn HC3 & RAID</span>
            <span>•</span>
            <span className="hover:text-indigo-600 cursor-pointer font-bold" onClick={() => setIsSettingsOpen(true)}>
              Cài đặt API (OpenRouter)
            </span>
          </div>
        </div>
      </footer>

      {/* Modals & Toast */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(text) => {
          setInputText(text);
          if (activeTab !== 'humanize') setActiveTab('humanize');
          showToast({ message: 'Đã tải bài mẫu thử nghiệm', type: 'info' });
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        t={t}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
