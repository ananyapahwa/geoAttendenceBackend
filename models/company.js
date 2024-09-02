const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
companyName:{
    type:String,
    required:true
},
email:{
    type:String,
    required:true,
    unique:true
},
password: {
    type: String, 
    required: true
  },
  pin:{
    type: Number,
    required:false
  },
  emailVerified:{
    type:Boolean,
    required:false,
    default:false
  },
  contactNumber:{
    type: String,
    required:true,
    unique:true
  }
},{
timestamps:true
});

module.exports = mongoose.model('Company', companySchema);
