const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLScMWSrPMhKu6U-8deYs5rPoZ8znSk9GVCUBRDHbOXw4sMOaEA/formResponse';

const FORM_FIELDS = {
  submittedAt: 'entry.364088573',
  name: 'entry.1471927501',
  attendance: 'entry.729155505',
  events: 'entry.1891984378',
  guestsCount: 'entry.1819079521',
  guests: 'entry.480183133',
  food: 'entry.1771740903',
  message: 'entry.112683149'
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('rsvpForm');
  const statusText = document.getElementById('formStatus');
  const guestsContainer = document.getElementById('additionalGuests');
  const addGuestBtn = document.getElementById('addGuestBtn');

  if (!form || !statusText || !guestsContainer || !addGuestBtn) {
    console.error('Не найдены элементы формы.');
    return;
  }

  function getOrCreateIframe() {
    let iframe = document.getElementById('googleFormFrame');

    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.name = 'googleFormFrame';
      iframe.id = 'googleFormFrame';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    return iframe;
  }

  function createHiddenGoogleForm() {
    let googleForm = document.getElementById('hiddenGoogleForm');

    if (googleForm) {
      googleForm.remove();
    }

    googleForm = document.createElement('form');
    googleForm.id = 'hiddenGoogleForm';
    googleForm.action = GOOGLE_FORM_ACTION_URL;
    googleForm.method = 'POST';
    googleForm.target = 'googleFormFrame';
    googleForm.style.display = 'none';

    document.body.appendChild(googleForm);

    return googleForm;
  }

  function addHiddenField(targetForm, name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value || '';
    targetForm.appendChild(input);
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

  function collectEventsText() {
    const checkedEvents = Array.from(form.querySelectorAll('input[name="events"]:checked'));

    return checkedEvents
      .map((checkbox) => checkbox.value)
      .join(', ');
  }

  function collectAdditionalGuests() {
    const guestNames = Array.from(form.querySelectorAll('input[name="guestName"]'));
    const guestRelations = Array.from(form.querySelectorAll('select[name="guestRelation"]'));

    const guests = guestNames
      .map((input, index) => {
        const name = input.value.trim();
        const relation = guestRelations[index] ? guestRelations[index].value.trim() : '';

        return {
          name,
          relation
        };
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

  function collectFormData() {
    const formData = new FormData(form);
    const guestsInfo = collectAdditionalGuests();

    return {
      submittedAt: new Date().toLocaleString('ru-RU'),
      name: formData.get('name') || '',
      attendance: formData.get('attendance') || '',
      events: collectEventsText(),
      guestsCount: String(guestsInfo.count),
      guests: guestsInfo.text,
      food: formData.get('food') || '',
      message: formData.get('message') || ''
    };
  }

  addGuestBtn.addEventListener('click', () => {
    createGuestCard();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = collectFormData();

    getOrCreateIframe();

    const googleForm = createHiddenGoogleForm();

    addHiddenField(googleForm, FORM_FIELDS.submittedAt, data.submittedAt);
    addHiddenField(googleForm, FORM_FIELDS.name, data.name);
    addHiddenField(googleForm, FORM_FIELDS.attendance, data.attendance);
    addHiddenField(googleForm, FORM_FIELDS.events, data.events);
    addHiddenField(googleForm, FORM_FIELDS.guestsCount, data.guestsCount);
    addHiddenField(googleForm, FORM_FIELDS.guests, data.guests);
    addHiddenField(googleForm, FORM_FIELDS.food, data.food);
    addHiddenField(googleForm, FORM_FIELDS.message, data.message);

    statusText.textContent = 'Отправляем ответ...';
    statusText.style.color = '#7b6e66';

    HTMLFormElement.prototype.submit.call(googleForm);

    setTimeout(() => {
      form.reset();
      guestsContainer.innerHTML = '';
      statusText.textContent = 'Спасибо! Ваш ответ отправлен.';
      statusText.style.color = '#4f7b56';
    }, 1500);
  });
});
