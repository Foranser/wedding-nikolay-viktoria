// Вставьте сюда ссылку Google Apps Script после публикации веб-приложения.
// Пример: const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ВАШ_АДРЕС/exec';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmNgbpFc2aZhzPi9uHiGalT4lmlhqvAUM7lMdq_is5kSh2Ek1XJxWbtP3j_V_vWzO5_Q/exec';
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ТВОЯ_ССЫЛКА/exec';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvpForm');
  const statusText = document.getElementById('formStatus');
  const guestsContainer = document.getElementById('additionalGuests');
  const addGuestBtn = document.getElementById('addGuestBtn');

  if (!form || !statusText || !guestsContainer || !addGuestBtn) {
    console.error('Не найдены элементы формы.');
    return;
  }

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

  function createSubmissionId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function collectAdditionalGuests() {
    const guestNames = Array.from(form.querySelectorAll('input[name="guestName"]'));
    const guestRelations = Array.from(form.querySelectorAll('select[name="guestRelation"]'));

    const guests = guestNames
      .map((input, index) => {
        const name = input.value.trim();
        const relation = guestRelations[index] ? guestRelations[index].value.trim() : '';

        return { name, relation };
      })
      .filter((guest) => guest.name || guest.relation);

    if (guests.length === 0) {
      return {
        count: 0,
        text: 'Без дополнительных гостей'
      };
    }

    return {
      count: guests.length,
      text: guests
        .map((guest, index) => `${index + 1}. ${guest.name} — ${guest.relation}`)
        .join('; ')
    };
  }

  function collectEventsText() {
    const checkedEvents = Array.from(form.querySelectorAll('input[name="events"]:checked'));

    return checkedEvents
      .map((checkbox) => checkbox.value)
      .join(', ');
  }

  function collectFormData() {
    const formData = new FormData(form);
    const guestsInfo = collectAdditionalGuests();

    return {
      submissionId: createSubmissionId(),
      submittedAt: new Date().toLocaleString('ru-RU'),
      name: formData.get('name') || '',
      attendance: formData.get('attendance') || '',
      events: collectEventsText(),
      guestsCount: String(guestsInfo.count),
      guests: guestsInfo.text,
      food: formData.get('food') || '',
      message: formData.get('message') || '',
      source: 'site'
    };
  }

  function validateForm() {
    const nameInput = form.querySelector('input[name="name"]');
    const attendanceSelect = form.querySelector('select[name="attendance"]');

    if (!nameInput || !nameInput.value.trim()) {
      statusText.textContent = 'Пожалуйста, укажите ваше имя и фамилию.';
      statusText.style.color = '#9b3f35';
      return false;
    }

    if (!attendanceSelect || !attendanceSelect.value) {
      statusText.textContent = 'Пожалуйста, выберите, сможете ли вы присутствовать.';
      statusText.style.color = '#9b3f35';
      return false;
    }

    const guestCards = guestsContainer.querySelectorAll('.guest-card');

    for (const card of guestCards) {
      const guestName = card.querySelector('input[name="guestName"]');
      const guestRelation = card.querySelector('select[name="guestRelation"]');

      if (!guestName.value.trim() || !guestRelation.value) {
        statusText.textContent = 'Заполните имя и кем приходится каждый добавленный гость.';
        statusText.style.color = '#9b3f35';
        return false;
      }
    }

    return true;
  }

  function sendByFetch(data) {
    const payload = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      payload.append(key, value);
    });

    return fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: payload
    });
  }

  function sendByImageFallback(data) {
    const params = new URLSearchParams();

    Object.entries(data).forEach(([key, value]) => {
      params.append(key, value);
    });

    const img = new Image();
    img.style.display = 'none';
    img.src = `${GOOGLE_SCRIPT_URL}?${params.toString()}`;

    document.body.appendChild(img);

    setTimeout(() => {
      img.remove();
    }, 5000);
  }

  addGuestBtn.addEventListener('click', () => {
    createGuestCard();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('ТВОЯ_ССЫЛКА')) {
      statusText.textContent = 'Не вставлена ссылка Google Apps Script в script.js.';
      statusText.style.color = '#9b3f35';
      return;
    }

    if (!validateForm()) {
      return;
    }

    const data = collectFormData();

    statusText.textContent = 'Отправляем ответ...';
    statusText.style.color = '#7b6e66';

    try {
      sendByImageFallback(data);
      await sendByFetch(data);

      setTimeout(() => {
        form.reset();
        guestsContainer.innerHTML = '';
        statusText.textContent = 'Спасибо! Ваш ответ отправлен.';
        statusText.style.color = '#4f7b56';
      }, 1200);
    } catch (error) {
      sendByImageFallback(data);

      setTimeout(() => {
        form.reset();
        guestsContainer.innerHTML = '';
        statusText.textContent = 'Спасибо! Ваш ответ отправлен.';
        statusText.style.color = '#4f7b56';
      }, 1500);
    }
  });
});
