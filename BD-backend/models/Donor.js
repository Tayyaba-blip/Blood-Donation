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
  province: String,
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
  },

   // ── NEW: Link to organization ──────────────────────────────────────────
    // The 6-char code the donor enters to join an org
    organizationCode: { type: String, default: null },
    // The resolved Organization _id (set automatically when code is entered)
    linkedOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      default: null,
    },
    
  // ── Donation fields ──
lastDonationDate: { type: String },
donationHistory: [
  {
    date: { type: String },
    units: { type: Number },
    location: { type: String },
  }
],

// ── Health fields ──
healthIssues:       { type: String, default: "None" },
currentMedications: { type: String, default: "None" },
recentSurgery:      { type: String, enum: ["Yes", "No"], default: "No" },
smoker:             { type: String, enum: ["Yes", "No"], default: "No" },
alcoholic:          { type: String, enum: ["Yes", "No"], default: "No" },
allergies:          { type: String, default: "None" },

}, 

{ timestamps: true });

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
// Virtual: is the donor eligible today?
donorSchema.virtual("isEligible").get(function () {
  if (!this.lastDonationDate) return true;
  const last = new Date(this.lastDonationDate);
  const today = new Date();
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  return diff >= 90;
});
 
// Virtual: days until next eligible donation
donorSchema.virtual("daysUntilEligible").get(function () {
  if (!this.lastDonationDate) return 0;
  const last = new Date(this.lastDonationDate);
  const today = new Date();
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  return diff >= 90 ? 0 : 90 - diff;
});
 
donorSchema.set("toJSON", { virtuals: true });

const Donor = mongoose.model("Donor", donorSchema);

export default Donor;