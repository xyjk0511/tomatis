import React, { useState, useEffect } from 'react';

const InputModal = ({ isOpen, title, defaultValue, onConfirm, onCancel, validation, namePlaceholder="文件夹名称", parentName=null }) => {
	const [value, setValue] = useState(defaultValue || '');
	const [error, setError] = useState('');
	
	useEffect(() => {	
		if(isOpen) {	
			setValue(defaultValue || '');	
			setError('');
		}	
	}, [isOpen, defaultValue]);

	const handleConfirm = () => {
		const trimmedValue = value.trim();
		if (!trimmedValue) {
			setError('名称不能为空');
			return;
		}
		if (validation && !validation(trimmedValue)) {
			setError('名称已存在或不符合要求');
			return;
		}
		onConfirm(trimmedValue);
	};

	if (!isOpen) return null;
	return (
		<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[400px] shadow-2xl animate-in zoom-in-95 duration-200">
				<h3 className="text-xl font-bold text-white mb-4">{title}</h3>
				{parentName && <p className="text-xs text-gray-400 mb-3">所属分类: <span className="font-medium text-gray-200">{parentName}</span></p>}
				<input 
					autoFocus
					type="text" 
					value={value}
					onChange={(e) => { setValue(e.target.value); setError(''); }}
					onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
					className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
					placeholder={namePlaceholder}
				/>
				{error && <p className="text-red-500 text-xs mt-2">{error}</p>}
				<div className="flex justify-end gap-3 mt-6">
					<button onClick={onCancel} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">取消</button>
					<button onClick={handleConfirm} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">确认</button>
				</div>
			</div>
		</div>
	);
};

export const NewFolderModal = InputModal;
export const RenameModal = InputModal;

export default InputModal;
