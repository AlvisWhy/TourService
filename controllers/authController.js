const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('./../models/userModel');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRETE, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires:
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    date: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  try {
    const url = `${req.protocol}://${req.get('host')}/me`;
    const newUser = await User.create(req.body);
    await new Email(newUser, url).sendWelcome();

    createSendToken(newUser, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
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
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
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

    res.locals.user = freshUser;
    req.user = freshUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decode = jwt.verify(req.cookies.jwt, process.env.JWT_SECRETE);

      const freshUser = await User.findById(decode.id);
      if (!freshUser) {
        return next();
      }

      if (freshUser.changedPasswordAfter(decode.iat)) {
        return next();
      }

      res.locals.user = freshUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
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

    try {
      const resetURL = `${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/resetPassword/${resetToken}`;
      await new Email(user, resetURL).sendPasswordReset();
      res.status(200).json({
        status: 'success',
        message: 'Token sent successfully'
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      res.status(403).json({
        status: 'fail',
        message: err.message
      });
    }
  } catch (err) {
    res.status(403).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const decodeToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: decodeToken,
      passwordResetExpire: { $gt: Date.now() }
    });
    if (!user) {
      return next(new Error('The token us invalid'));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETE, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    res.status(403).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user.correctPassword(req.body.password, user.password)) {
      return next(new Error('The password is wrong'));
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRETE, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;
    await user.save();
    res.status(200).json({
      status: 'success',
      token
    });
  } catch (err) {
    res.status(403).json({
      status: 'fail',
      message: err.message
    });
  }
};
