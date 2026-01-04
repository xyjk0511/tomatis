// ==========================================
// 1. 模拟数据源 (Mock Data)
// ==========================================

export const SYSTEM_CONFIG = {
	version: 'Tomatis-C Plus',
};

export const SUPPORTED_FORMATS = ['mp3', 'wav', 'flac', 'aif', 'aiff'];

const createSchemeParameters = (overrides = {}) => ({
	music: 'Mozart_Symphony_40.flac',
	filter: 5, low1: -5, high1: -5, low2: 5, high2: 5,
	center: 1000, slope: 6, lead: 250, delay: 0,
	inVol: 65, air: 50, bone: 50, gate: '50%', balance: '><',
	...overrides
});

// ✅ FIX 1: Changed from a function to an exported constant for stability and deep copying.
export const DEFAULT_STAGES = {
	1: Array.from({ length: 20 }, () => createSchemeParameters()),
	2: Array.from({ length: 20 }, () => createSchemeParameters({ center: 1500 })),
	3: Array.from({ length: 20 }, () => createSchemeParameters({ center: 2000, slope: 12 })),
};

export const INITIAL_SCHEMES = [
	{ id: 'S001', name: '儿童孤独症标准方案', type: '被动训练', isPreset: true, description: '适用于3-12岁孤独症谱系障碍儿童的基础听觉统合训练。', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['儿童', '孤独症'] },
	{ id: 'S002', name: '注意力缺陷多动障碍方案', type: '混合训练', isPreset: true, description: '针对ADHD儿童设计，结合被动聆听与主动发声练习。', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['儿童', '青少年', 'ADHD'] },
	{ id: 'S003', name: '听觉处理障碍强化方案', type: '被动训练', isPreset: true, description: '强化听觉分辨能力和时序处理能力。', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['儿童', '成人', '听觉处理障碍'] },
	{ id: 'S004', name: '儿童语言发育方案', type: '被动训练', isPreset: true, description: '针对语言发育迟缓儿童设计。', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['儿童', '语言发育迟缓'] },
	{ id: 'S005', name: '成人听觉康复方案', type: '主动训练', isPreset: true, description: '针对成人听觉处理障碍及听力损失康复。', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['成人'] },
	{ id: 'C001', name: '李小红-定制化脱敏方案', type: '被动训练', isPreset: false, description: '针对李小红高频敏感特质调整的定制方案。', createdAt: '2023-11-01', updatedAt: '2023-11-15', stages: JSON.parse(JSON.stringify(DEFAULT_STAGES)), tags: ['儿童', '孤独症'] },
];

const generateHistory = (completed, interrupted = null) => {
    const history = [];
    for (let i = 1; i <= completed; i++) {
        const stage = Math.floor((i - 1) / 20) + 1;
        const session = ((i - 1) % 20) + 1;
        history.push({ stage, session, status: 'completed', duration: 1800, date: `2023-10-${10+i}` });
    }
    if (interrupted) {
        const stage = Math.floor(completed / 20) + 1;
        const session = (completed % 20) + 1;
        history.push({ stage, session, status: 'interrupted', duration: interrupted.duration, date: `2023-11-15` });
    }
    return history;
};

export const MOCK_PATIENTS_DATA = [
	{ id: 'P001', name: '李小红', pinyin: 'lxh', gender: 'female', age: 5, mrn: '70386283', phone: '13800138000', diagnosis: '孤独症谱系障碍', dob: '2019-05-20', notes: '对高频声音敏感', lastTreatment: '2023-11-15 14:30', hasHistory: true, lastSchemeId: 'C001', trainingHistory: generateHistory(28, { duration: 900 }), isInpatient: true },
	{ id: 'P002', name: '张伟', pinyin: 'zw', gender: 'male', age: 6, mrn: '70386284', phone: '13912345678', diagnosis: '注意缺陷多动障碍', dob: '2018-03-12', notes: '', lastTreatment: '2023-11-14 10:00', hasHistory: true, lastSchemeId: 'S002', trainingHistory: generateHistory(4), isInpatient: false },
	{ id: 'P003', name: '王芳', pinyin: 'wf', gender: 'female', age: 8, mrn: '70386285', phone: '13700001111', diagnosis: '语言发育迟缓', dob: '2016-08-08', notes: '', lastTreatment: '2023-11-15 09:00', hasHistory: true, lastSchemeId: 'S004', trainingHistory: generateHistory(42), isInpatient: true },
	{ id: 'P004', name: '陈明', pinyin: 'cm', gender: 'male', age: 7, mrn: '70386286', phone: '13666668888', diagnosis: '感统失调', dob: '2017-12-01', notes: '需家长陪同', lastTreatment: '2023-11-10 16:00', hasHistory: false, trainingHistory: [], isInpatient: false },
	{ id: 'P005', name: '赵强', pinyin: 'zq', gender: 'male', age: 5, mrn: '70386287', phone: '13555554444', diagnosis: '听觉处理障碍', dob: '2019-01-15', notes: '', lastTreatment: '2023-11-12 11:30', hasHistory: false, trainingHistory: [], isInpatient: false },
    { id: 'P006', name: '孙悦', pinyin: 'sy', gender: 'female', age: 10, mrn: '70386288', phone: '13444445555', diagnosis: '学习障碍', dob: '2014-02-10', notes: '', lastTreatment: '2023-11-16 18:00', hasHistory: true, lastSchemeId: 'S003', trainingHistory: generateHistory(15, { duration: 300 }), isInpatient: false },
];

export const MOCK_TREATMENT_RECORDS = [
	{ id: 'R001', patientId: 'P001', scheme: '儿童孤独症标准方案', stage: '第二阶段', session: '第18次/共20次', mode: '被动', duration: '30min', status: '完成', time: '2023-11-15 14:30' },
	{ id: 'R002', patientId: 'P001', scheme: '儿童孤独症标准方案', stage: '第二阶段', session: '第17次/共20次', mode: '被动', duration: '30min', status: '完成', time: '2023-11-14 14:30' },
	{ id: 'R003', patientId: 'P002', scheme: 'ADHD混合训练方案', stage: '第一阶段', session: '第4次/共20次', mode: '混合', duration: '45min', status: '完成', time: '2023-11-14 10:00' },
    { id: 'R004', patientId: 'P003', scheme: '儿童语言发育方案', stage: '第三阶段', session: '第2次/共20次', mode: '被动', duration: '30min', status: '完成', time: '2023-11-15 09:00' },
    { id: 'R005', patientId: 'P006', scheme: '听觉处理障碍强化方案', stage: '第一阶段', session: '第15次/共20次', mode: '被动', duration: '30min', status: '完成', time: '2023-11-16 18:00' },
];

export const MOCK_MEDIA_FILES = [
	{ id: 'm001', name: 'Mozart_Symphony_40.flac', folderId: 'music_classical', duration: 330, size: '32MB', type: 'FLAC', date: '2023-10-01', rate: '44.1 kHz', bit: '24 bit', patientId: null, status: 'N/A' },
	{ id: 'm002', name: 'Mozart_Piano_Concerto_21.flac', folderId: 'music_classical', duration: 375, size: '38MB', type: 'FLAC', date: '2023-10-01', rate: '44.1 kHz', bit: '24 bit', patientId: null, status: 'N/A' },
	{ id: 'm003', name: 'Rain_Forest.mp3', folderId: 'music_nature', duration: 600, size: '15MB', type: 'MP3', date: '2023-10-05', rate: '44.1 kHz', bit: '16 bit', patientId: null, status: 'N/A' },
	{ id: 'm005', name: 'Instruction_Basic.wav', folderId: 'voice_instruction', duration: 60, size: '1MB', type: 'WAV', date: '2023-11-10', rate: '48.0 kHz', bit: '24 bit', patientId: null, status: 'N/A' },
	{ id: 'm006', name: 'Lihong_Raw_01.wav', folderId: 'mother_raw', duration: 200, size: '40MB', type: 'WAV', date: '2023-11-15', rate: '48.0 kHz', bit: '24 bit', patientId: 'P001', status: '未处理' },
	{ id: 'm007', name: 'Zhangwei_Raw_01.aif', folderId: 'mother_raw', duration: 220, size: '45MB', type: 'AIF', date: '2023-11-16', rate: '48.0 kHz', bit: '24 bit', patientId: 'P002', status: '未处理' },
	{ id: 'm004', name: 'Lihong_Processed_01.aiff', folderId: 'mother_processed', duration: 210, size: '35MB', type: 'AIFF', date: '2023-11-10', rate: '48.0 kHz', bit: '24 bit', patientId: 'P001', status: '已处理' },
];

export const calculateMediaCounts = (files) => {
	const counts = {};
	files.forEach(file => { counts[file.folderId] = (counts[file.folderId] || 0) + 1; });
	return counts;
};

export const findFolderByIdRecursive = (id, nodes) => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findFolderByIdRecursive(id, node.children);
            if (found) return found;
        }
    }
    return null;
};

export const createInitialFolders = (mediaFiles) => {
	const counts = calculateMediaCounts(mediaFiles);
	const initialStructure = [
		{ id: 'root_music', name: '音乐', type: 'system', children: [
			{ id: 'music_classical', name: '古典音乐', parentId: 'root_music' },
			{ id: 'music_nature', name: '自然声音', parentId: 'root_music' },
			{ id: 'music_gregorian', name: '格里高利圣咏', parentId: 'root_music' },
			{ id: 'custom_jazz', name: '爵士乐', parentId: 'root_music' },
		]},
		{ id: 'root_voice', name: '语音', type: 'system', children: [
			{ id: 'voice_stories', name: '儿童故事', parentId: 'root_voice' },
			{ id: 'voice_instruction', name: '指导语', parentId: 'root_voice' },
		]},
		...(SYSTEM_CONFIG.version === 'Tomatis-C Plus' ? [{ id: 'root_mother', name: '母亲声音', type: 'system', children: [
			{ id: 'mother_processed', name: '已处理', isProtected: true, parentId: 'root_mother' },
			{ id: 'mother_raw', name: '原始录音', isProtected: true, parentId: 'root_mother' },
		]}] : []),
	];
	return initialStructure.map(f => ({ ...f, count: counts[f.id] || 0, children: f.children ? f.children.map(c => ({...c, count: counts[c.id] || 0})) : undefined }));
};
