import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit, Copy, Trash2, Download } from 'lucide-react';
import { INITIAL_SCHEMES, DEFAULT_STAGES } from '../data/mockData';
import ConfirmModal from '../components/modals/ConfirmModal';
import CopySchemeModal from '../components/modals/CopySchemeModal';
import NewSchemeModal from '../components/modals/NewSchemeModal';
import SchemeEditor from '../components/scheme/SchemeEditor';

// Read-only details component
const SchemeDetails = ({ scheme, onEdit, onCopy, onDelete, onExport }) => {
    const [activeTab, setActiveTab] = useState(1);

    const ParametersTable = ({ stageData }) => {
        const headers = ['次', '音源', '滤波', '低1', '高1', '低2', '高2', '中心', '坡度', '提前', '延迟', '输入', '气导', '骨导', '门控', '平衡'];
        if (!stageData || stageData.length === 0) return <div className="text-center text-gray-500 py-8">此阶段无参数数据</div>;
        return (
            <div className="overflow-x-auto custom-scrollbar"><table className="w-full min-w-[1200px] text-xs text-left"><thead className="bg-[#1a1d26] text-gray-400 uppercase sticky top-0"><tr>{headers.map(h => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead><tbody className="divide-y divide-gray-800 text-gray-300">{stageData.map((row, index) => (<tr key={index} className="hover:bg-[#1a1d26]/50"><td className="p-2 font-mono text-blue-400">{index + 1}</td><td className="p-2 truncate max-w-[150px]">{row.music}</td><td className="p-2">{row.filter}</td><td className="p-2">{row.low1}</td><td className="p-2">{row.high1}</td><td className="p-2">{row.low2}</td><td className="p-2">{row.high2}</td><td className="p-2">{row.center}</td><td className="p-2">{row.slope}</td><td className="p-2">{row.lead}</td><td className="p-2">{row.delay}</td><td className="p-2">{row.inVol}</td><td className="p-2">{row.air}</td><td className="p-2">{row.bone}</td><td className="p-2">{row.gate}</td><td className="p-2">{row.balance}</td></tr>))}</tbody></table></div>
        );
    };

    return (
        <>
            <div className="p-4 border-b border-gray-800 bg-[#1a1d26]">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">{scheme.name}</h2>
                        <p className="text-sm text-gray-400 mt-1">{scheme.type}</p>
                        <p className="text-xs text-gray-500 mt-2">结构: 3阶段 × 20次 = 60次，每次30分钟</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onExport} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg"><Download size={14}/> 导出</button>
                        <button onClick={onCopy} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg"><Copy size={14}/> 复制</button>
                        <button onClick={onEdit} disabled={scheme.isPreset} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-50"><Edit size={14}/> 编辑</button>
                        <button onClick={onDelete} disabled={scheme.isPreset} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg disabled:opacity-50"><Trash2 size={14}/> 删除</button>
                    </div>
                </div>
                <p className="text-sm text-gray-400 mt-3 leading-relaxed">{scheme.description}</p>
                {!scheme.isPreset && <p className="text-xs text-gray-600 mt-2">创建于: {scheme.createdAt} | 最后修改: {scheme.updatedAt}</p>}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
                <div className="px-4 border-b border-gray-800">
                    <div className="flex -mb-px">
                        {[1, 2, 3].map(stage => (
                            <button 
                                key={stage} 
                                onClick={() => setActiveTab(stage)} 
                                className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === stage ? 'border-blue-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                            >
                                <span>第 {stage} 阶段</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeTab === stage ? 'bg-blue-900/30 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>1-20次</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4"><ParametersTable stageData={scheme.stages[activeTab]} /></div>
            </div>
        </>
    );
};


const SchemeManagementView = ({ mediaFiles, devices }) => {
    const [schemes, setSchemes] = useState(INITIAL_SCHEMES);
    const [selectedSchemeId, setSelectedSchemeId] = useState(schemes[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [copyModalOpen, setCopyModalOpen] = useState(false);
    const [newSchemeModalOpen, setNewSchemeModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingScheme, setEditingScheme] = useState(null);

    const availableMusic = useMemo(() => {
        if (!mediaFiles) return [];
        return mediaFiles.filter(file => {
            const isMotherSound = file.folderId && file.folderId.startsWith('mother_');
            if (isMotherSound) {
                return file.status === '已处理';
            }
            return true;
        });
    }, [mediaFiles]);

    const selectedScheme = schemes.find(s => s.id === selectedSchemeId);

    const filteredSchemes = schemes.filter(s => {
        const matchesFilter = filter === 'all' || (filter === 'preset' && s.isPreset) || (filter === 'custom' && !s.isPreset);
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleNew = () => setNewSchemeModalOpen(true);
    const handleConfirmNew = ({ name, type, templateId }) => {
        setNewSchemeModalOpen(false);
        let stages = JSON.parse(JSON.stringify(DEFAULT_STAGES));
        if (templateId !== 'empty') {
            const template = schemes.find(s => s.id === templateId);
            if (template) stages = JSON.parse(JSON.stringify(template.stages));
        }
        setEditingScheme({ name, type, isPreset: false, description: '', stages, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] });
        setIsEditing(true);
    };

    const handleEdit = () => {
        if (!selectedScheme || selectedScheme.isPreset) return;
        setEditingScheme(selectedScheme);
        setIsEditing(true);
    };

    const handleSave = (schemeToSave) => {
        if (schemeToSave.id) {
            setSchemes(schemes.map(s => s.id === schemeToSave.id ? { ...schemeToSave, updatedAt: new Date().toISOString().split('T')[0] } : s));
        } else {
            const newId = `C${Date.now()}`;
            const newScheme = { ...schemeToSave, id: newId };
            setSchemes([newScheme, ...schemes]);
            setSelectedSchemeId(newId);
        }
        setIsEditing(false);
        setEditingScheme(null);
    };

    const handleDelete = () => {
        if (!selectedScheme || selectedScheme.isPreset) return;
        const devicesUsingScheme = devices.filter(d => d.progressInfo?.schemeId === selectedScheme.id);
        if (devicesUsingScheme.length > 0) {
            alert(`该方案正在被 ${devicesUsingScheme.length} 个设备使用，无法删除。`);
            return;
        }
        setDeleteConfirmOpen(true);
    };
    const handleConfirmDelete = () => {
        if (selectedScheme?.isPreset) return;
        setSchemes(schemes.filter(s => s.id !== selectedSchemeId));
        setDeleteConfirmOpen(false);
        setSelectedSchemeId(schemes[0]?.id || null);
    };
    
    const handleCopy = () => setCopyModalOpen(true);
    const handleConfirmCopy = (newName) => {
        if (!selectedScheme || !newName.trim()) return setCopyModalOpen(false);
        const newId = `C${Date.now()}`;
        const newScheme = { ...selectedScheme, id: newId, name: newName.trim(), isPreset: false, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
        setSchemes([newScheme, ...schemes]);
        setSelectedSchemeId(newId);
        setCopyModalOpen(false);
    };

    const handleExport = () => {
        if (!selectedScheme) return;
        const dataStr = JSON.stringify(selectedScheme, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${selectedScheme.name}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="flex h-full bg-[#13161f] text-white">
            <div className="w-80 border-r border-gray-800 flex flex-col bg-[#0f1219]">
                <div className="p-4 border-b border-gray-800 space-y-3">
                    <div className="flex gap-2">
                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" placeholder="搜索方案名称" className="w-full bg-[#1a1d26] border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm focus:border-blue-500 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
                        <button onClick={handleNew} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg" title="新建方案"><Plus size={20} /></button>
                    </div>
                    <div className="flex gap-2 text-xs">{['all', 'preset', 'custom'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full ${filter === f ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>{f === 'all' ? '全部' : f === 'preset' ? '预置方案' : '自定义方案'}</button>))}</div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">{filteredSchemes.map(scheme => (<div key={scheme.id} onClick={() => { setSelectedSchemeId(scheme.id); setIsEditing(false); }} className={`p-3 border-b border-gray-800/50 cursor-pointer transition-colors ${selectedSchemeId === scheme.id ? 'bg-[#1a1d26]' : ''} ${scheme.isPreset ? 'hover:bg-purple-900/10' : 'hover:bg-blue-900/10'}`}><div className="flex justify-between items-start mb-1"><span className={`font-bold text-sm ${selectedSchemeId === scheme.id ? 'text-white' : 'text-gray-300'}`}>{scheme.name}</span><span className={`text-[10px] px-1.5 py-0.5 rounded border ${scheme.isPreset ? 'bg-purple-900/30 text-purple-400 border-purple-500/20' : 'bg-blue-900/30 text-blue-400 border-blue-500/20'}`}>{scheme.isPreset ? '预置' : '自定义'}</span></div><div className="text-xs text-gray-500 truncate">{scheme.type}</div></div>))}</div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                {isEditing ? (
                    <SchemeEditor 
                        scheme={editingScheme}
                        onSave={handleSave}
                        onCancel={() => setIsEditing(false)}
                        availableMusic={availableMusic}
                    />
                ) : selectedScheme ? (
                    <SchemeDetails 
                        scheme={selectedScheme}
                        onEdit={handleEdit}
                        onCopy={handleCopy}
                        onDelete={handleDelete}
                        onExport={handleExport}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">请从左侧选择一个方案查看详情</div>
                )}
            </div>

            <ConfirmModal isOpen={deleteConfirmOpen} title="删除方案" content={`确定要删除方案“${selectedScheme?.name}”吗？此操作不可恢复。`} isDanger confirmText="确认删除" onConfirm={handleConfirmDelete} onCancel={() => setDeleteConfirmOpen(false)} />
            <CopySchemeModal isOpen={copyModalOpen} onClose={() => setCopyModalOpen(false)} onConfirm={handleConfirmCopy} defaultName={selectedScheme ? `${selectedScheme.name} (副本)` : ''} />
            <NewSchemeModal isOpen={newSchemeModalOpen} onClose={() => setNewSchemeModalOpen(false)} onConfirm={handleConfirmNew} existingSchemes={schemes} />
        </div>
    );
};

export default SchemeManagementView;
