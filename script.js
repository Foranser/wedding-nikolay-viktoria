// Вставьте сюда ссылку Google Apps Script после публикации веб-приложения.
// Пример: const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ВАШ_АДРЕС/exec';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmNgbpFc2aZhzPi9uHiGalT4lmlhqvAUM7lMdq_is5kSh2Ek1XJxWbtP3j_V_vWzO5_Q/exec';

const form = document.getElementById('rsvpForm');
const statusText = document.getElementById('formStatus');
const guestsContainer = document.getElementById('additionalGuests');
const addGuestBtn = document.getElementById('addGuestBtn');

const submittedAtField = document.getElementById('submittedAtField');
const guestsCountField = document.getElementById('guestsCountField');
const guestsField = document.getElementById('guestsField');

function updateGuestTitles() {
  const cards = guestsContainer.querySelectorAll('.guest-card');
  cards.forEach((card, index) => {
    const title = card.querySelector('.guest-card-title');
    if (title) {
      title.textContent = `Гость ${index + 1}`;
    }
  });
}

function createGuestCard() {
  const card = document.createElement('div');
  card.className = 'guest-card';

  card.innerHTML = `
    <div class="guest-card-title">Гость</div>

    <label>
      Имя гостя
      <input type="text" name="guestName" placeholder="Например: Анна Петрова" required>
    </label>

    <label>
      Кем приходится
      <select name="guestRelation" required>
        <option value="" disabled selected>Выберите вариант</option>
        <option>Муж</option>
        <option>Жена</option>
        <option>Ребёнок</option>
        <option>Сын</option>
        <option>Дочь</option>
        <option>Друг</option>
        <option>Подруга</option>
        <option>Родственник</option>
        <option>Другое</option>
      </select>
    </label>

    <button class="remove-guest-btn" type="button" aria-label="Удалить гостя">×</button>
  `;

  const removeBtn = card.querySelector('.remove-guest-btn');
  removeBtn.addEventListener('click', () => {
    card.remove();
    updateGuestTitles();
  });

  guestsContainer.appendChild(card);
  updateGuestTitles();
}

function prepareHiddenFields() {
  const formData = new FormData(form);

  const guestNames = formData.getAll('guestName');
  const guestRelations = formData.getAll('guestRelation');

  const guests = guestNames
    .map((name, index) => ({
      name: (name || '').trim(),
      relation: (guestRelations[index] || '').trim()
    }))
    .filter((guest) => guest.name || guest.relation);

  const guestsText = guests.length
    ? guests.map((guest, index) => `${index + 1}. ${guest.name} — ${guest.relation}`).join('; ')
    : 'Без дополнительных гостей';

  submittedAtField.value = new Date().toLocaleString('ru-RU');
  guestsCountField.value = String(guests.length);
  guestsField.value = guestsText;
}

addGuestBtn.addEventListener('click', createGuestCard);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!GOOGLE_SCRIPT_URL) {
    prepareHiddenFields();
    const testData = Object.fromEntries(new FormData(form).entries());
    testData.events = new FormData(form).getAll('events').join(', ');
    statusText.textContent = 'Форма пока работает в тестовом режиме. Нужно вставить ссылку Google Apps Script в script.js.';
    statusText.style.color = '#8d604e';
    console.log('Данные формы:', testData);
    return;
  }

  prepareHiddenFields();

  form.action = GOOGLE_SCRIPT_URL;
  form.method = 'POST';
  form.target = 'googleSheetFrame';

  statusText.textContent = 'Отправляем ответ...';
  statusText.style.color = '#7b6e66';

  // Обычная отправка формы в скрытый iframe.
  // Так Google Apps Script получает стандартные поля формы в e.parameter/e.parameters.
  HTMLFormElement.prototype.submit.call(form);

  setTimeout(() => {
    form.reset();
    guestsContainer.innerHTML = '';
    statusText.textContent = 'Спасибо! Ответ отправлен.';
    statusText.style.color = '#4f7b56';
  }, 1200);
});
