const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    // ✅ ADD THESE OTP FIELDS
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpRequest: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password and OTP data from JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpAttempts;
  delete user.lastOtpRequest;
  return user;
};

module.exports = mongoose.model("User", userSchema);