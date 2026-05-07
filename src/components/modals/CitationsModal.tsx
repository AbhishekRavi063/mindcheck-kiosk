import { X, BookOpen, FlaskConical } from 'lucide-react';
import { motion } from 'motion/react';

interface CitationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export function CitationsModal({ isOpen, onClose, isDarkMode = false }: CitationsModalProps) {
  if (!isOpen) return null;

  const citations = {
    questionnaires: [
      {
        name: 'PHQ-9 (Patient Health Questionnaire-9)',
        description: 'A 9-item depression screening questionnaire',
        citation: 'Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606-613.',
        doi: 'https://doi.org/10.1046/j.1525-1497.2001.016009606.x'
      },
      {
        name: 'GAD-7 (Generalized Anxiety Disorder-7)',
        description: 'A 7-item anxiety screening questionnaire',
        citation: 'Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: The GAD-7. Archives of Internal Medicine, 166(10), 1092-1097.',
        doi: 'https://doi.org/10.1001/archinte.166.10.1092'
      },
      {
        name: 'PSS-10 (Perceived Stress Scale)',
        description: 'A 10-item psychological instrument for measuring perceived stress',
        citation: 'Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of perceived stress. Journal of Health and Social Behavior, 24(4), 385-396.',
        doi: 'https://doi.org/10.2307/2136404'
      },
      {
        name: 'RSES (Rosenberg Self-Esteem Scale)',
        description: 'A 10-item scale measuring global self-esteem',
        citation: 'Rosenberg, M. (1965). Society and the adolescent self-image. Princeton, NJ: Princeton University Press.',
        doi: null
      }
    ],
    cognitiveGames: [
      {
        name: 'Go/No-Go Task',
        description: 'Measures response inhibition and impulse control',
        citation: 'Donders, F. C. (1969). On the speed of mental processes. Acta Psychologica, 30, 412-431. (Original work published 1868). Modern implementation based on: Bezdjian, S., Baker, L. A., Lozano, D. I., & Raine, A. (2009). Assessing inattention and impulsivity in children during the Go/NoGo task. British Journal of Developmental Psychology, 27(2), 365-383.',
        doi: 'https://doi.org/10.1348/026151008X314919'
      },
      {
        name: 'Attention Task (Continuous Performance Test)',
        description: 'Measures sustained attention and vigilance',
        citation: 'Rosvold, H. E., Mirsky, A. F., Sarason, I., Bransome, E. D., & Beck, L. H. (1956). A continuous performance test of brain damage. Journal of Consulting Psychology, 20(5), 343-350.',
        doi: 'https://doi.org/10.1037/h0043220'
      },
      {
        name: 'Memory Game (Working Memory Task)',
        description: 'Assesses visual working memory capacity',
        citation: 'Based on: Luck, S. J., & Vogel, E. K. (1997). The capacity of visual working memory for features and conjunctions. Nature, 390(6657), 279-281.',
        doi: 'https://doi.org/10.1038/36846'
      },
      {
        name: 'Counting Task (Processing Speed)',
        description: 'Measures attention, processing speed, and numerical cognition',
        citation: 'Based on: Salthouse, T. A. (1996). The processing-speed theory of adult age differences in cognition. Psychological Review, 103(3), 403-428.',
        doi: 'https://doi.org/10.1037/0033-295X.103.3.403'
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
          isDarkMode 
            ? 'bg-[#2a2a2a] text-[#e0e0e0]' 
            : 'bg-[#ece5de] text-[#8d654c]'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
          isDarkMode ? 'border-[#3a3a3a] bg-[#2a2a2a]' : 'border-[#ddc4af] bg-[#ece5de]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                isDarkMode ? 'bg-[#3a3a3a]' : 'bg-[#ddc4af]'
              }`}>
                <BookOpen className="w-5 h-5" style={{ color: '#ffb757' }} />
              </div>
              <h2 className="text-xl font-semibold">Scientific Citations</h2>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode 
                  ? 'hover:bg-[#3a3a3a]' 
                  : 'hover:bg-[#ddc4af]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 py-4">
          {/* Questionnaires Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5" style={{ color: '#ffb757' }} />
              <h3 className="text-lg font-semibold">Clinical Questionnaires</h3>
            </div>
            
            <div className="space-y-4">
              {citations.questionnaires.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl ${
                    isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white/60'
                  }`}
                >
                  <h4 className="font-semibold mb-1" style={{ color: '#ffb757' }}>
                    {item.name}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? 'text-[#b0b0b0]' : 'text-[#8d654c]/80'
                  }`}>
                    {item.description}
                  </p>
                  <p className={`text-xs mb-2 ${
                    isDarkMode ? 'text-[#c0c0c0]' : 'text-[#8d654c]'
                  }`}>
                    {item.citation}
                  </p>
                  {item.doi && (
                    <a
                      href={item.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#ffb757' }}
                    >
                      DOI Link →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Cognitive Games Section */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-5 h-5" style={{ color: '#ffb757' }} />
              <h3 className="text-lg font-semibold">Cognitive Assessment Tasks</h3>
            </div>
            
            <div className="space-y-4">
              {citations.cognitiveGames.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl ${
                    isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white/60'
                  }`}
                >
                  <h4 className="font-semibold mb-1" style={{ color: '#ffb757' }}>
                    {item.name}
                  </h4>
                  <p className={`text-sm mb-2 ${
                    isDarkMode ? 'text-[#b0b0b0]' : 'text-[#8d654c]/80'
                  }`}>
                    {item.description}
                  </p>
                  <p className={`text-xs mb-2 ${
                    isDarkMode ? 'text-[#c0c0c0]' : 'text-[#8d654c]'
                  }`}>
                    {item.citation}
                  </p>
                  {item.doi && (
                    <a
                      href={item.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium hover:underline"
                      style={{ color: '#ffb757' }}
                    >
                      DOI Link →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`p-4 rounded-2xl mt-6 ${
            isDarkMode ? 'bg-[#1e1e1e]' : 'bg-white/60'
          }`}>
            <p className={`text-xs ${
              isDarkMode ? 'text-[#b0b0b0]' : 'text-[#8d654c]/80'
            }`}>
              <strong>Disclaimer:</strong> MindCheck uses validated clinical instruments and cognitive tasks for mental wellness tracking. These assessments are for self-monitoring purposes only and should not replace professional mental health evaluation or diagnosis. If you're experiencing mental health concerns, please consult with a qualified healthcare professional.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
