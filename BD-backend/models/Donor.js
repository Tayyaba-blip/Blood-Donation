import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const donorSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  phone: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 6
  },

  address: String,
  age: Number,
  bloodGroup: String,
  district: String,
  state: String,
  pincode: String,

  agreedToTerms: Boolean,

  isVerified: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    default: "donor"
  }

}, { timestamps: true });

/* PASSWORD HASH */
donorSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});


/* 🔑 PASSWORD COMPARE METHOD */
donorSchema.methods.comparePassword = async function (enteredPassword) {

  return await bcrypt.compare(enteredPassword, this.password);

};


const Donor = mongoose.model("Donor", donorSchema);

export default Donor;