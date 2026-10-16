const API = '/api';
const today = new Date();
const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const cropForm = document.getElementById('crop-form');
const expenseForm = document.getElementById('expense-form');
const cropIdInput = document.getElementById('crop-id');
const expenseIdInput = document.getElementById('expense-id');
const cropNameInput = document.getElementById('crop-name');
const seedVarietyInput = document.getElementById('seed-variety');
const sowingDateInput = document.getElementById('sowing-date');
const cropAreaInput = document.getElementById('crop-area');
const expenseCropSelect = document.getElementById('expense-crop');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseDateInput = document.getElementById('expense-date');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseNoteInput = document.getElementById('expense-note');
const cropList = document.getElementById('crop-list');
const expenseRows = document.getElementById('expense-rows');
const expenseFilter = document.getElementById('expense-filter');
const messageBox = document.getElementById('message');
const incomeDialog = document.getElementById('income-dialog');
const incomeForm = document.getElementById('income-form');
const saleIncomeInput = document.getElementById('sale-income');

let crops = [];
let expenses = [];
let completionCropId = null;
let messageTimer = null;

// All dates entered by the user must be today or earlier.
document.querySelectorAll('input[type="date"]').forEach((input) => { input.max = todayString; });
expenseDateInput.value = todayString;

function currency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function showMessage(message, type = 'success') {
  clearTimeout(messageTimer);
  messageBox.textContent = message;
  messageBox.className = `message ${type}`;
  messageBox.hidden = false;
  messageTimer = setTimeout(() => { messageBox.hidden = true; }, 5000);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function request(url, options = {}) {
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  let result = {};
  try { result = await response.json(); } catch { /* an empty response is handled below */ }
  if (!response.ok) throw new Error(result.message || `Request failed (${response.status}).`);
  return result;
}

function validDateNotFuture(value) {
  return Boolean(value) && /^\d{4}-\d{2}-\d{2}$/.test(value) && value <= todayString;
}

function validateCropForm() {
  const name = cropNameInput.value.trim();
  const seed = seedVarietyInput.value.trim();
  const date = sowingDateInput.value;
  const area = Number(cropAreaInput.value);
  if (name.length < 2 || name.length > 50) return 'Crop name must contain 2 to 50 characters.';
  if (seed.length < 2 || seed.length > 80) return 'Seed name or variety must contain 2 to 80 characters.';
  if (!validDateNotFuture(date)) return 'Choose a valid sowing date that is today or earlier.';
  if (!Number.isFinite(area) || area < 0.01 || area > 100000) return 'Land area must be greater than 0 and no more than 100000 acres.';
  return '';
}

function validateExpenseForm() {
  const crop = crops.find((item) => item._id === expenseCropSelect.value);
  if (!crop) return 'Please select a crop first.';
  if (!expenseIdInput.value && crop.status === 'Completed') return 'This crop season is complete. Choose a growing crop for a new expense.';
  if (!expenseCategoryInput.value) return 'Please choose an expense type.';
  if (!validDateNotFuture(expenseDateInput.value)) return 'Choose a valid expense date that is today or earlier.';
  if (expenseDateInput.value < dateInputValue(crop.sowingDate)) return 'Expense date cannot be before the crop sowing date.';
  const amount = Number(expenseAmountInput.value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) return 'Expense amount must be greater than 0 and within the allowed limit.';
  if (expenseNoteInput.value.trim().length > 200) return 'Note cannot exceed 200 characters.';
  return '';
}

function renderStats() {
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const completedCrops = crops.filter((crop) => crop.status === 'Completed');
  const saleIncome = completedCrops.reduce((sum, crop) => sum + Number(crop.saleIncome || 0), 0);
  const expenseByCrop = new Map();
  expenses.forEach((expense) => expenseByCrop.set(expense.cropId, (expenseByCrop.get(expense.cropId) || 0) + Number(expense.amount || 0)));
  const realizedProfit = completedCrops.reduce((sum, crop) => sum + Number(crop.saleIncome || 0) - (expenseByCrop.get(crop._id) || 0), 0);

  document.getElementById('stat-crops').textContent = crops.length;
  document.getElementById('stat-expenses').textContent = currency(totalExpenses);
  document.getElementById('stat-income').textContent = currency(saleIncome);
  const profitElement = document.getElementById('stat-profit');
  profitElement.textContent = currency(realizedProfit);
  profitElement.className = realizedProfit > 0 ? 'positive' : realizedProfit < 0 ? 'negative' : '';
  document.getElementById('crop-count').textContent = `${crops.length} ${crops.length === 1 ? 'crop' : 'crops'}`;
}

function renderCropOptions() {
  const current = expenseCropSelect.value;
  const editing = Boolean(expenseIdInput.value);
  const optionItems = ['<option value="">Choose crop</option>'];
  crops.forEach((crop) => {
    const statusText = crop.status === 'Completed' ? ' (Completed)' : '';
    optionItems.push(`<option value="${escapeHtml(crop._id)}">${escapeHtml(crop.cropName)}${statusText}</option>`);
  });
  expenseCropSelect.innerHTML = optionItems.join('');
  if (crops.some((crop) => crop._id === current)) expenseCropSelect.value = current;
  expenseCropSelect.disabled = editing;

  const filterCurrent = expenseFilter.value || 'all';
  expenseFilter.innerHTML = '<option value="all">All crops</option>' + crops.map((crop) => `<option value="${escapeHtml(crop._id)}">${escapeHtml(crop.cropName)}</option>`).join('');
  if (filterCurrent === 'all' || crops.some((crop) => crop._id === filterCurrent)) expenseFilter.value = filterCurrent;
}

function renderCrops() {
  if (!crops.length) {
    cropList.innerHTML = '<div class="empty-state"><span>🌱</span><strong>No crop records yet</strong><p>Add your first crop using the form above.</p></div>';
    return;
  }
  cropList.innerHTML = crops.map((crop) => {
    const expenseTotal = Number(crop.expenseTotal || 0);
    const completed = crop.status === 'Completed';
    const result = Number(crop.saleIncome || 0) - expenseTotal;
    const resultLabel = completed ? (result >= 0 ? 'Profit' : 'Loss') : 'Money spent so far';
    const resultClass = completed ? (result > 0 ? 'positive' : result < 0 ? 'negative' : 'neutral') : '';
    const resultValue = completed ? currency(Math.abs(result)) : currency(expenseTotal);
    const addExpenseButton = completed ? '' : `<button class="small-button" data-action="add-expense" data-id="${escapeHtml(crop._id)}">Add Expense</button>`;
    const seasonButton = completed
      ? `<button class="small-button" data-action="edit-income" data-id="${escapeHtml(crop._id)}">Update Sale Income</button>`
      : `<button class="small-button complete" data-action="complete" data-id="${escapeHtml(crop._id)}">Complete Season</button>`;
    return `<article class="crop-card">
      <div class="crop-card-top">
        <div class="crop-name-row"><span class="crop-emoji">🌾</span><div><h3>${escapeHtml(crop.cropName)}</h3><p class="crop-seed">Seed: ${escapeHtml(crop.seedVariety)}</p></div></div>
        <span class="status ${completed ? 'status-completed' : 'status-growing'}">${completed ? 'Completed' : 'Growing'}</span>
      </div>
      <div class="crop-meta">
        <div class="meta-item"><small>Sowing date</small><strong>${escapeHtml(formatDate(crop.sowingDate))}</strong></div>
        <div class="meta-item"><small>Land area</small><strong>${escapeHtml(crop.area)} acres</strong></div>
        <div class="meta-item"><small>Total expenses</small><strong>${currency(expenseTotal)}</strong></div>
        <div class="meta-item"><small>Sale income</small><strong>${completed ? currency(crop.saleIncome) : 'Not entered yet'}</strong></div>
      </div>
      <div class="crop-result"><span>${resultLabel}</span><strong class="${resultClass}">${completed && result < 0 ? '−' : ''}${resultValue}</strong></div>
      <div class="crop-actions"><button class="small-button" data-action="edit-crop" data-id="${escapeHtml(crop._id)}">Edit Crop</button>${addExpenseButton}${seasonButton}<button class="small-button danger" data-action="delete-crop" data-id="${escapeHtml(crop._id)}">Delete</button></div>
    </article>`;
  }).join('');
}

function renderExpenses() {
  const selectedCrop = expenseFilter.value || 'all';
  const filtered = selectedCrop === 'all' ? expenses : expenses.filter((item) => item.cropId === selectedCrop);
  if (!filtered.length) {
    expenseRows.innerHTML = '<tr><td class="table-empty" colspan="5">No expenses found for this selection.</td></tr>';
    return;
  }
  expenseRows.innerHTML = filtered.map((expense) => `<tr>
    <td>${escapeHtml(formatDate(expense.expenseDate))}</td>
    <td><strong>${escapeHtml(expense.cropName || 'Crop')}</strong></td>
    <td>${escapeHtml(expense.category)}${expense.note ? `<span class="cell-note">${escapeHtml(expense.note)}</span>` : ''}</td>
    <td class="amount-cell">${currency(expense.amount)}</td>
    <td><div class="table-actions"><button class="small-button" data-action="edit-expense" data-id="${escapeHtml(expense._id)}">Edit</button><button class="small-button danger" data-action="delete-expense" data-id="${escapeHtml(expense._id)}">Delete</button></div></td>
  </tr>`).join('');
}

async function refreshData() {
  try {
    const [cropData, expenseData] = await Promise.all([request('/crops'), request('/expenses')]);
    crops = cropData;
    expenses = expenseData;
    renderStats();
    renderCropOptions();
    renderCrops();
    renderExpenses();
  } catch (error) {
    showMessage(`${error.message} Make sure local MongoDB is running, then refresh the page.`, 'error');
  }
}

function resetCropForm() {
  cropForm.reset();
  cropIdInput.value = '';
  document.getElementById('crop-form-heading').textContent = 'Add a Crop';
  document.getElementById('crop-submit').textContent = '+ Save Crop';
  document.getElementById('crop-cancel').hidden = true;
  sowingDateInput.max = todayString;
}

function resetExpenseForm() {
  expenseForm.reset();
  expenseIdInput.value = '';
  expenseDateInput.value = todayString;
  expenseDateInput.max = todayString;
  expenseCropSelect.disabled = false;
  document.getElementById('expense-form-heading').textContent = 'Add an Expense';
  document.getElementById('expense-submit').textContent = '+ Save Expense';
  document.getElementById('expense-cancel').hidden = true;
}

cropForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const browserFormValid = cropForm.reportValidity();
  if (!browserFormValid) return;
  const message = validateCropForm();
  if (message) return showMessage(message, 'error');

  const id = cropIdInput.value;
  const body = {
    cropName: cropNameInput.value.trim(),
    seedVariety: seedVarietyInput.value.trim(),
    sowingDate: sowingDateInput.value,
    area: Number(cropAreaInput.value)
  };
  try {
    const result = await request(id ? `/crops/${id}` : '/crops', {
      method: id ? 'PUT' : 'POST', body: JSON.stringify(body)
    });
    resetCropForm();
    showMessage(result.message || 'Crop saved successfully.');
    await refreshData();
  } catch (error) { showMessage(error.message, 'error'); }
});

expenseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!expenseForm.reportValidity()) return;
  const message = validateExpenseForm();
  if (message) return showMessage(message, 'error');

  const id = expenseIdInput.value;
  const cropId = expenseCropSelect.value;
  const body = {
    category: expenseCategoryInput.value,
    expenseDate: expenseDateInput.value,
    amount: Number(expenseAmountInput.value),
    note: expenseNoteInput.value.trim()
  };
  try {
    const result = await request(id ? `/expenses/${id}` : `/crops/${cropId}/expenses`, {
      method: id ? 'PUT' : 'POST', body: JSON.stringify(body)
    });
    resetExpenseForm();
    showMessage(result.message || 'Expense saved successfully.');
    await refreshData();
  } catch (error) { showMessage(error.message, 'error'); }
});

cropList.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const crop = crops.find((item) => item._id === button.dataset.id);
  if (!crop) return;
  const action = button.dataset.action;

  if (action === 'edit-crop') {
    cropIdInput.value = crop._id;
    cropNameInput.value = crop.cropName;
    seedVarietyInput.value = crop.seedVariety;
    sowingDateInput.value = dateInputValue(crop.sowingDate);
    cropAreaInput.value = crop.area;
    document.getElementById('crop-form-heading').textContent = 'Edit Crop';
    document.getElementById('crop-submit').textContent = 'Update Crop';
    document.getElementById('crop-cancel').hidden = false;
    cropForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    cropNameInput.focus();
    return;
  }
  if (action === 'add-expense') {
    if (crop.status === 'Completed') return showMessage('This season is completed. Use a growing crop to add a new expense.', 'error');
    resetExpenseForm();
    expenseCropSelect.value = crop._id;
    expenseDateInput.min = dateInputValue(crop.sowingDate);
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    expenseCategoryInput.focus();
    return;
  }
  if (action === 'complete' || action === 'edit-income') {
    completionCropId = crop._id;
    document.getElementById('income-crop-label').textContent = `${crop.cropName}: enter the total money received from selling the harvest.`;
    saleIncomeInput.value = action === 'edit-income' ? Number(crop.saleIncome || 0) : '';
    incomeDialog.showModal();
    saleIncomeInput.focus();
    return;
  }
  if (action === 'delete-crop') {
    if (!window.confirm(`Delete ${crop.cropName} and all of its expense records? This cannot be undone.`)) return;
    try {
      const result = await request(`/crops/${crop._id}`, { method: 'DELETE' });
      if (cropIdInput.value === crop._id) resetCropForm();
      resetExpenseForm();
      showMessage(result.message);
      await refreshData();
    } catch (error) { showMessage(error.message, 'error'); }
  }
});

expenseRows.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const expense = expenses.find((item) => item._id === button.dataset.id);
  if (!expense) return;

  if (button.dataset.action === 'edit-expense') {
    expenseIdInput.value = expense._id;
    expenseCropSelect.value = expense.cropId;
    expenseCropSelect.disabled = true;
    expenseCategoryInput.value = expense.category;
    expenseDateInput.value = dateInputValue(expense.expenseDate);
    expenseDateInput.min = dateInputValue(expense.cropSowingDate) || '';
    expenseAmountInput.value = expense.amount;
    expenseNoteInput.value = expense.note || '';
    document.getElementById('expense-form-heading').textContent = 'Edit Expense';
    document.getElementById('expense-submit').textContent = 'Update Expense';
    document.getElementById('expense-cancel').hidden = false;
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    expenseCategoryInput.focus();
    return;
  }
  if (button.dataset.action === 'delete-expense') {
    if (!window.confirm(`Delete this ${expense.category.toLowerCase()} expense of ${currency(expense.amount)}?`)) return;
    try {
      const result = await request(`/expenses/${expense._id}`, { method: 'DELETE' });
      showMessage(result.message);
      await refreshData();
    } catch (error) { showMessage(error.message, 'error'); }
  }
});

incomeForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!incomeForm.reportValidity()) return;
  const saleIncome = Number(saleIncomeInput.value);
  if (!Number.isFinite(saleIncome) || saleIncome < 0 || saleIncome > 1000000000) return showMessage('Sale income must be a valid amount of 0 or more.', 'error');
  if (!completionCropId) return;
  try {
    const result = await request(`/crops/${completionCropId}/complete`, {
      method: 'PATCH', body: JSON.stringify({ saleIncome })
    });
    incomeDialog.close();
    completionCropId = null;
    showMessage(result.message || 'Crop season completed.');
    await refreshData();
  } catch (error) { showMessage(error.message, 'error'); }
});

function closeIncomeDialog() {
  incomeDialog.close();
  completionCropId = null;
  incomeForm.reset();
}
document.getElementById('income-close').addEventListener('click', closeIncomeDialog);
document.getElementById('income-cancel').addEventListener('click', closeIncomeDialog);
document.getElementById('crop-cancel').addEventListener('click', resetCropForm);
document.getElementById('expense-cancel').addEventListener('click', resetExpenseForm);
expenseFilter.addEventListener('change', renderExpenses);
expenseCropSelect.addEventListener('change', () => {
  const crop = crops.find((item) => item._id === expenseCropSelect.value);
  expenseDateInput.min = crop ? dateInputValue(crop.sowingDate) : '';
});
incomeDialog.addEventListener('click', (event) => {
  if (event.target === incomeDialog) closeIncomeDialog();
});

refreshData();
