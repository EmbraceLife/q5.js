let typeDefs = '';

class MiniEditor {
	constructor(scriptEl) {
		let scriptContent = scriptEl.innerHTML.slice(0, -1).replaceAll('\t', '  ').trim();
		let container = document.createElement('div');
		container.id = 'mie-' + scriptEl.id;
		container.className = 'mie-container';
		
		// Add a wrapper div to help with the new layout
		let contentWrapper = document.createElement('div');
		contentWrapper.className = 'mie-content-wrapper';
		container.appendChild(contentWrapper);
		
		scriptEl.insertAdjacentElement('beforebegin', container);
		this.container = container;
		this.contentWrapper = contentWrapper;
		this.initialCode = scriptContent;

		let attrs = scriptEl.getAttributeNames();
		for (let attr of attrs) {
			this[attr] = scriptEl.getAttribute(attr) || true;
		}
	}

	async init() {
		let editorEl = document.createElement('div');
		editorEl.id = `${this.container.id}-code`;
		editorEl.className = 'mie-code';
		if (this['hide-editor']) {
			editorEl.style.display = 'none';
		}

		let outputEl = document.createElement('div');
		outputEl.id = `${this.container.id}-output`;
		outputEl.className = 'mie-output';
		if (this['hide-output']) {
			outputEl.style.display = 'none';
		}

		// Add elements to the content wrapper instead of directly to container
		this.contentWrapper.append(outputEl);
		this.contentWrapper.append(editorEl);

		this.outputEl = outputEl;
		this.editorEl = editorEl;

		await this.initializeEditor();

		this.runCode();

		this.editor.onDidChangeModelContent(() => {
			clearTimeout(this.debounceTimeout);
			this.debounceTimeout = setTimeout(() => this.runCode(), 500);
		});

		this.resizeEditor();
		window.addEventListener('resize', () => this.resizeEditor());
		
		// Add a small delay to ensure layout is complete before final resize
		setTimeout(() => this.resizeEditor(), 100);
	}

	async initializeEditor() {
		return new Promise((resolve) => {
			require.config({
				paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs' }
			});

			require(['vs/editor/editor.main'], async () => {
				this.editor = monaco.editor.create(this.editorEl, {
					value: this.initialCode,
					language: 'javascript',
					wordWrap: true,
					folding: false,
					renderLineHighlight: 'none',
					theme: 'vs-dark',
					fontSize: 14,
					lineNumbersMinChars: 2,
					glyphMargin: false,
					minimap: { enabled: false },
					scrollbar: {
						verticalScrollbarSize: 0,
						horizontalScrollbarSize: 0,
						alwaysConsumeMouseWheel: false
					},
					scrollBeyondLastLine: false,
					tabSize: 2
				});

				if (!typeDefs) {
					let res = await fetch('/q5.d.ts');
					typeDefs = await res.text();
				}

				monaco.languages.typescript.javascriptDefaults.addExtraLib(typeDefs, '/q5.d.ts');

				this.editorReady = true;

				resolve();
			});
		});
	}

	runCode() {
		if (!this.editorReady) {
			console.error('Editor is not ready yet');
			return;
		}
		this.isRunning = true;

		this.outputEl.innerHTML = '';

		const q5FunctionNames = [
			'preload',
			'setup',
			'update',
			'draw',
			'drawFrame',
			'postProcess',
			'doubleClicked',
			'keyPressed',
			'keyReleased',
			'keyTyped',
			'mouseMoved',
			'mouseDragged',
			'mousePressed',
			'mouseReleased',
			'mouseClicked',
			'mouseWheel',
			'touchStarted',
			'touchMoved',
			'touchEnded',
			'windowResized'
		];

		try {
			let userCode = this.editor.getValue();

			let useWebGPU = userCode.includes('Q5.webgpu');

			const q5InstanceRegex = /(?:(?:let|const|var)\s+\w+\s*=\s*)?(?:new\s+Q5|await\s+Q5\.webgpu)\s*\([^)]*\);?/g;
			userCode = userCode.replace(q5InstanceRegex, '');

			let q = new Q5('instance', this.outputEl, useWebGPU ? 'webgpu' : null);

			for (let f of q5FunctionNames) {
				const regex = new RegExp(`(async\\s+)?function\\s+${f}\\s*\\(`, 'g');
				userCode = userCode.replace(regex, (match) => {
					const isAsync = match.includes('async');
					return `q.${f} = ${isAsync ? 'async ' : ''}function(`;
				});
			}

			const func = new Function(
				'q',
				`
(async () => {
	with (q) {
		${userCode}
	}
})();`
			);

			func(q);

			this.q5Instance = q;
		} catch (e) {
			console.error('Error executing user code:', e);
		}
	}

	resizeEditor() {
		// Set minimum height based on line count
		const lineHeight = 22;
		const minHeight = this.initialCode.split('\n').length * lineHeight + 'px';
		this.editorEl.style.minHeight = minHeight;
		
		// Make editor take available height in the flex layout
		this.editorEl.style.height = '100%';
		
		// Update Monaco editor layout
		this.editor.layout();
	}
}

// Add CSS for the new layout
function addLayoutStyles() {
	const styleEl = document.createElement('style');
	styleEl.textContent = `
		/* Move sidebar to left edge */
		.sidebar {
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			width: 250px;
			z-index: 100;
			overflow-y: auto;
		}
		
		/* Adjust main content area */
		.main-content {
			margin-left: 250px;
			width: calc(100% - 250px);
		}
		
		/* Style for the mini-editor container */
		.mie-container {
			width: 100%;
			margin: 20px 0;
		}
		
		/* New wrapper for content */
		.mie-content-wrapper {
			display: flex;
			flex-direction: row;
			width: 100%;
			min-height: 300px;
		}
		
		/* Output/canvas area takes 50% of space */
		.mie-output {
			flex: 1;
			min-width: 50%;
			border-right: 1px solid #444;
		}
		
		/* Code editor takes 50% of space */
		.mie-code {
			flex: 1;
			min-width: 50%;
		}
		
		/* Responsive adjustments for small screens */
		@media (max-width: 768px) {
			.sidebar {
				width: 200px;
			}
			
			.main-content {
				margin-left: 200px;
				width: calc(100% - 200px);
			}
			
			.mie-content-wrapper {
				flex-direction: column;
			}
			
			.mie-output, .mie-code {
				width: 100%;
				min-width: 100%;
			}
			
			.mie-output {
				border-right: none;
				border-bottom: 1px solid #444;
			}
		}
	`;
	document.head.appendChild(styleEl);
}

// Call this function when the script loads
window.addEventListener('DOMContentLoaded', addLayoutStyles);

window.MiniEditor = MiniEditor;
