const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userScheme = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell the name'],
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true],
    validate: [validator.isEmail, 'Please input valid email']
  },
  photo: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true],
    minlength: 6,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true],
    validate: {
      validator: function(val) {
        return this.password === val;
      },
      message: 'The passwordConfirm must equals the password'
    }
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date
});

userScheme.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userScheme.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userScheme.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userScheme.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('user', userScheme);

module.exports = User;
