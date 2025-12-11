import React, { useEffect } from 'react';
import { AnalysisDisplay } from './AnalysisDisplay';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: any;
  isLoading: boolean;
  error: string | null;
}

export const AnalysisModal: React.FC<AnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  error,
}) => {
  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Health Analysis</h2>
                <p className="text-indigo-100 text-sm mt-1">Comprehensive biomarker insights</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                </div>
                <p className="text-gray-600 mt-4 font-medium">Analyzing biomarkers...</p>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600 rounded-lg p-6">
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">❌</span>
                  <div>
                    <h3 className="text-red-900 font-semibold mb-1">Analysis Error</h3>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {analysis && !isLoading && !error && (
              <AnalysisDisplay analysis={analysis} />
            )}

            {!analysis && !isLoading && !error && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-600 rounded-lg p-6">
                <div className="flex gap-4">
                  <span className="text-2xl flex-shrink-0">ℹ️</span>
                  <div>
                    <h3 className="text-indigo-900 font-semibold mb-1">Ready to analyze</h3>
                    <p className="text-indigo-700 text-sm">
                      No analysis data available. Trigger the analysis to get started.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-100 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
