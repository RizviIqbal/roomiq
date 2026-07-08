const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const compatibilityProfileSchema = new mongoose.Schema({
  sleepSchedule:     { type: String, enum: ["early_bird", "night_owl", "flexible"] },
  cleanlinessLevel:  { type: Number, min: 1, max: 5 }, // 1=very messy, 5=very clean
  guestPolicy:       { type: String, enum: ["never", "rarely", "sometimes", "often"] },
  noiseTolerance:    { type: String, enum: ["silent", "low", "moderate", "high"] },
  smokingPolicy:     { type: String, enum: ["no_smoking", "outside_only", "anywhere"] },
  petPolicy:         { type: String, enum: ["no_pets", "small_pets", "any_pets"] },
  studyHabits:       { type: String, enum: ["at_home", "library", "mixed"] },
  foodSharing:       { type: Boolean, default: false },
  completedAt:       { type: Date }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false
  },
  avatar: {
    type: String,
    default: ""
  },
  phone: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    maxlength: 300,
    default: ""
  },
  occupation: {
    type: String,
    maxlength: 100,
    default: ""
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", ""],
    default: ""
  },
  budgetMax: {
    type: Number,
    default: null
  },
  bkashNumber: {
    type: String,
    default: ""
  },
  currentHouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    default: null
  },
  compatibilityProfile: {
    type: compatibilityProfileSchema,
    default: {}
  },
  knowledgeScore: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
