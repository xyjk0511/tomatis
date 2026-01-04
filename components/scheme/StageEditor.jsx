import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';

// 单个参数单元格，支持编辑
const ParamCell = ({ value, onChange, type = 'text', options = [] }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) {
            onChange(tempValue);
        }
    };

    if (isEditing) {
        if (type === 'select') {
            return (
                <select 
                    autoFocus
                    value={tempValue} 
                    onChange={(e) => { setTempValue(e.target.value); onChange(e.target.value); setIsEditing(false); }}
                    onBlur={() => setIsEditing(false)}
                    className="w-full bg-[#0b0e14] text-white text-xs p-1 outline-none border border-blue-500"
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        return (
            <input 
                autoFocus
                type={type === 'number' ? 'number' : 'text'}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => { if(e.key === 'Enter') handleBlur(); }}
                className="w-full bg-[#0b0e14] text-white text-xs p-1 outline-none border border-blue-500"
            />
        );
    }

    return (
        <div 
            onClick={() => { setTempValue(value); setIsEditing(true); }}
            className="w-full h-full min-h-[24px] flex items-center justify-center cursor-text hover:bg-white/5 text-xs text-gray-300 truncate px-1"
        >
            {value}
        </div>
    );
};

const StageEditor = ({ stages, onChange }) => {
    const [activeStage, setActiveStage] = useState(1);

    const currentRows = stages[activeStage] || [];

    const handleRowChange = (rowIndex, field, value) => {
        const newRows = [...currentRows];
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value };
        onChange({ ...stages, [activeStage]: newRows });
    };

    const handleAddRow = () => {
        const newRow = {
            music: '01-MUSIC/New_Track.flac',
            filter: 0, low1: 0, high1: 0, low2: 0, high2: 0,
            center: 1000, slope: 6, lead: 0, delay: 0,
            inVol: 60, air: 50, bone: 50, gate: '50%', balance: '><'
        };
        const newRows = [...currentRows, newRow];
        onChange({ ...stages, [activeStage]: newRows });
    };

    const handleDeleteRow = (rowIndex) => {
        const newRows = currentRows.filter((_, i) => i !== rowIndex);
        onChange({ ...stages, [activeStage]: newRows });
    };

    return (
        <div className="flex flex-col h-full bg-[#0b0e14] border border-gray-800 rounded-lg overflow-hidden">
            {/* 阶段切换 Tabs */}
            <div className="flex border-b border-gray-800 bg-[#1a1d26]">
                {[1, 2, 3].map(stage => (
                    <button
                        key={stage}
                        onClick={() => setActiveStage(stage)}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-r border-gray-800 ${
                            activeStage === stage 
                                ? 'bg-[#0b0e14] text-blue-400 border-t-2 border-t-blue-500' 
                                : 'text-gray-400 hover:text-white hover:bg-[#2a3040]'
                        }`}
                    >
                        第 {stage} 阶段
                    </button>
                ))}
            </div>

            {/* 表格区域 */}
            <div className="flex-1 overflow-auto custom-scrollbar p-4">
                <div className="min-w-[1000px]"> {/* 保证横向滚动 */}
                    <div className="grid grid-cols-[40px_200px_repeat(13,1fr)_40px] gap-px bg-gray-800 border border-gray-800">
                        {/* 表头 */}
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center">#</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center">音乐文件</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Filter">Filt</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Low 1">L1</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="High 1">H1</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Low 2">L2</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="High 2">H2</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Center Freq">Cen</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Slope">Slp</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Lead">Lead</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Delay">Dly</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Input Vol">In</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Air Vol">Air</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Bone Vol">Bone</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center" title="Gating">Gate</div>
                        <div className="bg-[#1a1d26] p-2 text-xs text-gray-400 font-bold text-center">操作</div>

                        {/* 数据行 */}
                        {currentRows.map((row, index) => (
                            <React.Fragment key={index}>
                                <div className="bg-[#0b0e14] flex items-center justify-center text-xs text-gray-500">{index + 1}</div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.music} onChange={(v) => handleRowChange(index, 'music', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.filter} type="number" onChange={(v) => handleRowChange(index, 'filter', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.low1} type="number" onChange={(v) => handleRowChange(index, 'low1', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.high1} type="number" onChange={(v) => handleRowChange(index, 'high1', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.low2} type="number" onChange={(v) => handleRowChange(index, 'low2', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.high2} type="number" onChange={(v) => handleRowChange(index, 'high2', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.center} type="number" onChange={(v) => handleRowChange(index, 'center', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.slope} type="number" onChange={(v) => handleRowChange(index, 'slope', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.lead} type="number" onChange={(v) => handleRowChange(index, 'lead', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.delay} type="number" onChange={(v) => handleRowChange(index, 'delay', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.inVol} type="number" onChange={(v) => handleRowChange(index, 'inVol', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.air} type="number" onChange={(v) => handleRowChange(index, 'air', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.bone} type="number" onChange={(v) => handleRowChange(index, 'bone', v)} /></div>
                                <div className="bg-[#0b0e14]"><ParamCell value={row.gate} onChange={(v) => handleRowChange(index, 'gate', v)} /></div>
                                <div className="bg-[#0b0e14] flex items-center justify-center">
                                    <button onClick={() => handleDeleteRow(index)} className="text-gray-600 hover:text-red-500 transition-colors">
                                        <span className="text-xs">✕</span>
                                    </button>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                    
                    <button 
                        onClick={handleAddRow}
                        className="mt-4 w-full py-2 border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 rounded flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                        <span>＋</span> 添加步骤
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StageEditor;
