import React from 'react';
import { CheckCircle2, Download } from 'lucide-react';

// 新增模态框组件: SaveSuccessModal
const SaveSuccessModal = ({ isOpen, onClose, onExport, recordedFile }) => {
	if (!isOpen || !recordedFile) return null;

	const handleExportClick = () => {
		onClose();
		// Assuming 'recordedFile' contains the necessary info for export
		onExport(recordedFile); 
	};

	return (
		<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[450px] shadow-2xl animate-in zoom-in-95 duration-200">
				<div className="flex items-center gap-3 mb-4 text-green-500">
					<CheckCircle2 size={28} />
					<h3 className="text-xl font-bold text-white">录音已保存</h3>
				</div>
				<p className="text-gray-400 mb-6 text-sm leading-relaxed">
					录音已保存到**原始录音**文件夹。此录音需要使用 Audacity 软件进行处理后才能用于训练。
				</p>
				<p className="text-gray-500 text-xs mb-4">文件名: <span className="text-white font-mono">{recordedFile.name}</span></p>
				<div className="flex justify-end gap-3">
					<button onClick={handleExportClick} className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-bold flex items-center gap-2">
						<Download size={16}/> 立即导出到Audacity
					</button>
					<button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">
						稍后处理
					</button>
				</div>
			</div>
		</div>
	);
};

export default SaveSuccessModal;
