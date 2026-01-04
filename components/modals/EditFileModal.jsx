import React, { useState, useEffect } from 'react';
import FormField from '../common/FormField';

const EditFileModal = ({ isOpen, onClose, file, onSave, folders, patients }) => {
    const [fileName, setFileName] = useState('');
    const [folderId, setFolderId] = useState('');
    const [patientId, setPatientId] = useState('');

    useEffect(() => {
        if (file) {
            setFileName(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
            setFolderId(file.folderId);
            setPatientId(file.patientId || '');
        }
    }, [file]);

    if (!isOpen || !file) return null;

    const handleSave = () => {
        const extension = file.name.split('.').pop();
        onSave({
            ...file,
            name: `${fileName}.${extension}`,
            folderId,
            patientId,
        });
        onClose();
    };

    const isMotherSound = file.folderId.startsWith('mother_');

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[500px] shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">编辑素材</h3>
                <div className="space-y-4">
                    <FormField label="文件名" type="text" value={fileName} onChange={e => setFileName(e.target.value)} />
                    {!isMotherSound && (
                        <FormField label="文件夹" type="select" value={folderId} onChange={e => setFolderId(e.target.value)}>
                            {folders.map(f => (
                                <optgroup label={f.name} key={f.id}>
                                    {f.children.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </optgroup>
                            ))}
                        </FormField>
                    )}
                    {isMotherSound && (
                        <FormField label="关联患者" type="select" value={patientId} onChange={e => setPatientId(e.target.value)}>
                            <option value="">无</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </FormField>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
                    <button onClick={handleSave} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">保存</button>
                </div>
            </div>
        </div>
    );
};

export default EditFileModal;
