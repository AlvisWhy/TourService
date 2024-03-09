const express = require('express');
const authController = require('../controllers/authController');

const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);

router.get('/tours/:slug', viewsController.getTour);

router.get('/login', viewsController.getLoginForm);

module.exports = router;
