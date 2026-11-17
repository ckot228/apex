'use strict';

// No backend, analytics, cookies, localStorage or personal-data transmission.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('is-open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.header')) closeMenu();
});
window.matchMedia('(min-width: 651px)').addEventListener('change', () => closeMenu());

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.06 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

// Service links retain normal anchor navigation and progressively enhance selection.
const serviceSelect = document.querySelector('#service');
document.querySelectorAll('[data-service]').forEach((link) => {
  link.addEventListener('click', () => {
    serviceSelect.value = link.dataset.service;
    validateField(serviceSelect);
    document.querySelector('#form-status').replaceChildren();
  });
});

const form = document.querySelector('#request-form');
const fields = [...form.querySelectorAll('input, select')];
const status = document.querySelector('#form-status');
function fieldError(field) {
  const value = field.value.trim();
  if (!value) return field.id === 'service' ? 'Выберите услугу.' : 'Заполните это поле.';
  if (field.id === 'name' && value.length < 2) return 'Укажите имя: не менее двух символов.';
  if (field.id === 'phone') {
    const digits = value.replace(/\D/g, '');
    if (!/^[+\d\s()\-]+$/.test(value) || digits.length < 10 || digits.length > 15) return 'Укажите телефон: от 10 до 15 цифр.';
  }
  if (field.id === 'car' && value.length < 2) return 'Укажите марку автомобиля.';
  return '';
}
function validateField(field) {
  const message = fieldError(field);
  document.querySelector(`#${field.id}-error`).textContent = message;
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return !message;
}
fields.forEach((field) => {
  field.addEventListener('blur', () => { if (field.value || field.hasAttribute('aria-invalid')) validateField(field); });
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    if (status.hasChildNodes()) status.replaceChildren();
  });
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.replaceChildren();
  const validity = fields.map(validateField);
  if (validity.includes(false)) {
    fields[validity.indexOf(false)].focus();
    return;
  }
  // Deliberately do not construct a payload or use any network API.
  const title = document.createElement('strong');
  title.textContent = 'Демонстрация завершена';
  const description = document.createElement('p');
  description.textContent = 'Форма заполнена верно. Заявка не отправлена, данные не сохранены. Обратного звонка не будет.';
  form.reset();
  fields.forEach((field) => field.removeAttribute('aria-invalid'));
  status.append(title, description);
  status.focus();
});
// Keep submission unavailable if JavaScript cannot initialize.
form.querySelector('button[type="submit"]').disabled = false;

const gallery = [...document.querySelectorAll('[data-photo]')];
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
let currentPhoto = 0;
let galleryTrigger;
function renderPhoto() {
  const item = gallery[currentPhoto];
  const size = item.dataset.photo === 'hero' ? 1800 : 1200;
  lightboxImage.src = `./assets/${item.dataset.photo}-${size}.jpg`;
  lightboxImage.alt = item.querySelector('img').alt;
  document.querySelector('#lightbox-caption').textContent = item.dataset.caption;
  document.querySelector('#lightbox-count').textContent = `${currentPhoto + 1} / ${gallery.length}`;
}
gallery.forEach((item, index) => item.addEventListener('click', () => {
  galleryTrigger = item;
  currentPhoto = index;
  renderPhoto();
  lightbox.showModal();
  document.body.classList.add('modal-open');
}));
document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
document.querySelector('.lightbox-prev').addEventListener('click', () => { currentPhoto = (currentPhoto - 1 + gallery.length) % gallery.length; renderPhoto(); });
document.querySelector('.lightbox-next').addEventListener('click', () => { currentPhoto = (currentPhoto + 1) % gallery.length; renderPhoto(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    currentPhoto = (currentPhoto + (event.key === 'ArrowRight' ? 1 : -1) + gallery.length) % gallery.length;
    renderPhoto();
  }
});
lightbox.addEventListener('click', (event) => {
  if (event.target !== lightbox) return;
  const bounds = lightbox.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) lightbox.close();
});
lightbox.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  galleryTrigger?.focus({ preventScroll: true });
});
document.querySelector('#year').textContent = new Date().getFullYear();
