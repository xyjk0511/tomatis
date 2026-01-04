import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BatchUpdateModal = ({ isOpen, onClose, onConfirm, paramKeys }) => {
    const numericParams = paramKeys.filter(p => !['music', 'balance'].includes(p));
    
    const [targetParam, setTargetParam] = useState(numericParams[0] || '');
    const [operation, setOperation] = useState('set'); // 'set', 'add', 'subtract'
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setTargetParam(numericParams[0] || '');
            setOperation('set');
            setValue(0);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
            alert('请输入有效的数字');
            return;
        }
        onConfirm({
            param: targetParam,
            op: operation,
            val: numValue,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">批量修改参数</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="text-sm text-gray-400 mb-1 block">参数</label>
                        <select 
                            value={targetParam} 
                            onChange={(e) => setTargetParam(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                        >
                            {numericParams.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-sm text-gray-400 mb-1 block">操作</label>
                        <select 
                            value={operation} 
                            onChange={(e) => setOperation(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                        >
                            <option value="set">设置为</option>
                            <option value="add">增加</option>
                            <option value="subtract">减少</option>
                        </select>
                    </div>
                     <div className="col-span-1">
                        <label className="text-sm text-gray-400 mb-1 block">数值</label>
                        <input 
                            type="number" 
                            value={value} 
                            onChange={(e) => setValue(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" 
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 text-sm hover:bg-gray-700">取消</button>
                    <button onClick={handleConfirm} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">应用修改</button>
                </div>
            </div>
        </div>
    );
};

export default BatchUpdateModal;
