// Global CSS for custom-scrollbar must be included in the main app's CSS file for production, 
// but is defined here for a self-contained environment.
export const globalStyles = `
.custom-scrollbar::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
	background: #0b0e14; /* Corresponds to the main background color */
}

.custom-scrollbar::-webkit-scrollbar-thumb {
	background: #1f2937; /* A dark gray for the thumb */
	border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
	background: #374151; /* A slightly lighter gray on hover */
}
`;
