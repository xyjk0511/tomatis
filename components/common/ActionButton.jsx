import React from 'react';

const ActionButton = ({ icon, label, secondary = false, onClick, disabled = false, className = "" }) => (
	<button 
		onClick={onClick}
		disabled={disabled}
		className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 active:scale-95 whitespace-nowrap 
			${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
			${secondary ? 'bg-[#1e2330] text-gray-300 hover:bg-[#2a3040] border border-gray-700' : 'bg-[#1e2330] text-gray-300 hover:bg-[#2a3040] border border-gray-700'} ${className}`}
	>
		{icon} <span>{label}</span>
	</button>
);

export default ActionButton;
