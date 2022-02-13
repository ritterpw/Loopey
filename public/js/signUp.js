/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const signUp = async (
  firstName,
  lastName,
  email,
  password,
  passwordConfirmed,
  role
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/users/signUp`,
      data: {
        firstName,
        lastName,
        email,
        password,
        passwordConfirmed,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
