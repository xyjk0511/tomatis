import React from 'react';
import DeviceCard from '../components/common/DeviceCard';
import ActionButton from '../components/common/ActionButton';
import StatusLegend from '../components/common/StatusLegend';
import { Play, Pause } from 'lucide-react';

// 修复点 2: DashboardView 接收 onHandleResume 属性
const DashboardView = ({ devices, onCardClick, onStart, onPause, onHandleResume, onStop, onVolumeChange, onAllStart, onAllPause, onMoreOptions }) => {
	const onlineCount = devices.filter(d => d.status !== 'locked' && d.status !== 'offline').length;
	const canStartAll = devices.some(d => d.status === 'assigned');
	const canPauseAll = devices.some(d => d.status === 'running');

	return (
		<div className="flex flex-col h-full p-4 gap-3">
			<div className="flex justify-between items-center shrink-0 h-8">
				<div className="flex gap-2"><ActionButton icon={<Play size={14} fill="currentColor" />} label="全部开始" onClick={onAllStart} disabled={!canStartAll} /><ActionButton icon={<Pause size={14} fill="currentColor" />} label="全部暂停" secondary onClick={onAllPause} disabled={!canPauseAll} /></div>
				<div className="flex items-center gap-4 text-xs text-gray-400"><StatusLegend color="bg-green-500" label="运行中" /><StatusLegend color="bg-yellow-500" label="暂停" /><StatusLegend color="bg-indigo-500" label="已分配" /><StatusLegend color="bg-blue-500" label="待机" /><StatusLegend color="bg-red-500" label="异常" /><StatusLegend color="bg-gray-600" label="离线" /><StatusLegend color="bg-gray-800" label="未开通" /></div>
			</div>
			<div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
				{/* MODIFIED: Changed the grid layout to a fixed grid-cols-4 for 4x3 layout */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 pb-2">
					{devices.map((device) => (
						<DeviceCard 
							key={device.id} 
							{...device} 
							onClick={() => onCardClick(device)} 
							onStart={onStart} 
							onPause={onPause} 
							onResume={onHandleResume} // 修复点 3: 将新的属性名传递给 DeviceCard
							onStop={onStop} 
							onVolumeChange={onVolumeChange} 
							onMoreOptions={onMoreOptions} 
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default DashboardView;
