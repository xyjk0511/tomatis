import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, ChevronDown } from 'lucide-react';

import { globalStyles } from './utils/styles';
import {
	MOCK_PATIENTS_DATA,
	MOCK_TREATMENT_RECORDS,
	MOCK_MEDIA_FILES,
	createInitialFolders,
	INITIAL_SCHEMES,
    SYSTEM_CONFIG
} from './data/mockData';

import NavItem from './components/common/NavItem';
import ChangePasswordModal from './components/modals/ChangePasswordModal';
import SchemeSelectionModal from './components/modals/SchemeSelectionModal';
import AdjustProgressModal from './components/modals/AdjustProgressModal';
import ConfirmModal from './components/modals/ConfirmModal';
import ImportModal from './components/modals/ImportModal';
import RecordingModal from './components/modals/RecordingModal';
import ExportAudacityModal from './components/modals/ExportAudacityModal';

import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import PatientArchiveView from './views/PatientArchiveView';
import PatientDetailsView from './views/PatientDetailsView';
import SchemeManagementView from './views/SchemeManagementView';
import MediaLibraryView from './views/MediaLibraryView';
import SettingsView from './views/SettingsView';

// Helper to format seconds into MM:SS
const formatTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const TomatisDashboard = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const [currentView, setCurrentView] = useState('dashboard');
	const [selectedDeviceId, setSelectedDeviceId] = useState(null);
	
	const [showSchemeSelect, setShowSchemeSelect] = useState(false);
	const [pendingAssignPatient, setPendingAssignPatient] = useState(null);
    const [isChangingScheme, setIsChangingScheme] = useState(false);

	const [adjustProgressOpen, setAdjustProgressOpen] = useState(false);
	const [operatingDeviceId, setOperatingDeviceId] = useState(null);
    
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', content: '', onConfirm: () => {} });

	const [patients, setPatients] = useState(MOCK_PATIENTS_DATA);
	const [records, setRecords] = useState(MOCK_TREATMENT_RECORDS);
	const [mediaFiles, setMediaFiles] = useState(MOCK_MEDIA_FILES);
	const [mediaFolders, setMediaFolders] = useState(createInitialFolders(MOCK_MEDIA_FILES));
	
	const [showImportModal, setShowImportModal] = useState({ isOpen: false, fileList: [] });
	const [showRecordModal, setShowRecordModal] = useState(false);
	const [showExportAudacityModal, setShowExportAudacityModal] = useState({ isOpen: false, file: null });

    // Login Lockout State
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState(null);

	const updateMediaFiles = useCallback((newFile) => {
		setMediaFiles(prev => {
			const updatedFiles = [...prev, newFile];
			setMediaFolders(createInitialFolders(updatedFiles));
			return updatedFiles;
		});
	}, []);
	
	const handleDeleteFile = useCallback((fileId) => {
		setMediaFiles(prev => {
			const updatedFiles = prev.filter(f => f.id !== fileId);
			setMediaFolders(createInitialFolders(updatedFiles));
			return updatedFiles;
		});
	}, []);
	
	const handleImportFile = useCallback((name, type, folderId, patientId = null) => {
		const newFile = { id: `m${Date.now()}`, name, folderId, duration: Math.floor(Math.random() * 600) + 120, size: `${(Math.random() * 50 + 10).toFixed(1)}MB`, type: type.toUpperCase(), date: new Date().toISOString().split('T')[0], rate: '44.1 kHz', bit: '24 bit', patientId, status: type.toLowerCase() === 'aiff' || type.toLowerCase() === 'aif' ? '已处理' : 'N/A' };
		updateMediaFiles(newFile);
	}, [updateMediaFiles]);
	
	const handleSaveRecording = useCallback((recordedFile) => {
		updateMediaFiles(recordedFile);
	}, [updateMediaFiles]);
	
	const onCloseRecordingModal = () => setShowRecordModal(false);
	const handleExportAudacity = (file) => setShowExportAudacityModal({ isOpen: true, file });
	const handleConfirmExportAudacity = () => {
		console.log(`File ${showExportAudacityModal.file.name} exported to Audacity format`);
		setShowExportAudacityModal({ isOpen: false, file: null });
	};

	const handleStart = (deviceId) => setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'running', progressInfo: { ...d.progressInfo, currentSession: d.progressInfo?.nextSession || '第一阶段 - 第1次', timerSeconds: d.progressInfo?.timerSeconds || 0, totalTime: '30:00' } } : d));
	const handlePause = (deviceId) => setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'paused' } : d));
	const handleResume = (deviceId) => setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'running' } : d));
	
	const handleStop = (deviceId) => {
		setDevices(prev => prev.map(d => {
			if (d.id !== deviceId) return d;
			const current = d.progressInfo?.currentSession || '第一阶段 - 第1次';
			const [stageStr, sessionStr] = current.split(' - ');
			let stageNum = 1;
			if (stageStr.includes('二')) stageNum = 2; else if (stageStr.includes('三')) stageNum = 3;
			const sessionNum = parseInt(sessionStr?.match(/第(\d+)次/)?.[1] || '1', 10);
			let nextStage = stageNum, nextSession = sessionNum + 1;
			if (nextSession > 20) { nextSession = 1; nextStage = Math.min(nextStage + 1, 3); }
			const nextSessionLabel = `第${nextStage}阶段 - 第${nextSession}次`;
			setPatients(p => p.map(pat => pat.id === d.patientInfo?.id ? { ...pat, lastProgress: { stage: stageNum, session: sessionNum } } : pat));
			return { ...d, status: 'assigned', progressInfo: { ...d.progressInfo, nextSession: nextSessionLabel, currentSession: null, timerSeconds: 0 } };
		}));
	};
	
	const handleVolumeChange = (deviceId, type, value) => setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, volumeInfo: { ...d.volumeInfo, [type]: value } } : d));
	const handleAllStart = () => setDevices(prev => prev.map(d => d.status === 'assigned' ? { ...d, status: 'running', progressInfo: { ...d.progressInfo, currentSession: d.progressInfo?.nextSession || '第一阶段 - 第1次', timerSeconds: d.progressInfo?.timerSeconds || 0, totalTime: '30:00' } } : d));
	const handleAllPause = () => setDevices(prev => prev.map(d => d.status === 'running' ? { ...d, status: 'paused' } : d));

	const initialDevices = Array.from({ length: 12 }, (_, i) => {
		const id = (i + 1).toString().padStart(2, '0');
        const p1 = MOCK_PATIENTS_DATA.find(p => p.id === 'P001');
        const p2 = MOCK_PATIENTS_DATA.find(p => p.id === 'P002');
        const p3 = MOCK_PATIENTS_DATA.find(p => p.id === 'P003');
        const p6 = MOCK_PATIENTS_DATA.find(p => p.id === 'P006');

		if (i === 0) return { id, status: 'running', label: p2.name, patientInfo: p2, progressInfo: { currentSession: `第${p2.trainingHistory.length}阶段 - 第${p2.trainingHistory.length}次`, timerSeconds: 860, totalTime: '30:00', schemeName: INITIAL_SCHEMES.find(s=>s.id===p2.lastSchemeId).name, schemeId: p2.lastSchemeId }, volumeInfo: { air: 60, bone: 50 } };
		if (i === 1) return { id, status: 'paused', label: p3.name, patientInfo: p3, progressInfo: { currentSession: `第${p3.trainingHistory.length}阶段 - 第${p3.trainingHistory.length}次`, timerSeconds: 525, totalTime: '30:00', schemeName: INITIAL_SCHEMES.find(s=>s.id===p3.lastSchemeId).name, schemeId: p3.lastSchemeId }, volumeInfo: { air: 60, bone: 50 } };
		if (i === 2) return { id, status: 'assigned', label: p1.name, patientInfo: p1, progressInfo: { nextSession: `第${Math.floor(p1.trainingHistory.length/20)+1}阶段 - 第${p1.trainingHistory.length%20+1}次`, schemeName: INITIAL_SCHEMES.find(s => s.id === p1.lastSchemeId).name, schemeId: p1.lastSchemeId, timerSeconds: 0 }, volumeInfo: { air: 60, bone: 50 } };
        if (i === 3) return { id, status: 'assigned', label: p6.name, patientInfo: p6, progressInfo: { nextSession: `第${Math.floor(p6.trainingHistory.length/20)+1}阶段 - 第${p6.trainingHistory.length%20+1}次`, schemeName: INITIAL_SCHEMES.find(s => s.id === p6.lastSchemeId).name, schemeId: p6.lastSchemeId, timerSeconds: 0 }, volumeInfo: { air: 60, bone: 50 } };
		if (i === 4) return { id, status: 'error', label: '异常', errorInfo: { reason: '连接中断' }, volumeInfo: { air: 60, bone: 50 } };
		if (i >= 5 && i <= 7) return { id, status: 'connected', label: '待分配', volumeInfo: { air: 60, bone: 50 } };
		return { id, status: 'locked', label: '未开通' };
	});

	const [devices, setDevices] = useState(initialDevices);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setDevices(prevDevices => 
                prevDevices.map(d => {
                    if (d.status === 'running' && (d.progressInfo.timerSeconds || 0) < 1800) {
                        const newTime = (d.progressInfo.timerSeconds || 0) + 1;
                        return { ...d, progressInfo: { ...d.progressInfo, timerSeconds: newTime } };
                    }
                    return d;
                })
            );
        }, 1000);
        return () => clearInterval(timerInterval);
    }, []);

	const handleLogin = (u, p, setError) => {
        // Check lockout
        if (lockoutTime) {
            const remaining = Math.ceil((lockoutTime - new Date()) / 60000);
            if (remaining > 0) {
                return setError(`账户已锁定，请 ${remaining} 分钟后重试`);
            } else {
                setLockoutTime(null);
                setLoginAttempts(0);
            }
        }

        if (u === 'skip' && p === 'skip') {
            setIsLoggedIn(true);
            setLoginAttempts(0);
            return;
        }

		if (u === 'admin' && p === '123456') {
            setShowFirstLoginModal(true);
            setLoginAttempts(0);
        } else if (u === 'test' && p === 'test') {
            setIsLoggedIn(true);
            setLoginAttempts(0);
        } else {
            const newAttempts = loginAttempts + 1;
            setLoginAttempts(newAttempts);
            if (newAttempts >= 5) {
                const lockUntil = new Date(new Date().getTime() + 15 * 60000); // 15 minutes
                setLockoutTime(lockUntil);
                setError('账户已锁定，请 15 分钟后重试');
            } else {
                setError(`用户名或密码错误 (剩余尝试次数: ${5 - newAttempts})`);
            }
        }
	};
	const handleConfirmPasswordChange = (p) => { setShowFirstLoginModal(false); setIsLoggedIn(true); console.log(`Password changed to: ${p}`); };
	const handleLogout = () => { setIsLoggedIn(false); setCurrentView('dashboard'); };

	useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
	const formatTime = (d) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

	const handleCardClick = (device) => {
        if (device.status === 'locked' || device.status === 'offline') return alert(device.status === 'locked' ? '该通道未开通' : '请先连接耳机设备');
		setSelectedDeviceId(device.id);
		if (device.status === 'connected') setCurrentView('patient-archive-select');
		else if (['assigned', 'running', 'paused', 'error'].includes(device.status)) setCurrentView('patient-details');
	};

	const handleAssignPatient = (patient) => {
		const currentPatient = patients.find(p => p.id === patient.id);
		if (currentPatient?.hasHistory) {
			const scheme = INITIAL_SCHEMES.find(s => s.id === currentPatient.lastSchemeId);
			const nextSession = currentPatient.trainingHistory.length + 1;
			const nextSessionLabel = `第${Math.floor((nextSession-1)/20)+1}阶段 - 第${(nextSession-1)%20+1}次`;
			setDevices(prev => prev.map(d => d.id === selectedDeviceId ? { ...d, status: 'assigned', label: patient.name, patientInfo: { ...patient }, progressInfo: { nextSession: nextSessionLabel, schemeName: scheme?.name, schemeId: scheme?.id, timerSeconds: 0 } } : d));
			setCurrentView('dashboard');
		} else {
			setPendingAssignPatient(patient);
			setShowSchemeSelect(true);
            setIsChangingScheme(false);
		}
	};

	const handleConfirmScheme = (scheme) => {
		const targetDevice = selectedDeviceId || operatingDeviceId;
		setDevices(prev => prev.map(d => {
			if (d.id === targetDevice) {
				return { ...d, status: 'assigned', label: pendingAssignPatient.name, patientInfo: { ...pendingAssignPatient }, progressInfo: { nextSession: '第一阶段 - 第1次', schemeName: scheme.name, schemeId: scheme.id, timerSeconds: 0 } };
			}
			return d;
		}));
        setPatients(prev => prev.map(p => p.id === pendingAssignPatient.id ? { ...p, hasHistory: true, lastSchemeId: scheme.id, trainingHistory: [] } : p));
		setShowSchemeSelect(false);
		setPendingAssignPatient(null);
        setOperatingDeviceId(null);
		setCurrentView('dashboard');
	};

	const handleCancelScheme = () => {
		setShowSchemeSelect(false);
		setPendingAssignPatient(null);
        setOperatingDeviceId(null);
        if (!isChangingScheme) { setCurrentView('dashboard'); }
        setIsChangingScheme(false);
	};

	const handleAddPatient = (p) => setPatients(prev => [p, ...prev]);
	const handleUpdatePatient = (p) => {
		setPatients(prev => prev.map(pat => pat.id === p.id ? p : pat));
		setDevices(prev => prev.map(d => d.patientInfo?.id === p.id ? { ...d, label: p.name, patientInfo: { ...p } } : d));
	};
	const handleDeletePatient = (id) => {
		const patientName = patients.find(p => p.id === id)?.name;
		setPatients(prev => prev.filter(p => p.id !== id));
		setDevices(prev => prev.map(d => d.label === patientName ? { ...d, status: 'connected', label: '待分配', patientInfo: null, progressInfo: null, errorInfo: null } : d));
	};

	const handleRemovePatient = (deviceId) => {
		const id = deviceId || operatingDeviceId;
		setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'connected', label: '待分配', patientInfo: null, progressInfo: null, errorInfo: null } : d));
		if (id === selectedDeviceId) setCurrentView('dashboard');
		setOperatingDeviceId(null);
	};

	const handleMoreOptions = (deviceId, type) => {
		setOperatingDeviceId(deviceId);
		const device = devices.find(d => d.id === deviceId);
		if (!device?.patientInfo) return;
		if (type === 'change') {
            setConfirmModal({
                isOpen: true,
                title: '变更方案',
                content: '变更方案后，将从新方案第一阶段第1次开始，确定变更？',
                onConfirm: () => {
                    const patient = patients.find(p => p.id === device.patientInfo.id);
                    setPendingAssignPatient(patient);
                    setIsChangingScheme(true);
                    setShowSchemeSelect(true);
                }
            });
		} else if (type === 'adjust') {
			setAdjustProgressOpen(true);
		} else if (type === 'remove') {
			setConfirmModal({
                isOpen: true,
                title: '移除患者',
                content: `确定要将患者 ${device.label} 从当前通道移除吗？`,
                onConfirm: () => handleRemovePatient(deviceId)
            });
		}
	};
    
    const handleConfirmAdjustProgress = (deviceId, newProgress) => {
        const { stage, session } = newProgress;
        const stageMap = { 1: '一', 2: '二', 3: '三' };
        const nextSessionLabel = `第${stageMap[stage]}阶段 - 第${session}次`;
        
        setDevices(prev => prev.map(d => 
            d.id === deviceId 
            ? { ...d, progressInfo: { ...d.progressInfo, nextSession: nextSessionLabel, timerSeconds: 0 } } 
            : d
        ));
        setAdjustProgressOpen(false);
        setOperatingDeviceId(null);
    };

	const onlineCount = devices.filter(d => d.status !== 'locked' && d.status !== 'offline').length;
    
    const devicesWithTimer = devices.map(d => ({
        ...d,
        progressInfo: {
            ...d.progressInfo,
            timer: formatTimer(d.progressInfo?.timerSeconds || 0),
        }
    }));
    const currentDeviceForDetailsWithTimer = devicesWithTimer.find(d => d.id === selectedDeviceId);

	if (!isLoggedIn) return <div className="w-full h-screen bg-black flex items-center justify-center p-4"><div className="aspect-video w-full max-h-full max-w-full bg-[#0b0e14] text-gray-300 font-sans shadow-2xl relative flex flex-col overflow-hidden border border-gray-900 rounded-sm"><LoginView onLogin={handleLogin} /><ChangePasswordModal isOpen={showFirstLoginModal} onConfirm={handleConfirmPasswordChange} onCancel={() => setShowFirstLoginModal(false)} /></div></div>;

	return (
		<div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden p-4">
			<style>{globalStyles}</style>
			<div className="aspect-video w-full max-h-full max-w-full bg-[#0b0e14] text-gray-300 font-sans shadow-2xl relative flex flex-col overflow-hidden border border-gray-900 rounded-sm">
				
				<SchemeSelectionModal 
					isOpen={showSchemeSelect}
					patient={pendingAssignPatient}
                    currentSchemeId={isChangingScheme ? devices.find(d => d.id === operatingDeviceId)?.progressInfo?.schemeId : null}
					onSelectScheme={handleConfirmScheme}
					onClose={handleCancelScheme}
				/>

                <AdjustProgressModal
                    isOpen={adjustProgressOpen}
                    onClose={() => { setAdjustProgressOpen(false); setOperatingDeviceId(null); }}
                    onConfirm={handleConfirmAdjustProgress}
                    device={devices.find(d => d.id === operatingDeviceId)}
                />

                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    content={confirmModal.content}
                    onConfirm={() => {
                        confirmModal.onConfirm();
                        setConfirmModal({ isOpen: false, title: '', content: '', onConfirm: () => {} });
                    }}
                    onCancel={() => setConfirmModal({ isOpen: false, title: '', content: '', onConfirm: () => {} })}
                />

				<ImportModal isOpen={showImportModal.isOpen} onClose={() => setShowImportModal({ isOpen: false, fileList: [] })} onImport={handleImportFile} initialFolders={mediaFolders} patients={patients} existingFiles={mediaFiles} />
				<RecordingModal isOpen={showRecordModal} onClose={onCloseRecordingModal} onSaveRecording={handleSaveRecording} patients={patients} onExportAudacity={handleExportAudacity} />
				<ExportAudacityModal isOpen={showExportAudacityModal.isOpen} onClose={() => setShowExportAudacityModal({ isOpen: false, file: null })} file={showExportAudacityModal.file} onConfirmExport={handleConfirmExportAudacity} patients={patients} />
				
				<header className="h-14 bg-[#1a1d26] flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
					<div className="flex items-center gap-8 lg:gap-10">
						<div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}><div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base">T</div><span className="text-lg font-bold text-white tracking-wide">Tomatis<span className="text-blue-500">{SYSTEM_CONFIG.version.includes('Pro') ? 'Pro' : 'Plus'}</span></span></div>
						<nav className="flex items-center gap-1">
							<NavItem label="监控中心" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
							<NavItem label="患者档案" active={currentView === 'patient-archive-manage'} onClick={() => setCurrentView('patient-archive-manage')} />
							<NavItem label="方案管理" active={currentView === 'scheme-management'} onClick={() => setCurrentView('scheme-management')} />
							<NavItem label="素材库" active={currentView === 'media-library'} onClick={() => setCurrentView('media-library')} />
							<NavItem label="系统设置" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
						</nav>
					</div>
					<div className="flex items-center gap-4 text-xs lg:text-sm">
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">{SYSTEM_CONFIG.version}</span>
                        <div className="relative"><select className="bg-[#1e2330] border border-gray-700 rounded-lg py-1.5 px-3 text-xs text-gray-300 appearance-none pr-8 cursor-pointer hover:bg-[#2a3040] outline-none"><option>8通道</option><option>12通道</option></select><ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" /></div>
						<div className="flex items-center gap-2 text-gray-400"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div><span>在线: {onlineCount}/8</span></div>
						<div className="text-gray-400 font-mono text-sm border-l border-gray-700 pl-4 pr-4">{formatTime(currentTime)}</div>
						<button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors" title="退出登录"><LogOut size={18} /></button>
					</div>
				</header>

				<main className="flex-1 flex flex-col overflow-hidden relative bg-[#0b0e14]">
					{currentView === 'dashboard' && <DashboardView devices={devicesWithTimer} onCardClick={handleCardClick} onStart={handleStart} onPause={handlePause} onHandleResume={handleResume} onStop={handleStop} onVolumeChange={handleVolumeChange} onAllStart={handleAllStart} onAllPause={handleAllPause} onMoreOptions={handleMoreOptions} />}
					{currentView === 'patient-archive-select' && <PatientArchiveView mode="select" targetDeviceId={selectedDeviceId} patients={patients} records={records} onSelectPatient={handleAssignPatient} onBack={() => setCurrentView('dashboard')} onAddPatient={handleAddPatient} onUpdatePatient={handleUpdatePatient} onDeletePatient={handleDeletePatient} />}
					{currentView === 'patient-archive-manage' && <PatientArchiveView mode="manage" patients={patients} records={records} onSelectPatient={() => {}} onBack={() => setCurrentView('dashboard')} onAddPatient={handleAddPatient} onUpdatePatient={handleUpdatePatient} onDeletePatient={handleDeletePatient} />}
					{currentView === 'patient-details' && currentDeviceForDetailsWithTimer && <PatientDetailsView device={currentDeviceForDetailsWithTimer} patients={patients} onBack={() => setCurrentView('dashboard')} onRemove={() => handleRemovePatient(selectedDeviceId)} onStart={handleStart} onPause={handlePause} onResume={handleResume} onStop={handleStop} onVolumeChange={handleVolumeChange} onMoreOptions={handleMoreOptions} />}
					{currentView === 'scheme-management' && <SchemeManagementView mediaFiles={mediaFiles} devices={devices} />}
					{currentView === 'media-library' && <MediaLibraryView initialFolders={mediaFolders} mediaFiles={mediaFiles} setMediaFolders={setMediaFolders} patients={patients} setShowImportModal={setShowImportModal} setShowRecordModal={setShowRecordModal} handleDeleteFile={handleDeleteFile} onExportAudacity={handleExportAudacity} schemes={INITIAL_SCHEMES} />}
                    {currentView === 'settings' && <SettingsView />}
				</main>
			</div>
		</div>
	);
};

export default TomatisDashboard;
