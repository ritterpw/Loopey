/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
import { loadStripe } from '@stripe/stripe-js';

export const subscribeToProducer = async (producerId) => {
  // 1) Get checkout session from API
  const { data } = await axios(
    `/api/v1/subscriptions/checkout-session/${producerId}`,
    {
      'Content-type': 'application/json',
      Accept: 'application/json',
    }
  );

  const stripeSession = data.session.id;
  const stripe = await loadStripe(
    'pk_test_51KNkkAEN94GceQk7xMydvj4Z92ePfTeP833VEZZYJ4emL3bfHYulhPxlPjjhX2W6xpgzplbWh0AhhKBJ0o1O3HQA00Ye60XICc'
  );

  await stripe.redirectToCheckout({ sessionId: stripeSession });
};
