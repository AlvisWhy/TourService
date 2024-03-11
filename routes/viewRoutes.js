const express = require('express');
const authController = require('../controllers/authController');

const bookingController = require('../controllers/bookingController');

const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);
router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours
);

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.use(authController.isLoggedIn);
router.get('/tours/:slug', viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
