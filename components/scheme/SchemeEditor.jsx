import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle } from 'lucide-react';
import { DEFAULT_STAGES } from '../../data/mockData';
import EditableCell from './EditableCell';
import ConfirmModal from '../modals/ConfirmModal';

const EditableParametersTable = ({ stageData, onParamChange, availableMusic }) => {
    const headers = ['次', '音源', '滤波', '低1', '高1', '低2', '高2', '中心', '坡度', '提前', '延迟', '输入', '气导', '骨导', '门控', '平衡'];
    const paramKeys = ['music', 'filter', 'low1', 'high1', 'low2', 'high2', 'center', 'slope', 'lead', 'delay', 'inVol', 'air', 'bone', 'gate', 'balance'];

    return (
        <div className="overflow-x-auto custom-scrollbar border border-gray-700 rounded-lg">
            <table className="w-full min-w-[1400px] text-xs text-left">
                <thead className="bg-[#1a1d26] text-gray-400 uppercase sticky top-0">
                    <tr>{headers.map(h => <th key={h} className="p-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-gray-300">
                    {(stageData || []).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-[#1a1d26]/50">
                            <td className="p-1 font-mono text-blue-400 text-center">{rowIndex + 1}</td>
                            {paramKeys.map(paramName => (
                                <td key={paramName} className="p-1">
                                    <EditableCell
                                        value={row?.[paramName] ?? ''}
                                        onValueChange={(newValue) => onParamChange(rowIndex, paramName, newValue)}
                                        paramName={paramName}
                                        availableMusic={availableMusic}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const SchemeEditor = ({ scheme, onSave, onCancel, availableMusic }) => {
    const getInitialState = () => scheme || {
        name: '新建自定义方案',
        type: '被动训练',
        isPreset: false,
        description: '',
        stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
    };

    const [editedScheme, setEditedScheme] = useState(getInitialState);
    const [activeTab, setActiveTab] = useState(0);
    const [hasChanges, setHasChanges] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const hasMotherSound = availableMusic.some(m => m.folderId.startsWith('mother_'));

    useEffect(() => {
        setEditedScheme(getInitialState());
        setHasChanges(false);
    }, [scheme]);

    const handleBasicInfoChange = (e) => {
        const { name, value } = e.target;
        setEditedScheme(prev => ({ ...prev, [name]: value }));
        setHasChanges(true);
    };

    const handleParamChange = (stageIndex, rowIndex, paramName, value) => {
        const stageKey = stageIndex + 1;
        setEditedScheme(prev => {
            const updatedStages = { ...prev.stages };
            const updatedStageData = [...(updatedStages[stageKey] || [])];
            updatedStageData[rowIndex] = { ...updatedStageData[rowIndex], [paramName]: value };
            updatedStages[stageKey] = updatedStageData;
            return { ...prev, stages: updatedStages };
        });
        setHasChanges(true);
    };
    
    const handleSave = () => {
        if (!editedScheme?.name?.trim()) {
            alert("方案名称不能为空");
            return;
        }
        onSave(editedScheme);
    };

    const handleCancelClick = () => {
        if (hasChanges) {
            setShowCancelConfirm(true);
        } else {
            onCancel();
        }
    };
    
    if (!editedScheme) return null;

    return (
        <div className="flex flex-col h-full relative">
            <ConfirmModal 
                isOpen={showCancelConfirm} 
                title="确认取消" 
                content="您有未保存的修改，确定要放弃吗？" 
                onConfirm={() => { setShowCancelConfirm(false); onCancel(); }} 
                onCancel={() => setShowCancelConfirm(false)} 
            />

            <div className="p-4 border-b border-gray-800 bg-[#1a1d26] flex justify-between items-center">
                <h2 className="text-xl font-bold">{editedScheme.id ? '编辑方案' : '新建方案'}</h2>
                <div className="flex gap-2">
                    <button onClick={handleCancelClick} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg"><X size={14}/> 取消</button>
                    <button onClick={handleSave} className="flex items-center gap-2 text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"><Save size={14}/> 保存方案</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">方案名称</label>
                        <input type="text" name="name" value={editedScheme.name ?? ''} onChange={handleBasicInfoChange} className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">方案类型</label>
                        <select name="type" value={editedScheme.type ?? '被动训练'} onChange={handleBasicInfoChange} className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white">
                            <option>被动训练</option>
                            <option>主动训练</option>
                            <option>混合训练</option>
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="text-sm text-gray-400 mb-1 block">方案描述</label>
                        <textarea name="description" value={editedScheme.description ?? ''} onChange={handleBasicInfoChange} className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white min-h-[80px]"></textarea>
                    </div>
                </div>
                
                <div>
                    {!hasMotherSound && (
                        <div className="flex items-center gap-2 text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/30 mb-4">
                            <AlertTriangle size={16} />
                            <span className="text-sm">暂无可用的母亲声音，请先录制并处理。</span>
                        </div>
                    )}
                    <div className="px-1 border-b border-gray-800 mb-4">
                        <div className="flex -mb-px">
                            {[0, 1, 2].map(stageIndex => (
                                <button key={stageIndex} onClick={() => setActiveTab(stageIndex)} className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === stageIndex ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                                    第 {stageIndex + 1} 阶段
                                </button>
                            ))}
                        </div>
                    </div>
                    <EditableParametersTable 
                        stageData={editedScheme.stages?.[activeTab + 1] ?? []} 
                        onParamChange={(rowIndex, paramName, value) => handleParamChange(activeTab, rowIndex, paramName, value)}
                        availableMusic={availableMusic}
                    />
                </div>
            </div>
        </div>
    );
};

export default SchemeEditor;
