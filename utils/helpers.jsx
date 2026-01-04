import React from 'react';

// ==========================================
// 调试工具和安全组件 (Safety and Debugging)
// ==========================================

export function assertComponent(name, C) {
    if (C === undefined) {
        console.error(`[undefined] 组件变量 "${name}" 是 undefined (导入/导出/运行环境问题)`);
        // throw new Error(`[undefined] 组件变量 "${name}" 是 undefined`); // 故意注释，让 ErrorBoundary 捕获
    }
}

// 安全图标组件：避免 React.createElement(undefined) 导致崩溃
export function SafeIcon({ Icon, fallback = '•', ...props }) {
  if (Icon === undefined || Icon === null) {
      // 可以在此处打印警告，但返回一个稳定的 DOM 元素
      return <span style={{ opacity: 0.6, fontSize: props.size || 16 }}>{fallback}</span>;
  }
  return <Icon {...props} />;
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 12, color: '#fca5a5', fontFamily: 'monospace', backgroundColor: '#330000', border: '1px solid #ff0000' }}>
          渲染出错：{String(this.state.error)}
          <br/>
          请检查控制台获取详细信息。
        </div>
      );
    }
    return this.props.children;
  }
}

export const formatTime = (seconds) => {
	const min = Math.floor(seconds / 60);
	const sec = Math.floor(seconds % 60);
	return `${min}:${sec.toString().padStart(2, '0')}`;
};
