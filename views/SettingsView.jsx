import React, { useState } from 'react';
import FormField from '../components/common/FormField';

const SettingsView = () => {
    const [audacityPath, setAudacityPath] = useState('C:\\Program Files\\Audacity\\audacity.exe');

    const handleSave = () => {
        // In a real app, this would save to a config file or backend
        alert(`Audacity 路径已保存: ${audacityPath}`);
    };

    return (
        <div className="flex flex-col h-full p-6 gap-4 text-white">
            <h2 className="text-2xl font-bold border-b border-gray-800 pb-4">系统设置</h2>
            
            <div className="max-w-2xl mx-auto w-full space-y-6 mt-4">
                <div className="bg-[#1a1d26] p-6 rounded-lg border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4">软件路径配置</h3>
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
                            <FormField 
                                label="Audacity 软件路径"
                                type="text"
                                value={audacityPath}
                                onChange={(e) => setAudacityPath(e.target.value)}
                                placeholder="例如: C:\Program Files\Audacity\audacity.exe"
                            />
                        </div>
                        <button className="px-4 py-2 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm">
                            浏览...
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={handleSave} className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-500 text-sm font-bold">
                        保存设置
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
