import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import HumanizerView from './components/HumanizerView';
import DetectorView from './components/DetectorView';
import DiffViewer from './components/DiffViewer';
import PresetsModal from './components/PresetsModal';
import SettingsModal from './components/SettingsModal';
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

  // Detector states
  const [detectorText, setDetectorText] = useState('');
  const [detectorData, setDetectorData] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  // Processing state & stage text
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  // Initial default sample if empty
  useEffect(() => {
    if (!inputText) {
      setInputText(
        `Không thể phủ nhận rằng trong kỷ nguyên số hiện nay, trí tuệ nhân tạo đang đóng một vai trò vô cùng quan trọng đối với sự phát triển kinh tế toàn cầu. Các giải pháp tự động hóa thông minh không chỉ giúp tối ưu hóa chi phí sản xuất mà còn nâng cao hiệu suất làm việc của người lao động một cách toàn diện. Hơn nữa, việc ứng dụng công nghệ điện toán đám mây kết hợp cùng thuật toán máy học đã mở ra một kỷ nguyên mới cho ngành quản trị kinh doanh.`
      );
    }
  }, []);

  // Handle Humanize
  const handleHumanize = async (options) => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    setProcessingStage(t.stages[0]);

    // Stage ticker simulation for realistic experience
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
      const storedProvider = localStorage.getItem('tg_provider') || 'local';
      const storedKey = localStorage.getItem('tg_api_key') || '';
      const storedModel = localStorage.getItem('tg_model') || 'gemini-1.5-flash';

      const res = await fetch('/api/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          strength: options.strength,
          readability: options.readability,
          purpose: options.purpose,
          apiKey: storedKey,
          provider: storedProvider,
          model: storedModel
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

        // Celebration confetti if human score is excellent
        if (data.afterStats?.humanScore >= 80) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else if (data.error) {
        alert(data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ: ' + err.message);
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
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setDetectorData(data);
    } catch (err) {
      alert('Lỗi khi phân tích: ' + err.message);
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
  };

  return (
    <div className="min-h-screen bg-[#fbfcff] flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          lang={lang}
          setLang={setLang}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenPresets={() => setIsPresetsOpen(true)}
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
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TextGuard AI • Mô phỏng hoàn chỉnh cho mục đích kiểm thử và tối ưu văn bản tự nhiên</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="hover:text-[#6248ff] cursor-pointer">Điều khoản</span>
            <span>•</span>
            <span className="hover:text-[#6248ff] cursor-pointer">Bảo mật</span>
            <span>•</span>
            <span className="hover:text-[#6248ff] cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
              Cài đặt API
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(text) => {
          setInputText(text);
          if (activeTab !== 'humanize') setActiveTab('humanize');
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        t={t}
      />
    </div>
  );
}
