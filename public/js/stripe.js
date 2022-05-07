
import axios from 'axios';
import { showAlert } from './alerts';



export const bookTour = async tourId => {
    try {
        //^ 1) Get checkout session from API
        const session = await axios(
          `/api/v1/bookings/checkout-session/${tourId}`
        );
        const url =session.data.session.url;
        location.href = url;
        //^ 2) Create checkout form + chanre credit card
        // await stripe.redirectToCheckout({
        //   sessionId: session.data.session.id
        // });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
      }

};
