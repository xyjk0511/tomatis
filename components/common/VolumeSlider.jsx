import React, { useState, useEffect, useRef, useCallback } from 'react';

const VolumeSlider = ({ value, colorClass, onChange }) => {
	const ref = useRef(null);
	const isDraggingRef = useRef(false);	
	const [isHovered, setIsHovered] = useState(false);

	const calculateValue = useCallback((clientX) => {
		if (!ref.current) return 0;
		const rect = ref.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const width = rect.width;
		const percentage = Math.max(0, Math.min(100, (x / width) * 100));
		return Math.round(percentage);
	}, []);

	useEffect(() => {
		const handleMouseMove = (moveEvent) => {
			if (isDraggingRef.current) {
				onChange(calculateValue(moveEvent.clientX));
			}
		};
		
		const handleMouseUp = () => {
			if (isDraggingRef.current) {
				isDraggingRef.current = false;
				// Force re-render to update the size class after drag ends
				setIsHovered(false);	
			}
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		
		// Touch event listeners for mobile responsiveness
		const handleTouchMove = (moveEvent) => {
			if (isDraggingRef.current && moveEvent.touches.length > 0) {
				onChange(calculateValue(moveEvent.touches[0].clientX));
			}
		};
		const handleTouchEnd = () => {
				isDraggingRef.current = false;
				setIsHovered(false);
		};

		document.addEventListener('touchmove', handleTouchMove);
		document.addEventListener('touchend', handleTouchEnd);


		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
			document.removeEventListener('touchmove', handleTouchMove);
			document.removeEventListener('touchend', handleTouchEnd);
		};
	}, [onChange, calculateValue]);
	
	const handleMouseDown = (e) => {
		e.stopPropagation();
		isDraggingRef.current = true;
		setIsHovered(true); // Indicate active drag state
		onChange(calculateValue(e.clientX));
	};
	
	const handleTouchStart = (e) => {
		e.stopPropagation();
		isDraggingRef.current = true;
		setIsHovered(true);	
		onChange(calculateValue(e.touches[0].clientX));
	};

	const handleContainerClick = (e) => {
		e.stopPropagation();	
		onChange(calculateValue(e.clientX));
	};

	return (
		<div 
			ref={ref}
			onMouseDown={handleMouseDown}
			onTouchStart={handleTouchStart}
			onClick={handleContainerClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => { if (!isDraggingRef.current) setIsHovered(false); }}
			className={`h-1.5 bg-gray-700 rounded-full overflow-hidden relative cursor-ew-resize group/vol transition-all touch-none ${isHovered || isDraggingRef.current ? 'h-2.5' : 'hover:h-2.5'}`}
		>
			<div 
				className={`absolute inset-y-0 left-0 ${colorClass} transition-all duration-75 ease-out`} 
				style={{ width: `${value}%` }}
			></div>
			<div 
				className={`absolute inset-y-0 w-1 bg-white opacity-0 group-hover/vol:opacity-100 ${isHovered || isDraggingRef.current ? 'opacity-100' : ''} transition-opacity shadow-sm`}
				style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
			></div> 
		</div>
	);
};

export default VolumeSlider;
