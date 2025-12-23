# Page Number Format Examples

## New Format (Current Implementation)

The page number now appears **at the front** in **bold**:

```markdown
**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272
```

### Visual Preview (How it looks in Obsidian/Markdown):

**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272

---

## Features:

✅ **Page number is bold** - Easy to spot when scanning through notes
✅ **Page number comes first** - See the page immediately
✅ **Semicolon separator** - Clean visual separation
✅ **Auto-calculated** - Uses formula: (x - 194) / 13

---

## Example with Multiple Quotes:

**Page 1**; location: [207](kindle://book?action=open&asin=B0C5VBDC65&location=207) ^ref-12345

**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272

**Page 62**; location: [1000](kindle://book?action=open&asin=B0C5VBDC65&location=1000) ^ref-99999

---

## Complete Quote Example:

> This is the actual quote from the book. **Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272

> [!note]
> These are your notes about the quote. You can add your thoughts, analysis, or connections here.

---

## Migration:

The function automatically handles old formats and converts them:

**Old Format:**
```
location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272 Page: 24
```

**Automatically Converted To:**
```
**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272
```
