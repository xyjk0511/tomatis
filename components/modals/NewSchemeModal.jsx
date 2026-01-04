import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const NewSchemeModal = ({ isOpen, onClose, onConfirm, existingSchemes }) => {
    const [name, setName] = useState('新建自定义方案');
    const [type, setType] = useState('被动训练');
    const [templateId, setTemplateId] = useState('empty'); // 'empty' or a scheme id

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setName('新建自定义方案');
            setType('被动训练');
            setTemplateId('empty');
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (!name.trim()) {
            alert('方案名称不能为空');
            return;
        }
        onConfirm({ name: name.trim(), type, templateId });
    };

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">新建方案</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">方案名称</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">方案类型</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                        >
                            <option>被动训练</option>
                            <option>主动训练</option>
                            <option>混合训练</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-gray-400 mb-1 block">基于模板创建</label>
                        <select 
                            value={templateId} 
                            onChange={(e) => setTemplateId(e.target.value)} 
                            className="w-full bg-[#0f1219] border border-gray-700 rounded-lg p-2.5 text-white focus:border-blue-500 outline-none"
                        >
                            <option value="empty">空模板</option>
                            <optgroup label="预置方案">
                                {existingSchemes.filter(s => s.isPreset).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </optgroup>
                            <optgroup label="自定义方案">
                                {existingSchemes.filter(s => !s.isPreset).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 text-sm hover:bg-gray-700">取消</button>
                    <button onClick={handleConfirm} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">创建并编辑</button>
                </div>
            </div>
        </div>
    );
};

export default NewSchemeModal;
