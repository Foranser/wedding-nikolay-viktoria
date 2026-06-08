// Вставьте сюда ссылку Google Apps Script после публикации веб-приложения.
// Пример: const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ВАШ_АДРЕС/exec';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmNgbpFc2aZhzPi9uHiGalT4lmlhqvAUM7lMdq_is5kSh2Ek1XJxWbtP3j_V_vWzO5_Q/exec';


const form = document.getElementById('rsvpForm');
const statusText = document.getElementById('formStatus');
const guestsContainer = document.getElementById('additionalGuests');
const addGuestBtn = document.getElementById('addGuestBtn');

function updateGuestTitles() {
  const cards = guestsContainer.querySelectorAll('.guest-card');

  cards.forEach((card, index) => {
    const title = card.querySelector('.guest-card-title');

    if (title) {
      title.textContent = Гость ${index + 1};
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

function collectFormData() {
  const formData = new FormData(form);

  const selectedEvents = formData.getAll('events').join(', ');

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

  return {
    submittedAt: new Date().toLocaleString('ru-RU'),
    name: formData.get('name') || '',
    attendance: formData.get('attendance') || '',
    events: selectedEvents || '',
    guestsCount: String(guests.length),
    guests: guestsText,
    food: formData.get('food') || '',
    message: formData.get('message') || ''
  };
}

function sendToGoogleSheet(data) {
  const params = new URLSearchParams();

  Object.entries(data).forEach(([key, value]) => {
    params.append(key, value);
  });

  const requestUrl = ${GOOGLE_SCRIPT_URL}?${params.toString()};

  let iframe = document.getElementById('googleSheetFrame');

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = 'googleSheetFrame';
    iframe.id = 'googleSheetFrame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  iframe.src = requestUrl;
}

addGuestBtn.addEventListener('click', createGuestCard);

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('СЮДА_ВСТАВЬ')) {
    statusText.textContent = 'Не вставлена ссылка Google Apps Script в script.js.';
    statusText.style.color = '#9b3f35';
    return;
  }

  const data = collectFormData();

  if (!data.name || !data.attendance) {
    statusText.textContent = 'Заполните имя и выберите, сможете ли присутствовать.';
    statusText.style.color = '#9b3f35';
    return;
  }

  statusText.textContent = 'Отправляем ответ...';
  statusText.style.color = '#7b6e66';

  sendToGoogleSheet(data);

  setTimeout(() => {
    form.reset();
    guestsContainer.innerHTML = '';
    statusText.textContent = 'Спасибо! Ответ отправлен.';
    statusText.style.color = '#4f7b56';
  }, 1500);
});
});
