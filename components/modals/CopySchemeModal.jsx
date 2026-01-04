import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CopySchemeModal = ({ isOpen, onClose, onConfirm, defaultName }) => {
    const [name, setName] = useState(defaultName);

    useEffect(() => {
        if (isOpen) {
            setName(defaultName);
        }
    }, [isOpen, defaultName]);

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">复制方案</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-4">请输入新方案的名称：</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 outline-none"
                />
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 text-sm hover:bg-gray-700">
                        取消
                    </button>
                    <button onClick={() => onConfirm(name)} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">
                        确认复制
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CopySchemeModal;
