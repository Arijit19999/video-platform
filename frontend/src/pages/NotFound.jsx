import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-700">404</p>
        <h1 className="text-2xl font-bold text-white mt-4">Page Not Found</h1>
        <p className="text-gray-400 mt-2 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <Film size={20} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
