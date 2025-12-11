import React from 'react';

interface BiomarkerAnalysis {
  biomarkerId: string;
  name: string;
  value: number;
  status: 'normal' | 'high' | 'low';
  riskLevel: string;
  explanation: string;
  recommendations: string[];
}

interface MonitoringPriority {
  biomarkerId: string;
  name: string;
  priority: 'high' | 'medium' | 'low' | string;
  reason: string;
  actionItems: string[];
}

interface HealthSummary {
  patientId: string;
  patientName: string;
  overallRiskLevel: string;
  keyFindings: string[];
  concerningBiomarkers: string[];
  recommendations: string[];
  nextSteps: string[];
}

interface AnalysisDisplayProps {
  analysis: {
    analyzeBiomarkers: unknown;
    suggestMonitoringPriorities: unknown;
    generateHealthSummary: unknown;
  };
}

function getRiskLevelColor(level: string | undefined): string {
  if (!level) return 'text-gray-600';
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('high')) return 'text-red-600';
  if (lowerLevel.includes('moderate')) return 'text-yellow-600';
  return 'text-green-600';
}

function getRiskLevelBgColor(level: string | undefined): string {
  if (!level) return 'bg-gradient-to-br from-gray-50 to-gray-100 border-l-4 border-gray-400';
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('high') || lowerLevel.includes('critical')) {
    return 'bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-600';
  }
  if (lowerLevel.includes('moderate')) {
    return 'bg-gradient-to-br from-amber-50 to-orange-50 border-l-4 border-amber-600';
  }
  return 'bg-gradient-to-br from-emerald-50 to-green-50 border-l-4 border-green-600';
}

function getPriorityColor(priority: string | undefined): string {
  if (!priority) return 'text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400';
  const lower = priority.toLowerCase();
  if (lower === 'high' || lower === 'critical') {
    return 'text-red-700 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-600';
  }
  if (lower === 'medium') {
    return 'text-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-600';
  }
  return 'text-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-600';
}

function getStatusBgColor(status: string): string {
  if (status === 'high') return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-900';
  if (status === 'low') return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900';
  return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-900';
}

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  const biomarkerAnalysis = (analysis.analyzeBiomarkers as BiomarkerAnalysis[]) || [];
  const monitoringPriorities = (analysis.suggestMonitoringPriorities as MonitoringPriority[]) || [];
  const healthSummary = analysis.generateHealthSummary as HealthSummary;

  if (!healthSummary || !healthSummary.overallRiskLevel) {
    return <div className="text-gray-500">No health summary available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Health Summary */}
      {healthSummary && (
        <div className={`rounded-xl p-6 border-2 shadow-md hover:shadow-lg transition-shadow ${getRiskLevelBgColor(healthSummary.overallRiskLevel)}`}>
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0 animate-pulse">
              {(healthSummary.overallRiskLevel || '').toLowerCase().includes('high') || (healthSummary.overallRiskLevel || '').toLowerCase().includes('critical')
                ? '⚠️'
                : (healthSummary.overallRiskLevel || '').toLowerCase().includes('moderate')
                ? '⚡'
                : '✅'}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Health Summary</h3>
              <p className={`font-bold text-lg mb-4 ${getRiskLevelColor(healthSummary.overallRiskLevel)}`}>
                Overall Risk Level: {healthSummary.overallRiskLevel || 'Unknown'}
              </p>
              
              {healthSummary.keyFindings?.length > 0 && (
                <div className="mb-4 bg-white/60 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🔍</span> Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {healthSummary.keyFindings.map((finding, idx) => (
                      <li key={idx} className="text-gray-800 flex items-start gap-2">
                        <span className="text-lg flex-shrink-0 mt-0.5">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {healthSummary.recommendations?.length > 0 && (
                <div className="mb-4 bg-white/60 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💊</span> Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {healthSummary.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-800 flex items-start gap-2">
                        <span className="text-lg flex-shrink-0 mt-0.5">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {healthSummary.nextSteps?.length > 0 && (
                <div className="bg-white/60 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📋</span> Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {healthSummary.nextSteps.map((step, idx) => (
                      <li key={idx} className="text-gray-800 flex items-start gap-2">
                        <span className="text-lg flex-shrink-0 mt-0.5">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monitoring Priorities */}
      {monitoringPriorities.length > 0 && (
        <div className="rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow bg-white/80">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <h3 className="text-lg font-bold text-white">Monitoring Priorities</h3>
              <p className="text-purple-100 text-xs">Key biomarkers requiring attention</p>
            </div>
          </div>
          
          <div className="space-y-3 p-6">
            {monitoringPriorities.map((priority) => (
              <div
                key={priority.biomarkerId}
                className={`rounded-lg p-4 border-2 transition-all hover:shadow-md ${getPriorityColor(priority.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-lg">{priority.name}</h4>
                  </div>
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    (priority.priority || '').toLowerCase() === 'high' || (priority.priority || '').toLowerCase() === 'critical'
                      ? 'bg-red-500 text-white'
                      : (priority.priority || '').toLowerCase() === 'medium'
                      ? 'bg-amber-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}>
                    {priority.priority || 'N/A'}
                  </span>
                </div>
                <p className="text-base font-medium mb-3">{priority.reason}</p>
                {priority.actionItems?.length > 0 && (
                  <div className="bg-white/50 rounded p-3">
                    <p className="text-xs font-bold uppercase text-gray-900 mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {priority.actionItems.map((item, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-lg flex-shrink-0">⚡</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biomarker Analysis */}
      {biomarkerAnalysis.length > 0 && (
        <div className="rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow bg-white/80">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-lg font-bold text-white">Detailed Biomarker Analysis</h3>
              <p className="text-blue-100 text-xs">Individual markers with insights</p>
            </div>
          </div>
          
          <div className="space-y-3 p-6">
            {biomarkerAnalysis.map((marker) => (
              <div key={marker.biomarkerId} className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white/50 hover:bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{marker.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Value: <span className="font-bold text-gray-900">{marker.value}</span>
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold ${
                      marker.status === 'normal'
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-900'
                        : marker.status === 'high'
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-900'
                        : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-900'
                    }`}>
                      {marker.status.charAt(0).toUpperCase() + marker.status.slice(1)}
                    </span>
                    <p className={`text-xs font-bold ${getRiskLevelColor(marker.riskLevel)}`}>
                      {marker.riskLevel} Risk
                    </p>
                  </div>
                </div>
                
                <p className="text-base text-gray-800 mb-4 leading-relaxed">{marker.explanation}</p>
                
                {marker.recommendations?.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border-l-4 border-indigo-400">
                    <p className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>💡</span> Recommendations
                    </p>
                    <ul className="space-y-2">
                      {marker.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                          <span className="text-base flex-shrink-0 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
