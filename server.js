const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express();

mongoose.connect('mongodb+srv://saqlainaly:w59rhThu4142wuAs@cluster0.nixfrcw.mongodb.net/Cluster0').then(res=>console.log("Mongo Connected")).catch(err=>console.log(err))
app.use(express.json());
app.use(cors())

const port = 80;

const patientSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    number:{
        type:String,
    },
    appointment_date:{
        type:String,
    },
    diagnosis:String,
    problem_specialist:String,
    is_approved:{
        type:Boolean,
        default:false,
    }
})

const Patient = mongoose.model('patient',patientSchema);

app.get('/', (req, res) => {
    res.send('hello world')
  })


app.post('/get-number',async (req,res)=>{
    try{
        console.log(req.body);
        const {name,number,appointment,user_problem,problem_specialist} = req.body.args;
        console.log(req.body?.args);
        const {to_number} = req.body?.call;
        const patient = new Patient({name:name||"",number:to_number||"",appointment_date:appointment||"",diagnosis:user_problem||"",problem_specialist:problem_specialist || ""});
        const patientCreated = await patient.save();
        if(patientCreated){
            res.status(200).json({message:"Appointment created successfully"});
        }else{
            res.status(400).json({message:"Some problem occurred"});
        }
}catch(err){
    res.status(500).json({error:"Internal Server Error"})
}
})

app.get('/get-appointments', async (req, res) => {
    try {
        const appointments = await Patient.find();
        res.json(appointments); // Sending appointments as JSON
    } catch (err) {
        console.error(err); // Log the error for debugging purposes
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/user-details', async (req, res) => {
    try {
        const {to_number} = req.body?.call;
        const latestAppointment = await Patient.findOne({number:to_number}).sort({_id:-1}).limit(1);
        if(latestAppointment){ 
        const isUpdate = await Patient.updateOne({_id:latestAppointment._id},{$set: {is_approved:true}});
        res.json({message:`User appointment is booked on ${latestAppointment?.appointment_date}`});
        }else{
            res.json({message:"No record found"});
        }
    } catch (err) {
        console.error(err); // Log the error for debugging purposes
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port,()=>{
    console.log(`Server is Listening on Port`);
   
})