import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Folder, Plus, Search, ChevronDown, Music, Trash2, Edit, Download, Play, StopCircle, Volume2, FolderPlus, Edit3, Trash, MoreHorizontal, X, AlertTriangle, CheckCircle, Move } from 'lucide-react';
import FolderNode from '../components/media/FolderNode';
import ContextMenu from '../components/common/ContextMenu';
import { NewFolderModal, RenameModal } from '../components/modals/InputModal';
import ConfirmModal from '../components/modals/ConfirmModal';
import EditFileModal from '../components/modals/EditFileModal';
import MoveFileModal from '../components/modals/MoveFileModal';
import ActionButton from '../components/common/ActionButton';
import { SYSTEM_CONFIG, INITIAL_SCHEMES } from '../data/mockData';
import { formatTime } from '../utils/helpers.jsx';

const MediaLibraryView = ({ initialFolders, mediaFiles, setMediaFolders, patients, setShowImportModal, setShowRecordModal, handleDeleteFile, onExportAudacity }) => {
    const safeInitialFolders = Array.isArray(initialFolders) ? initialFolders : [];
    const safeMediaFiles = Array.isArray(mediaFiles) ? mediaFiles : [];
    const safePatients = Array.isArray(patients) ? patients : [];

    const [selectedFolderId, setSelectedFolderId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFileIds, setSelectedFileIds] = useState(new Set());
    const [lastSelectedId, setLastSelectedId] = useState(null);
    const [currentSort, setCurrentSort] = useState({ key: 'date', order: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [modal, setModal] = useState({ type: 'none', data: null });
    const [contextMenu, setContextMenu] = useState({ x: null, y: null, options: [] });

    const [playingFile, setPlayingFile] = useState(null);
    const [volume, setVolume] = useState(60);
    const audioRef = useRef(null);

    const findFolderById = useCallback((id, nodes) => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findFolderById(id, node.children);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const enrichedFolders = useMemo(() => {
        const processNode = (node) => {
            const directFiles = safeMediaFiles.filter(f => f.folderId === node.id);
            let count = directFiles.length;
            let newChildren = [];
            if (node.children) {
                newChildren = node.children.map(child => {
                    const processedChild = processNode(child);
                    count += processedChild.count;
                    return processedChild;
                });
            }
            return { ...node, children: newChildren, count };
        };
        return safeInitialFolders.map(processNode);
    }, [safeInitialFolders, safeMediaFiles]);

    const allFilesNode = useMemo(() => ({ id: 'all', name: '全部素材', count: safeMediaFiles.length, children: enrichedFolders, isOpen: true }), [safeMediaFiles.length, enrichedFolders]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updatePlayingFile = () => {
            if (!audio.paused) {
                setPlayingFile(prev => prev ? ({ ...prev, currentTime: audio.currentTime }) : null);
            }
        };
        const handleEnded = () => setPlayingFile(null);
        audio.addEventListener('timeupdate', updatePlayingFile);
        audio.addEventListener('ended', handleEnded);
        return () => {
            audio.removeEventListener('timeupdate', updatePlayingFile);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const handlePlayPause = (file) => {
        if (playingFile?.id === file.id) {
            audioRef.current.pause();
            setPlayingFile(null);
        } else {
            setPlayingFile({ ...file, currentTime: 0 });
            audioRef.current.src = `/path/to/audio/${file.name}`; // Mock path
            audioRef.current.play();
        }
    };

    const handleSeek = (e) => {
        if(playingFile && audioRef.current) {
            audioRef.current.currentTime = e.target.value;
            setPlayingFile(prev => ({ ...prev, currentTime: e.target.value }));
        }
    };

    const findParentFolder = useCallback((childId, nodes) => {
        for (const node of nodes) {
            if (node.children?.some(child => child.id === childId)) return node;
            if (node.children) {
                const found = findParentFolder(childId, node.children);
                if (found) return found;
            }
        }
        return null;
    }, []);
    
    const getBreadcrumbPath = useCallback((id) => {
        if (id === 'all') return '全部素材';
        const path = [];
        let currentId = id;
        while (currentId) {
            const node = findFolderById(currentId, enrichedFolders);
            if (node) {
                path.unshift(node.name);
                const parent = findParentFolder(currentId, enrichedFolders);
                currentId = parent ? parent.id : null;
            } else break;
        }
        return path.join(' > ');
    }, [enrichedFolders, findFolderById, findParentFolder]);

    const updateFolderTree = (nodes, targetId, updateFn) => {
        return nodes.map(node => {
            if (node.id === targetId) return updateFn(node);
            if (node.children) return { ...node, children: updateFolderTree(node.children, targetId, updateFn) };
            return node;
        });
    };

    const deleteFolderFromTree = (nodes, targetId) => {
        return nodes.filter(node => node.id !== targetId).map(node => {
            if (node.children) return { ...node, children: deleteFolderFromTree(node.children, targetId) };
            return node;
        });
    };

    const handleCreateFolder = (newFolderName) => {
        const { parentId, parentNode } = modal.data;
        if (!parentId || !parentNode) return;
        const isDuplicate = parentNode.children?.some(child => child.name === newFolderName);
        if (isDuplicate) return alert('同一分类下文件夹名称不可重复');
        const newId = `f_${Date.now()}`;
        const newFolder = { id: newId, name: newFolderName, children: [] };
        const updatedFolders = updateFolderTree(enrichedFolders, parentId, parent => ({ ...parent, children: [...(parent.children || []), newFolder] }));
        setMediaFolders(updatedFolders);
        setModal({ type: 'none' });
        setSelectedFolderId(newId);
    };

    const handleRenameFolder = (newName) => {
        const { id, parentNode } = modal.data;
        const isDuplicate = parentNode?.children?.some(child => child.name === newName && child.id !== id);
        if (isDuplicate) return alert('同一分类下文件夹名称不可重复');
        setMediaFolders(prev => updateFolderTree(prev, id, folder => ({ ...folder, name: newName })));
        setModal({ type: 'none' });
    };
    
    const getFilesForFolder = useCallback((folderId, directOnly = false) => {
        if (folderId === 'all' && !directOnly) return safeMediaFiles;
        const folder = findFolderById(folderId, enrichedFolders);
        if (!folder) return [];
        let files = safeMediaFiles.filter(f => f.folderId === folderId);
        if (!directOnly && folder.children) {
            folder.children.forEach(child => {
                files = files.concat(getFilesForFolder(child.id, false));
            });
        }
        return files;
    }, [safeMediaFiles, enrichedFolders, findFolderById]);
    
    const handleConfirmDelete = () => {
        const { folder, files: filesToDelete } = modal.data;
        if (folder) {
            const parent = findParentFolder(folder.id, enrichedFolders) || allFilesNode;
            const filesToMove = getFilesForFolder(folder.id, false);
            if (filesToMove.length > 0) console.log(`Moving ${filesToMove.length} files to ${parent.name}`);
            setMediaFolders(prev => deleteFolderFromTree(prev, folder.id));
            setSelectedFolderId(parent.id);
        } else if (filesToDelete) {
            filesToDelete.forEach(id => handleDeleteFile(id));
            setSelectedFileIds(new Set());
        }
        setModal({ type: 'none' });
    };

    const handleFolderSelect = (id) => {
        setSelectedFolderId(id);
        setSelectedFileIds(new Set());
        setCurrentPage(1);
    };

    const handleContextMenu = (e, folder) => {
        e.preventDefault();
        e.stopPropagation();
        if (!folder) return;
        const isAll = folder.id === 'all';
        const options = [
            { label: '新建子文件夹', icon: <FolderPlus size={14} />, action: () => setModal({ type: 'newFolder', data: { parentId: folder.id, parentNode: folder } }), disabled: false },
            { label: '重命名', icon: <Edit3 size={14} />, action: () => { const parentNode = findParentFolder(folder.id, enrichedFolders) || allFilesNode; setModal({ type: 'rename', data: { id: folder.id, name: folder.name, parentNode } }); }, disabled: isAll },
            { label: '删除文件夹', icon: <Trash2 size={14} />, isDanger: true, action: () => setModal({ type: 'deleteConfirm', data: { folder }, content: `确定删除文件夹“${folder.name}”吗？（子文件夹将一并删除）` }), disabled: isAll },
        ];
        setContextMenu({ x: e.clientX, y: e.clientY, options });
    };

    const handleFileContextMenu = (e, file) => {
        e.preventDefault();
        e.stopPropagation();
        const isMotherSound = file.folderId.startsWith('mother_');
        const isUnprocessed = file.status === '未处理';
        
        let options = [
            { label: '预览', icon: <Play size={14} />, action: () => handlePlayPause(file) },
        ];

        if (isMotherSound) {
            if (isUnprocessed) {
                options.push({ label: '导出到Audacity', icon: <Download size={14} />, action: () => onExportAudacity(file) });
            }
            options.push({ label: '编辑', icon: <Edit size={14} />, action: () => setModal({ type: 'editFile', data: { file } }) });
            // Added Move for Mother Sound as well, as per "Move Material" requirement
            options.push({ label: '移动到...', icon: <Move size={14} />, action: () => setModal({ type: 'moveFile', data: { files: [file] } }) });
        } else {
            options.push(
                { label: '编辑', icon: <Edit size={14} />, action: () => setModal({ type: 'editFile', data: { file } }) },
                { label: '移动到...', icon: <Move size={14} />, action: () => setModal({ type: 'moveFile', data: { files: Array.from(selectedFileIds.size > 1 ? selectedFileIds : [file.id]) } }) }
            );
        }
        
        options.push({ label: '删除', icon: <Trash2 size={14} />, action: () => setModal({ type: 'deleteConfirm', data: { files: [file.id] }, content: `确定删除素材“${file.name}”吗？` }), isDanger: true });
        
        setContextMenu({ x: e.clientX, y: e.clientY, options });
    };

    const closeContextMenu = () => setContextMenu({ x: null, y: null, options: [] });

    const currentFiles = useMemo(() => {
        let files = getFilesForFolder(selectedFolderId, false);
        if (searchQuery) files = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        files.sort((a, b) => {
            const valA = a[currentSort.key] || '';
            const valB = b[currentSort.key] || '';
            if (valA < valB) return currentSort.order === 'asc' ? -1 : 1;
            if (valA > valB) return currentSort.order === 'asc' ? 1 : -1;
            return 0;
        });
        return files;
    }, [selectedFolderId, searchQuery, currentSort, getFilesForFolder]);

    const totalPages = Math.ceil(currentFiles.length / itemsPerPage);
    const paginatedFiles = currentFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const handleSortChange = (key) => {
        if (currentSort.key === key) {
            setCurrentSort({ ...currentSort, order: currentSort.order === 'asc' ? 'desc' : 'asc' });
        } else {
            setCurrentSort({ key, order: 'desc' });
        }
    };
    const getSortIcon = (key) => currentSort.key === key ? (currentSort.order === 'asc' ? '▲' : '▼') : '';
    const getPatientName = (id) => safePatients.find(p => p.id === id)?.name || '-';

    const handleSelectFile = (fileId, e) => {
        const newSelectedIds = new Set(selectedFileIds);
        if (e.shiftKey && lastSelectedId) {
            const lastIndex = paginatedFiles.findIndex(f => f.id === lastSelectedId);
            const currentIndex = paginatedFiles.findIndex(f => f.id === fileId);
            const [start, end] = [lastIndex, currentIndex].sort((a, b) => a - b);
            for (let i = start; i <= end; i++) newSelectedIds.add(paginatedFiles[i].id);
        } else if (e.ctrlKey || e.metaKey) {
            newSelectedIds.has(fileId) ? newSelectedIds.delete(fileId) : newSelectedIds.add(fileId);
        } else {
            newSelectedIds.clear();
            newSelectedIds.add(fileId);
        }
        setSelectedFileIds(newSelectedIds);
        setLastSelectedId(fileId);
    };

    const handleSelectAll = (e) => setSelectedFileIds(e.target.checked ? new Set(paginatedFiles.map(f => f.id)) : new Set());

    const handleSaveFile = (updatedFile) => {
        // Mock update
        console.log('Updating file:', updatedFile);
        setModal({ type: 'none' });
    };

    const handleConfirmMove = (filesToMove, targetFolderId) => {
        // Mock move
        console.log(`Moving ${filesToMove.length} files to ${targetFolderId}`);
        setModal({ type: 'none' });
        setSelectedFileIds(new Set());
    };

    const isMotherSoundFolder = selectedFolderId.startsWith('root_mother');
    const columns = isMotherSoundFolder
        ? ['name', 'patientId', 'status', 'duration', 'type', 'size', 'date']
        : ['name', 'duration', 'type', 'size', 'date'];

    const renderFileRow = (file) => (
        <tr key={file.id} onClick={(e) => handleSelectFile(file.id, e)} onDoubleClick={() => handlePlayPause(file)} onContextMenu={(e) => handleFileContextMenu(e, file)} className={`hover:bg-[#1a1d26] cursor-pointer ${selectedFileIds.has(file.id) ? 'bg-blue-900/20' : ''}`}>
            <td className="p-3"><input type="checkbox" checked={selectedFileIds.has(file.id)} onChange={(e) => handleSelectFile(file.id, e)} onClick={e => e.stopPropagation()} className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" /></td>
            {columns.map(col => {
                switch (col) {
                    case 'name': return <td key={col} className="p-3">{file.name}</td>;
                    case 'patientId': return <td key={col} className="p-3">{getPatientName(file.patientId)}</td>;
                    case 'status': return <td key={col} className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${file.status === '已处理' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{file.status}</span></td>;
                    case 'duration': return <td key={col} className="p-3">{formatTime(file.duration)}</td>;
                    case 'type': return <td key={col} className="p-3">{file.type}</td>;
                    case 'size': return <td key={col} className="p-3">{file.size}</td>;
                    case 'date': return <td key={col} className="p-3">{file.date}</td>;
                    default: return null;
                }
            })}
            <td className="p-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handlePlayPause(file); }} className="p-1 hover:bg-gray-700 rounded">{playingFile?.id === file.id ? <StopCircle size={16}/> : <Play size={16}/>}</button>
                    {file.folderId.startsWith('mother_') && file.status === '未处理' && <button onClick={(e) => {e.stopPropagation(); onExportAudacity(file);}} className="p-1 hover:bg-gray-700 rounded"><Download size={16}/></button>}
                    <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'editFile', data: { file } }); }} className="p-1 hover:bg-gray-700 rounded"><Edit size={16}/></button>
                    <button onClick={(e) => { e.stopPropagation(); setModal({ type: 'deleteConfirm', data: { files: [file.id] }, content: `确定删除素材“${file.name}”吗？` }); }} className="p-1 hover:bg-gray-700 rounded"><Trash2 size={16}/></button>
                </div>
            </td>
        </tr>
    );
    
    const selectedFile = useMemo(() => {
        if (selectedFileIds.size !== 1) return null;
        const lastId = Array.from(selectedFileIds)[0];
        return safeMediaFiles.find(f => f.id === lastId);
    }, [selectedFileIds, safeMediaFiles]);

    const renderDetails = () => {
        if (!selectedFile) return <div className="w-80 flex flex-col items-center justify-center text-gray-600 bg-[#0f1219] shrink-0 h-full"><Music size={48} className="opacity-10 mb-4" /><p className="text-sm">选择一个素材查看详情</p></div>;
        
        const isMotherVoiceFile = selectedFile.folderId.startsWith('mother_');
        const patient = isMotherVoiceFile ? safePatients.find(p => p.id === selectedFile.patientId) : null;
        const isUnprocessed = selectedFile.status === '未处理';
        const folderPath = getBreadcrumbPath(selectedFile.folderId);

        const DetailRow = ({ label, value }) => <div className="flex justify-between border-b border-gray-800 py-2.5"><span className="text-gray-500">{label}</span><span className="text-gray-300 text-right truncate">{value}</span></div>;

        return (
            <div className="w-80 bg-[#13161f] flex flex-col p-6 animate-in slide-in-from-right-10 duration-200 shrink-0">
                <h3 className="text-base font-bold text-white mb-4">素材详情</h3>
                <div className="aspect-square bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg flex items-center justify-center mb-6 border border-white/5 relative group shrink-0">
                    <Music size={64} className="text-white/10" />
                    <button onClick={() => handlePlayPause(selectedFile)} className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">{playingFile?.id === selectedFile.id ? <StopCircle size={48} className="text-white drop-shadow-lg"/> : <Play size={48} className="text-white drop-shadow-lg" />}</button>
                </div>
                <div className="mb-6">
                    <input type="range" min="0" max={selectedFile.duration || 0} value={playingFile?.id === selectedFile.id ? playingFile.currentTime : 0} onChange={handleSeek} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer range-sm" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1"><span>{formatTime(playingFile?.id === selectedFile.id ? playingFile.currentTime : 0)}</span><span>{formatTime(selectedFile.duration)}</span></div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => handlePlayPause(selectedFile)} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500">{playingFile?.id === selectedFile.id ? <StopCircle size={20}/> : <Play size={20}/>}</button>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 break-all leading-snug">{selectedFile.name}</h3>
                <div className="space-y-2 mb-6 text-sm flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <DetailRow label="文件位置" value={folderPath} />
                    {isMotherVoiceFile && <DetailRow label="关联患者" value={patient?.name || '-'} />}
                    {isMotherVoiceFile && <DetailRow label="状态" value={selectedFile.status} />}
                    <DetailRow label="时长" value={formatTime(selectedFile.duration)} />
                    <DetailRow label="格式" value={selectedFile.type} />
                    <DetailRow label="大小" value={selectedFile.size} />
                    <DetailRow label="采样率" value={selectedFile.rate} />
                    <DetailRow label="添加时间" value={selectedFile.date} />
                </div>
                {isMotherVoiceFile && (
                    <div className={`flex items-center gap-2 p-3 rounded text-xs ${isUnprocessed ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                        {isUnprocessed ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        <span>{isUnprocessed ? '此录音尚未处理，无法用于训练' : '此录音已处理完成，可用于训练'}</span>
                    </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                    {isMotherVoiceFile && isUnprocessed && <ActionButton icon={<Download size={14}/>} label="导出到Audacity" primary onClick={() => onExportAudacity(selectedFile)} />}
                    <div className="flex gap-2">
                        <ActionButton icon={<Edit size={14}/>} label="编辑" secondary onClick={() => setModal({ type: 'editFile', data: { file: selectedFile } })} />
                        <ActionButton icon={<Move size={14}/>} label="移动" secondary onClick={() => setModal({ type: 'moveFile', data: { files: [selectedFile] } })} />
                        <ActionButton icon={<Trash2 size={14}/>} label="删除" danger onClick={() => setModal({ type: 'deleteConfirm', data: { files: [selectedFile.id] }, content: `确定删除素材“${selectedFile.name}”吗？` })} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full bg-[#13161f] animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative" onClick={closeContextMenu}>
            <audio ref={audioRef} />
            <ContextMenu x={contextMenu.x} y={contextMenu.y} options={contextMenu.options} onClose={closeContextMenu} />
            <NewFolderModal isOpen={modal.type === 'newFolder'} title="新建子文件夹" onConfirm={handleCreateFolder} onCancel={() => setModal({ type: 'none' })} />
            <RenameModal isOpen={modal.type === 'rename'} title={`重命名: ${modal.data?.name}`} defaultValue={modal.data?.name} onConfirm={handleRenameFolder} onCancel={() => setModal({ type: 'none' })} />
            <ConfirmModal isOpen={modal.type === 'deleteConfirm'} title="确认删除" content={modal.content || `确定删除选中的 ${modal.data?.files?.length || 0} 个素材吗？`} isDanger onConfirm={handleConfirmDelete} onCancel={() => setModal({ type: 'none' })} />
            <EditFileModal isOpen={modal.type === 'editFile'} onClose={() => setModal({ type: 'none' })} file={modal.data?.file} onSave={handleSaveFile} folders={enrichedFolders} patients={safePatients} />
            <MoveFileModal isOpen={modal.type === 'moveFile'} onClose={() => setModal({ type: 'none' })} onMove={handleConfirmMove} files={modal.data?.files} folders={enrichedFolders} />

            <div className="w-72 border-r border-gray-800 bg-[#0f1219] flex flex-col min-w-[280px] shrink-0">
                <div className="p-4 border-b border-gray-800"><span className="text-sm font-bold text-white">素材分类</span></div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    <FolderNode node={allFilesNode} selectedFolderId={selectedFolderId} onSelectFolder={handleFolderSelect} onContextMenu={handleContextMenu} />
                </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <div className="p-4 border-b border-gray-800 flex flex-col gap-3 shrink-0">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">{getBreadcrumbPath(selectedFolderId)}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1 max-w-lg">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" placeholder="在当前分类下搜索..." className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={16}/></button>}
                        </div>
                        <div className="flex items-center gap-2">
                            <select onChange={(e) => handleSortChange(e.target.value)} value={currentSort.key} className="bg-[#1e2330] border border-gray-700 rounded-lg py-2 px-3 text-xs text-gray-300 appearance-none pr-8 cursor-pointer hover:bg-[#2a3040] outline-none">
                                <option value="date">按添加时间</option>
                                <option value="name">按名称</option>
                                <option value="duration">按时长</option>
                            </select>
                            <ChevronDown size={14} className="pointer-events-none -ml-7 text-gray-500" />
                            {SYSTEM_CONFIG.version.includes('Plus') && isMotherSoundFolder && <ActionButton icon={'◎'} label="录音" onClick={() => setShowRecordModal(true)} />}
                            <ActionButton icon={'↑'} label="导入" onClick={() => setShowImportModal({ isOpen: true })} />
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {paginatedFiles.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1a1d26] text-gray-400 text-xs uppercase font-medium sticky top-0 z-10">
                                <tr>
                                    <th className="p-3"><input type="checkbox" onChange={handleSelectAll} checked={selectedFileIds.size > 0 && selectedFileIds.size === paginatedFiles.length} className="form-checkbox h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" /></th>
                                    {columns.map(key => <th key={key} onClick={() => handleSortChange(key)} className="p-3 cursor-pointer hover:text-white">{key.replace('patientId', '关联患者')} {getSortIcon(key)}</th>)}
                                    <th className="p-3 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 text-gray-300">
                                {paginatedFiles.map(renderFileRow)}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">未找到相关素材</div>
                    )}
                </div>
                <div className="h-12 bg-[#1a1d26] border-t border-gray-800 px-6 flex items-center justify-between">
                    <div>
                        {selectedFileIds.size > 0 && (
                            <div className="flex gap-2">
                                <ActionButton label={`删除选中 (${selectedFileIds.size})`} danger onClick={() => setModal({ type: 'deleteConfirm', data: { files: Array.from(selectedFileIds) }, content: `确定删除选中的 ${selectedFileIds.size} 个素材吗？` })} />
                                <ActionButton label={`批量移动 (${selectedFileIds.size})`} secondary onClick={() => {
                                    const files = safeMediaFiles.filter(f => selectedFileIds.has(f.id));
                                    setModal({ type: 'moveFile', data: { files } });
                                }} />
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>共 {currentFiles.length} 条</span>
                        <select value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-transparent border border-gray-700 rounded px-2 py-1">
                            <option value={10}>10/页</option>
                            <option value={20}>20/页</option>
                            <option value={50}>50/页</option>
                        </select>
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="disabled:opacity-50">‹</button>
                        <span>{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="disabled:opacity-50">›</button>
                    </div>
                </div>
            </div>
            {renderDetails()}
        </div>
    );
};

export default MediaLibraryView;
