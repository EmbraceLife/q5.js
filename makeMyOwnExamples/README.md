# Nature of Code Interactive Documentation

An interactive documentation system for Nature of Code examples based on the Q5.js learn framework.

## Overview

This project creates an interactive documentation site that allows:

1. Displaying and describing Nature of Code examples
2. Live editing of code with immediate visual feedback
3. Showing focused parts of larger code examples
4. Organizing content by chapters/topics

## Getting Started

1. Open `index.html` in your browser to view the documentation
2. Use the navigation menu to explore different sections
3. Edit code examples to see how they work
4. Toggle between full code and focused sections using the 🔍 button

## File Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling
- `docs.js` - Navigation and content display functionality
- `mini-editor.js` - Interactive code editor component
- `examples.js` - Content and examples organized by section

## Adding New Examples

To add a new example:

1. Edit `examples.js` to add a new section or subsection
2. Include code examples using the `<script type="mini">` tag
3. For focused code sections, use the `data-context` and `data-focus-start`/`data-focus-end` attributes

### Example:

```javascript
// Simple example - shows and runs the full code
<script id="example-id" type="mini">
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  ellipse(mouseX, mouseY, 50, 50);
}
</script>

// Focused example - shows part of a larger codebase
<script id="focused-example" type="mini" 
  data-context="// Full code here..." 
  data-focus-start="10" 
  data-focus-end="15">
// Only this part is shown in the editor
ellipse(mouseX, mouseY, 50, 50);
</script>
```

## Features

- **Interactive Editing**: Edit code and see results immediately
- **Focused Code Sections**: Show and explain specific parts of larger examples
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Theme**: Switch between dark and light themes
- **Search**: Find examples by keyword

## Dependencies

- [Q5.js](https://q5js.org/) - Creative coding library
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor component

## Customization

- Modify `styles.css` to change the appearance
- Adjust editor settings in `mini-editor.js`
- Change the content structure in `examples.js`

## Credits

Built with inspiration from the Q5.js learn framework. 