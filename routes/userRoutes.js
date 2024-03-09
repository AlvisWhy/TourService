const express = require('express');

const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgetPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updateMyPassword', authController.changePassword);

router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
