/**
 * MiniEditor - A lightweight code editor with live preview for Q5.js
 * This component allows displaying and editing code snippets with a live preview
 * It supports showing only portions of a larger codebase while still running the complete code
 */
class MiniEditor {
    /**
     * Create a new MiniEditor instance
     * @param {HTMLElement|string} scriptEl - The script element or its ID containing the code
     */
    constructor(scriptEl) {
        // If a string ID was passed, get the actual element
        if (typeof scriptEl === 'string') {
            scriptEl = document.getElementById(scriptEl);
        }
        
        // Get the content from the script element
        let scriptContent = scriptEl.innerHTML.trim();
        
        // Create the container for the editor
        let container = document.createElement('div');
        container.id = 'mie-' + (scriptEl.id || 'editor-' + Math.random().toString(36).substring(2, 9));
        container.className = 'mie-container';
        scriptEl.insertAdjacentElement('beforebegin', container);
        this.container = container;
        
        // Store the initial code
        this.initialCode = scriptContent;
        
        // Get attributes from the script element
        this.attributes = {};
        let attrs = scriptEl.getAttributeNames();
        for (let attr of attrs) {
            this.attributes[attr] = scriptEl.getAttribute(attr) || true;
        }
        
        // Set up context and focus information
        this.fullContext = this.attributes['data-context'] || this.initialCode;
        this.visibleCode = this.initialCode;
        
        // Parse focus attributes if they exist
        if (this.attributes['data-focus-start'] && this.attributes['data-focus-end']) {
            this.focusSection = {
                start: parseInt(this.attributes['data-focus-start']),
                end: parseInt(this.attributes['data-focus-end'])
            };
        } else {
            this.focusSection = null;
        }
        
        // Remove the original script element
        scriptEl.remove();
    }

    /**
     * Initialize the editor
     */
    async init() {
        // Create elements for the editor and output
        let editorEl = document.createElement('div');
        editorEl.id = `${this.container.id}-code`;
        editorEl.className = 'mie-code';
        
        let outputEl = document.createElement('div');
        outputEl.id = `${this.container.id}-output`;
        outputEl.className = 'mie-output';
        
        // Add toggle button for showing full code
        let toggleBtn = document.createElement('button');
        toggleBtn.className = 'mie-fullcode-toggle';
        toggleBtn.innerHTML = '🔍';
        toggleBtn.title = 'Toggle full code view';
        toggleBtn.addEventListener('click', () => this.toggleFullCode());
        
        // Add elements to container
        this.container.append(outputEl);
        this.container.append(editorEl);
        this.container.append(toggleBtn);
        
        // Store references to elements
        this.outputEl = outputEl;
        this.editorEl = editorEl;
        this.toggleBtn = toggleBtn;
        
        // Initialize Monaco editor
        await this.initializeEditor();
        
        // Run the code for the first time
        this.runCode();
        
        // Set up auto-update when code changes
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => this.runCode(), 500);
        });
        
        // Make sure the editor is properly sized
        this.resizeEditor();
        window.addEventListener('resize', () => this.resizeEditor());
    }

    /**
     * Initialize the Monaco editor
     */
    async initializeEditor() {
        return new Promise((resolve) => {
            require.config({
                paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs' }
            });

            require(['vs/editor/editor.main'], () => {
                // Define the editor theme
                monaco.editor.defineTheme('q5Theme', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [],
                    colors: {
                        'editor.background': '#1e1e1e'
                    }
                });

                // Create the editor instance
                this.editor = monaco.editor.create(this.editorEl, {
                    value: this.visibleCode,
                    language: 'javascript',
                    theme: 'q5Theme',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    glyphMargin: false,
                    folding: true,
                    fontSize: 14,
                    tabSize: 2,
                    renderLineHighlight: 'line',
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto'
                    }
                });
                
                // Highlight the focused section if specified
                if (this.focusSection) {
                    this.highlightFocusedSection();
                }

                this.editorReady = true;
                resolve();
            });
        });
    }

    /**
     * Run the code and update the preview
     */
    runCode() {
        if (!this.editorReady) {
            console.error('Editor is not ready yet');
            return;
        }
        
        // Clear the output area
        this.outputEl.innerHTML = '';
        
        try {
            // Get the current code from the editor
            let currentCode = this.editor.getValue();
            
            // Determine if we're in full code view or partial code view
            let runCode = this.isFullCodeView ? currentCode : this.getRunCode(currentCode);
            
            // Create a new Q5 instance with proper mounting
            // Use the 'instance' mode to properly attach to the container
            let q = new Q5('instance', this.outputEl);
            
            // Execute the code
            const func = new Function(
                'q',
                `
(async () => {
    try {
        with (q) {
            ${runCode}
            // If no setup or draw function was defined, create a default setup
            if (typeof setup !== 'function' && typeof draw !== 'function') {
                setup = () => {
                    createCanvas(400, 400);
                    try { ${runCode} } catch (e) { console.error(e); }
                };
            }
        }
    } catch (e) {
        console.error('Error in code execution:', e);
    }
})();`
            );
            
            func(q);
            
            // Store the Q5 instance
            this.q5Instance = q;
        } catch (e) {
            console.error('Error executing user code:', e);
            // Display error in the output area
            this.outputEl.innerHTML = `<div style="color: red; padding: 10px;">Error: ${e.message}</div>`;
        }
    }

    /**
     * Combine the visible code with the full context
     * @param {string} visibleCode - The code currently visible in the editor
     * @returns {string} - The code to actually run
     */
    getRunCode(visibleCode) {
        if (this.attributes['data-context']) {
            // If we have an external context file, use it and replace the focus section
            // This would need to fetch the file content or have it predefined
            // For simplicity, we'll assume it's already loaded in this.fullContext
            if (this.focusSection) {
                // Split the full context into lines
                let contextLines = this.fullContext.split('\n');
                
                // Replace the focused section with the current editor content
                contextLines.splice(
                    this.focusSection.start - 1,
                    this.focusSection.end - this.focusSection.start + 1,
                    visibleCode
                );
                
                return contextLines.join('\n');
            }
        }
        
        // If no special context handling is needed, use the visible code
        return visibleCode;
    }

    /**
     * Toggle between showing the focused code section and the full code
     */
    toggleFullCode() {
        this.isFullCodeView = !this.isFullCodeView;
        
        if (this.isFullCodeView) {
            // Switch to full code view
            this.visibleCode = this.editor.getValue();
            this.editor.setValue(this.fullContext || this.visibleCode);
            this.toggleBtn.innerHTML = '👁️';
            this.toggleBtn.title = 'Show focused section';
        } else {
            // Switch back to focused view
            this.fullContext = this.editor.getValue();
            this.editor.setValue(this.visibleCode);
            this.toggleBtn.innerHTML = '🔍';
            this.toggleBtn.title = 'Show full code';
            
            // Re-highlight the focused section
            if (this.focusSection) {
                this.highlightFocusedSection();
            }
        }
        
        // Run the code with the updated view
        this.runCode();
    }

    /**
     * Highlight the focused section of code
     */
    highlightFocusedSection() {
        if (!this.focusSection || this.isFullCodeView) return;
        
        this.editor.deltaDecorations([], [
            {
                range: new monaco.Range(
                    1, 1, 
                    this.editor.getModel().getLineCount(), 1
                ),
                options: {
                    className: 'highlighted-section',
                    isWholeLine: true
                }
            }
        ]);
    }

    /**
     * Resize the editor to fit its content
     */
    resizeEditor() {
        let lines = this.editor.getModel().getLineCount();
        let height = Math.min(lines * 20, 400);
        
        // Only adjust the editor height, not the output height
        this.editorEl.style.height = `${height}px`;
        
        // Don't modify the output height here to maintain the canvas size
        this.editor.layout();
    }
}

// Make MiniEditor available globally
window.MiniEditor = MiniEditor; 