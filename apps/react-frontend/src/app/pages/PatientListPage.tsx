import { Link } from 'react-router-dom';
import { usePatients } from '../../api';
import { formatDate } from '../../utils/styling';

export function PatientListPage() {
  const { patients, loading, error } = usePatients();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-lg text-slate-400 flex items-center gap-3">
          <div className="animate-spin">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
          </div>
          Loading patients...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-red-300 text-lg">
          ❌ Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            🏥 Healthcare Biomarker System
          </h1>
          <p className="text-slate-300 text-lg">
            Select a patient to view their biomarkers and get AI-powered health insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Link
              key={patient.id}
              to={`/patient/${patient.id}`}
              className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-indigo-400/50 backdrop-blur-lg p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 transform hover:scale-105"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600/0 to-purple-600/0 group-hover:from-indigo-600/10 group-hover:to-purple-600/10 transition-all duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {patient.name}
                  </h2>
                  <span className="text-2xl">👤</span>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                    <span className="text-lg">📅</span>
                    <div>
                      <span className="font-semibold text-slate-200">DOB:</span> {formatDate(patient.dateOfBirth)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 group-hover:text-slate-200 transition-colors">
                    <span className="text-lg">🏥</span>
                    <div>
                      <span className="font-semibold text-slate-200">Last Visit:</span> {formatDate(patient.lastVisit)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">
                  <span>View Details</span>
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>

        {patients.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-slate-400 text-lg">No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
}
