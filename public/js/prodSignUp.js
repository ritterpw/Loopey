/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const producerSignUp = async (
  producerName,
  prodStyle,
  minSamplesPerPack,
  artistType,
  subscriptionName,
  description,
  price
) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/producers/signUp`,
      data: {
        producerName,
        prodStyle,
        minSamplesPerPack,
        artistType,
        subscriptionName,
        description,
        price,
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
