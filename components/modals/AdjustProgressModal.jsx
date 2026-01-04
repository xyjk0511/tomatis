import React, { useState, useMemo } from 'react';
import { X, Check } from 'lucide-react';

const AdjustProgressModal = ({ isOpen, onClose, onConfirm, device }) => {
    const { patientInfo, progressInfo } = device || {};

    // 解析当前进度
    const currentProgress = useMemo(() => {
        const sessionLabel = progressInfo?.nextSession || '第一阶段 - 第1次';
        const stageMatch = sessionLabel.match(/第(\S+)阶段/);
        const sessionMatch = sessionLabel.match(/第(\d+)次/);
        
        let stage = 1;
        if (stageMatch) {
            if (stageMatch[1] === '二') stage = 2;
            else if (stageMatch[1] === '三') stage = 3;
        }
        const session = sessionMatch ? parseInt(sessionMatch[1], 10) : 1;

        return { stage, session };
    }, [progressInfo]);

    const [selectedProgress, setSelectedProgress] = useState(currentProgress);

    const handleSelect = (stage, session) => {
        setSelectedProgress({ stage, session });
    };

    const handleConfirmClick = () => {
        onConfirm(device.id, selectedProgress);
        onClose();
    };

    if (!isOpen) return null;

    const renderGrid = (stage) => {
        return (
            <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 20 }, (_, i) => {
                    const session = i + 1;
                    const isCurrent = currentProgress.stage === stage && currentProgress.session === session;
                    const isSelected = selectedProgress.stage === stage && selectedProgress.session === session;
                    
                    let cellStyle = "bg-gray-700/50 hover:bg-gray-600";
                    if (isCurrent) cellStyle = "bg-blue-600 ring-2 ring-blue-400 ring-offset-2 ring-offset-gray-800";
                    if (isSelected) cellStyle = "bg-green-600 ring-2 ring-green-400 ring-offset-2 ring-offset-gray-800";

                    return (
                        <button 
                            key={session}
                            onClick={() => handleSelect(stage, session)}
                            className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-mono transition-all duration-200 ${cellStyle}`}
                        >
                            {session}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-white">调整训练进度</h3>
                        <p className="text-sm text-gray-400">
                            正在为 <span className="font-semibold text-blue-400">{patientInfo?.name}</span> ({device.id}号耳机) 调整进度
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">第一阶段</h4>
                            {renderGrid(1)}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">第二阶段</h4>
                            {renderGrid(2)}
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">第三阶段</h4>
                            {renderGrid(3)}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800 flex justify-between items-center shrink-0">
                    <div className="text-sm text-gray-400">
                        当前进度: <span className="font-semibold text-blue-400">第{currentProgress.stage}阶段 - 第{currentProgress.session}次</span>
                        <span className="mx-2">→</span>
                        调整为: <span className="font-semibold text-green-400">第{selectedProgress.stage}阶段 - 第{selectedProgress.session}次</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-[#2a3040] text-sm">取消</button>
                        <button onClick={handleConfirmClick} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold shadow-lg flex items-center gap-2">
                            <Check size={16} /> 确认调整
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdjustProgressModal;
