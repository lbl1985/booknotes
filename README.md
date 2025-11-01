# 📚 Book Notes - Kindle to Obsidian Converter

An interactive web application that converts Kindle highlights from markdown format to Obsidian-formatted notes with blockquotes and callouts.

## Features

### ✨ Core Functionality
- **Highlight Formatting**: Automatically converts highlights to Obsidian blockquote format (`> text`)
- **Note Callouts**: Converts notes to Obsidian callouts with 11 different types available
- **Merge Highlights**: Option to merge multiple consecutive highlights under one block
- **Live Preview**: Real-time conversion as you type
- **Copy to Clipboard**: One-click copying of formatted output

### 📝 Supported Callout Types
| Type | Appearance | Use Case |
|------|------------|----------|
| `[!note]` | 📝 Blue box | General notes, neutral commentary |
| `[!tip]` | 💡 Green box | Helpful tips, actionable advice |
| `[!warning]` | ⚠️ Red box | Cautions, important warnings |
| `[!danger]` | 🚨 Dark red box | Critical alerts or "don't do this" |
| `[!info]` | ℹ️ Light blue box | Informational content, explanations |
| `[!success]` | ✅ Green with checkmark | Achievements, confirmations, takeaways |
| `[!bug]` | 🐛 Red with bug icon | Technical issues, errors, glitches |
| `[!question]` | ❓ Purple box | Open questions or curiosities |
| `[!abstract]` | 📄 Gray box | Summaries or high-level overview |
| `[!example]` | 📋 Yellow box | Examples or case studies |
| `[!quote]` | 💬 Indigo box | Emphasized quotes or excerpts |

## Input Format

The tool expects Kindle highlights in this format:

```
---
Highlight text from the book. This should typically be one paragraph.

Your personal notes about this highlight. This can be multiple paragraphs with your thoughts, analysis, and connections.

---

Another highlight from the book.

More of your notes and reflections.

---
```

## Output Format

The tool converts your input to Obsidian format:

```markdown
> Highlight text from the book. This should typically be one paragraph.

> [!note]
> Your personal notes about this highlight. This can be multiple paragraphs with your thoughts, analysis, and connections.

> Another highlight from the book.

> [!note]
> More of your notes and reflections.
```

## How to Use

### Method 1: File Upload (Recommended)
1. **Open** `index.html` in your web browser
2. **Upload** your markdown file by dragging and dropping or clicking "Browse Files"
3. **Choose** your preferred callout type for notes (default: `[!note]`)
4. **Toggle** whether to merge consecutive highlights (recommended: enabled)
5. **Download** the converted markdown file (automatically named `filename-converted.md`)

### Method 2: Direct Text Input
1. **Paste** your Kindle highlights directly in the text area
2. **Choose** your settings and convert
3. **Copy** the formatted output or download as a new markdown file

## Files

- `index.html` - Main application interface with file upload support
- `styles.css` - Styling with Obsidian-like appearance and callout previews
- `script.js` - Core functionality for parsing, converting, and file handling
- `sample-notes.md` - Example markdown file for testing
- `README.md` - This documentation

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- Clipboard API (with fallback for older browsers)

## Customization

### Adding New Callout Types
To add new callout types, update the `calloutTypes` object in `script.js` and add corresponding CSS styles in `styles.css`.

### Styling
The CSS uses CSS custom properties and can be easily customized to match your preferred color scheme.

## Tips

- **Batch Processing**: You can paste multiple highlight sections at once
- **Auto-Save**: The tool automatically converts as you type (with a 500ms debounce)
- **Keyboard Shortcuts**: Use standard copy/paste shortcuts
- **Mobile Friendly**: Fully responsive design works on mobile devices

## Troubleshooting

### Common Issues
1. **No output generated**: Ensure your input follows the `---` separator format
2. **Formatting looks wrong**: Check that highlights and notes are separated by blank lines
3. **Copy not working**: Try using Ctrl+C manually or check browser permissions

### Input Format Requirements
- Use `---` as separators between different highlight sections
- Leave a blank line between the highlight and your notes
- Each section should contain at least a highlight (notes are optional)

## Future Enhancements

Potential features for future versions:
- Export to multiple formats (Markdown, HTML, etc.)
- Batch file processing
- Custom callout creation
- Theme customization
- Integration with Obsidian API

## how to use it
```
python3 -m http.server 8000
```

Then in the browser, go to http://localhost:8000 to leverage Vimium to help on the navigation.