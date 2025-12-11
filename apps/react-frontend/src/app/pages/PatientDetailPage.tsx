import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatients, useBiomarkers, BiomarkerCategory, useAnalysis, useLiveUpdates, BiomarkerUpdateEvent } from '../../api';
import type { BiomarkersResponse } from '../../api/types';
import { getStatusColor, formatDate } from '../../utils/styling';
import { BiomarkerChart } from '../components/BiomarkerChart';
import { AnalysisModal } from '../components/AnalysisModal';

const CATEGORIES: BiomarkerCategory[] = ['metabolic', 'cardiovascular', 'hormonal'];

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<BiomarkerCategory | null>(null);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [liveUpdatesEnabled, setLiveUpdatesEnabled] = useState(false);
  const [updatedBiomarkerIds, setUpdatedBiomarkerIds] = useState<Set<string>>(new Set());
  const [displayData, setDisplayData] = useState<BiomarkersResponse | null>(null);

  const { patients } = usePatients();
  const { data, loading, error } = useBiomarkers(patientId || '', selectedCategory || undefined);
  const { analysis, loading: analysisLoading, error: analysisError, fetchAnalysis } = useAnalysis(patientId || '');

  // Sync hook data to display data when it changes
  useEffect(() => {
    if (data) {
      setDisplayData(data);
    }
  }, [data]);

  // Use live updates hook
  const { isConnected } = useLiveUpdates({
    patientId: patientId || '',
    enabled: liveUpdatesEnabled,
    onUpdate: (event: BiomarkerUpdateEvent) => {
      // Update biomarker values in the display state
      setDisplayData((prevData: BiomarkersResponse | null) => {
        if (!prevData) return prevData;
        return {
          ...prevData,
          biomarkers: prevData.biomarkers.map((biomarker) => {
            const update = event.updates.find(u => u.id === biomarker.id);
            return update ? { ...biomarker, value: update.value } : biomarker;
          })
        };
      });
      
      // Highlight recently updated biomarkers
      const ids = new Set(event.updates.map(u => u.id));
      setUpdatedBiomarkerIds(ids);
      
      // Clear highlight after 2 seconds
      setTimeout(() => {
        setUpdatedBiomarkerIds(new Set());
      }, 2000);
    }
  });

  const handleGetAnalysis = async () => {
    await fetchAnalysis();
  };

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Patient not found</p>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === patientId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <p className="text-slate-400">Loading biomarkers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-400 hover:text-blue-300 font-medium mb-4 flex items-center gap-2 transition-colors"
          >
            ← Back to Patients
          </button>
          {patient && (
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">{patient.name}</h1>
              <div className="text-slate-300 space-y-1">
                <p>📅 DOB: {formatDate(patient.dateOfBirth)}</p>
                <p>🏥 Last Visit: {formatDate(patient.lastVisit)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 border border-indigo-500">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🔍</span> Filter by Category
          </h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-white text-indigo-600 shadow-lg scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  selectedCategory === category
                    ? 'bg-white text-indigo-600 shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* AI Insights Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (!showAIInsights) {
                handleGetAnalysis();
              }
              setShowAIInsights(!showAIInsights);
            }}
            disabled={analysisLoading}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-emerald-400 disabled:to-teal-500 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg disabled:shadow-none"
          >
            {analysisLoading ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                Analyzing biomarkers...
              </>
            ) : showAIInsights ? (
              <>
                <span>✕</span> Close AI Insights
              </>
            ) : (
              <>
                <span>✨</span> Get AI Insights
              </>
            )}
          </button>
        </div>

        {/* Live Updates Toggle */}
        <div className="mb-8 flex items-center gap-4">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-lg p-4 border border-cyan-500 flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div>
                <h3 className="text-white font-bold">Live Updates</h3>
                <p className="text-cyan-100 text-xs">Real-time biomarker changes</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={() => setLiveUpdatesEnabled(!liveUpdatesEnabled)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${
                liveUpdatesEnabled
                  ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                  : 'bg-gray-400'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  liveUpdatesEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-cyan-400">
              <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-white text-xs font-medium">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Biomarkers Chart */}
        {displayData && displayData.biomarkers.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl shadow-lg p-6 mb-8 border border-white/20 backdrop-blur-lg">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>📈</span> Biomarker Visualization
            </h2>
            <BiomarkerChart biomarkers={displayData.biomarkers} />
          </div>
        )}

        {/* Biomarkers Table */}
        <div className="bg-white/5 rounded-xl shadow-lg overflow-hidden border border-white/20 backdrop-blur-lg">
          <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🧬</span> Biomarkers {selectedCategory && `(${selectedCategory})`}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">Value</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">
                    Reference Range
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-white">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayData?.biomarkers.map((biomarker) => (
                  <tr
                    key={biomarker.id}
                    className={`border-b border-white/10 transition-all ${
                      updatedBiomarkerIds.has(biomarker.id)
                        ? 'bg-emerald-500/30 hover:bg-emerald-500/40'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-white font-medium">
                      {biomarker.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {biomarker.value} {biomarker.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {biomarker.referenceRange.min} - {biomarker.referenceRange.max}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          biomarker.status
                        )}`}
                      >
                        {biomarker.status.charAt(0).toUpperCase() + biomarker.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 capitalize">
                      {biomarker.category}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayData?.biomarkers.length === 0 && (
            <div className="px-6 py-8 text-center text-slate-400">
              No biomarkers found for the selected category
            </div>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      <AnalysisModal
        isOpen={showAIInsights}
        onClose={() => setShowAIInsights(false)}
        analysis={analysis?.analysis || null}
        isLoading={analysisLoading}
        error={analysisError}
      />
    </div>
  );
}
