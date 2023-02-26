const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const port = 3000;


mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/docupDB", { useNewUrlParser: true }).then(console.log("connected to database!"));

const app = express();

app.set('view engine', 'ejs'); 



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const patientSchema = new mongoose.Schema({
    name : String,
    contact : Number,
    date: String,
    time: String,
    domain: String,
    symptoms : String
});

const Patient = mongoose.model("Patient",patientSchema );


// for doctors

doctorSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String,
    domain : String
})

const Doctor = mongoose.model("Doctor",doctorSchema);



app.get("/", (req, res) => {
  res.sendFile(__dirname+"/index.html");
})

app.get("/appointment",(req,res)=>{
      res.sendFile(__dirname+"/appointment.html");
})

app.post("/registerPatient", (req,res)=>{

    const patient = new Patient({
        name : req.body.name,
        contact : req.body.contact,
        date : req.body.date,
        time : req.body.time,
        domain : req.body.domain,
        symptoms : req.body.symptoms
    }) 

    patient.save().then(console.log("patient : "+req.body.name+" save."));

    // res.send("<h1>Thanks for registraition</h1>");
    res.render("afterFormSubmit",{patient : patient} );
})


// testing data fetch
app.get("/test", (req,res)=>{
    Patient.find({},(err,foundPatient)=>{
        if (!err) {
            res.render("test",{patients : foundPatient})
        };
    });

 
})


//for doctors

app.get("/signup",(req,res)=>{
    res.render("signup");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/signup",(req,res)=>{
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const doctor = new Doctor({
            name : req.body.name,
            email : req.body.email,
            password : hash,
            domain : req.body.domain
        })

        doctor.save();
    });
    

    res.redirect("/test");
})

app.post("/login",(req,res)=>{
    
    // const email = req.body.email;
    // const password = req.body.password;

    Doctor.findOne({email : req.body.email }, (err,foundDoctor)=>{
        if (!err) {
            if (foundDoctor) {
                bcrypt.compare( req.body.password, foundDoctor.password, function(err, result) {
                    if (result) {
                        console.log("user is present.");
                        res.redirect("/test");
                    }
                });
            }
            else{
                console.log("user not found");

            }
        }
        else{
            console.log("error to login")
            console.log(err);
        }
    });

    
});

app.post("/searchbydate",(req,res)=>{
    
    Patient.find({date: req.body.date},(err,foundPatient)=>{
        if (!err) {
            res.render("test",{patients : foundPatient})
        };
    });

})

// end for doctors

app.listen(port, function () {
  console.log("Server started on port 3000");
});