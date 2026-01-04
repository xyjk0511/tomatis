import React from 'react';
import { ArrowLeft, Play, Pause, StopCircle, Settings2, Battery, Wifi, FileText, Bot, ChevronsRight, Trash2, Volume2 } from 'lucide-react';
import DetailedProgressGrid from '../components/patient/DetailedProgressGrid';
import SchemeParameters from '../components/patient/SchemeParameters';
import { INITIAL_SCHEMES } from '../data/mockData';
import VolumeSlider from '../components/common/VolumeSlider';

const PatientDetailsView = ({ device, onBack, onRemove, onStart, onPause, onResume, onStop, onVolumeChange, onMoreOptions, patients }) => {
    const { id, status, patientInfo, progressInfo, volumeInfo } = device;
    const isRunning = status === 'running';
    const isPaused = status === 'paused';
    const isAssigned = status === 'assigned';

    const fullPatientData = patients.find(p => p.id === patientInfo.id);
    const history = fullPatientData?.trainingHistory || [];

    let currentSessionIndex = history.length;
    const lastSession = history[history.length - 1];
    if (lastSession?.status === 'interrupted') {
        currentSessionIndex = history.length - 1;
    }
    const currentStage = Math.floor(currentSessionIndex / 20) + 1;
    const currentSessionNum = (currentSessionIndex % 20) + 1;
    
    const scheme = INITIAL_SCHEMES.find(s => s.id === progressInfo.schemeId);
    const currentParams = scheme?.stages[currentStage]?.[currentSessionNum - 1];

    const handleAction = () => {
        if (isRunning) onPause(id);
        else if (isPaused) onResume(id);
        else if (isAssigned) onStart(id);
    };

    const getActionButton = () => {
        if (isRunning) return { text: '暂停训练', icon: <Pause size={18} />, style: 'bg-yellow-600 hover:bg-yellow-500' };
        if (isPaused) return { text: '继续训练', icon: <Play size={18} />, style: 'bg-green-600 hover:bg-green-500' };
        return { text: '开始训练', icon: <Play size={18} />, style: 'bg-blue-600 hover:bg-blue-500' };
    };

    const actionButton = getActionButton();
    const timerSeconds = progressInfo?.timerSeconds || 0;
    const totalSeconds = 1800;
    const progressPercent = (timerSeconds / totalSeconds) * 100;

    return (
        <div className="flex flex-col h-full bg-[#0b0e14] text-white animate-in fade-in-5 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0 h-20 px-6 border-b border-gray-800 bg-[#1a1d26]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors self-start mt-1"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{patientInfo?.name}</h2>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>{patientInfo?.age}岁, {patientInfo?.gender === 'male' ? '男' : '女'}</span>
                            <span className="flex items-center gap-1"><FileText size={12} /> MRN: {patientInfo?.mrn || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                     <div className="text-right">
                        <p className="font-bold text-lg text-white">设备 {id}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-1"><Battery size={12} className="text-green-500"/> {volumeInfo?.battery || 85}%</span>
                            <span className="flex items-center gap-1"><Wifi size={12} className="text-blue-500"/> 已连接</span>
                        </div>
                    </div>
                    <button onClick={onRemove} className="p-2 hover:bg-red-900/50 rounded-full text-red-500 hover:text-red-400 transition-colors"><Trash2 size={20} /></button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
                {/* Top Control Section */}
                <div className="shrink-0 bg-[#0f1219] border border-gray-800 rounded-lg mb-4 p-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-400">当前训练</span>
                        <span className="text-lg font-semibold text-blue-400">第 {currentStage} 阶段 - 第 {currentSessionNum} 次</span>
                        {lastSession?.status === 'interrupted' && (
                            <span className="text-xs text-orange-400 mt-1">（上次训练 {Math.floor(lastSession.duration / 60)} 分钟，将续接）</span>
                        )}
                    </div>
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                            <circle className="text-blue-500" strokeWidth="8" strokeDasharray={2 * Math.PI * 45} strokeDashoffset={(2 * Math.PI * 45) * (1 - (progressPercent / 100))} strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }} />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-4xl font-mono font-bold tracking-wider">{progressInfo?.timer || '00:00'}</p>
                            <p className="text-xs text-gray-500">/ 30:00</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 w-64">
                         <button onClick={handleAction} className={`text-base font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg ${actionButton.style}`}>
                            {actionButton.icon} {actionButton.text}
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onStop(id)} disabled={!isRunning && !isPaused} className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-sm">
                                <StopCircle size={14} /> 停止
                            </button>
                             <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                                <Bot size={14} /> 自动训练
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Progress, Parameters, and Volume */}
                <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                    <div className="col-span-1 overflow-y-auto custom-scrollbar pr-2">
                        <DetailedProgressGrid history={history} />
                    </div>
                    <div className="col-span-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                        <SchemeParameters parameters={currentParams} />
                        {isRunning && (
                            <div className="bg-[#0f1219] p-3 rounded-lg border border-gray-800">
                                <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2"><Volume2 size={16} /> 音量调节</h3>
                                <div className="space-y-3 px-2">
                                    <VolumeSlider label="气导" value={volumeInfo?.air || 60} colorClass="bg-blue-500" onChange={(val) => onVolumeChange && onVolumeChange(id, 'air', val)}/>
                                    <VolumeSlider label="骨导" value={volumeInfo?.bone || 50} colorClass="bg-yellow-500" onChange={(val) => onVolumeChange && onVolumeChange(id, 'bone', val)}/>
                                </div>
                            </div>
                        )}
                         <div className="mt-auto">
                            <button onClick={() => onMoreOptions(id, 'change')} className="w-full mb-2 bg-gray-800/50 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                                <ChevronsRight size={14} /> 变更方案
                            </button>
                            <button onClick={() => onMoreOptions(id, 'adjust')} className="w-full bg-gray-800/50 hover:bg-gray-700 text-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm">
                                <Settings2 size={14} /> 调整进度
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetailsView;
