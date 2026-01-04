import React, { useState, useMemo } from 'react';
import { X, Star } from 'lucide-react';
import { INITIAL_SCHEMES } from '../../data/mockData';

const SchemeSelectionModal = ({ isOpen, patient, currentSchemeId, onSelectScheme, onClose }) => {
    const [selectedId, setSelectedId] = useState(currentSchemeId || null);
    const [filter, setFilter] = useState('all');

    const recommendedSchemes = useMemo(() => {
        if (!patient) return [];
        // Mock recommendation logic
        return INITIAL_SCHEMES.filter(s => {
            if (patient.age < 12 && s.tags?.includes('儿童')) return true;
            if (patient.age >= 12 && s.tags?.includes('青少年')) return true;
            if (patient.age >= 18 && s.tags?.includes('成人')) return true;
            return false;
        }).slice(0, 2);
    }, [patient]);

    const filteredSchemes = useMemo(() => {
        let schemes = [...INITIAL_SCHEMES];
        // Move recommended to the top
        schemes = schemes.sort((a, b) => {
            const aIsRecommended = recommendedSchemes.some(rs => rs.id === a.id);
            const bIsRecommended = recommendedSchemes.some(rs => rs.id === b.id);
            if (aIsRecommended && !bIsRecommended) return -1;
            if (!aIsRecommended && bIsRecommended) return 1;
            return 0;
        });
        if (filter !== 'all') {
            return schemes.filter(s => s.type === filter);
        }
        return schemes;
    }, [filter, recommendedSchemes]);

    const selectedSchemeDetails = useMemo(() => {
        return INITIAL_SCHEMES.find(s => s.id === selectedId);
    }, [selectedId]);

    if (!isOpen || !patient) return null;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg w-[900px] h-[70vh] shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">选择训练方案</h3>
                        <p className="text-sm text-gray-400">为患者 <span className="font-bold text-blue-400">{patient.name}</span> ( {patient.age}岁, {patient.diagnosis} ) 选择一个方案</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="flex flex-1 min-h-0">
                    <div className="w-1/3 border-r border-gray-800 flex flex-col">
                        <div className="p-3 border-b border-gray-800">
                            <div className="flex gap-2 text-xs">{['all', '被动训练', '主动训练', '混合训练'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full ${filter === f ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>{f === 'all' ? '全部' : f}</button>))}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {filteredSchemes.map(scheme => {
                                const isRecommended = recommendedSchemes.some(rs => rs.id === scheme.id);
                                return (
                                    <div key={scheme.id} onClick={() => setSelectedId(scheme.id)} className={`p-3 border-b border-gray-800/50 cursor-pointer ${selectedId === scheme.id ? 'bg-blue-900/30' : ''} ${scheme.isPreset ? 'hover:bg-purple-900/10' : 'hover:bg-blue-900/10'}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`font-bold text-sm ${selectedId === scheme.id ? 'text-white' : 'text-gray-300'}`}>{scheme.name}</span>
                                            {isRecommended && <span className="text-yellow-400 flex items-center gap-1 text-xs"><Star size={12} fill="currentColor"/> 推荐</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">{scheme.type}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="w-2/3 flex flex-col p-4">
                        {selectedSchemeDetails ? (
                            <>
                                <h4 className="text-lg font-bold text-white">{selectedSchemeDetails.name}</h4>
                                <p className="text-sm text-gray-400 mt-1">{selectedSchemeDetails.description}</p>
                                <div className="mt-4 text-xs text-gray-500">
                                    <p>类型: {selectedSchemeDetails.type}</p>
                                    <p>标签: {selectedSchemeDetails.tags?.join(', ')}</p>
                                </div>
                                <div className="mt-4 flex-1 border border-gray-700 rounded-lg bg-[#0b0e14] p-2 overflow-y-auto custom-scrollbar">
                                    <p className="text-sm font-bold text-gray-300 mb-2">参数概览 (第一阶段):</p>
                                    <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{JSON.stringify(selectedSchemeDetails.stages[1].slice(0, 5), null, 2)}</pre>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">请从左侧选择一个方案查看详情</div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
                    <button onClick={() => onSelectScheme(selectedSchemeDetails)} disabled={!selectedId} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold disabled:bg-gray-500">确认方案</button>
                </div>
            </div>
        </div>
    );
};

export default SchemeSelectionModal;
