import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, ChevronLeft, ChevronRight, Users, ArrowLeft, Download, Check, X } from 'lucide-react';
import ActionButton from '../components/common/ActionButton';
import FormField from '../components/common/FormField';
import ConfirmModal from '../components/modals/ConfirmModal';
import Toast from '../components/common/Toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const calcAge = (dob) => {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
};

// Helper to highlight text
const HighlightText = ({ text, highlight }) => {
    if (!highlight || !text) return <span>{text}</span>;
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === highlight.toLowerCase() ? (
                    <span key={i} className="text-yellow-400 font-bold">{part}</span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
};

const PatientArchiveView = ({ mode = 'manage', targetDeviceId = null, patients, records, onSelectPatient, onBack, onAddPatient, onUpdatePatient, onDeletePatient }) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalType, setModalType] = useState('add');
	const [currentForm, setCurrentForm] = useState({});
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'info' });
    const [selectedRecords, setSelectedRecords] = useState(new Set());

    // 分页状态 - 患者列表
    const [patientPage, setPatientPage] = useState(1);
    const patientItemsPerPage = 10;

    // 分页状态 - 治疗记录
    const [recordPage, setRecordPage] = useState(1);
    const recordItemsPerPage = 8;

    // 日期筛选状态
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        const age = calcAge(currentForm.dob);
        if (age !== '' && age !== currentForm.age) {
            setCurrentForm(prev => ({ ...prev, age }));
        }
    }, [currentForm.dob]);

	const filteredPatients = patients.filter(p => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		const pinyinMatch = p.pinyin ? p.pinyin.toLowerCase().includes(q) : false;
		return p.name.toLowerCase().includes(q) || p.mrn.includes(q) || (p.phone && p.phone.includes(q)) || pinyinMatch;
	});
	const sortedPatients = [...filteredPatients].sort((a, b) => new Date(b.lastTreatment).getTime() - new Date(a.lastTreatment).getTime());
	
    const totalPatientPages = Math.ceil(sortedPatients.length / patientItemsPerPage);
    const paginatedPatients = sortedPatients.slice((patientPage - 1) * patientItemsPerPage, patientPage * patientItemsPerPage);

    const selectedPatient = patients.find(p => p.id === selectedPatientId);
	
    const filteredRecords = records.filter(r => {
        if (r.patientId !== selectedPatientId) return false;
        if (dateRange.start && new Date(r.time) < new Date(dateRange.start)) return false;
        if (dateRange.end && new Date(r.time) > new Date(dateRange.end + 'T23:59:59')) return false;
        return true;
    });
    
    const totalRecordPages = Math.ceil(filteredRecords.length / recordItemsPerPage);
    const paginatedRecords = filteredRecords.slice((recordPage - 1) * recordItemsPerPage, recordPage * recordItemsPerPage);

	const showToast = (message, type = 'info') => setToast({ message, type });

	const openAddModal = () => {	
		setModalType('add');	
		setCurrentForm({ name: '', gender: 'male', dob: '', phone: '', diagnosis: '', notes: '', guardian: '', age: '' });	
		setIsModalOpen(true);	
	};
	const openEditModal = () => {	
		if (!selectedPatient) return;	
		setModalType('edit');	
		setCurrentForm({ ...selectedPatient, age: selectedPatient.age || calcAge(selectedPatient.dob) });	
		setIsModalOpen(true);	
	};
	
	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setCurrentForm(prev => ({ ...prev, [name]: value }));
	};

	const handleSave = () => {
		if (!currentForm.name || !currentForm.gender || !currentForm.dob) return showToast('请填写必填项 (姓名、性别、出生日期)', 'info');
		if (new Date(currentForm.dob) > new Date()) return showToast('出生日期不能晚于当前日期', 'info');
		if (currentForm.phone && !/^\d{11}$/.test(currentForm.phone)) return showToast('请输入有效的11位手机号码', 'info');

		if (modalType === 'add') {
			const pinyin = currentForm.name.split('').map(() => 'x').join('').toLowerCase();
			const newPatient = {	
				...currentForm,	
				id: `P${Date.now()}`,	
				mrn: `7038${Math.floor(Math.random() * 10000)}`,	
				lastTreatment: new Date().toISOString().split('T')[0],	
				hasHistory: false,	
				pinyin,
				age: currentForm.age || 0
			};
			onAddPatient(newPatient);	
			setSelectedPatientId(newPatient.id);
            showToast('患者新建成功', 'success');
		} else {	
			onUpdatePatient(currentForm);
            showToast('患者信息已更新', 'success');
		}
		setIsModalOpen(false);
	};
	
	const handleDelete = () => { 
        onDeletePatient(selectedPatientId); 
        setDeleteConfirmOpen(false); 
        setIsModalOpen(false); 
        setSelectedPatientId(null); 
        showToast('患者已删除', 'success');
    };

    const handleDoubleClickPatient = (patient) => {
        if (mode === 'select') {
            onSelectPatient(patient);
        } else {
            showToast('请先在监控中心选择一个待分配的耳机通道', 'info');
        }
    };

    const handleExport = (format) => {
        if (!selectedPatient) return;
        const recordsToExport = selectedRecords.size > 0 
            ? filteredRecords.filter(r => selectedRecords.has(r.id))
            : filteredRecords;

        if (recordsToExport.length === 0) {
            showToast('没有可导出的治疗记录', 'info');
            return;
        }

        const patientInfo = `患者: ${selectedPatient.name} (MRN: ${selectedPatient.mrn})  性别: ${selectedPatient.gender === 'male' ? '男' : '女'}  年龄: ${selectedPatient.age}岁`;
        const headers = ["治疗时间", "方案名称", "阶段/次数", "模式", "时长", "状态"];
        const body = recordsToExport.map(r => [r.time, r.scheme, `${r.stage} / ${r.session}`, r.mode, r.duration, r.status]);

        if (format === 'pdf') {
            const doc = new jsPDF();
            doc.addFont('SimHei', 'SimHei', 'normal'); // Embed font
            doc.setFont('SimHei');
            doc.text("治疗报告", 14, 15);
            doc.setFontSize(10);
            doc.text(patientInfo, 14, 22);
            doc.autoTable({
                startY: 28,
                head: [headers],
                body: body,
                styles: { font: 'SimHei', fontStyle: 'normal' },
            });
            doc.save(`${selectedPatient.name}_治疗报告.pdf`);
        } else if (format === 'excel') {
            const ws = XLSX.utils.aoa_to_sheet([
                ["治疗报告"],
                [patientInfo],
                [],
                headers
            ]);
            XLSX.utils.sheet_add_aoa(ws, body, { origin: -1 }); // Append body
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "治疗记录");
            XLSX.writeFile(wb, `${selectedPatient.name}_治疗报告.xlsx`);
        }
        showToast(`报告已导出为 ${format.toUpperCase()}`, 'success');
    };
    
    const handleSelectRecord = (recordId) => {
        const newSelection = new Set(selectedRecords);
        if (newSelection.has(recordId)) {
            newSelection.delete(recordId);
        } else {
            newSelection.add(recordId);
        }
        setSelectedRecords(newSelection);
    };

    const handleSelectAllRecords = (e) => {
        if (e.target.checked) {
            setSelectedRecords(new Set(paginatedRecords.map(r => r.id)));
        } else {
            setSelectedRecords(new Set());
        }
    };

	return (
		<div className="flex h-full bg-[#13161f] animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative">
            <Toast message={toast.message} type={toast.type} onDismiss={() => setToast({ message: '', type: 'info' })} />
			{isModalOpen && (
				<div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[600px] shadow-2xl animate-in zoom-in-95 duration-200">
						<div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
							<h3 className="text-xl font-bold text-white">{modalType === 'add' ? '新建患者档案' : '编辑患者档案'}</h3>
							<button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
						</div>
						<div className="grid grid-cols-2 gap-4 mb-6">
                            {modalType === 'edit' && <FormField label="患者编号 (MRN)" name="mrn" value={currentForm.mrn || ''} readOnly />}
							<FormField label="姓名" required name="name" value={currentForm.name || ''} onChange={handleFormChange} placeholder="输入姓名" />
							<FormField label="性别" required type="select" name="gender" value={currentForm.gender || 'male'} onChange={handleFormChange}>
								<option value="male">男</option><option value="female">女</option>
							</FormField>
							<FormField label="出生日期" required type="date" name="dob" value={currentForm.dob || ''} onChange={handleFormChange} />
							<FormField label="年龄 (自动计算)" name="age" value={currentForm.age ?? ''} placeholder="岁" readOnly />
							<FormField label="联系电话" name="phone" placeholder="手机号码" value={currentForm.phone || ''} onChange={handleFormChange} />
							<FormField label="家长/监护人姓名" name="guardian" placeholder="儿童患者填写" value={currentForm.guardian || ''} onChange={handleFormChange} />
							<div className="col-span-2"><FormField label="诊断信息" name="diagnosis" placeholder="请输入诊断结果" value={currentForm.diagnosis || ''} onChange={handleFormChange} /></div>
							<div className="col-span-2"><label className="block text-xs font-medium text-gray-400 mb-1.5">备注</label><textarea className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none min-h-[80px] resize-none" placeholder="填写其他注意事项..." name="notes" value={currentForm.notes || ''} onChange={handleFormChange}/></div>
						</div>
						<div className="flex justify-between items-center pt-2">
							{modalType === 'edit' ? <button onClick={() => setDeleteConfirmOpen(true)} className="px-4 py-2 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 text-sm flex items-center gap-2"><Trash2 size={14}/> 删除</button> : <div></div>}
							<div className="flex gap-3"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-[#2a3040] text-sm">取消</button><button onClick={handleSave} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold shadow-lg">保存</button></div>
						</div>
					</div>
				</div>
			)}
			<ConfirmModal isOpen={deleteConfirmOpen} title="删除患者" content="确定要删除该患者档案吗？删除后，该患者的所有治疗记录也将一并删除，且不可恢复。" isDanger confirmText="确认删除" onConfirm={handleDelete} onCancel={() => setDeleteConfirmOpen(false)} />
			<div className="w-[320px] flex flex-col border-r border-gray-800 bg-[#0f1219] shrink-0">
				<div className="p-4 border-b border-gray-800 space-y-3">
					{mode === 'select' && <div className="flex items-center gap-2 text-blue-400 bg-blue-900/20 p-2 rounded text-xs border border-blue-500/30 mb-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div><span>正在为 <strong>{targetDeviceId}号耳机</strong> 选择患者</span></div>}
					<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" placeholder="姓名、住院号、门诊号、病历号..." className="w-full bg-[#1a1d26] border border-gray-700 rounded-lg pl-10 pr-8 py-2.5 text-sm text-white focus:border-blue-500 outline-none" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPatientPage(1); }} />{searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X size={14} /></button>}</div>
					{sortedPatients.length === 0 && searchQuery && <div className="text-center text-gray-500 text-xs py-2">未找到相关患者</div>}
					<div className="flex gap-2">
						<button onClick={openAddModal} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1 font-medium transition-colors"><Plus size={16} /> 新建患者</button>
						<button onClick={openEditModal} disabled={!selectedPatientId} className={`px-3 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors ${!selectedPatientId ? 'opacity-50 cursor-not-allowed' : ''}`} title="编辑患者档案"><Edit3 size={16} /></button>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto custom-scrollbar">
					{paginatedPatients.length === 0 ? <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm"><Users size={32} className="mb-2 opacity-50"/><div>{searchQuery ? '未找到相关患者' : '暂无患者'}</div><button onClick={openAddModal} className="mt-2 text-blue-400 hover:text-blue-300 text-xs">点击新建患者</button></div> : <div className="divide-y divide-gray-800/50">{paginatedPatients.map(p => {
						return (
							<div 
								key={p.id} 
								onClick={() => setSelectedPatientId(p.id)} 
								onDoubleClick={() => handleDoubleClickPatient(p)} 
								className={`p-3 cursor-pointer transition-all hover:bg-[#1a1d26] ${selectedPatientId === p.id ? 'bg-[#1a1d26] border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
							>
								<div className="flex justify-between items-start mb-1">
									<span className={`font-bold text-sm ${selectedPatientId === p.id ? 'text-white' : 'text-gray-300'}`}>
                                        <HighlightText text={p.name} highlight={searchQuery} />
									</span>
                                    <div className="flex items-center gap-2">
                                        {p.isInpatient && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">住</span>}
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            <HighlightText text={p.mrn} highlight={searchQuery} />
                                        </span>
                                    </div>
								</div>
								<div className="flex justify-between items-center text-xs text-gray-500">
									<div className="flex items-center gap-2">
										<span className={`px-1.5 py-0.5 rounded text-[10px] ${p.gender === 'male' ? 'bg-blue-900/20 text-blue-400' : 'bg-pink-900/20 text-pink-400'}`}>
                                            {p.gender === 'male' ? '♂' : '♀'}
                                        </span>
										<span>{p.age}岁</span>
                                        {p.phone && <span><HighlightText text={p.phone} highlight={searchQuery} /></span>}
									</div>
									<span>上次: {p.lastTreatment.split(' ')[0]}</span>
								</div>
							</div>
						)})}</div>}
				</div>
				<div className="p-2 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500 bg-[#0f1219]">
					<span>共 {sortedPatients.length} 人</span>
					<div className="flex gap-1 items-center">
                        <button onClick={() => setPatientPage(prev => Math.max(1, prev - 1))} disabled={patientPage === 1} className="p-1 hover:bg-gray-800 rounded disabled:opacity-50"><ChevronLeft size={14}/></button>
                        <span className="font-mono">{patientPage}/{totalPatientPages || 1}</span>
						<button onClick={() => setPatientPage(prev => Math.min(totalPatientPages, prev + 1))} disabled={patientPage === totalPatientPages || totalPatientPages === 0} className="p-1 hover:bg-gray-800 rounded disabled:opacity-50"><ChevronRight size={14}/></button>
					</div>
				</div>
			</div>
			<div className="flex-1 flex flex-col bg-[#13161f] min-w-0">
				{selectedPatient ? (
					<>
						<div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#1a1d26] shrink-0">
							<div className="flex items-center gap-4">
								{mode === 'select' && <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><ArrowLeft size={20} /></button>}
								<div className="flex items-center gap-3">
									<div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${selectedPatient.gender === 'male' ? 'bg-blue-600' : 'bg-pink-600'}`}>
										{selectedPatient.name[0]}
									</div>
									<div>
										<h2 className="text-lg font-bold text-white flex items-center gap-2">{selectedPatient.name}<span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-0.5 rounded">{selectedPatient.diagnosis || '无诊断信息'}</span></h2>
										<p className="text-xs text-gray-500">MRN: {selectedPatient.mrn} | 电话: {selectedPatient.phone || '-'}</p>
									</div>
								</div>
							</div>
							<div className="flex gap-3">
								<div className="flex items-center gap-2 bg-[#0b0e14] border border-gray-700 rounded-lg px-2 py-1">
                                    <span className="text-xs text-gray-500 pl-1">从</span>
                                    <input type="date" className="bg-transparent text-xs text-white outline-none w-24" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
                                    <span className="text-xs text-gray-500">至</span>
                                    <input type="date" className="bg-transparent text-xs text-white outline-none w-24" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
								</div>
								<ActionButton icon={<Search size={14}/>} label="查询" onClick={() => setRecordPage(1)} />
                                <div className="relative group">
                                    <ActionButton icon={<Download size={14}/>} label="导出报告" secondary />
                                    <div className="absolute top-full right-0 mt-2 w-28 bg-[#2a3040] border border-gray-700 rounded-md shadow-lg z-20 overflow-hidden hidden group-hover:block">
                                        <button onClick={() => handleExport('pdf')} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white">导出 PDF</button>
                                        <button onClick={() => handleExport('excel')} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-blue-600 hover:text-white">导出 Excel</button>
                                    </div>
                                </div>
								{mode === 'select' && <button onClick={() => onSelectPatient(selectedPatient)} className="px-4 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-bold shadow-lg shadow-green-900/30 flex items-center gap-2 animate-pulse"><Check size={14} /> 确认分配</button>}
							</div>
						</div>
						<div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col">
							<div className="bg-[#0b0e14] border border-gray-800 rounded-lg overflow-hidden flex-1 flex flex-col">
								<table className="w-full text-left text-sm">
									<thead className="bg-[#1a1d26] text-gray-400 text-xs uppercase font-medium sticky top-0 z-10">
										<tr>
											<th className="p-3 w-10 text-center"><input type="checkbox" className="rounded bg-gray-800 border-gray-600" onChange={handleSelectAllRecords} checked={selectedRecords.size > 0 && selectedRecords.size === paginatedRecords.length} /></th>
											<th className="p-3">治疗时间</th>
											<th className="p-3">方案名称</th>
											<th className="p-3">阶段/次数</th>
											<th className="p-3">模式</th>
											<th className="p-3">时长</th>
											<th className="p-3">状态</th>
											<th className="p-3 text-right">操作</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-800 text-gray-300">
										{paginatedRecords.length === 0 ?	
											<tr><td colSpan="8" className="p-8 text-center text-gray-500">暂无治疗记录</td></tr>	
											: paginatedRecords.map(record => (
												<tr key={record.id} className={`hover:bg-[#1a1d26]/50 transition-colors ${selectedRecords.has(record.id) ? 'bg-[#1a1d26]' : ''}`}>
													<td className="p-3 text-center"><input type="checkbox" className="rounded bg-gray-800 border-gray-600" checked={selectedRecords.has(record.id)} onChange={() => handleSelectRecord(record.id)} /></td>
													<td className="p-3 font-mono text-xs">{record.time}</td>
													<td className="p-3">{record.scheme}</td>
													<td className="p-3"><span className="bg-gray-800 px-2 py-0.5 rounded text-xs">{record.stage}</span><span className="text-gray-500 text-xs ml-1">{record.session}</span></td>
													<td className="p-3">{record.mode}</td>
													<td className="p-3">{record.duration}</td>
													<td className="p-3"><span className={`text-xs px-2 py-0.5 rounded border ${record.status === '完成' ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}`}>{record.status}</span></td>
													<td className="p-3 text-right"><button className="text-blue-400 hover:text-blue-300 text-xs">查看详情</button></td>
												</tr>
											))}
									</tbody>
								</table>
                                <div className="p-3 border-t border-gray-800 flex justify-between items-center bg-[#1a1d26] mt-auto">
                                    <span className="text-xs text-gray-500">共 {filteredRecords.length} 条记录 (已选 {selectedRecords.size} 条)</span>
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <button onClick={() => setRecordPage(prev => Math.max(1, prev - 1))} disabled={recordPage === 1} className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"><ChevronLeft size={14}/></button>
                                        <span className="font-mono">{recordPage}/{totalRecordPages || 1}</span>
                                        <button onClick={() => setRecordPage(prev => Math.min(totalRecordPages, prev + 1))} disabled={recordPage === totalRecordPages || totalRecordPages === 0} className="p-1 hover:bg-gray-700 rounded disabled:opacity-50"><ChevronRight size={14}/></button>
                                    </div>
                                </div>
							</div>
						</div>
					</>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-gray-500">
						<Users size={48} className="mb-4 opacity-20" />
						<p>请从左侧选择一位患者查看档案</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default PatientArchiveView;
