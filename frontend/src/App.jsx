import { AuthProvider} from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import VideoUpload from './components/video/VideoUpload';
import VideoList from './components/video/VideoList';

// function Dashboard() {
//   const { user, logout } = useAuth();
//   const [refreshKey, setRefreshKey] = useState(0);

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
//         <h1 className="text-xl font-bold">Video Platform</h1>

//         <div className="flex items-center gap-4">
//           <span className="text-sm text-gray-600">
//             {user.email} ({user.role})
//           </span>
//           <button
//             onClick={logout}
//             className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <main className="p-6 max-w-7xl mx-auto">
//         {(user.role === 'editor' || user.role === 'admin') && (
//           <VideoUpload onUploadComplete={() => setRefreshKey(k => k + 1)} />
//         )}

//         <VideoList refresh={refreshKey} />
//       </main>
//     </div>
//   );
// }

function Dashboard() {
  const { user, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            Video Platform
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user.email} ({user.role})
            </span>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-1.5 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {(user.role === 'editor' || user.role === 'admin') && (
          <VideoUpload onUploadComplete={() => setRefreshKey(k => k + 1)} />
        )}

        <VideoList refresh={refreshKey} />
      </main>
    </div>
  );
}


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthForm />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
