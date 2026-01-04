import React from 'react';
// import { AlertCircle, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, content, onConfirm, onCancel, confirmText = "确认", cancelText = "取消", isDanger = false }) => {
	if (!isOpen) return null;
	return (
		<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-96 shadow-2xl animate-in zoom-in-95 duration-200">
				<div className="flex items-center gap-3 mb-4">
					{/* {isDanger ? <AlertCircle size={28} className="text-red-500" /> : <AlertTriangle size={28} className="text-yellow-500" />} */}
                    <span className="text-2xl">{isDanger ? '⚠️' : '❓'}</span>
					<h3 className="text-xl font-bold text-white">{title}</h3>
				</div>
				<p className="text-gray-400 mb-6 text-sm leading-relaxed">{content}</p>
				<div className="flex justify-end gap-3">
					<button onClick={onCancel} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors">{cancelText}</button>
					<button onClick={onConfirm} className={`px-4 py-2 rounded text-white text-sm font-bold transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
