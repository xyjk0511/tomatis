import React from 'react';
import { ChevronDown } from 'lucide-react';

// FormField 接受 readOnly 属性并传递给 input/textarea
const FormField = ({ label, required, placeholder, type = "text", className = "", children, value, onChange, readOnly = false, name = "" }) => (
	<div className={`flex flex-col ${className}`}>
		<label className="block text-xs font-medium text-gray-400 mb-1.5">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
		{type === 'select' ? (
			<div className="relative">
				<select 
					value={value} 
					onChange={onChange}
					name={name} // 传递 name 属性
					// readOnly does not apply to select, but we keep it for consistency
					className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-white appearance-none focus:border-blue-500 outline-none"
				>
					{children}
				</select>
				<ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
			</div>
		) : type === 'textarea' ? (
			<textarea 
				value={value}
				onChange={onChange}
				name={name} // 传递 name 属性
				readOnly={readOnly} // 传递 readOnly 给 textarea
				className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:border-blue-500 outline-none min-h-[80px] resize-none" 
				placeholder={placeholder}
			/>
		) : (
			<input 
				type={type} 
				value={value}
				onChange={onChange}
				name={name} // 传递 name 属性
				readOnly={readOnly} // 传递 readOnly 给 input
				className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:border-blue-500 outline-none" 
				placeholder={placeholder} 
			/>
		)}
	</div>
);

export default FormField;
