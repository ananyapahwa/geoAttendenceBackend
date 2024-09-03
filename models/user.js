const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company', 
      required: true
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

module.exports=mongoose.model('User',userSchema)
