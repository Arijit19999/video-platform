import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, confirmLabel, onConfirm, onCancel, danger }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 p-6 max-w-sm w-full shadow-xl">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          {danger && (
            <div className="p-2 rounded-full bg-red-400/10">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>

        <p className="text-gray-400 text-sm mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
