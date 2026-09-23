const input = document.querySelector('#json-input');
const output = document.querySelector('#json-output');
const message = document.querySelector('#message');

function transform(compact) {
  const value = input.value.trim();
  message.textContent = '';

  if (!value) {
    output.value = '';
    message.textContent = 'Enter some JSON to format.';
    input.focus();
    return;
  }

  try {
    const json = JSON.parse(value);
    output.value = JSON.stringify(json, null, compact ? 0 : 2);
  } catch (error) {
    output.value = '';
    message.textContent = `Invalid JSON: ${error.message}`;
  }
}

document.querySelector('#format-button').addEventListener('click', () => transform(false));
document.querySelector('#minify-button').addEventListener('click', () => transform(true));
document.querySelector('#clear-button').addEventListener('click', () => {
  input.value = '';
  output.value = '';
  message.textContent = '';
  input.focus();
});
document.querySelector('#copy-button').addEventListener('click', async () => {
  if (!output.value) {
    message.textContent = 'There is no output to copy.';
    return;
  }

  try {
    await navigator.clipboard.writeText(output.value);
    message.textContent = 'Output copied to clipboard.';
  } catch {
    message.textContent = 'Could not copy output. Please copy it manually.';
  }
});
