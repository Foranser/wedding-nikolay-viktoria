/*
  Google Apps Script для формы свадебного сайта.
  Вариант v15: обычная HTML-форма отправляется в скрытый iframe.
  Apps Script читает стандартные поля формы через e.parameter/e.parameters.
*/

const SPREADSHEET_ID = '';
const SHEET_NAME = 'Ответы гостей';

function getSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('Не удалось открыть таблицу. Создайте Apps Script из Google Таблицы или укажите SPREADSHEET_ID.');
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  const headers = [
    'Дата ответа',
    'Имя основного гостя',
    'Присутствие',
    'Части мероприятия',
    'Количество дополнительных гостей',
    'Дополнительные гости',
    'Питание',
    'Комментарий'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function value_(data, fieldName) {
  return data && data[fieldName] ? data[fieldName] : '';
}

function values_(parameters, fieldName) {
  if (!parameters || !parameters[fieldName]) {
    return '';
  }

  return parameters[fieldName].join(', ');
}

function saveResponse_(e) {
  const sheet = getSheet_();

  const data = e && e.parameter ? e.parameter : {};
  const parameters = e && e.parameters ? e.parameters : {};

  const name = value_(data, 'name');
  const attendance = value_(data, 'attendance');
  const events = values_(parameters, 'events');
  const guestsCount = value_(data, 'guestsCount') || '0';
  const guests = value_(data, 'guests') || 'Без дополнительных гостей';
  const food = value_(data, 'food');
  const message = value_(data, 'message');
  const submittedAt = value_(data, 'submittedAt') || new Date();

  // Защита от пустых строк: если форма пришла без основных данных,
  // ничего не записываем в таблицу.
  if (!name && !attendance && !events && !food && !message && (!guests || guests === 'Без дополнительных гостей')) {
    return ContentService
      .createTextOutput('EMPTY_REQUEST_SKIPPED')
      .setMimeType(ContentService.MimeType.TEXT);
  }

  sheet.appendRow([
    submittedAt,
    name,
    attendance,
    events,
    guestsCount,
    guests,
    food,
    message
  ]);

  return ContentService
    .createTextOutput('SUCCESS')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    return saveResponse_(e);
  } catch (error) {
    return ContentService
      .createTextOutput('ERROR: ' + error.message)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('OK. Скрипт работает. Для записи данных отправьте форму с сайта.')
    .setMimeType(ContentService.MimeType.TEXT);
}
