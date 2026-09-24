const input = document.querySelector('#json-input');
const output = document.querySelector('#json-output');
const message = document.querySelector('#message');

function setMessage(text, type = 'error') {
  message.textContent = text;
  message.dataset.type = type;
}

function clearValidationState() {
  input.setAttribute('aria-invalid', 'false');
  output.setAttribute('aria-invalid', 'false');
}

function transform(compact) {
  const value = input.value.trim();
  setMessage('', 'info');

  if (!value) {
    output.value = '';
    input.setAttribute('aria-invalid', 'true');
    setMessage('Enter some JSON to format.', 'error');
    input.focus();
    return;
  }

  try {
    const json = JSON.parse(value);
    output.value = JSON.stringify(json, null, compact ? 0 : 2);
    clearValidationState();
    setMessage(compact ? 'JSON minified successfully.' : 'JSON formatted successfully.', 'success');
  } catch (error) {
    output.value = '';
    input.setAttribute('aria-invalid', 'true');
    clearValidationState();
    setMessage(`Invalid JSON: ${error.message}`, 'error');
  }
}

function handleKeyboardShortcuts(event) {
  const isModifierPressed = event.ctrlKey || event.metaKey;

  if (!isModifierPressed) {
    return;
  }

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

document.querySelector('#format-button').addEventListener('click', () => transform(false));
document.querySelector('#minify-button').addEventListener('click', () => transform(true));
document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  output.value = '';
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
