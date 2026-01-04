import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import { INITIAL_SCHEMES } from '../../data/mockData';

const SchemeSelectModal = ({ isOpen, patient, onSelect, onCancel }) => {
	const [selectedSchemeId, setSelectedSchemeId] = useState(null);
	
	useEffect(() => {
		// 默认选中推荐方案或第一个方案
		if (isOpen) {
			const recommendedId = (() => {
				const diag = patient?.diagnosis || '';
				if (patient?.age <= 12 && diag.includes('孤独症')) return 'S001';
				if (patient?.age <= 12 && diag.includes('语言')) return 'S004';
				if (patient?.age > 18 && diag.includes('听觉')) return 'S005';
				return INITIAL_SCHEMES[0]?.id || null;
			})();
			setSelectedSchemeId(recommendedId);
		}
	}, [isOpen, patient]);

	if (!isOpen || !patient) return null;

	const recommendedSchemeId = (() => {
		const diag = patient.diagnosis || '';
		if (patient.age <= 12 && diag.includes('孤独症')) return 'S001';
		if (patient.age <= 12 && diag.includes('语言')) return 'S004';
		if (patient.age > 18 && diag.includes('听觉')) return 'S005';
		return null;
	})();

	const handleConfirm = () => {
		if (selectedSchemeId) {
			const scheme = INITIAL_SCHEMES.find(s => s.id === selectedSchemeId);
			onSelect(scheme);
		}
	};

	return (
		<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-[#1a1d26] border border-gray-700 rounded-lg w-[800px] h-[600px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
				<div className="p-6 border-b border-gray-700 flex justify-between items-start shrink-0">
					<div>
						<h3 className="text-xl font-bold text-white mb-2">选择训练方案</h3>
						<div className="flex items-center gap-4 text-sm text-gray-400">
							<span className="text-white font-bold">{patient.name}</span>
							<span>{patient.gender === 'male' ? '男' : '女'} {patient.age}岁</span>
							<span className="bg-gray-800 px-2 py-0.5 rounded text-xs">{patient.diagnosis}</span>
						</div>
					</div>
					<button onClick={onCancel}><X className="text-gray-400 hover:text-white" /></button>
				</div>

				<div className="flex-1 flex overflow-hidden">
					<div className="w-1/3 border-r border-gray-700 overflow-y-auto custom-scrollbar p-2">
						<div className="space-y-2">
							{INITIAL_SCHEMES.map(scheme => {
								const isRecommended = scheme.id === recommendedSchemeId;
								return (
									<div 
										key={scheme.id}
										onClick={() => setSelectedSchemeId(scheme.id)}
										className={`p-3 rounded-lg cursor-pointer border transition-all relative ${selectedSchemeId === scheme.id ? 'bg-blue-900/20 border-blue-500' : 'bg-[#0f1219] border-gray-800 hover:border-gray-600'}`}
									>
										{isRecommended && (
											<div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-yellow-500 bg-yellow-900/20 px-1.5 py-0.5 rounded border border-yellow-500/30">
												<Star size={10} fill="currentColor" /> 推荐
											</div>
										)}
										<div className={`font-medium text-sm mb-1 ${selectedSchemeId === scheme.id ? 'text-white' : 'text-gray-300'}`}>{scheme.name}</div>
										<div className="flex justify-between items-center text-xs">
											<span className={`px-1.5 py-0.5 rounded border ${scheme.isPreset ? 'text-purple-400 border-purple-900/30 bg-purple-900/10' : 'text-green-400 border-green-900/30 bg-green-900/10'}`}>
												{scheme.isPreset ? '预置' : '自定义'}
											</span>
											<span className="text-gray-500">{scheme.type}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
						{selectedSchemeId ? (
							<div className="space-y-6">
								<div>
									<h4 className="text-lg font-bold text-white mb-2">{INITIAL_SCHEMES.find(s => s.id === selectedSchemeId)?.name}</h4>
									<p className="text-gray-400 text-sm leading-relaxed">{INITIAL_SCHEMES.find(s => s.id === selectedSchemeId)?.description}</p>
								</div>
								<div className="grid grid-cols-2 gap-4">
									 <div className="bg-[#0f1219] p-4 rounded border border-gray-800">
										<div className="text-xs text-gray-500 mb-1">训练阶段</div>
										<div className="text-white font-mono">3 阶段</div>
									 </div>
									 <div className="bg-[#0f1219] p-4 rounded border border-gray-800">
										<div className="text-xs text-gray-500 mb-1">总次数</div>
										<div className="text-white font-mono">60 次</div>
									 </div> 
								</div>
							</div>
						) : (
							<div className="flex items-center justify-center h-full text-gray-500 text-sm">请选择左侧方案查看详情</div>
						)}
					</div>
				</div>

				<div className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-[#13161f] shrink-0">
					<button onClick={onCancel} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
					<button 
						onClick={handleConfirm}
						disabled={!selectedSchemeId}
						className={`px-6 py-2 rounded text-white text-sm font-bold shadow-lg transition-all ${selectedSchemeId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 cursor-not-allowed text-gray-400'}`}
					>
						确认方案
					</button>
				</div>
			</div>
		</div>
	);
};

export default SchemeSelectModal;
