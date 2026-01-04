import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const ChangePasswordModal = ({ isOpen, onConfirm, onCancel }) => {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = () => {
		if (!newPassword || newPassword.length < 6) {
			setError('新密码长度至少需6位');
			return;
		}
		if (newPassword !== confirmPassword) {
			setError('两次输入的密码不一致');
			return;
		}
		onConfirm(newPassword);
	};

	if (!isOpen) return null;

	return (
		<div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="bg-[#1a1d26] border border-gray-700 rounded-lg p-8 w-[420px] shadow-2xl animate-in zoom-in-95 duration-200">
				<div className="text-center mb-6">
					<div className="w-12 h-12 bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<Lock className="text-yellow-500" size={24} />
					</div>
					<h3 className="text-xl font-bold text-white">首次登录安全提示</h3>
					<p className="text-gray-400 text-sm mt-2">为了您的账户安全，首次登录系统请强制修改默认密码。</p>
				</div>
				
				<div className="space-y-4">
					<div className="space-y-1">
						<label className="text-xs text-gray-400">新密码</label>
						<input 
							type="password" 
							value={newPassword}
							onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
							className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
							placeholder="请输入新密码 (6-16位)"
						/>
					</div>
					<div className="space-y-1">
						<label className="text-xs text-gray-400">确认新密码</label>
						<input 
							type="password" 
							value={confirmPassword}
							onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
							className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none"
							placeholder="请再次输入新密码"
						/>
					</div>
					
					{error && (
						<div className="text-red-400 text-xs bg-red-900/10 p-2 rounded text-center">
							{error}
						</div>
					)}

					<button 
						onClick={handleSubmit} 
						className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold text-sm shadow-lg mt-2 transition-all"
					>
						确认修改并登录
					</button>
				</div>
			</div>
		</div>
	);
};

export default ChangePasswordModal;
