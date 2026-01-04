import React, { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, options, onClose }) => {
	if (x === null || y === null || options.length === 0) return null;

	const menuRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				onClose();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('contextmenu', onClose);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('contextmenu', onClose);
		};
	}, [onClose]);

	const style = {
		top: y,
		left: x,
	};

	return (
		<div 
			ref={menuRef}
			style={style}
			className="absolute bg-[#1a1d26] border border-gray-700 rounded-lg shadow-2xl py-1 z-50 text-sm w-40 animate-in fade-in zoom-in-95 duration-100"
		>
			{options.map((option, index) => (
				<button
					key={index}
					onClick={(e) => { e.stopPropagation(); option.action(); onClose(); }}
					disabled={option.disabled}
					className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors text-xs
						${option.disabled ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-blue-600 hover:text-white'}
						${option.isDanger ? 'hover:!bg-red-600 hover:!text-white' : ''}
					`}
				>
					{option.icon}
					<span>{option.label}</span>
				</button>
			))}
		</div>
	);
};

export default ContextMenu;
