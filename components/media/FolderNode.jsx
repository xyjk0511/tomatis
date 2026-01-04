import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

const FolderNode = ({ node, selectedFolderId, onSelectFolder, level = 0, onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(node.isOpen || level === 0);
    const hasChildren = node.children && node.children.length > 0;

    const handleToggle = (e) => {
        e.stopPropagation();
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = () => {
        onSelectFolder(node.id);
        if (hasChildren && !isOpen) {
            setIsOpen(true);
        }
    };
    
    const handleDoubleClick = () => {
        if (hasChildren) {
            setIsOpen(!isOpen);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    };

    const isSelected = selectedFolderId === node.id;

    return (
        <div>
            <div 
                onClick={handleSelect}
                onDoubleClick={handleDoubleClick}
                onContextMenu={handleContextMenu}
                className={`flex items-center p-2 my-0.5 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-600/20 text-white' : 'text-gray-400 hover:bg-gray-800/50'}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                title={node.name}
            >
                <div onClick={handleToggle} className="p-0.5 rounded hover:bg-gray-700">
                    {hasChildren ? (
                        isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    ) : (
                        <span className="w-5" />
                    )}
                </div>
                <Folder size={16} className={`mr-2 shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className="flex-1 text-sm truncate">{node.name}</span>
                {node.count != null && (
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-600/30' : 'bg-gray-700/50'}`}>
                        {node.count}
                    </span>
                )}
            </div>
            {isOpen && hasChildren && (
                <div className="mt-1">
                    {node.children.map(childNode => (
                        <FolderNode
                            key={childNode.id}
                            node={childNode}
                            selectedFolderId={selectedFolderId}
                            onSelectFolder={onSelectFolder}
                            level={level + 1}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FolderNode;
