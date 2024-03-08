/* eslint-disable */
import '@babel/polyfill';
import { login } from './login';
import { displayMap } from './mapbox';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    e.preventDefault();
    login(email, password);
  });
}
