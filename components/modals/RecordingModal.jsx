import React, { useState, useEffect, useRef } from 'react';
import { Monitor, CheckCircle2, WifiOff, Play, StopCircle, Save, RefreshCw, X, PlayCircle } from 'lucide-react';
import SaveSuccessModal from './SaveSuccessModal';
import ActionButton from '../common/ActionButton';
import FormField from '../common/FormField';
import { formatTime } from '../../utils/helpers.jsx';

const RecordingModal = ({ isOpen, onClose, onSaveRecording, patients, onExportAudacity }) => {
    const [patientId, setPatientId] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isMicConnected, setIsMicConnected] = useState(false);
    const [duration, setDuration] = useState(0);
    const [level, setLevel] = useState(0);
    const [status, setStatus] = useState('ready');
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [recordedFile, setRecordedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const timerRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);

    const patientName = patients.find(p => p.id === patientId)?.name;

    const cleanup = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPatientId('');
            setDuration(0);
            setStatus('ready');
            setLevel(0);
            setShowSaveSuccess(false);
            setRecordedFile(null);
            setIsRecording(false);
            setFileName('');
            audioChunksRef.current = [];

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    setIsMicConnected(true);
                    streamRef.current = stream;
                    mediaRecorderRef.current = new MediaRecorder(stream);
                    mediaRecorderRef.current.ondataavailable = event => {
                        audioChunksRef.current.push(event.data);
                    };
                    
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    audioContextRef.current = audioContext;
                    analyserRef.current = audioContext.createAnalyser();
                    sourceRef.current = audioContext.createMediaStreamSource(stream);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.fftSize = 256;
                    const bufferLength = analyserRef.current.frequencyBinCount;
                    dataArrayRef.current = new Uint8Array(bufferLength);
                })
                .catch(() => setIsMicConnected(false));
        } else {
            cleanup();
        }
        return cleanup;
    }, [isOpen]);

    const updateLevel = () => {
        if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            const avg = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
            setLevel(Math.min(100, Math.floor((avg / 128) * 100)));
        }
    };

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
                updateLevel();
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    const handleStartRecording = () => {
        if (!isMicConnected || !patientId) return;
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setDuration(0);
        setStatus('recording');
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        setFileName(`${patientName}_${dateStr}`);
    };

    const handleStopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setStatus('stopped');
    };

    const handlePreview = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
        audioRef.current.play();
    };

    const handleSave = () => {
        const newFile = {
            id: `m${Date.now()}`,
            name: `${fileName}.wav`,
            duration: duration,
            patientId: patientId,
            folderId: 'mother_raw',
            status: '未处理',
            type: 'WAV',
            date: new Date().toISOString().split('T')[0],
            rate: '44.1 kHz',
            bit: '16 bit',
        };
        onSaveRecording(newFile);
        setRecordedFile(newFile);
        setShowSaveSuccess(true);
    };

    const handleReset = () => {
        setStatus('ready');
        setDuration(0);
        setIsRecording(false);
        setShowSaveSuccess(false);
        setRecordedFile(null);
        audioChunksRef.current = [];
    };

    const handleCloseSuccess = () => {
        setShowSaveSuccess(false);
        onClose();
    }

    if (!isOpen) return null;

    const canStart = status === 'ready' && isMicConnected && patientId;
    const canSave = status === 'stopped' && duration > 0;
    const canPreview = status === 'stopped' && duration > 0;

    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <audio ref={audioRef} />
            <SaveSuccessModal isOpen={showSaveSuccess} onClose={handleCloseSuccess} onExport={onExportAudacity} recordedFile={recordedFile} />

            <div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-6 w-[800px] shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col" style={{ display: showSaveSuccess ? 'none' : 'flex' }}>
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-3">录制母亲声音</h3>
                
                <div className="grid grid-cols-3 gap-6 mb-4">
                    <div className="col-span-1">
                        <FormField label="关联患者" type="select" value={patientId} onChange={(e) => setPatientId(e.target.value)} required disabled={isRecording}>
                            <option value="">请选择关联患者</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </FormField>
                    </div>
                    <div className="col-span-2 space-y-2">
                        <div className="flex justify-between items-center text-xs text-gray-400">
                            <span>话筒状态</span>
                            <span className={`flex items-center gap-1 ${isMicConnected ? 'text-green-400' : 'text-red-400'}`}>
                                {isMicConnected ? <CheckCircle2 size={12}/> : <WifiOff size={12}/>} {isMicConnected ? '已连接' : '未连接'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400"><span>输入电平 ({level}%)</span></div>
                        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                            <div className={`h-full ${isMicConnected && isRecording ? 'bg-green-600' : 'bg-green-600/30'}`} style={{ width: `${level}%`, transition: 'width 0.1s' }}></div>
                        </div>
                    </div>
                </div>

                <div className={`flex-1 flex flex-col items-center justify-center min-h-[200px] rounded-lg border-2 border-dashed ${isRecording ? 'border-green-600/50 bg-green-900/10' : 'border-gray-700 bg-[#0b0e14]'} transition-all p-4`}>
                    {status === 'recording' && <div className="text-center"><div className="text-red-500 text-4xl font-mono animate-pulse">{formatTime(duration)}</div><p className="text-gray-400 text-sm mt-2">正在录音...</p></div>}
                    {status === 'stopped' && <div className="text-center"><div className="text-blue-400 text-4xl font-mono">{formatTime(duration)}</div><p className="text-gray-300 text-sm mt-2">录音已停止。</p><FormField label="文件名" type="text" value={fileName} onChange={e => setFileName(e.target.value)} required /></div>}
                    {status === 'ready' && <div className="text-center text-gray-500"><Monitor size={48} className="mb-2"/><p>点击下方按钮开始录音</p></div>}
                </div>
                
                <div className="mt-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <ActionButton icon={<PlayCircle size={16} />} label="试听" secondary onClick={handlePreview} disabled={!canPreview} />
                        <ActionButton icon={<RefreshCw size={16}/>} label="重录" secondary onClick={handleReset} disabled={isRecording} />
                    </div>
                    <div className="flex items-center gap-3">
                        <ActionButton icon={<X size={16}/>} label="取消" secondary onClick={onClose} disabled={isRecording} />
                        {status === 'ready' && <button onClick={handleStartRecording} disabled={!canStart} className="px-6 py-2 rounded text-white text-sm font-bold flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed"><Play size={16} fill="currentColor"/> 开始录音</button>}
                        {status === 'recording' && <button onClick={handleStopRecording} className="px-6 py-2 rounded bg-yellow-600 text-white hover:bg-yellow-500 text-sm font-bold flex items-center gap-2"><StopCircle size={16}/> 停止录音</button>}
                        {status === 'stopped' && <button onClick={handleSave} disabled={!canSave || !fileName} className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-500 text-sm font-bold flex items-center gap-2 disabled:bg-gray-700"><Save size={16}/> 保存</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordingModal;
