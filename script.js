const input = document.querySelector('#json-input');
const output = document.querySelector('#json-output');
const message = document.querySelector('#message');
const storageKey = 'json-prettifier-input';

function setMessage(text, type = 'error') {
  message.textContent = text;
  message.dataset.type = type;
}

function clearValidationState() {
  input.setAttribute('aria-invalid', 'false');
  output.setAttribute('aria-invalid', 'false');
}

function resetStats() {
  ['keys', 'objects', 'arrays', 'depth'].forEach((name) => {
    document.querySelector(`#stat-${name}`).textContent = '0';
  });
  document.querySelector('#stat-size').textContent = '0 B';
}

function updateStats(value, text) {
  const stats = { keys: 0, objects: 0, arrays: 0, depth: 0 };

  function visit(node, depth) {
    stats.depth = Math.max(stats.depth, depth);
    if (Array.isArray(node)) {
      stats.arrays += 1;
      node.forEach((item) => visit(item, depth + 1));
    } else if (node !== null && typeof node === 'object') {
      stats.objects += 1;
      stats.keys += Object.keys(node).length;
      Object.values(node).forEach((item) => visit(item, depth + 1));
    }
  }

  visit(value, 0);
  document.querySelector('#stat-keys').textContent = stats.keys;
  document.querySelector('#stat-objects').textContent = stats.objects;
  document.querySelector('#stat-arrays').textContent = stats.arrays;
  document.querySelector('#stat-depth').textContent = stats.depth;
  document.querySelector('#stat-size').textContent = `${new Blob([text]).size} B`;
}

function saveInput() {
  try {
    localStorage.setItem(storageKey, input.value);
  } catch {
    // Storage can be unavailable in private browsing; the editor still works.
  }
}

function parseInput() {
  const value = input.value.trim();
  if (!value) {
    output.value = '';
    resetStats();
    input.setAttribute('aria-invalid', 'true');
    setMessage('Enter some JSON to continue.', 'error');
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    output.value = '';
    resetStats();
    input.setAttribute('aria-invalid', 'true');
    output.setAttribute('aria-invalid', 'false');
    setMessage(`Invalid JSON: ${error.message}`, 'error');
    return null;
  }
}

function transform(compact) {
  setMessage('', 'info');
  const json = parseInput();
  if (json === null) {
    input.focus();
    return;
  }

  const text = JSON.stringify(json, null, compact ? 0 : 2);
  output.value = text;
  clearValidationState();
  updateStats(json, text);
  saveInput();
  setMessage(compact ? 'JSON minified successfully.' : 'JSON formatted successfully.', 'success');
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === 'object') {
    return Object.keys(value).sort((a, b) => a.localeCompare(b)).reduce((sorted, key) => {
      sorted[key] = sortKeys(value[key]);
      return sorted;
    }, {});
  }
  return value;
}

function sortJson() {
  const json = parseInput();
  if (json === null) return;
  const sorted = sortKeys(json);
  input.value = JSON.stringify(sorted, null, 2);
  output.value = input.value;
  updateStats(sorted, output.value);
  clearValidationState();
  saveInput();
  setMessage('JSON keys sorted alphabetically.', 'success');
}

function handleKeyboardShortcuts(event) {
  const isModifierPressed = event.ctrlKey || event.metaKey;
  if (!isModifierPressed) return;
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    transform(false);
    return;
  }
  if (event.key.toLowerCase() === 'm' && event.shiftKey) {
    event.preventDefault();
    transform(true);
  }
}

document.addEventListener('keydown', handleKeyboardShortcuts);
input.addEventListener('input', saveInput);
document.querySelector('#format-button').addEventListener('click', () => transform(false));
document.querySelector('#minify-button').addEventListener('click', () => transform(true));
document.querySelector('#sort-button').addEventListener('click', sortJson);
document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  resetStats();
  try { localStorage.removeItem(storageKey); } catch { /* Ignore unavailable storage. */ }
  setMessage('', 'info');
  clearValidationState();
  input.focus();
});
document.querySelector('#copy-button').addEventListener('click', async () => {
  if (!output.value) {
    setMessage('There is no output to copy yet. Format or minify JSON first.', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(output.value);
    setMessage('Output copied to clipboard.', 'success');
  } catch {
    setMessage('Could not copy output automatically. Please copy it manually.', 'error');
  }
});
document.querySelector('#upload-button').addEventListener('click', () => document.querySelector('#file-input').click());
document.querySelector('#file-input').addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    input.value = reader.result;
    saveInput();
    transform(false);
  });
  reader.addEventListener('error', () => setMessage('Could not read that file.', 'error'));
  reader.readAsText(file);
  event.target.value = '';
});
document.querySelector('#download-button').addEventListener('click', () => {
  if (!output.value) {
    setMessage('There is no formatted output to download yet.', 'error');
    return;
  }
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([output.value], { type: 'application/json' }));
  link.download = 'formatted.json';
  link.click();
  URL.revokeObjectURL(link.href);
  setMessage('formatted.json downloaded.', 'success');
});

try {
  const savedInput = localStorage.getItem(storageKey);
  if (savedInput) {
    input.value = savedInput;
    transform(false);
  }
} catch {
  // Storage can be unavailable; start with an empty editor.
}
