import React, { useState } from 'react';
import FolderNode from '../media/FolderNode';

const MoveFileModal = ({ isOpen, onClose, onMove, files, folders }) => {
    const [targetFolderId, setTargetFolderId] = useState(null);

    if (!isOpen) return null;

    const handleMove = () => {
        if (targetFolderId) {
            onMove(files, targetFolderId);
        }
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[500px] shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">移动到...</h3>
                <div className="max-h-64 overflow-y-auto custom-scrollbar border border-gray-700 rounded-lg p-2">
                    {folders.map(folder => (
                        <FolderNode
                            key={folder.id}
                            node={folder}
                            selectedFolderId={targetFolderId}
                            onSelectFolder={setTargetFolderId}
                        />
                    ))}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
                    <button onClick={handleMove} disabled={!targetFolderId} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold disabled:bg-gray-500">移动</button>
                </div>
            </div>
        </div>
    );
};

export default MoveFileModal;
