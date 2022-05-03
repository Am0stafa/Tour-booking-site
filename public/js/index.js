//!this is our entry file and here get data from the user interface and then we delegate actions to some fuctions coming form these other modules that we made in the same folder

import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';


//* DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

//* DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}
  
if (loginForm)
  loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
if (logOutBtn) logOutBtn.addEventListener('click', logout);
