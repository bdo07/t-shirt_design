import { motion, AnimatePresence } from 'framer-motion';
import { X, FileImage, FileText, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ExportFormat } from '../hooks/useExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  exportError: string | null;
}

const FORMAT_OPTIONS: { format: ExportFormat; label: string; description: string; icon: typeof FileImage }[] = [
  {
    format: 'png',
    label: 'PNG',
    description: 'Transparent background, best for web & print',
    icon: FileImage,
  },
  {
    format: 'jpg',
    label: 'JPG',
    description: 'White background, smaller file size',
    icon: FileImage,
  },
  {
    format: 'pdf',
    label: 'PDF',
    description: 'Print-ready document format',
    icon: FileText,
  },
];

export function ExportModal({ isOpen, onClose, onExport, isExporting, exportError }: ExportModalProps) {
  const { isDark } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl shadow-2xl border ${
              isDark
                ? 'bg-zinc-900 border-zinc-700'
                : 'bg-white border-zinc-200'
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-zinc-700' : 'border-zinc-100'}`}>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  Export Design
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Choose your preferred file format
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Format Options */}
            <div className="p-6 space-y-3">
              {FORMAT_OPTIONS.map(({ format, label, description, icon: Icon }) => (
                <button
                  key={format}
                  onClick={() => onExport(format)}
                  disabled={isExporting}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'border-zinc-700 hover:border-indigo-500 hover:bg-zinc-800/50'
                      : 'border-zinc-200 hover:border-indigo-500 hover:bg-indigo-50/50'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${
                    isDark
                      ? 'bg-zinc-800 group-hover:bg-indigo-900/50'
                      : 'bg-zinc-100 group-hover:bg-indigo-100'
                  }`}>
                    <Icon size={22} className={`transition-colors ${
                      isDark
                        ? 'text-zinc-400 group-hover:text-indigo-400'
                        : 'text-zinc-500 group-hover:text-indigo-600'
                    }`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      {label}
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {description}
                    </div>
                  </div>
                  <Download size={16} className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                    isDark ? 'text-indigo-400' : 'text-indigo-600'
                  }`} />
                </button>
              ))}
            </div>

            {/* Loading / Error State */}
            {isExporting && (
              <div className={`px-6 pb-4`}>
                <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-zinc-800' : 'bg-indigo-50'}`}>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                  <span className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    Generating your file...
                  </span>
                </div>
              </div>
            )}

            {exportError && (
              <div className="px-6 pb-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {exportError}
                  </span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className={`p-6 pt-0`}>
              <p className={`text-[11px] text-center ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                The entire T-shirt preview will be captured and exported at 2× resolution
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
