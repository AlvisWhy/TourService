/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    const session = await axios({
      url: `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`,
    });
    console.log(session);
    window.location.href = session.data.session.url;
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};