import React, { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import FormField from '../common/FormField';
import { NewFolderModal } from './InputModal';
import { SUPPORTED_FORMATS } from '../../data/mockData';
import { findFolderByIdRecursive } from '../../data/mockData';

// 新增模态框组件: ImportModal (实现素材导入逻辑)
const ImportModal = ({ isOpen, onClose, onImport, initialFolders, patients, existingFiles }) => {
    const [step, setStep] = useState('selection'); // 'selection', 'uploading', 'result'
    const [filesToImport, setFilesToImport] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(initialFolders[0].id);
    const [selectedSubFolder, setSelectedSubFolder] = useState(initialFolders[0].children[0].id);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState({ success: 0, failure: 0 });
    const [aiffPatientId, setAiffPatientId] = useState('');
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
	const [newFolderName, setNewFolderName] = useState('');
	const [error, setError] = useState('');
	const fileInputRef = useRef(null);

    const allSubFolders = initialFolders.flatMap(cat => cat.children || []);
    const currentCategoryData = initialFolders.find(f => f.id === selectedCategory);
    const currentSubFolders = currentCategoryData?.children || [];

    // AIFF mode check: if any selected file is AIFF or AIF (Mother's Voice)
    const isAiffMode = filesToImport.some(f => f.type === 'AIFF' || f.type === 'AIF');

    useEffect(() => {
        if (!isOpen) {
            setStep('selection');
            setFilesToImport([]);
            setImportProgress(0);
            setSelectedCategory(initialFolders[0].id);
            setSelectedSubFolder(initialFolders[0].children[0].id);
            setAiffPatientId('');
			setError('');
        }
    }, [isOpen, initialFolders]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        let hasUnsupported = false;

        const validatedFiles = selectedFiles.map(file => {
            const parts = file.name.split('.');
            const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
            const isValidFormat = SUPPORTED_FORMATS.includes(ext);
            const isAiffFormat = ext === 'aiff' || ext === 'aif';

            let status = 'Pending';

            if (!isValidFormat) {
				status = 'Unsupported Format';
				hasUnsupported = true;
			} else if (existingFiles.some(f => f.name.toLowerCase() === file.name.toLowerCase())) {
                // Mock heavy checks: check for file name conflict
                status = 'Exists';
            } else if (file.name.includes('corrupt')) {
                // Mock corruption check
                status = 'Corrupt File';
            }

            return {
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
                type: ext.toUpperCase(),
                status: status,
                isAiffFormat,
            };
        }).filter(f => f.status !== 'Unsupported Format'); // Filter out unsupported immediately

        setFilesToImport(validatedFiles);

        if (hasUnsupported) {
            setError('存在不支持的音频格式，请确保文件为 MP3/WAV/FLAC/AIF/AIFF。');
        } else {
			setError('');
		}

		// Reset file input value to allow selecting the same file again
		if(fileInputRef.current) fileInputRef.current.value = null;

    };

	const handleCategoryChange = (e) => {
		const newCatId = e.target.value;
		setSelectedCategory(newCatId);
		const newSubs = initialFolders.find(f => f.id === newCatId)?.children || [];
		if (newSubs.length > 0) {
			setSelectedSubFolder(newSubs[0].id);
		} else {
			setSelectedSubFolder('');
		}
	}

    const startImport = () => {
        const pendingFiles = filesToImport.filter(f => f.status === 'Pending' || f.status === 'Exists');
        if (pendingFiles.length === 0) {
            return setError('没有可导入的文件。');
        }
        if (!isAiffMode && !selectedSubFolder) {
             return setError('请选择目标子文件夹。');
        }
        if (isAiffMode && !aiffPatientId) {
            return setError('导入处理后的母亲声音必须关联患者。');
        }

		setError('');
        setStep('uploading');
        
        // --- 导入模拟 ---
        let successCount = 0;
        let failureCount = 0;
        const totalToImport = pendingFiles.length;

        // Final destination logic
        const finalFolderId = isAiffMode ? 'mother_processed' : selectedSubFolder;

        const importFile = (file) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    if (file.status === 'Corrupt File') {
                        failureCount++;
                    } else if (file.name.includes('fail')) {
                        failureCount++;
                    } else {
                        successCount++;
                        onImport(
                            file.name,
                            file.type,
                            finalFolderId,
                            file.isAiffFormat ? aiffPatientId : null
                        );
                    }
                    resolve();
                }, 300);
            });
        };

        const processFiles = async () => {
            for (let i = 0; i < totalToImport; i++) {
                await importFile(pendingFiles[i]);
                setImportProgress(((i + 1) / totalToImport) * 100);
            }
            setImportResult({ success: successCount, failure: failureCount });
            setStep('result');
        };

        processFiles();
    };

	const handleNewFolder = (name) => {
		const parentFolder = findFolderByIdRecursive(selectedCategory, initialFolders);
		if (!parentFolder || !parentFolder.children) return;

		// Simulate folder ID creation and selection
		const mockNewFolderId = `c_${Date.now()}_${name}`;

		// For the sake of this mock modal, we just select it.
		setSelectedSubFolder(mockNewFolderId);
		setShowNewFolderModal(false);
	}

    if (!isOpen) return null;

    // AIFF 模式下自动选择母亲声音/已处理
    if (isAiffMode) {
        // Find '母亲声音' root ID dynamically
        const motherRootId = initialFolders.find(f => f.name === '母亲声音')?.id || 'root_mother';
        setSelectedCategory(motherRootId);
        setSelectedSubFolder(allSubFolders.find(f => f.id === 'mother_processed')?.id || '');
    }

    const filteredFilesToImport = filesToImport.filter(f => f.status !== 'Unsupported Format');

    // Check if selected subfolder is valid for non-AIFF mode
    const isSubFolderSelectable = currentSubFolders.some(f => f.id === selectedSubFolder);


    // --- 渲染部分 ---

    return (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<NewFolderModal
				isOpen={showNewFolderModal}
				title="新建子文件夹"
				parentName={currentCategoryData?.name}
				defaultValue={newFolderName}
				validation={(name) => {
					// Simplified validation: Check only existing siblings
					const currentSiblingNames = (currentCategoryData?.children || []).map(f => f.name);
					return !currentSiblingNames.includes(name);
				}}
				onConfirm={(name) => { setNewFolderName(name); handleNewFolder(name); }}
				onCancel={() => setShowNewFolderModal(false)}
			/>

            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[700px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">
                    {isAiffMode ? '导入处理后的母亲声音' : '导入素材'}
                </h3>
                
                {step === 'selection' && (
                    <>
						{/* 文件选择区 */}
						<div className={`p-4 rounded-lg border border-dashed ${isAiffMode ? 'border-indigo-600/50 bg-indigo-900/20' : 'border-gray-600/50 bg-gray-900/20'} mb-4 flex items-center gap-4`}>
							<input
								ref={fileInputRef}
								type="file"
								accept={SUPPORTED_FORMATS.map(ext => `.${ext}`).join(',')}
								multiple
								onChange={handleFileChange}
								className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:cursor-pointer"
							/>
							<span className="text-xs text-gray-500">支持格式: {SUPPORTED_FORMATS.join(', ')}</span>
						</div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <FormField
                                label="一级分类"
                                type="select"
                                value={selectedCategory}
                                onChange={handleCategoryChange}
                                required
                                disabled={isAiffMode}
                            >
                                {initialFolders.map(f => (
                                    <option
                                        key={f.id}
                                        value={f.id}
                                        disabled={isAiffMode && f.name !== '母亲声音'}
                                    >
                                        {f.name}
                                    </option>
                                ))}
                            </FormField>

                            {isAiffMode ? (
                                <FormField label="关联患者" type="select" value={aiffPatientId} onChange={(e) => setAiffPatientId(e.target.value)} required>
                                    <option value="">请选择关联患者 (必选)</option>
                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </FormField>
                            ) : (
                                <FormField label="子文件夹" type="select" value={selectedSubFolder} onChange={(e) => {
                                    if (e.target.value === 'new_folder') {
                                        setShowNewFolderModal(true);
                                    } else {
                                        setSelectedSubFolder(e.target.value);
                                    }
                                }} required>
                                    {currentSubFolders.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                    <option value="new_folder">+ 新建文件夹</option>
                                </FormField>
                            )}
                        </div>

						{isAiffMode && (
							<div className="flex justify-between items-center bg-green-900/20 text-green-400 border border-green-900/50 p-3 rounded-lg mb-4">
								<span className="text-sm font-medium">状态显示：已处理</span>
								<CheckCircle2 size={16}/>
							</div>
						)}

                        <div className="flex-1 min-h-[150px] overflow-y-auto custom-scrollbar border border-gray-700 rounded-lg bg-[#0b0e14]">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#1a1d26] text-gray-400 sticky top-0">
                                    <tr>
                                        <th className="p-2 w-1/2">文件名</th>
                                        <th className="p-2 w-20">大小</th>
                                        <th className="p-2 w-20">格式</th>
                                        <th className="p-2 w-auto">导入校验结果</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFilesToImport.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">待导入文件列表为空</td></tr>
                                    ) : (
                                        filteredFilesToImport.map((file, i) => (
                                            <tr key={i} className="border-t border-gray-800">
                                                <td className="p-2 text-white truncate">{file.name}</td>
                                                <td className="p-2 text-gray-400">{file.size}</td>
                                                <td className="p-2 text-gray-400 font-mono">{file.type}</td>
                                                <td className="p-2">
													{file.status === 'Corrupt File' && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle size={12}/> 文件已损坏，无法导入</span>}
													{file.status === 'Exists' && <span className="text-yellow-500 text-xs flex items-center gap-1"><AlertTriangle size={12}/> 文件已存在，将覆盖</span>}
													{file.status === 'Pending' && <span className="text-green-400 text-xs flex items-center gap-1"><Check size={12}/> {file.isAiffFormat ? 'AIFF(需关联患者)' : '准备导入'}</span>}
												</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {error && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                    </>
                )}

                {step === 'uploading' && (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] p-8">
                        <Upload size={48} className="text-blue-500 mb-4 animate-bounce" />
                        <h4 className="text-white text-lg font-medium mb-2">正在导入素材...</h4>
                        <p className="text-gray-400 text-sm mb-4">已完成 {Math.round(importProgress)}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }}></div>
                        </div>
                    </div>
                )}

                {step === 'result' && (
                    <div className="flex flex-col items-center justify-center flex-1 min-h-[300px] p-8">
                        <CheckCircle2 size={48} className="text-green-500 mb-4" />
                        <h4 className="text-white text-xl font-medium mb-4">导入完成！</h4>
                        <p className="text-gray-400 text-sm">成功导入 {importResult.success} 个文件。</p>
                        {importResult.failure > 0 && <p className="text-red-400 text-sm">失败 {importResult.failure} 个文件。</p>}
                    </div>
                )}


                <div className="mt-6 pt-3 border-t border-gray-700 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">
                        {step === 'result' ? '关闭' : '取消'}
                    </button>
                    {step === 'selection' && (
                        <button
                            onClick={startImport}
                            disabled={filteredFilesToImport.length === 0 || error || (isAiffMode && !aiffPatientId) || (!isAiffMode && !selectedSubFolder)}
                            className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold"
                        >
                            开始导入
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
