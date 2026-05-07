import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Download, HelpCircle, Shield, Info, ChevronRight, Phone, Moon, Sun, BookOpen, Copy, Database, ExternalLink, Heart, MessageCircle, X, AlertTriangle, Cloud } from 'lucide-react';
import { enableCloudSync, disableCloudSync, uploadAllLocalData } from '../utils/cloudSync';
import { NotificationPreferences } from './NotificationPreferences';
import { HowItWorksModal } from './modals/HowItWorksModal';
import { CrisisResourcesModal } from './modals/CrisisResourcesModal';
import { AboutModal } from './modals/AboutModal';
import { CitationsModal } from './modals/CitationsModal';
import { getUserId } from '../utils/dataSync';
import { getErrorLogs, clearErrorLogs, ErrorLog } from '../utils/errorLogger';
import { APP_VERSION } from '../utils/appConfig';
// Browser-native file download for PWA — no Capacitor Filesystem needed
function browserDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ProfileScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function ProfileScreen({ isDarkMode, onToggleDarkMode }: ProfileScreenProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showUserId, setShowUserId] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showExportFormatModal, setShowExportFormatModal] = useState(false);
  const [exportData, setExportData] = useState<any>(null);
  const [showErrorLogs, setShowErrorLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [devTapCount, setDevTapCount] = useState(0);
  const [showDevMode, setShowDevMode] = useState(false);

  const [userId, setUserId] = useState<string>('Loading...');
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState(false);

  useEffect(() => {
    getUserId().then(id => setUserId(id));
    setCloudBackupEnabled(localStorage.getItem('mindcheck_cloud_backup_enabled') === 'true');
  }, []);

  const handleToggleCloudBackup = () => {
    const newValue = !cloudBackupEnabled;
    setCloudBackupEnabled(newValue);
    if (newValue) {
      enableCloudSync();
      uploadAllLocalData();
    } else {
      disableCloudSync();
    }
  };

  const handleExportData = async () => {
    try {
      const currentUserId = await getUserId();
      const exportData = {
        userId: currentUserId,
        exportDate: new Date().toISOString(),
        appVersion: APP_VERSION,
        checkInHistory: JSON.parse(localStorage.getItem('mindcheck_history') || '[]'),
        gameMetrics: JSON.parse(localStorage.getItem('mindcheck_game_metrics') || '[]'),
        journalEntries: JSON.parse(localStorage.getItem('mindcheck_journal_entries_all') || '[]').map((e: any) => ({
          ...e,
          userId: e.userId || currentUserId,
          // Strip base64 media from export to keep file small — store only metadata
          media: e.media ? { type: e.media.type, note: 'Image stored on device only' } : null,
        })),
        emaData: JSON.parse(localStorage.getItem('mindcheck_ema_data') || '{}'),
        preferences: JSON.parse(localStorage.getItem('mindcheck_preferences') || '{}'),
      };

      // Show format picker
      setExportData(exportData);
      setShowExportFormatModal(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const doExport = async (format: 'json' | 'csv' | 'txt') => {
    if (!exportData) return;
    setShowExportFormatModal(false);
    try {
      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      const dateStr = new Date().toISOString().split('T')[0];

      // Shared helpers
      const fmtDate = (ts: any): string => {
        if (!ts) return '';
        const d = new Date(ts);
        return isNaN(d.getTime()) ? String(ts) : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      const phq9Severity  = (s: number) => s <= 4 ? 'Minimal' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : s <= 19 ? 'Moderately severe' : 'Severe';
      const gad7Severity  = (s: number) => s <= 4 ? 'Minimal' : s <= 9 ? 'Mild' : s <= 14 ? 'Moderate' : 'Severe';
      const pssSeverity   = (s: number) => s <= 13 ? 'Low stress' : s <= 26 ? 'Moderate stress' : 'High stress';
      const rsesSeverity  = (s: number) => s < 15 ? 'Low self-esteem' : s <= 25 ? 'Average self-esteem' : 'Strong self-esteem';
      const fiLabel       = (v: number | null | undefined): string | null => {
        if (v == null) return null;
        return (['Not difficult at all', 'Somewhat difficult', 'Very difficult', 'Extremely difficult'][v]) ?? String(v);
      };
      const checkinLabel  = (t: string) => ({ full: 'Full check-in', phq9: 'PHQ-9 only', gad7: 'GAD-7 only', pss: 'PSS only', rses: 'RSES only' } as Record<string, string>)[t] ?? t;
      const moodStr       = (emotions: string[], intensities: Record<string, number> = {}) =>
        (emotions || []).map(e => intensities[e] != null ? `${e} (${intensities[e]}/5)` : e).join(', ');

      // Compact game detail for CSV
      const gameDetail = (g: any): string => {
        switch (g.type) {
          case 'gonogo':    return `hits:${g.hits??'-'} misses:${g.misses??'-'} falseAlarms:${g.falseAlarms??'-'} correctRejections:${g.correctRejections??'-'} inhibitionScore:${g.inhibitionScore??'-'}% avgRT:${g.averageReactionTime??'-'}ms`;
          case 'attention': return `correctSequences:${g.correctSequences??'-'} longestSequence:${g.longestSequence??'-'} avgSpan:${g.averageSpan??'-'} accuracy:${g.accuracy??'-'}% avgRT:${g.averageReactionTime??'-'}ms`;
          case 'memory':    return `correctRecalls:${g.correctRecalls??'-'} avgDigitSpan:${g.averageDigitSpan??'-'} longestSpan:${g.longestSpan??'-'} accuracy:${g.accuracy??'-'}% avgRT:${g.averageReactionTime??'-'}ms`;
          case 'counting':  return `correctSteps:${g.correctSteps??'-'} incorrectSteps:${g.incorrectSteps??'-'} accuracy:${g.accuracy??'-'}% avgRT:${g.averageReactionTime??'-'}ms totalTime:${g.totalTime??'-'}s`;
          default:          return `accuracy:${g.accuracy??'-'}%`;
        }
      };

      // Readable multi-line game detail for TXT
      const gameLines = (g: any): string[] => {
        switch (g.type) {
          case 'gonogo':    return [
            `   Hits: ${g.hits??'-'}  Misses: ${g.misses??'-'}  False Alarms: ${g.falseAlarms??'-'}  Correct Rejections: ${g.correctRejections??'-'}`,
            `   Inhibition Score: ${g.inhibitionScore??'-'}%  Avg Reaction Time: ${g.averageReactionTime??'-'}ms`,
          ];
          case 'attention': return [
            `   Correct Sequences: ${g.correctSequences??'-'}  Longest: ${g.longestSequence??'-'}  Avg Span: ${g.averageSpan??'-'}`,
            `   Accuracy: ${g.accuracy??'-'}%  Avg Reaction Time: ${g.averageReactionTime??'-'}ms`,
          ];
          case 'memory':    return [
            `   Correct Recalls: ${g.correctRecalls??'-'}  Avg Digit Span: ${g.averageDigitSpan??'-'}  Longest Span: ${g.longestSpan??'-'}`,
            `   Accuracy: ${g.accuracy??'-'}%  Avg Reaction Time: ${g.averageReactionTime??'-'}ms`,
          ];
          case 'counting':  return [
            `   Correct Steps: ${g.correctSteps??'-'}  Incorrect Steps: ${g.incorrectSteps??'-'}`,
            `   Accuracy: ${g.accuracy??'-'}%  Avg Reaction Time: ${g.averageReactionTime??'-'}ms  Total Time: ${g.totalTime??'-'}s`,
          ];
          default:          return [`   Accuracy: ${g.accuracy??'-'}%`];
        }
      };

      if (format === 'json') {
        fileContent = JSON.stringify(exportData, null, 2);
        fileName = `mindcheck-export-${dateStr}.json`;
        mimeType = 'application/json';

      } else if (format === 'csv') {
        const lines: string[] = [];
        lines.push('Type,Date,UserId,Details');

        // Check-ins
        (exportData.checkInHistory || []).forEach((r: any) => {
          const scores = [
            r.phq9Score != null ? `PHQ9:${r.phq9Score} (${phq9Severity(r.phq9Score)})` : null,
            r.gad7Score != null ? `GAD7:${r.gad7Score} (${gad7Severity(r.gad7Score)})` : null,
            r.pssScore  != null ? `PSS:${r.pssScore} (${pssSeverity(r.pssScore)})` : null,
            r.rsesScore != null ? `RSES:${r.rsesScore} (${rsesSeverity(r.rsesScore)})` : null,
          ].filter(Boolean).join(' | ');
          const fi = fiLabel(r.functionalImpairment);
          const details = [
            `Type: ${checkinLabel(r.checkInType || 'full')}`,
            scores,
            fi ? `Functional impairment: ${fi}` : null,
          ].filter(Boolean).join(' | ');
          lines.push(`"Check-in","${r.date || fmtDate(r.timestamp)}","${exportData.userId}","${details.replace(/"/g, '""')}"`);
        });

        // Games
        (exportData.gameMetrics || []).forEach((g: any) => {
          lines.push(`"Game","${fmtDate(g.timestamp || g.date)}","${exportData.userId}","${g.type}: ${gameDetail(g)}"`);
        });

        // Journals
        (exportData.journalEntries || []).forEach((j: any) => {
          const mood = moodStr(j.emotions, j.moodIntensities);
          const details = [
            `Type: ${j.checkin_type === 'guided' ? 'Guided check-in' : 'Standalone'}`,
            j.prompt ? `Prompt: ${j.prompt}` : null,
            mood ? `Emotions: ${mood}` : null,
            j.hashtags?.length ? `Tags: ${j.hashtags.join(' ')}` : null,
            `Entry: ${(j.entry || '').replace(/"/g, '""')}`,
          ].filter(Boolean).join(' | ');
          lines.push(`"Journal","${j.date || fmtDate(j.timestamp)}","${exportData.userId}","${details}"`);
        });

        // Day Logs (EMA)
        const emaData = exportData.emaData || {};
        Object.entries(emaData).forEach(([date, sessions]) => {
          (sessions as any[]).forEach((s: any) => {
            const responses = (s.questions || []).map((q: any) => `${q.question_text}: ${q.response}`).join(' | ');
            const time = s.timestamp ? ` ${fmtDate(s.timestamp)}` : '';
            lines.push(`"Day Log","${date}${time}","${exportData.userId}","Section: ${s.section}${responses ? ' | ' + responses : ''}"`);
          });
        });

        fileContent = lines.join('\n');
        fileName = `mindcheck-export-${dateStr}.csv`;
        mimeType = 'text/csv';

      } else {
        // TXT — readable narrative format
        const lines: string[] = [];
        const divider = '═══════════════════════════════════════';

        lines.push('MindCheck Data Export');
        lines.push(`User ID:     ${exportData.userId}`);
        lines.push(`Export Date: ${fmtDate(exportData.exportDate)}`);
        lines.push(`App Version: v${exportData.appVersion}`);

        // Check-ins
        lines.push('');
        lines.push(divider);
        lines.push(' CHECK-IN HISTORY');
        lines.push(divider);
        const checkIns = exportData.checkInHistory || [];
        if (!checkIns.length) {
          lines.push('  No check-ins recorded.');
        } else {
          checkIns.forEach((r: any, i: number) => {
            lines.push('');
            lines.push(`${i + 1}. ${r.date || fmtDate(r.timestamp)} — ${checkinLabel(r.checkInType || 'full')}`);
            if (r.phq9Score != null) lines.push(`   PHQ-9 (Mood):        ${r.phq9Score}/27 — ${phq9Severity(r.phq9Score)}`);
            if (r.gad7Score != null) lines.push(`   GAD-7 (Anxiety):     ${r.gad7Score}/21 — ${gad7Severity(r.gad7Score)}`);
            if (r.pssScore  != null) lines.push(`   PSS (Stress):        ${r.pssScore}/40 — ${pssSeverity(r.pssScore)}`);
            if (r.rsesScore != null) lines.push(`   RSES (Self-esteem):  ${r.rsesScore}/40 — ${rsesSeverity(r.rsesScore)}`);
            const fi = fiLabel(r.functionalImpairment);
            if (fi) lines.push(`   Functional impact:   ${fi}`);
          });
        }

        // Games
        lines.push('');
        lines.push(divider);
        lines.push(' GAME SCORES');
        lines.push(divider);
        const games = exportData.gameMetrics || [];
        if (!games.length) {
          lines.push('  No game data recorded.');
        } else {
          games.forEach((g: any, i: number) => {
            lines.push('');
            lines.push(`${i + 1}. ${fmtDate(g.timestamp || g.date)} — ${g.type}`);
            gameLines(g).forEach(l => lines.push(l));
          });
        }

        // Journals
        lines.push('');
        lines.push(divider);
        lines.push(' JOURNAL ENTRIES');
        lines.push(divider);
        const journals = exportData.journalEntries || [];
        if (!journals.length) {
          lines.push('  No journal entries recorded.');
        } else {
          journals.forEach((j: any, i: number) => {
            lines.push('');
            lines.push(`${i + 1}. ${j.date || fmtDate(j.timestamp)} — ${j.checkin_type === 'guided' ? 'Guided check-in' : 'Standalone'}`);
            if (j.prompt) lines.push(`   Prompt:    ${j.prompt}`);
            const mood = moodStr(j.emotions, j.moodIntensities);
            if (mood) lines.push(`   Emotions:  ${mood}`);
            if (j.hashtags?.length) lines.push(`   Tags:      ${j.hashtags.join(', ')}`);
            if (j.entry) {
              lines.push('   Entry:');
              // Word-wrap at ~72 chars
              const words = j.entry.split(' ');
              let currentLine = '     ';
              words.forEach((w: string) => {
                if (currentLine.length + w.length > 72) {
                  lines.push(currentLine.trimEnd());
                  currentLine = '     ' + w + ' ';
                } else {
                  currentLine += w + ' ';
                }
              });
              if (currentLine.trim()) lines.push(currentLine.trimEnd());
            }
          });
        }

        // Day Logs
        lines.push('');
        lines.push(divider);
        lines.push(' DAY LOGS');
        lines.push(divider);
        const emaEntries = exportData.emaData || {};
        const emaDates = Object.keys(emaEntries).sort();
        if (!emaDates.length) {
          lines.push('  No day logs recorded.');
        } else {
          emaDates.forEach(date => {
            lines.push('');
            lines.push(`  ${date}`);
            (emaEntries[date] as any[]).forEach((s: any) => {
              const section = s.section.charAt(0).toUpperCase() + s.section.slice(1);
              lines.push(`  ▸ ${section} check-in`);
              (s.questions || []).forEach((q: any) => {
                lines.push(`      ${q.question_text}: ${q.response}`);
              });
            });
          });
        }

        fileContent = lines.join('\n');
        fileName = `mindcheck-export-${dateStr}.txt`;
        mimeType = 'text/plain';
      }

      browserDownload(fileContent, fileName, mimeType);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  // Clear only health data — keeps onboarding, preferences, User ID intact
  const handleClearHealthData = () => {
    const allHealthKeys = [
      'mindcheck_history',
      'mindcheck_last_phq9',
      'mindcheck_last_pss',
      'mindcheck_last_rses',
      'mindcheck_last_gad7',
      'mindcheck_last_assessment',
      'mindcheck_game_metrics',
      'mindcheck_journal_entries_all',
      'mindcheck_ema_data',
      'mindcheck_hashtag_count',
      'mindcheck_sync_preference_asked',
      'mindcheck_synced_to_backend',
      'mindcheck_backend_loaded',
    ];
    allHealthKeys.forEach(key => localStorage.removeItem(key));
    setShowClearDataModal(false);
    alert('All health data cleared. Your preferences and account are intact.');
  };

  // Full reset — clears everything, app restarts like fresh install
  const handleFullReset = () => {
    localStorage.clear();
    setShowClearDataModal(false);
    // Reload app to trigger onboarding
    window.location.reload();
  };

  const copyUserId = () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(userId)
          .then(() => {
            setCopiedUserId(true);
            setTimeout(() => setCopiedUserId(false), 2000);
          })
          .catch(() => {
            fallbackCopyToClipboard(userId);
          });
      } else {
        fallbackCopyToClipboard(userId);
      }
    } catch (error) {
      console.error('Copy failed:', error);
      fallbackCopyToClipboard(userId);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    try {
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedUserId(true);
        setTimeout(() => setCopiedUserId(false), 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    } finally {
      document.body.removeChild(textarea);
    }
  };

  

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all your check-in history? This cannot be undone.')) {
      localStorage.removeItem('mindcheck_history');
      localStorage.removeItem('mindcheck_last_phq9');
      localStorage.removeItem('mindcheck_last_pss');
      localStorage.removeItem('mindcheck_last_rses');
      localStorage.removeItem('mindcheck_last_assessment');
      alert('All data has been cleared.');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} overflow-y-auto pb-20`}>
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="pt-4 pb-2">
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>Profile</h1>
          <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>Manage your settings and data</p>
        </div>

        {/* User Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-1">
                Welcome back
              </h2>
              <p className="text-white/80 text-sm">
                Taking care of your mental wellness
              </p>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} uppercase tracking-wide px-1`}>
            Appearance
          </h3>

          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl shadow-sm`}>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-xl flex items-center justify-center`}>
                    {isDarkMode ? (
                      <Moon className="w-5 h-5 text-[#ffb757]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#ffb757]" />
                    )}
                  </div>
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                      {isDarkMode ? 'Dark mode' : 'Light mode'}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      {isDarkMode ? 'Easy on the eyes' : 'Bright and clear'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`w-14 h-8 rounded-full p-1 transition-all ${
                    isDarkMode ? 'bg-[#ffb757]' : 'bg-[#8d654c]/20'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Check-in & Reminders */}
        <NotificationPreferences isDarkMode={isDarkMode} />

        {/* Data & Privacy */}
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} uppercase tracking-wide px-1`}>
            Data & Privacy
          </h3>

          <div className={`${isDarkMode ? 'bg-[#2a2218] divide-[#ffb757]/10' : 'bg-white/80 divide-[#ddc4af]/20'} rounded-2xl divide-y shadow-sm`}>

            {/* Privacy Policy */}
            <a
              href="https://sites.google.com/view/transit-lab/transit-lab/mindcheck_privacy_policy"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/20'} rounded-xl flex items-center justify-center`}>
                  <Shield className={`w-5 h-5 text-[#ffb757]`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Privacy Policy</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>How we handle your data</div>
                </div>
              </div>
              <ExternalLink className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </a>

            {/* User ID Display */}
            <div
              onClick={() => setShowUserId(!showUserId)}
              className={`w-full p-5 cursor-pointer ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ece5de]/10' : 'bg-[#8d654c]/10'} rounded-xl flex items-center justify-center`}>
                    <Database className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>User ID</div>
                    {showUserId ? (
                      <div className="flex items-center gap-2 mt-1">
                        <code className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70 bg-[#1a1410]' : 'text-[#8d654c]/70 bg-[#ece5de]'} px-2 py-1 rounded font-mono break-all`}>
                          {userId}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUserId();
                          }}
                          className={`flex-shrink-0 p-1.5 rounded-lg ${
                            copiedUserId
                              ? 'bg-green-500/20 text-green-500'
                              : isDarkMode ? 'bg-[#ffb757]/20 text-[#ffb757]' : 'bg-[#ffb757]/10 text-[#ffb757]'
                          } transition-colors`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Tap to view and copy</div>
                    )}
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'} transition-transform ${showUserId ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Cloud Backup Toggle */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-xl flex items-center justify-center`}>
                  <Cloud className="w-5 h-5 text-[#ffb757]" />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Cloud Backup</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Sync your data securely to the cloud</div>
                </div>
              </div>
              <button
                onClick={handleToggleCloudBackup}
                className={`w-14 h-8 rounded-full p-1 transition-all ${
                  cloudBackupEnabled ? 'bg-[#ffb757]' : 'bg-[#8d654c]/20'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  cloudBackupEnabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button
              onClick={handleExportData}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ece5de]/10' : 'bg-[#8d654c]/10'} rounded-xl flex items-center justify-center`}>
                  <Download className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Export my data</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>JSON · CSV · TXT formats</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>

            <button
              onClick={() => setShowClearDataModal(true)}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
                  <span className="text-lg">🗑️</span>
                </div>
                <div>
                  <div className="font-semibold text-red-600">Clear all data</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Permanently delete history</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="space-y-3">
          <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} uppercase tracking-wide px-1`}>
            Help & Support
          </h3>

          <div className={`${isDarkMode ? 'bg-[#2a2218] divide-[#ffb757]/10' : 'bg-white/80 divide-[#ddc4af]/20'} rounded-2xl divide-y shadow-sm`}>
            <button
              onClick={() => setShowCrisisResources(true)}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} rounded-xl flex items-center justify-center`}>
                  <Phone className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Support resources</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>24/7 support available</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>

            <button
              onClick={() => setShowHowItWorks(true)}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ece5de]/10' : 'bg-[#8d654c]/10'} rounded-xl flex items-center justify-center`}>
                  <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>How it works</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Learn about our assessments</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>

            <button
              onClick={() => setShowCitations(true)}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ece5de]/10' : 'bg-[#8d654c]/10'} rounded-xl flex items-center justify-center`}>
                  <BookOpen className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Scientific citations</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Research credits</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>

            <button
              onClick={() => { setErrorLogs(getErrorLogs()); setShowErrorLogs(true); }}
              className={`w-full p-5 flex items-center justify-between text-left ${isDarkMode ? 'active:bg-[#2a2218]/80' : 'active:bg-white/90'} ${showDevMode ? '' : 'hidden'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'} rounded-xl flex items-center justify-center`}>
                  <AlertTriangle className={`w-5 h-5 text-orange-500`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Error logs</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>View app crash reports</div>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`} />
            </button>
          </div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`${isDarkMode ? 'bg-[#ffb757]/20 border-[#ffb757]/40' : 'bg-[#ffb757]/10 border-[#ffb757]/30'} border-2 rounded-2xl p-5`}
        >
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'} leading-relaxed text-center`}>
            MindCheck is a self-reflection tool, not a diagnostic service. Your privacy is our priority.
          </p>
        </motion.div>

        {/* By Transit Lab Section */}
        <motion.a
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          href="https://neuroinnovativesolutions.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={`block text-center py-4 px-5 rounded-2xl transition-all active:scale-[0.98] ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#8d654c]/15 to-[#8d654c]/5 border border-[#8d654c]/20' 
              : 'bg-gradient-to-br from-[#ddc4af]/20 to-[#ddc4af]/10 border border-[#ddc4af]/30'
          }`}
        >
          <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mb-1`}>
            Developed by
          </p>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]'} flex items-center justify-center gap-1.5`}>
            Startup wing of Transit Lab
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </p>
        </motion.a>

        {/* App Version - tap 5 times to unlock developer mode */}
        <div className="text-center py-2">
          <button
            onClick={() => {
              const newCount = devTapCount + 1;
              setDevTapCount(newCount);
              if (newCount >= 5 && !showDevMode) {
                setShowDevMode(true);
                setDevTapCount(0);
              }
              // Reset tap count after 2 seconds of no tapping
              setTimeout(() => setDevTapCount(0), 2000);
            }}
            className={`text-xs ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`}
          >
            MindCheck v{APP_VERSION}
            {showDevMode && <span className="ml-1 text-orange-400">(dev)</span>}
          </button>
        </div>

        {/* Logout Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => {
            if (confirm('Are you sure you want to log out? Your data will remain saved on this device.')) {
              localStorage.removeItem('mindcheck_onboarded');
              window.location.reload();
            }
          }}
          className={`w-full py-4 rounded-2xl font-semibold transition-all ${
            isDarkMode 
              ? 'bg-[#2a2218] text-[#ece5de]/70 border-2 border-[#ece5de]/20' 
              : 'bg-white/60 text-[#8d654c]/70 border-2 border-[#8d654c]/20'
          } active:scale-[0.98]`}
        >
          Log Out
        </motion.button>
      </div>

      {/* Modals */}
      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} isDarkMode={isDarkMode} />
      )}
      {showCrisisResources && (
        <CrisisResourcesModal onClose={() => setShowCrisisResources(false)} isDarkMode={isDarkMode} />
      )}
      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} isDarkMode={isDarkMode} />
      )}
      {showCitations && (
        <CitationsModal isOpen={showCitations} onClose={() => setShowCitations(false)} isDarkMode={isDarkMode} />
      )}

      {/* Error Logs Modal */}
      {showErrorLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowErrorLogs(false)} />
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'} max-h-[80vh] flex flex-col`}
          >
            <div className="p-5 pb-3 flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Error Logs</h2>
              <div className="flex gap-2">
                {errorLogs.length > 0 && (
                  <>
                    <button
                      onClick={async () => {
                        try {
                          const logText = errorLogs.map(l => 
                            `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}\n${l.stack || ''}`
                          ).join('\n\n---\n\n');
                          const content = `MindCheck Error Logs\nApp: v${APP_VERSION}\nExported: ${new Date().toISOString()}\n\n${logText}`;
                          const fileName = `mindcheck-errors-${new Date().toISOString().split('T')[0]}.txt`;
                          browserDownload(content, fileName, 'text/plain');
                        } catch (e) {
                          console.error('Share logs failed:', e);
                        }
                      }}
                      className={`text-xs px-3 py-1 rounded-full border ${isDarkMode ? 'text-[#ece5de]/70 border-[#ece5de]/30' : 'text-[#8d654c] border-[#8d654c]/30'}`}
                    >
                      Share
                    </button>
                    <button
                      onClick={() => { clearErrorLogs(); setErrorLogs([]); }}
                      className="text-xs text-red-500 px-3 py-1 rounded-full border border-red-300"
                    >
                      Clear all
                    </button>
                  </>
                )}
                <button onClick={() => setShowErrorLogs(false)}>
                  <X className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`} />
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 overflow-auto flex-1">
              {errorLogs.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
                  <p className="text-sm">No errors recorded</p>
                  <p className="text-xs mt-1 opacity-60">Errors will appear here when they occur</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {errorLogs.map((log, i) => (
                    <div key={log.id || i} className={`p-3 rounded-xl text-xs font-mono ${isDarkMode ? 'bg-[#1a1410] border border-[#ece5de]/10' : 'bg-[#ece5de]/60 border border-[#ddc4af]/30'}`}>
                      <div className="flex justify-between mb-1">
                        <span className={`font-semibold ${log.type === 'react' ? 'text-red-500' : 'text-orange-500'}`}>{log.type.toUpperCase()}</span>
                        <span className={`opacity-50 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className={`break-all ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]'}`}>
                        {log.message}
                      </div>
                      {log.stack && (
                        <div className={`mt-1 break-all opacity-50 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                          {log.stack.substring(0, 200)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Export Format Modal */}
      {showExportFormatModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportFormatModal(false)} />
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'}`}
          >
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-[#ffb757]/20 rounded-full flex items-center justify-center">
                <Download className="w-7 h-7 text-[#ffb757]" />
              </div>
            </div>
            <h2 className={`text-xl font-semibold text-center mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Export Format</h2>
            <p className={`text-sm text-center mb-5 ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Choose how to export your data</p>

            <button onClick={() => doExport('json')} className={`w-full p-4 rounded-2xl text-left mb-3 border-2 transition-all active:scale-[0.98] ${isDarkMode ? 'border-[#ece5de]/20 bg-[#1a1410]/50' : 'border-[#ddc4af]/40 bg-[#ece5de]/40'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>JSON (Full Data)</div>
                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#ece5de]/55' : 'text-[#8d654c]/60'}`}>Complete data with all details. Best for backup or database import.</div>
                </div>
              </div>
            </button>

            <button onClick={() => doExport('csv')} className={`w-full p-4 rounded-2xl text-left mb-3 border-2 transition-all active:scale-[0.98] ${isDarkMode ? 'border-[#ece5de]/20 bg-[#1a1410]/50' : 'border-[#ddc4af]/40 bg-[#ece5de]/40'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>CSV (Spreadsheet)</div>
                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#ece5de]/55' : 'text-[#8d654c]/60'}`}>Opens in Excel or Google Sheets. Good for analysis.</div>
                </div>
              </div>
            </button>

            <button onClick={() => doExport('txt')} className={`w-full p-4 rounded-2xl text-left mb-3 border-2 transition-all active:scale-[0.98] ${isDarkMode ? 'border-[#ece5de]/20 bg-[#1a1410]/50' : 'border-[#ddc4af]/40 bg-[#ece5de]/40'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Text (Readable)</div>
                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#ece5de]/55' : 'text-[#8d654c]/60'}`}>Human-readable summary. Easy to read and share.</div>
                </div>
              </div>
            </button>

            <button onClick={() => setShowExportFormatModal(false)} className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${isDarkMode ? 'bg-[#ece5de]/10 text-[#ece5de]/70' : 'bg-[#8d654c]/10 text-[#8d654c]/70'}`}>Cancel</button>
          </motion.div>
        </div>
      )}

      {/* Clear Data Modal */}
      {showClearDataModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowClearDataModal(false)}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full max-w-sm rounded-3xl shadow-2xl p-6 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'}`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-red-600" />
              </div>
            </div>

            <h2 className={`text-xl font-semibold text-center mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Clear Data
            </h2>
            <p className={`text-sm text-center mb-6 ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Choose what you want to delete. This cannot be undone.
            </p>

            {/* Option 1 — Health data only */}
            <button
              onClick={handleClearHealthData}
              className={`w-full p-4 rounded-2xl text-left mb-3 border-2 transition-all active:scale-[0.98] ${
                isDarkMode
                  ? 'border-[#ece5de]/20 bg-[#1a1410]/50 hover:bg-[#1a1410]/80'
                  : 'border-[#ddc4af]/40 bg-[#ece5de]/40 hover:bg-[#ece5de]/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🗂️</span>
                <div>
                  <div className={`font-semibold text-sm mb-1 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    Clear health data only
                  </div>
                  <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-[#ece5de]/55' : 'text-[#8d654c]/60'}`}>
                    Deletes all check-ins, journals, game scores and daily logs. Keeps your preferences and account intact — you stay logged in.
                  </div>
                </div>
              </div>
            </button>

            {/* Option 2 — Full reset */}
            <button
              onClick={handleFullReset}
              className="w-full p-4 rounded-2xl text-left mb-4 border-2 border-red-300/60 bg-red-50/60 hover:bg-red-50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">🔄</span>
                <div>
                  <div className="font-semibold text-sm mb-1 text-red-600">
                    Full reset — fresh install
                  </div>
                  <div className="text-xs text-red-500/80 leading-relaxed">
                    Deletes everything including onboarding, preferences and account. App restarts completely as if newly installed.
                  </div>
                </div>
              </div>
            </button>

            {/* Cancel */}
            <button
              onClick={() => setShowClearDataModal(false)}
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98] ${
                isDarkMode ? 'bg-[#ece5de]/10 text-[#ece5de]/70' : 'bg-[#8d654c]/10 text-[#8d654c]/70'
              }`}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}