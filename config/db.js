const mongoose=require('mongoose');

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log('MONGO DB connected');
    }
    catch(err){
        console.error('Error connecting to Mongo DB: ',err.message);
        process.exit(1);
    }
}
module.exports=connectDB;