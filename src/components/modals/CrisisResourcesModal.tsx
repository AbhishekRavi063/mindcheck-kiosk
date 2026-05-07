import { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Phone, MessageCircle, ExternalLink, Heart, Calendar } from 'lucide-react';
import { logUserActivity } from '../../utils/firebaseSync';

interface CrisisResourcesModalProps {
  onClose?: () => void;
  onContinue?: () => void;
  isDarkMode: boolean;
}

export function CrisisResourcesModal({ onClose, onContinue, isDarkMode }: CrisisResourcesModalProps) {
  useEffect(() => {
    logUserActivity('support_resources_viewed');
  }, []);

  const handleClose = () => {
    if (onContinue) onContinue();
    if (onClose) onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className={`sticky top-0 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} z-10 flex items-center justify-between p-4`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ffb757] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Support Resources
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`w-8 h-8 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <X className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 space-y-4">
          {/* Institute Support */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} px-1`}>
              Institute Support
            </h4>

            {/* CMHW */}
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#ffb757]/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-[#ffb757]" />
                </div>
                <div className="flex-1">
                  <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                    Center For Mental Health and Wellbeing (CMHW)
                  </h5>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                    IIT Kanpur — Professional counseling and mental health support available on campus.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <a
                  href="https://www.iitk.ac.in/counsel/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 ${isDarkMode ? 'bg-[#1a1410] border-[#ddc4af]/20' : 'bg-[#ece5de] border-[#ddc4af]/40'} border rounded-xl font-medium text-sm ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-[0.98] transition-transform flex items-center justify-center gap-2`}
                >
                  <Calendar className="w-4 h-4" />
                  Book an Appointment
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
                <a
                  href="tel:+915122597784"
                  className={`w-full py-3 ${isDarkMode ? 'bg-[#1a1410] border-[#ddc4af]/20' : 'bg-[#ece5de] border-[#ddc4af]/40'} border rounded-xl font-medium text-sm ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-[0.98] transition-transform flex items-center justify-between px-4`}
                >
                  <div className="flex flex-col items-start gap-0.5">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>Talk to a Counsellor</span>
                    </div>
                    <span className="text-xs opacity-60 ml-6">Mon-Fri, 10AM-9PM</span>
                  </div>
                  <span className="text-xs opacity-70">+91 512 2597784</span>
                </a>
              </div>
            </div>

            {/* Health Center Emergency */}
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                    Health Center Emergency
                  </h5>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    IIT Kanpur Campus - 24/7 Emergency
                  </p>
                </div>
                <Phone className="w-4 h-4 text-[#ffb757] flex-shrink-0 mt-1" />
              </div>
              <div className="flex flex-wrap gap-2">
                <a href="tel:7777" className={`px-3 py-1.5 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-lg text-xs font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-95 transition-transform`}>
                  7777
                </a>
                <a href="tel:7666" className={`px-3 py-1.5 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-lg text-xs font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-95 transition-transform`}>
                  7666
                </a>
                <a href="tel:2222" className={`px-3 py-1.5 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-lg text-xs font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-95 transition-transform`}>
                  2222
                </a>
                <a href="tel:2228" className={`px-3 py-1.5 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-lg text-xs font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-95 transition-transform`}>
                  2228
                </a>
              </div>
            </div>

            {/* YourDOST */}
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                    YourDOST
                  </h5>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    24/7 Online Counseling Platform
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:08046810938"
                  className={`flex-1 py-2.5 ${isDarkMode ? 'bg-[#1a1410] border-[#ddc4af]/20' : 'bg-[#ece5de] border-[#ddc4af]/40'} border rounded-xl text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-[0.98] transition-transform flex items-center justify-center gap-2`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  080-46810938
                </a>
                <a
                  href="https://yourdost.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-2.5 px-4 ${isDarkMode ? 'bg-[#1a1410] border-[#ddc4af]/20' : 'bg-[#ece5de] border-[#ddc4af]/40'} border rounded-xl text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-[0.98] transition-transform flex items-center justify-center gap-2`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Website
                </a>
              </div>
            </div>

            {/* Treadwill */}
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 shadow-sm`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                    Treadwill
                  </h5>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    Free online program for anxiety & depression — IIT Kanpur
                  </p>
                </div>
              </div>
              <a
                href="https://www.treadwill.org/open"
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 ${isDarkMode ? 'bg-[#1a1410] border-[#ddc4af]/20' : 'bg-[#ece5de] border-[#ddc4af]/40'} border rounded-xl text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} active:scale-[0.98] transition-transform flex items-center justify-center gap-2`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Website
              </a>
            </div>

            {/* Crisis & 24/7 Helplines heading */}
            <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} px-1 pt-2`}>
              Crisis &amp; 24/7 Helplines
            </h4>

            {/* Tele MANAS */}
            <a
              href="tel:14416"
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm`}
            >
              <div className="flex-1">
                <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                  Tele MANAS
                </h5>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  National Mental Health Helpline - 24/7
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  14416
                </span>
                <Phone className="w-4 h-4 text-[#ffb757]" />
              </div>
            </a>

            {/* KIRAN Helpline */}
            <a
              href="tel:18005990019"
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm`}
            >
              <div className="flex-1">
                <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                  KIRAN Helpline
                </h5>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  24/7 Mental Health Support
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  1800-599-0019
                </span>
                <Phone className="w-4 h-4 text-[#ffb757]" />
              </div>
            </a>

            {/* Vandrevala Foundation */}
            <a
              href="tel:1860-2662-345"
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm`}
            >
              <div className="flex-1">
                <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                  Vandrevala Foundation
                </h5>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Mental Health Helpline - 24/7
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  1860-2662-345
                </span>
                <Phone className="w-4 h-4 text-[#ffb757]" />
              </div>
            </a>

            {/* iCALL */}
            <a
              href="tel:9152987821"
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm`}
            >
              <div className="flex-1">
                <h5 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5`}>
                  iCALL
                </h5>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Psychosocial Helpline (Mon-Sat, 8AM-10PM)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  9152987821
                </span>
                <Phone className="w-4 h-4 text-[#ffb757]" />
              </div>
            </a>
          </motion.div>

          {/* Other Resources Section */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 shadow-sm`}
          >
            <h4 className={`font-semibold mb-3 text-sm ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Other resources:
            </h4>
            <ul className={`space-y-2 text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
              <li className="flex gap-2">
                <span className="text-[#ffb757] mt-0.5">•</span>
                <span><strong>National Emergency:</strong> Call 112 or go to your nearest emergency room</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#ffb757] mt-0.5">•</span>
                <span><strong>Snehi:</strong> 011-65978181 (Delhi-based crisis helpline)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#ffb757] mt-0.5">•</span>
                <span><strong>Parivarthan:</strong> +91 7676602602 (Bengaluru crisis helpline)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#ffb757] mt-0.5">•</span>
                <span>Reach out to a trusted friend, family member, or mental health professional</span>
              </li>
            </ul>
          </motion.div>

          {/* Additional Info Banner */}
          <div className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} px-4 pt-2`}>
            <p>You're not alone. Support is available whenever you need it.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}