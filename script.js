// DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const noteCallout = document.getElementById('noteCallout');
const parseBtn = document.getElementById('parseBtn');
const generateBtn = document.getElementById('generateBtn');
const mergeSelectedBtn = document.getElementById('mergeSelectedBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const backToEditBtn = document.getElementById('backToEditBtn');
const fileInput = document.getElementById('fileInput');
const fileDropZone = document.getElementById('fileDropZone');
const currentFile = document.getElementById('currentFile');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFileBtn');

// Section elements
const quotesSection = document.getElementById('quotesSection');
const outputSection = document.getElementById('outputSection');
const quotesList = document.getElementById('quotesList');
const saveProgressBtn = document.getElementById('saveProgressBtn');

// Modal elements
const editModal = document.getElementById('editModal');
const closeModal = document.getElementById('closeModal');
const editQuoteText = document.getElementById('editQuoteText');
const editNotesText = document.getElementById('editNotesText');
const editCalloutType = document.getElementById('editCalloutType');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Application state
let currentFileName = '';
let originalFileContent = '';
let quotes = [];
let currentEditingIndex = -1;
let hasProgressMetadata = false;

// Callout type mappings
const calloutTypes = {
    note: { emoji: '📝', title: 'Note', class: 'note' },
    tip: { emoji: '💡', title: 'Tip', class: 'tip' },
    warning: { emoji: '⚠️', title: 'Warning', class: 'warning' },
    danger: { emoji: '🚨', title: 'Danger', class: 'danger' },
    info: { emoji: 'ℹ️', title: 'Info', class: 'info' },
    success: { emoji: '✅', title: 'Success', class: 'success' },
    bug: { emoji: '🐛', title: 'Bug', class: 'bug' },
    question: { emoji: '❓', title: 'Question', class: 'question' },
    abstract: { emoji: '📄', title: 'Abstract', class: 'abstract' },
    example: { emoji: '📋', title: 'Example', class: 'example' },
    quote: { emoji: '💬', title: 'Quote', class: 'quote' }
};

// Initialize the application
function init() {
    console.log('Book Notes Converter initialized');
    console.log('Save Progress Button:', saveProgressBtn);
    
    // Event listeners
    parseBtn.addEventListener('click', parseQuotes);
    generateBtn.addEventListener('click', generateOutput);
    mergeSelectedBtn.addEventListener('click', mergeSelectedQuotes);
    saveProgressBtn.addEventListener('click', saveProgress);
    copyBtn.addEventListener('click', copyToClipboard);
    downloadBtn.addEventListener('click', downloadMarkdownFile);
    clearBtn.addEventListener('click', clearAll);
    backToEditBtn.addEventListener('click', backToEdit);
    removeFileBtn.addEventListener('click', removeFile);
    
    // Modal listeners
    closeModal.addEventListener('click', closeEditModal);
    saveQuoteBtn.addEventListener('click', saveQuoteChanges);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });
    
    // File input listeners
    fileInput.addEventListener('change', handleFileSelect);
    fileDropZone.addEventListener('click', () => fileInput.click());
    
    // Drag and drop listeners
    fileDropZone.addEventListener('dragover', handleDragOver);
    fileDropZone.addEventListener('dragleave', handleDragLeave);
    fileDropZone.addEventListener('drop', handleFileDrop);
}

// Parse quotes from input text
function parseQuotes() {
    const input = inputText.value.trim();
    if (!input) {
        alert('Please enter some content to parse.');
        return;
    }
    
    try {
        quotes = parseKindleHighlights(input);
        
        if (quotes.length === 0) {
            alert('No quotes found. Make sure your content uses "---" as separators.');
            return;
        }
        
        displayQuotes();
        quotesSection.style.display = 'block';
        outputSection.style.display = 'none';
        
        // Scroll to quotes section
        quotesSection.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Parse error:', error);
        alert('Error parsing quotes. Please check your format.');
    }
}

// Parse Kindle highlights format
function parseKindleHighlights(text) {
    if (!text.trim()) return [];
    
    // Split by --- separators
    const sections = text.split(/---\s*/).filter(section => section.trim());
    
    const highlights = [];
    
    sections.forEach((section, index) => {
        const lines = section.trim().split('\n');
        let highlight = '';
        let notes = '';
        let locationRefs = [];
        let foundEmptyLine = false;
        let isInNotes = false;
        
        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();
            
            // Skip empty lines but track them
            if (trimmedLine === '') {
                foundEmptyLine = true;
                return;
            }
            
            // Check if line is a standalone Kindle location reference
            const isLocationRef = isKindleLocationRef(trimmedLine);
            
            if (isLocationRef) {
                locationRefs.push(trimmedLine);
                return;  // Skip adding to highlight or notes
            }
            
            // Process the line and handle embedded location references
            let processedLine = trimmedLine;
            
            // Extract any embedded location references
            const embeddedRefs = extractLocationRefs(processedLine);
            if (embeddedRefs.length > 0) {
                locationRefs.push(...embeddedRefs);
                // Remove the location references from the text
                processedLine = removeEmbeddedLocationRefs(processedLine);
            }
            
            // Skip if line becomes empty after removing location refs
            if (!processedLine.trim()) {
                return;
            }
            
            // Determine if we're in the notes section
            if (!foundEmptyLine && !isInNotes) {
                // Still in highlight section
                highlight += (highlight ? ' ' : '') + processedLine;
            } else {
                // We're in the notes section
                isInNotes = true;
                notes += (notes ? '\n' : '') + processedLine;
            }
        });
        
        if (highlight.trim()) {
            highlights.push({
                id: Date.now() + index,
                highlight: highlight.trim(),
                notes: notes.trim(),
                locationRefs: locationRefs, // Store location references separately
                calloutType: noteCallout.value,
                selected: false,
                merged: false
            });
        }
    });
    
    return highlights;
}

// Check if a line is a Kindle location reference (standalone line)
function isKindleLocationRef(line) {
    const patterns = [
        // Match any dash-like character followed by "location:"
        /^[\u2013\u2014\u2015\-]\s*location:/i,
        // Match ^ref- pattern
        /^\^ref-\d+/i,
        // Match standalone location patterns
        /^location:\s*\[/i,
        /^page:\s*\d+/i
    ];
    
    return patterns.some(pattern => pattern.test(line));
}

// Remove embedded Kindle location references from text
function removeEmbeddedLocationRefs(text) {
    // Pattern to match location references embedded within text
    // Matches: — location: [302](kindle://book?action=open&asin=B00Z3FRYB0&location=302) ^ref-391
    const locationPattern = /[\u2013\u2014\u2015\-]\s*location:\s*\[.*?\]\(kindle:\/\/.*?\)\s*\^ref-\d+/gi;
    
    // Also match standalone ^ref-##### patterns
    const refPattern = /\s*\^ref-\d+/gi;
    
    let cleaned = text.replace(locationPattern, '');
    cleaned = cleaned.replace(refPattern, '');
    
    // Clean up any extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
}

// Extract location references from text
function extractLocationRefs(text) {
    const locationRefs = [];
    
    // Pattern to match location references
    const locationPattern = /[\u2013\u2014\u2015\-]\s*location:\s*\[.*?\]\(kindle:\/\/.*?\)\s*\^ref-\d+/gi;
    const refPattern = /\^ref-\d+/gi;
    
    let match;
    
    // Extract full location references
    while ((match = locationPattern.exec(text)) !== null) {
        locationRefs.push(match[0].trim());
    }
    
    // Extract standalone ref patterns
    locationPattern.lastIndex = 0; // Reset regex
    while ((match = refPattern.exec(text)) !== null) {
        // Only add if not already part of a full location reference
        const refText = match[0].trim();
        const alreadyIncluded = locationRefs.some(ref => ref.includes(refText));
        if (!alreadyIncluded) {
            locationRefs.push(refText);
        }
    }
    
    return locationRefs;
}

// Display quotes as cards
function displayQuotes() {
    quotesList.innerHTML = '';
    
    quotes.forEach((quote, index) => {
        const card = createQuoteCard(quote, index);
        quotesList.appendChild(card);
    });
    
    updateMergeButton();
    updateQuoteCount();
    
    // Enable save progress button when quotes are available
    saveProgressBtn.disabled = quotes.length === 0;
}

// Update quote counter
function updateQuoteCount() {
    const quotesCount = document.getElementById('quotesCount');
    const count = quotes.length;
    const selectedCount = quotes.filter(q => q.selected).length;
    
    let countText = `${count} quote${count !== 1 ? 's' : ''}`;
    if (selectedCount > 0) {
        countText += ` (${selectedCount} selected)`;
    }
    
    quotesCount.textContent = countText;
}

// Create a quote card element
function createQuoteCard(quote, index) {
    const card = document.createElement('div');
    card.className = `quote-card ${quote.selected ? 'selected' : ''} ${quote.merged ? 'merged' : ''}`;
    card.dataset.index = index;
    
    const calloutInfo = calloutTypes[quote.calloutType];
    
    // Add location info indicator if present
    const locationIndicator = quote.locationRefs && quote.locationRefs.length > 0 ? 
        `<span class="location-indicator" title="Contains Kindle location reference">📍</span>` : '';
    
    // Build the card content conditionally
    const hasNotes = quote.notes && quote.notes.trim();
    const editButtonText = hasNotes ? '✏️ Edit' : '✏️ Add Notes';
    
    let cardContent = `
        <div class="quote-header">
            <span class="quote-number">Quote #${index + 1} ${locationIndicator}</span>
            <div class="quote-actions">
                <input type="checkbox" class="quote-checkbox" ${quote.selected ? 'checked' : ''}>
                <button class="edit-btn" onclick="editQuote(${index})">${editButtonText}</button>
                <button class="delete-btn" onclick="deleteQuote(${index})">🗑️ Delete</button>
            </div>
        </div>
        
        <div class="quote-text">"${quote.highlight}"</div>`;
    
    // Only add notes section if there are actual notes
    if (hasNotes) {
        cardContent += `
        <div class="quote-notes">
            ${quote.notes}
        </div>`;
    }
    
    // Always show callout info for consistency
    cardContent += `
        <div class="quote-callout-info">
            <span>${calloutInfo.emoji} ${calloutInfo.title} callout</span>
            ${!hasNotes ? '<span class="no-notes-indicator">• No notes yet</span>' : ''}
        </div>`;
    
    card.innerHTML = cardContent;
    
    // Add click handler for selection
    card.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox' || e.target.tagName === 'BUTTON') return;
        toggleQuoteSelection(index);
    });
    
    // Add checkbox handler
    const checkbox = card.querySelector('.quote-checkbox');
    checkbox.addEventListener('change', () => {
        toggleQuoteSelection(index);
    });
    
    return card;
}

// Quote interaction functions
function toggleQuoteSelection(index) {
    quotes[index].selected = !quotes[index].selected;
    displayQuotes();
}

function editQuote(index) {
    currentEditingIndex = index;
    const quote = quotes[index];
    
    editQuoteText.value = quote.highlight;
    editNotesText.value = quote.notes;
    editCalloutType.value = quote.calloutType;
    
    editModal.style.display = 'flex';
    editNotesText.focus();
    
    // Position cursor at the end of existing notes for easy continuation
    editNotesText.setSelectionRange(editNotesText.value.length, editNotesText.value.length);
}

function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes.splice(index, 1);
        displayQuotes();
    }
}

function closeEditModal() {
    editModal.style.display = 'none';
    currentEditingIndex = -1;
}

function saveQuoteChanges() {
    if (currentEditingIndex === -1) return;
    
    const quote = quotes[currentEditingIndex];
    quote.highlight = editQuoteText.value.trim();
    quote.notes = editNotesText.value.trim();
    quote.calloutType = editCalloutType.value;
    // Location references are preserved and not editable
    
    displayQuotes();
    closeEditModal();
}

function updateMergeButton() {
    const selectedCount = quotes.filter(q => q.selected).length;
    mergeSelectedBtn.disabled = selectedCount < 2;
    mergeSelectedBtn.textContent = selectedCount > 0 ? 
        `🔗 Merge Selected (${selectedCount})` : 
        '🔗 Merge Selected';
    updateQuoteCount();
}

function mergeSelectedQuotes() {
    const selectedIndices = quotes.map((quote, index) => quote.selected ? index : -1)
                                  .filter(index => index !== -1);
    
    if (selectedIndices.length < 2) return;
    
    // Create merged quote with structured data to maintain quote-reference relationships
    const selectedQuotes = selectedIndices.map(i => quotes[i]);
    
    // Store individual quotes with their references for proper output formatting
    const quoteParts = selectedQuotes.map(q => ({
        highlight: q.highlight,
        locationRefs: q.locationRefs || []
    }));
    
    const mergedHighlight = selectedQuotes.map(q => q.highlight).join('\n\n');
    const mergedNotes = selectedQuotes.filter(q => q.notes).map(q => q.notes).join('\n\n');
    
    const mergedQuote = {
        id: Date.now(),
        highlight: mergedHighlight,
        notes: mergedNotes,
        locationRefs: [], // Keep empty for merged quotes
        quoteParts: quoteParts, // Store individual parts with their references
        calloutType: selectedQuotes[0].calloutType,
        selected: false,
        merged: true
    };
    
    // Remove selected quotes (in reverse order to maintain indices)
    selectedIndices.reverse().forEach(index => {
        quotes.splice(index, 1);
    });
    
    // Add merged quote at the position of the first selected quote
    const insertIndex = Math.min(...selectedIndices.map(i => i));
    quotes.splice(insertIndex, 0, mergedQuote);
    
    displayQuotes();
}

// Generate final output
function generateOutput() {
    if (quotes.length === 0) {
        alert('No quotes to generate output from.');
        return;
    }
    
    let result = '';
    
    quotes.forEach((quote, index) => {
        // Add separator before each quote (except the first one)
        if (index > 0) {
            result += '\n---\n\n';
        }
        
        // Handle merged quotes vs single quotes
        if (quote.merged && quote.quoteParts) {
            // For merged quotes, use the stored quoteParts to maintain quote-reference relationships
            quote.quoteParts.forEach((part, partIndex) => {
                const quoteLines = part.highlight.split('\n');
                quoteLines.forEach((line, lineIndex) => {
                    result += '> ' + line;
                    
                    // Add location references to the last line of each quote part
                    if (lineIndex === quoteLines.length - 1 && part.locationRefs && part.locationRefs.length > 0) {
                        result += ' ' + part.locationRefs.join(' ');
                    }
                    
                    result += '\n';
                });
                
                // Add spacing between merged quote parts (except after the last one)
                if (partIndex < quote.quoteParts.length - 1) {
                    result += '\n';
                }
            });
            result += '\n';
        } else {
            // Single quote - add location references at the end of the quote line
            const quoteLines = quote.highlight.split('\n');
            quoteLines.forEach((line, lineIndex) => {
                result += '> ' + line;
                
                // Add location references to the last line of the quote
                if (lineIndex === quoteLines.length - 1 && quote.locationRefs && quote.locationRefs.length > 0) {
                    result += ' ' + quote.locationRefs.join(' ');
                }
                
                result += '\n';
            });
            result += '\n';
        }
        
        // Add notes in callout format if they exist
        if (quote.notes) {
            result += `> [!${quote.calloutType}]\n`;
            const noteLines = quote.notes.split('\n');
            noteLines.forEach(line => {
                result += `> ${line}\n`;
            });
            result += '\n';
        }
    });
    
    outputText.value = result.trim();
    outputSection.style.display = 'block';
    quotesSection.style.display = 'none';
    
    // Scroll to output section
    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function backToEdit() {
    outputSection.style.display = 'none';
    quotesSection.style.display = 'block';
    quotesSection.scrollIntoView({ behavior: 'smooth' });
}

// Progress tracking functions
function generateProgressMetadata() {
    const progressData = {
        timestamp: new Date().toISOString(),
        totalQuotes: quotes.length,
        quotesWithNotes: quotes.filter(q => q.notes && q.notes.trim()).length,
        mergedQuotes: quotes.filter(q => q.merged).length,
        quotes: quotes.map((quote, index) => ({
            index: index,
            id: quote.id,
            hasNotes: !!(quote.notes && quote.notes.trim()),
            calloutType: quote.calloutType,
            merged: quote.merged,
            selected: quote.selected
        }))
    };
    
    return `<!-- BOOKNOTES_PROGRESS_START
${JSON.stringify(progressData, null, 2)}
BOOKNOTES_PROGRESS_END -->`;
}

function parseProgressMetadata(content) {
    const progressMatch = content.match(/<!-- BOOKNOTES_PROGRESS_START\n([\s\S]*?)\nBOOKNOTES_PROGRESS_END -->/);
    if (progressMatch) {
        try {
            return JSON.parse(progressMatch[1]);
        } catch (e) {
            console.error('Error parsing progress metadata:', e);
        }
    }
    return null;
}

function removeProgressMetadata(content) {
    return content.replace(/<!-- BOOKNOTES_PROGRESS_START[\s\S]*?BOOKNOTES_PROGRESS_END -->\n?/g, '');
}

function saveProgress() {
    console.log('Save Progress button clicked!');
    
    if (!currentFileName) {
        alert('No file loaded to save progress to.');
        return;
    }
    
    console.log('Saving progress...', { quotes: quotes.length, fileName: currentFileName });
    
    // Show user instruction about replacing the original file
    const confirmMessage = `This will download "${currentFileName}" with your progress saved.\n\n` +
                          `To avoid file duplicates:\n` +
                          `1. Save the downloaded file to replace your original\n` +
                          `2. Or move the downloaded file to replace the original\n\n` +
                          `Continue with saving progress?`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Get current content without old progress metadata
    let cleanContent = removeProgressMetadata(originalFileContent);
    
    // Reconstruct the markdown with current notes
    let updatedContent = reconstructMarkdownWithNotes(originalFileContent);
    
    // Add progress metadata at the end
    const progressMetadata = generateProgressMetadata();
    console.log('Generated metadata:', progressMetadata);
    updatedContent += '\n\n' + progressMetadata;
    
    // Create and download the updated file with exact same name
    const blob = new Blob([updatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName; // Exact same filename for replacement
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update original content for next save
    originalFileContent = updatedContent;
    
    // Visual feedback with instruction
    const originalText = saveProgressBtn.textContent;
    saveProgressBtn.textContent = '✅ Downloaded - Replace Original!';
    saveProgressBtn.style.background = '#22c55e';
    
    // Show follow-up instruction
    setTimeout(() => {
        alert(`Progress saved to downloads!\n\n` +
              `Next step: Replace your original "${currentFileName}" file with the downloaded version to avoid duplicates.`);
    }, 500);
    
    setTimeout(() => {
        saveProgressBtn.textContent = originalText;
        saveProgressBtn.style.background = '';
    }, 4000);
}

function reconstructMarkdownWithNotes(originalContent) {
    // Remove progress metadata first
    const cleanContent = removeProgressMetadata(originalContent);
    
    // Split by --- to get original sections
    const sections = cleanContent.split(/---\s*/).filter(section => section.trim());
    
    let result = '';
    
    quotes.forEach((quote, index) => {
        if (index > 0) {
            result += '\n---\n\n';
        }
        
        // Add the quote highlight with its location references
        if (quote.merged && quote.quoteParts) {
            // Handle merged quotes
            quote.quoteParts.forEach((part, partIndex) => {
                result += part.highlight;
                if (part.locationRefs && part.locationRefs.length > 0) {
                    result += ' ' + part.locationRefs.join(' ');
                }
                if (partIndex < quote.quoteParts.length - 1) {
                    result += '\n\n';
                }
            });
        } else {
            // Single quote
            result += quote.highlight;
            if (quote.locationRefs && quote.locationRefs.length > 0) {
                result += ' ' + quote.locationRefs.join(' ');
            }
        }
        
        // Add notes if they exist
        if (quote.notes && quote.notes.trim()) {
            result += '\n\n' + quote.notes;
        }
        
        result += '\n';
    });
    
    return result.trim();
}

// File handling functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        loadFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    fileDropZone.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    fileDropZone.classList.remove('drag-over');
}

function handleFileDrop(event) {
    event.preventDefault();
    fileDropZone.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        loadFile(files[0]);
    }
}

function loadFile(file) {
    if (!file.name.match(/\.(md|markdown|txt)$/i)) {
        alert('Please select a markdown (.md), .markdown, or .txt file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        originalFileContent = content;
        currentFileName = file.name;
        
        // Check for existing progress metadata
        const progressData = parseProgressMetadata(content);
        hasProgressMetadata = !!progressData;
        
        // Remove progress metadata from display content
        const cleanContent = removeProgressMetadata(content);
        inputText.value = cleanContent;
        
        // Update UI
        fileName.textContent = file.name + (hasProgressMetadata ? ' (has progress)' : '');
        currentFile.style.display = 'flex';
        fileDropZone.style.display = 'none';
        
        // Reset sections
        quotesSection.style.display = 'none';
        outputSection.style.display = 'none';
        
        // Show progress info if available
        if (hasProgressMetadata) {
            showProgressInfo(progressData);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
}

function showProgressInfo(progressData) {
    const timestamp = new Date(progressData.timestamp).toLocaleString();
    const message = `📊 Previous Progress Found (${timestamp}):\n` +
                   `• ${progressData.totalQuotes} quotes total\n` +
                   `• ${progressData.quotesWithNotes} quotes with notes\n` +
                   `• ${progressData.mergedQuotes} merged quotes\n\n` +
                   `Click "Parse Quotes" to continue where you left off.`;
    
    if (confirm(message + '\n\nWould you like to automatically parse and restore your progress?')) {
        parseQuotes();
        restoreProgressState(progressData);
    }
}

function restoreProgressState(progressData) {
    // This will be called after parsing to restore selection states, etc.
    setTimeout(() => {
        progressData.quotes.forEach((savedQuote, index) => {
            if (index < quotes.length && quotes[index].id === savedQuote.id) {
                quotes[index].selected = savedQuote.selected;
                quotes[index].calloutType = savedQuote.calloutType;
            }
        });
        displayQuotes();
    }, 100);
}

function removeFile() {
    currentFileName = '';
    originalFileContent = '';
    inputText.value = '';
    outputText.value = '';
    quotes = [];
    
    // Reset file input
    fileInput.value = '';
    
    // Update UI
    currentFile.style.display = 'none';
    fileDropZone.style.display = 'block';
    quotesSection.style.display = 'none';
    outputSection.style.display = 'none';
}

function downloadMarkdownFile() {
    const content = outputText.value;
    if (!content) return;
    
    // Use original filename or default
    const filename = currentFileName || 'converted-notes.md';
    const downloadName = filename.replace(/\.(md|markdown|txt)$/i, '-converted.md');
    
    // Create blob and download
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Visual feedback
    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = '✅ Downloaded!';
    downloadBtn.style.background = '#22c55e';
    
    setTimeout(() => {
        downloadBtn.textContent = originalText;
        downloadBtn.style.background = '';
    }, 2000);
}



// Copy to clipboard function
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(outputText.value);
        
        // Visual feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        copyBtn.style.background = '#22c55e';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '';
        }, 2000);
        
    } catch (error) {
        console.error('Failed to copy:', error);
        
        // Fallback for older browsers
        outputText.select();
        document.execCommand('copy');
        
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }
}

// Clear all function
function clearAll() {
    removeFile(); // This will clear everything and reset UI
    quotes = [];
    quotesSection.style.display = 'none';
    outputSection.style.display = 'none';
    inputText.focus();
}



// Sample data for testing
function loadSampleData() {
    const sampleText = `---
The key to successful habit formation is to start small and be consistent rather than trying to make dramatic changes all at once.

— location: [685](kindle://book?action=open&asin=B00Z3FRYB0&location=685) ^ref-60154

This resonates with my own experience. I've found that when I try to change too much too quickly, I usually end up abandoning the new habits. Starting with just 2 minutes of reading per day was much more sustainable than trying to read for an hour.

---

Environment design is more powerful than willpower. If you want to build a good habit, make it easy. If you want to break a bad habit, make it hard.

— location: [789](kindle://book?action=open&asin=B00Z3FRYB0&location=789) ^ref-17832

I need to apply this to my phone usage. Instead of relying on willpower, I should just put my phone in another room when I'm working.

---

The most effective way to change your habits is to focus not on what you want to achieve, but on who you wish to become.

This is a paradigm shift for me. Instead of saying "I want to lose weight," I should think "I am someone who takes care of their health."

---`;
    
    inputText.value = sampleText;
    parseQuotes();
}

// Debug/Test Functions
function runLocationTest() {
    const testInput = document.getElementById('testInput').value;
    const linesOutput = document.getElementById('linesOutput');
    const locationOutput = document.getElementById('locationOutput');
    const parsedOutput = document.getElementById('parsedOutput');
    
    // Clear previous output
    linesOutput.textContent = '';
    locationOutput.textContent = '';
    parsedOutput.textContent = '';
    
    // Test line by line
    const lines = testInput.split('\n');
    let linesResult = '';
    let locationResult = '';
    
    lines.forEach((line, index) => {
        const trimmed = line.trim();
        linesResult += `Line ${index}: "${trimmed}"\n`;
        linesResult += `  Length: ${trimmed.length}\n`;
        linesResult += `  First char: "${trimmed.charAt(0)}" (code: ${trimmed.charCodeAt(0)})\n`;
        
        // Test standalone location reference detection
        const isLocationRef = isKindleLocationRef(trimmed);
        locationResult += `Line ${index}: ${isLocationRef ? '✅ IS' : '❌ NOT'} a standalone location reference\n`;
        
        // Test embedded location reference detection
        const embeddedRefs = extractLocationRefs(trimmed);
        if (embeddedRefs.length > 0) {
            locationResult += `  🔍 FOUND embedded references: ${embeddedRefs.join(', ')}\n`;
            const cleaned = removeEmbeddedLocationRefs(trimmed);
            locationResult += `  🧹 CLEANED text: "${cleaned}"\n`;
        }
        
        locationResult += `  📝 Original: "${trimmed}"\n\n`;
        
        linesResult += '\n';
    });
    
    // Test full parsing
    const sections = [`---\n${testInput}\n---`];
    const parsed = parseKindleHighlights(sections[0]);
    
    linesOutput.textContent = linesResult;
    locationOutput.textContent = locationResult;
    parsedOutput.textContent = JSON.stringify(parsed, null, 2);
}

function toggleDebugSection() {
    const debugSection = document.getElementById('debugSection');
    const isVisible = debugSection.style.display !== 'none';
    debugSection.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        debugSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Add sample data button and debug functionality
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('footer');
    
    // Sample data button
    const sampleButton = document.createElement('button');
    sampleButton.textContent = '📖 Load Sample Data';
    sampleButton.className = 'convert-btn';
    sampleButton.style.marginTop = '20px';
    sampleButton.addEventListener('click', loadSampleData);
    footer.appendChild(sampleButton);
    
    // Debug toggle button
    const debugToggle = document.createElement('button');
    debugToggle.textContent = '🔧';
    debugToggle.className = 'debug-toggle';
    debugToggle.title = 'Toggle Debug Mode';
    debugToggle.addEventListener('click', toggleDebugSection);
    document.body.appendChild(debugToggle);
    
    // Debug test button
    const runTestBtn = document.getElementById('runTestBtn');
    if (runTestBtn) {
        runTestBtn.addEventListener('click', runLocationTest);
    }
});