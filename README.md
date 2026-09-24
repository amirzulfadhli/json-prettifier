# JSON Prettifier

A lightweight browser-based JSON utility for formatting, minifying, sorting, and copying JSON directly in the browser.

## Features
- Format JSON with readable indentation
- Minify JSON into a compact single-line string
- Upload JSON files and download formatted output as `formatted.json`
- Recursively sort object keys while preserving array order
- Automatically save and restore the latest input in local storage
- Show JSON statistics including keys, objects, arrays, nesting depth, and output size
- Copy the generated output to the clipboard
- Clear the input and output panels instantly
- Keyboard shortcuts for faster editing
- Accessible status messages and validation feedback

## Usage
1. Paste JSON or upload a `.json` file into the input area.
2. Click Format, Minify, or Sort keys, or use the keyboard shortcuts:
   - Ctrl/Cmd + Enter: Format
   - Ctrl/Cmd + Shift + M: Minify
3. Review the output, download `formatted.json`, or use Copy output when needed.

## Notes
- The app runs entirely on the client side and does not send your JSON to a server.
- Empty and invalid JSON input produces a clear message without breaking the editor.
