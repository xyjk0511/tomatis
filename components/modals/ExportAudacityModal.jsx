import React, { useState, useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';

const ExportAudacityModal = ({ isOpen, onClose, file, onConfirmExport, patients }) => {
    const [isAudacityInstalled, setIsAudacityInstalled] = useState(false);

    useEffect(() => {
        // Mock check for Audacity installation
        setIsAudacityInstalled(Math.random() > 0.3);
    }, [isOpen]);

    if (!isOpen || !file) return null;

    const patientName = patients.find(p => p.id === file.patientId)?.name || 'N/A';

    const handleOpenAudacity = () => {
        if (isAudacityInstalled) {
            alert('正在打开 Audacity... (模拟操作)');
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[600px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">导出到 Audacity</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><span className="text-gray-500">文件名:</span> <span className="text-white font-mono">{file.name}</span></div>
                    <div><span className="text-gray-500">关联患者:</span> <span className="text-white">{patientName}</span></div>
                    <div><span className="text-gray-500">导出格式:</span> <span className="text-white font-mono">AIF (无损)</span></div>
                    <div>
                        <label className="text-gray-500">保存位置:</label>
                        <button className="ml-2 text-blue-400 hover:text-blue-300 text-xs underline">点击选择</button>
                    </div>
                </div>

                <div className="bg-[#0b0e14] p-4 rounded-lg border border-gray-700 mb-6">
                    <h4 className="font-bold text-white mb-2">处理说明</h4>
                    <ol className="list-decimal list-inside text-xs text-gray-400 space-y-1">
                        <li>打开 Audacity 软件。</li>
                        <li>导入导出的 AIF 文件。</li>
                        <li>对高频音进行反复放大。</li>
                        <li>去除低频音。</li>
                        <li>处理完成后通过 <span className="font-bold text-yellow-400">文件 &gt; 导出 &gt; 导出音频</span> 另存为 AIFF 格式。</li>
                        <li>返回本软件，导入处理后的 AIFF 文件。</li>
                    </ol>
                </div>

                <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleOpenAudacity}
                            disabled={!isAudacityInstalled}
                            className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-500 text-sm font-bold flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            <ExternalLink size={16}/> 打开 Audacity
                        </button>
                        {!isAudacityInstalled && (
                            <div className="text-xs text-yellow-500">
                                未检测到 Audacity，<a href="https://www.audacityteam.org/download/" target="_blank" rel="noopener noreferrer" className="underline">前往下载</a>。
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
                        <button onClick={onConfirmExport} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold flex items-center gap-2">
                            <Download size={16}/> 导出
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExportAudacityModal;
