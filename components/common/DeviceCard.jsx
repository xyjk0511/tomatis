import React, { useState } from 'react';
import { Headphones, Play, Pause, PlusCircle, StopCircle, MoreHorizontal, Battery, Link2Off, User, BatteryWarning, Volume2, Lock } from 'lucide-react';
import VolumeSlider from './VolumeSlider';

const DeviceCard = ({ id, status, label, patientInfo, progressInfo, volumeInfo, errorInfo, onClick, onStart, onPause, onResume, onStop, onVolumeChange, onMoreOptions }) => {
	const isLocked = status === 'locked';	
	const isOffline = status === 'offline';	
	const isStandby = status === 'connected';	
	const isAssigned = status === 'assigned';	
	const isRunning = status === 'running';	
	const isPaused = status === 'paused';	
	const isError = status === 'error';	

	let cardStyle = "bg-[#13161f] border border-gray-800 hover:border-gray-700";	
	let iconColor = "text-gray-500";
	
	if (isStandby) {
		cardStyle = "bg-[#13161f] border border-blue-500/30 hover:border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer hover:translate-y-[-2px]";
		iconColor = "text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]";
	} else if (isAssigned) {
		cardStyle = "bg-[#13161f] border border-indigo-500/50 hover:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] cursor-pointer";
		iconColor = "text-indigo-400";
	} else if (isRunning) {
		cardStyle = "bg-[#05110a] border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] cursor-pointer";
		iconColor = "text-green-500";
	} else if (isPaused) {
		cardStyle = "bg-[#161205] border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)] cursor-pointer";
		iconColor = "text-yellow-500";
	} else if (isError) {
		cardStyle = "bg-[#1a0f0f] border border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse cursor-pointer";
		iconColor = "text-red-500";
	} else if (isOffline) {
		cardStyle = "bg-[#13161f] border border-gray-700 hover:border-gray-600 opacity-80 cursor-pointer";
		iconColor = "text-gray-600";
	}

	const [showMenu, setShowMenu] = useState(false);

	return (
		<div onClick={onClick} className={`relative rounded-lg p-2.5 flex flex-col transition-all duration-300 group select-none w-full min-h-[190px] h-full overflow-hidden ${cardStyle}`}>
			<div className="absolute top-2.5 right-3 z-20">
				<div className={`text-xl font-bold font-mono ${isLocked || isOffline ? 'text-gray-700' : 'text-[#1f2433]'} ${isStandby && '!text-blue-900/30'} ${isAssigned && '!text-indigo-900/30'} ${isRunning && '!text-green-900/30'} ${isPaused && '!text-yellow-900/30'} ${isError && '!text-red-900/30'}`}>{id}</div>
			</div>
			{isOffline && (
				<div className="flex-1 flex flex-col items-center justify-center gap-2 z-10"><div className="relative mt-2 opacity-50"><Headphones strokeWidth={1} className={`w-12 h-12 ${iconColor}`} /><div className="absolute -bottom-1 -right-1 bg-gray-700 rounded-full p-0.5 border-2 border-[#13161f]"><Link2Off size={12} className="text-gray-400" /></div></div><span className="text-xs text-gray-500 font-medium mt-1">请连接设备</span><div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 opacity-50"><User size={14} className="text-gray-600" /><span className="text-[10px] text-gray-600">未就绪</span></div></div>
			)}
			{isStandby && (
				<div className="flex-1 flex flex-col items-center justify-center gap-2 z-10"><div className="flex justify-between w-full px-1 absolute top-2.5 left-2.5"><div className="flex items-center gap-1 text-gray-500"><Battery size={10} /> <span className="text-[9px] font-mono">85%</span></div></div><div className="relative mt-2"><Headphones strokeWidth={1} className={`w-12 h-12 ${iconColor} transition-transform group-hover:scale-110`} /><div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5 border-2 border-[#13161f] animate-pulse"><PlusCircle size={12} className="text-white" /></div></div><span className="text-xs text-blue-400 font-bold mt-1">添加患者</span></div>
			)}
			{isAssigned && (
				<div className="flex-1 flex flex-col items-center justify-center z-10 h-full relative">
					<div className="relative mb-3 mt-1"><Headphones strokeWidth={1} className="w-10 h-10 text-blue-500" /><div className="absolute -top-1 -right-4 bg-gray-800/80 rounded px-1 py-0.5 border border-gray-700 flex items-center gap-0.5"><Battery size={8} className="text-green-400" /><span className="text-[8px] text-gray-300 font-mono">85%</span></div></div>
					<div className="text-center mb-3"><div className="text-sm font-bold text-white mb-0.5">{patientInfo?.name}</div><div className="text-[10px] text-gray-300">{progressInfo?.schemeName}</div><div className="text-[10px] text-gray-400 bg-gray-800/50 px-2 py-0.5 rounded border border-gray-700/50 mt-1">{progressInfo?.nextSession || "准备就绪"}</div></div>
					<div className="w-full mt-auto flex gap-2 items-center">
						<button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }} className="p-1.5 rounded border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 relative"><MoreHorizontal size={14}/>{showMenu && (<div className="absolute bottom-full left-0 mb-1 w-24 bg-[#1a1d26] border border-gray-700 rounded shadow-xl py-1 z-30 flex flex-col"><div onClick={(e) => { e.stopPropagation(); onMoreOptions(id, 'change'); setShowMenu(false); }} className="px-3 py-1.5 text-[10px] text-gray-300 hover:bg-blue-600 text-left">变更方案</div><div onClick={(e) => { e.stopPropagation(); onMoreOptions(id, 'adjust'); setShowMenu(false); }} className="px-3 py-1.5 text-[10px] text-gray-300 hover:bg-blue-600 text-left">调整进度</div><div onClick={(e) => { e.stopPropagation(); onMoreOptions(id, 'remove'); setShowMenu(false); }} className="px-3 py-1.5 text-[10px] text-red-400 hover:bg-red-900/30 text-left border-t border-gray-700">移除患者</div></div>)}</button>
						<button onClick={(e) => { e.stopPropagation(); onStart && onStart(id); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-900/20 font-medium active:scale-95"><Play size={10} fill="currentColor" /> 开始治疗</button>
					</div>
				</div>
			)}
			{isRunning && (
				<div className="flex-1 flex flex-col z-10 h-full">
					<div className="flex items-center justify-between mb-2 pr-6"><span className="text-sm font-bold text-white">{patientInfo?.name}</span><div className="flex items-center gap-1 text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-500/20"><Battery size={9} /> <span className="text-[9px] font-mono">85%</span></div></div>
					<div className="flex-1 flex flex-col justify-center items-center text-center gap-1"><div className="text-[10px] text-gray-400">{progressInfo?.currentSession}</div><div className="text-2xl font-mono font-bold text-green-400 tracking-wider">{progressInfo?.timer} <span className="text-xs text-gray-600 font-normal">/ {progressInfo?.totalTime || '30:00'}</span></div><div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-1"><div className="h-full bg-green-500 w-[45%] animate-[pulse_3s_ease-in-out_infinite]"></div></div></div>
					<div className="mt-auto pt-2 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center gap-2 mb-2 px-1 cursor-default"><Volume2 size={10} className="text-gray-500" />
                        <div className="flex-1 grid grid-cols-2 gap-2"><VolumeSlider value={volumeInfo?.air || 60} colorClass="bg-blue-500" onChange={(val) => onVolumeChange && onVolumeChange(id, 'air', val)}/><VolumeSlider value={volumeInfo?.bone || 50} colorClass="bg-yellow-500" onChange={(val) => onVolumeChange && onVolumeChange(id, 'bone', val)}/></div>
                        </div>
						<button onClick={(e) => { e.stopPropagation(); onPause && onPause(id); }} className="w-full bg-green-900/30 border border-green-500/30 hover:bg-green-500 hover:text-white text-green-400 text-xs py-1.5 rounded flex items-center justify-center gap-1.5 transition-all active:scale-95"><Pause size={10} fill="currentColor" /> 暂停训练</button>
					</div>
				</div>
			)}
			{isPaused && (
				<div className="flex-1 flex flex-col z-10 h-full">
					<div className="flex items-center justify-between mb-2 pr-6"><span className="text-sm font-bold text-gray-300">{patientInfo?.name}</span><div className="flex items-center gap-1 text-yellow-500/50"><Battery size={9} /> <span className="text-[9px] font-mono">85%</span></div></div>
					<div className="flex-1 flex flex-col justify-center items-center text-center">
                        <div className="text-[10px] text-gray-500 mb-0.5">{progressInfo?.currentSession}</div>
                        <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-500/20 mb-2">
                            <Pause size={10} fill="currentColor"/>
                            <span className="text-[10px] font-medium">已暂停 {progressInfo?.timer} / {progressInfo?.totalTime || '30:00'}</span>
                        </div>
                    </div>
					<div className="mt-auto grid grid-cols-2 gap-2"><button onClick={(e) => { e.stopPropagation(); onResume && onResume(id); }} className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-colors font-medium active:scale-95"><Play size={10} fill="currentColor"/> 继续</button><button onClick={(e) => { e.stopPropagation(); onStop && onStop(id); }} className="border border-gray-600 text-gray-400 hover:text-white hover:bg-gray-700 hover:border-gray-500 text-xs py-1.5 rounded flex items-center justify-center gap-1 transition-all active:scale-95"><StopCircle size={10} /> 停止</button></div>
				</div>
			)}
			{isError && (
				<div className="flex-1 flex flex-col items-center justify-center z-10"><BatteryWarning size={32} strokeWidth={1} className={`${iconColor} mb-2`} /><div className="text-xs text-red-500 font-bold mb-1">异常警告</div><div className="text-[10px] text-red-400/80 bg-red-900/20 px-2 py-0.5 rounded border border-red-900/30 animate-pulse">{errorInfo?.reason || "未知错误"}</div></div>
			)}
			{isLocked && (
				<div className="flex-1 flex flex-col items-center justify-center h-full gap-2 opacity-30"><Headphones size={36} strokeWidth={1} className="text-gray-600" /><div className="flex items-center gap-1"><Lock size={10} className="text-gray-500" /><span className="text-[10px] text-gray-500 font-medium">{label}</span></div><div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 opacity-50"><User size={14} className="text-gray-600" /><span className="text-[10px] text-gray-600">未开通</span></div></div>
			)}
			{(!isLocked && !isOffline) && <div className={`absolute inset-0 bg-gradient-to-b from-transparent ${isAssigned ? 'to-indigo-500/5' : isRunning ? 'to-green-500/5' : isPaused ? 'to-yellow-500/5' : isError ? 'to-red-500/10' : 'to-blue-500/5'} pointer-events-none`}></div>}
		</div>
	);
};

export default DeviceCard;
