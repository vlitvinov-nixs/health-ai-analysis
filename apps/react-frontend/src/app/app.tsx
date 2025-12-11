import { Route, Routes, Link } from 'react-router-dom';
import { PatientListPage } from './pages/PatientListPage';
import { PatientDetailPage } from './pages/PatientDetailPage';

export function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Healthcare Biomarker Dashboard
          </Link>
        </div>
      </header>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<PatientListPage />} />
        <Route path="/patient/:patientId" element={<PatientDetailPage />} />
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600 mb-4">Page not found</p>
                <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                  Go back to patients
                </Link>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;


