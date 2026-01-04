import React from 'react';
import { SlidersHorizontal, Music, Replace } from 'lucide-react';

const ParameterRow = ({ label, value, unit = '' }) => (
    <div className="flex justify-between items-center py-2.5 px-3 even:bg-gray-800/30 rounded-md">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-mono font-semibold text-white">{value} <span className="text-gray-500">{unit}</span></span>
    </div>
);

const SchemeParameters = ({ parameters }) => {
    if (!parameters) {
        return <div>无参数信息</div>;
    }

    return (
        <div>
            <h3 className="text-base font-semibold mb-3 text-gray-300 flex items-center gap-2">
                <SlidersHorizontal size={16} />
                当前训练参数
            </h3>
            <div className="bg-[#0f1219] p-3 rounded-lg border border-gray-800 space-y-1">
                <div className="flex justify-between items-center py-2.5 px-3 bg-blue-900/20 rounded-md">
                    <div className="flex items-center gap-2">
                        <Music size={14} className="text-blue-400"/>
                        <span className="text-sm text-gray-400">音源文件</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-semibold text-white">{parameters.music}</span>
                        <button className="text-xs text-blue-400 hover:text-white flex items-center gap-1">
                            <Replace size={12} /> 更换
                        </button>
                    </div>
                </div>
                <ParameterRow label="过滤" value={parameters.filter} />
                <ParameterRow label="低频1" value={parameters.low1} unit="dB" />
                <ParameterRow label="高频1" value={parameters.high1} unit="dB" />
                <ParameterRow label="低频2" value={parameters.low2} unit="dB" />
                <ParameterRow label="高频2" value={parameters.high2} unit="dB" />
                <ParameterRow label="中心频率" value={parameters.center} unit="Hz" />
                <ParameterRow label="坡度" value={parameters.slope} unit="dB/oct" />
                <ParameterRow label="提前时间" value={parameters.lead} unit="ms" />
                <ParameterRow label="延迟时间" value={parameters.delay} unit="ms" />
                <ParameterRow label="输入音量" value={parameters.inVol} unit="dB" />
                <ParameterRow label="气导输出" value={parameters.air} unit="dB" />
                <ParameterRow label="骨导输出" value={parameters.bone} unit="dB" />
                <ParameterRow label="门控" value={parameters.gate} />
                <ParameterRow label="平衡" value={parameters.balance} />
            </div>
        </div>
    );
};

export default SchemeParameters;
