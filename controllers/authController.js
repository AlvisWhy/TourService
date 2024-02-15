const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRETE, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: newUser
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: err
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new Error('Provide email and the password'));
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new Error('Incorrect email or password'));
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETE, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return next(new Error('please log in to get access!'));
    }

    const decode = jwt.verify(token, process.env.JWT_SECRETE);

    const freshUser = await User.findById(decode.id);
    if (!freshUser) {
      return next(new Error('The user is no longer exist'));
    }

    if (freshUser.changedPasswordAfter(decode.iat)) {
      return next(new Error('The password has beeen changed'));
    }

    req.user = freshUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return next(new Error('You do not have the right to do this'));
      }
      next();
    } catch (err) {
      res.status(403).json({
        status: 'fail',
        message: err.message
      });
    }
  };
};

exports.forgetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new Error('No such user'));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status: 'success',
      message: user
    });
  } catch (err) {
    res.status(403).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.resetPassword = (req, res, next) => {};
