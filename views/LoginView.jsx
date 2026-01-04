import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginView = ({ onLogin }) => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [rememberMe, setRememberMe] = useState(false);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!username) return setError('请输入用户名');
		if (!password) return setError('请输入密码');
		onLogin(username, password, setError);
	};

    const handleSkip = () => {
        onLogin('skip', 'skip', setError);
    };

	return (
		<div className="w-full h-full flex flex-col items-center justify-center bg-[#0b0e14] relative overflow-hidden">
			<div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>
			<div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none"></div>
			<div className="w-[420px] z-10 animate-in fade-in zoom-in-95 duration-500">
				<div className="text-center mb-8">
					<div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-900/50 mb-6 rotate-3 hover:rotate-6 transition-transform"><span className="text-white font-bold text-3xl">T</span></div>
					<h1 className="text-3xl font-bold text-white tracking-wide mb-2">听觉康复训练仪管理软件</h1>
					<p className="text-gray-500 text-sm">专业 · 智能 · 高效</p>
				</div>
				<div className="bg-[#1a1d26] border border-gray-700/50 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
					<h2 className="text-xl font-bold text-white mb-6 text-center">用户登录</h2>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="space-y-1.5"><label className="text-xs font-medium text-gray-400 ml-1">用户名</label><div className="relative group"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} /><input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }} className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-600" placeholder="请输入用户名" /></div></div>
						<div className="space-y-1.5"><label className="text-xs font-medium text-gray-400 ml-1">密码</label><div className="relative group"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={18} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} className="w-full bg-[#0b0e14] border border-gray-700 rounded-lg py-3 pl-10 pr-10 text-sm text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-600" placeholder="请输入密码" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
						<div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 select-none"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-600 bg-[#0b0e14] text-blue-600 focus:ring-offset-[#1a1d26] accent-blue-600" />记住密码</label><a href="#" className="text-blue-500 hover:text-blue-400 transition-colors">忘记密码?</a></div>
						{error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-900/20 animate-in slide-in-from-top-1"><AlertCircle size={14} /> {error}</div>}
						<button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] mt-2">登 录</button>
                        <button type="button" onClick={handleSkip} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-3 rounded-lg shadow-lg transition-all active:scale-[0.98] mt-2">跳过登录 (开发测试)</button>
					</form>
				</div>
				<div className="text-center mt-8 text-gray-600 text-xs font-mono">软件版本号: v2.0.1.2512</div>
			</div>
		</div>
	);
};

export default LoginView;
