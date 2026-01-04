import React from 'react';

const ParamGroup = ({ title, children }) => (
	<div className="flex flex-col gap-1">
		<div className="text-[10px] text-gray-500 uppercase tracking-wider pl-1">{title}</div>
		{children}
	</div>
);

export default ParamGroup;
