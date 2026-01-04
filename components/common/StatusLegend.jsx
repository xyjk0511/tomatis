import React from 'react';

const StatusLegend = ({ color, label }) => (
	<div className="flex items-center gap-2">
		<div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
		<span className="text-xs text-gray-400">{label}</span>
	</div>
);

export default StatusLegend;
