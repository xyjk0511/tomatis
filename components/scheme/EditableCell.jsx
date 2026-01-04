import React from 'react';
import { FolderSearch } from 'lucide-react';

const EditableCell = ({ value, onValueChange, paramName, availableMusic }) => {
    const isSlider = ['inVol', 'air', 'bone', 'gate'].includes(paramName);
    const isMusic = paramName === 'music';

    if (isSlider) {
        const numValue = parseInt(String(value).replace('%', ''), 10) || 0;
        const displayValue = paramName === 'gate' ? `${numValue}%` : numValue;
        return (
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={numValue}
                    onChange={(e) => onValueChange(paramName === 'gate' ? `${e.target.value}%` : e.target.value)}
                    className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-xs font-mono w-10 text-right">{displayValue}</span>
            </div>
        );
    }

    if (isMusic) {
        return (
            <select
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="w-full bg-transparent border border-gray-700 rounded px-1.5 py-1 focus:bg-[#0b0e14] focus:border-blue-500 outline-none"
            >
                <option value="">选择音源</option>
                {availableMusic && availableMusic.map(musicFile => (
                    <option key={musicFile.id} value={musicFile.name}>
                        {musicFile.name}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full bg-transparent border border-gray-700 rounded px-1.5 py-1 focus:bg-[#0b0e14] focus:border-blue-500 outline-none"
        />
    );
};

export default EditableCell;
