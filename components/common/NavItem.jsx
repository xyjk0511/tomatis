import React from 'react';

const NavItem = ({ label, active = false, onClick }) => (
	<button 
		onClick={onClick}
		className={`px-4 py-1.5 rounded transition-all duration-200 text-xs lg:text-sm font-medium whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
	>
		{label} 
	</button>
);

export default NavItem;
