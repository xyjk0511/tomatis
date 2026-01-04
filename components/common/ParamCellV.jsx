import React from 'react';

// 修复 Unterminated string literal 错误 (缺失的模板字符串结束符)
const ParamCellV = ({ label, value, colSpan = 1, highlight = false }) => (
	<div className={`bg-[#0b0e14] p-2 flex flex-col justify-center items-center ${colSpan > 1 ? 'col-span-2' : ''} ${highlight ? 'bg-blue-900/10' : ''}`}>
		<span className="text-[9px] text-gray-500">{label}</span>
		<span className={`font-mono text-xs ${highlight ? 'text-blue-400 font-bold' : 'text-gray-300'}`}>{value}</span>
	</div>
);

export default ParamCellV;
