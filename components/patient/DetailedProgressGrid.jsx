import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

const DetailedProgressGrid = ({ history = [] }) => {
    const totalSessions = 60;
    
    // Find the current session (first non-completed/interrupted)
    let currentSessionIndex = history.length;
    const lastSession = history[history.length - 1];
    if (lastSession?.status === 'interrupted') {
        currentSessionIndex = history.length - 1;
    }

    const renderGrid = (stage) => {
        const stageHistory = history.filter(h => h.stage === stage);
        const completedInStage = stageHistory.filter(h => h.status === 'completed').length;

        return (
            <div className="bg-[#0f1219] p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-white">第 {stage} 阶段</h4>
                    <span className="text-sm text-gray-400">{completedInStage} / 20</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 20 }, (_, i) => {
                        const session = i + 1;
                        const sessionIndex = (stage - 1) * 20 + session -1;
                        const sessionData = history[sessionIndex];
                        
                        let content = null;
                        let cellStyle = 'bg-gray-700/50 text-gray-500';
                        let title = `第${stage}阶段 - 第${session}次 (未开始)`;

                        if (sessionData) {
                            if (sessionData.status === 'completed') {
                                cellStyle = 'bg-green-800/60 text-green-400';
                                content = <Check size={16} />;
                                title = `第${stage}阶段 - 第${session}次 (已完成于 ${sessionData.date})`;
                            } else if (sessionData.status === 'interrupted') {
                                cellStyle = 'bg-orange-800/60 text-orange-400';
                                content = <div className="text-[10px] font-bold">{Math.floor(sessionData.duration / 60)}m</div>;
                                title = `第${stage}阶段 - 第${session}次 (中断于 ${sessionData.date}, 时长 ${Math.floor(sessionData.duration / 60)}分钟)`;
                            }
                        }

                        if (sessionIndex === currentSessionIndex) {
                            cellStyle = 'bg-blue-600 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0f1219]';
                            content = <span className="font-bold text-xs">当前</span>;
                            title = `当前训练: 第${stage}阶段 - 第${session}次`;
                        }

                        return (
                            <div key={session} title={title} className={`relative aspect-square rounded-md flex items-center justify-center transition-all duration-200 ${cellStyle}`}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300">治疗总览</h3>
            <div className="grid grid-cols-3 gap-4">
                {renderGrid(1)}
                {renderGrid(2)}
                {renderGrid(3)}
            </div>
        </div>
    );
};

export default DetailedProgressGrid;
