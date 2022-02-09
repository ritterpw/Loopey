/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { signUp } from './signUp';
import { producerSignUp } from './prodSignUp';

import { updateSettings } from './updateSettings';
import { subscribeToProducer } from './stripe';

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const subscribeBtn = document.getElementById('subscribe-to-producer');
const signupForm = document.querySelector('.form--signup');
const producerForm = document.querySelector('.form--producer');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmed = document.getElementById('password-confirm').value;

    signUp(firstName, lastName, email, password, passwordConfirmed);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('firstName', document.getElementById('firstName').value);
    form.append('email', document.getElementById('email').value);
    form.append('imageLink', document.getElementById('imageLink').files[0]);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirmed =
      document.getElementById('password-confirmed').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirmed },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirmed').value = '';
  });

if (subscribeBtn)
  subscribeBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { producerId } = e.target.dataset;
    subscribeToProducer(producerId);
  });

if (producerForm) {
  producerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const producerName = document.getElementById('producerName').value;
    const prodStyle = document.getElementById('prodStyle').value;
    const minSamplesPerPack =
      document.getElementById('minSamplesPerPack').value;
    const artistType = document.getElementById('artistType').value;
    const youtubeLink = document.getElementById('youtubeLink').value;
    const subscriptionName = document.getElementById('subscriptionName').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;

    producerSignUp(
      producerName,
      prodStyle,
      minSamplesPerPack,
      artistType,
      youtubeLink,
      subscriptionName,
      description,
      price
    );
  });
}
