const mongoose= require('mongoose');

const leavesSchema= new mongoose.Schema({
    userID: {
        type:mongoose.Schema.Types.ObjectId ,
        ref: 'user', 
        // required: true
},
companyID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company', 
    // required: true
},
startDate: {
    type: Date,
    required: true,
},
endDate: {
    type: Date,
    required: true,
},
leaveType: {
    type: String,
    required: true,
    enum: ['sick', 'casual', 'paid'],
},
status:{
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
}
}, {timestamps:true});

module.exports = mongoose.model ('leave', leavesSchema);


