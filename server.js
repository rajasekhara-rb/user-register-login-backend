// importing the required packages 
import express, { urlencoded } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mangoose from "mongoose";

// configuring the dotenv 
dotenv.config();
const mongoUrl = process.env.MONGO_URI;
// creating the instance of express 
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded());

const PORT = 5001;

// mongodb connection using mangoose 
const connetDB = async () => {
    try {
        await mangoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Mangodb database connected successfully")
    } catch (error) {
        console.log(error);
    }
}
connetDB()

// creating a mangoose schema for users 
const usersSchema = new mangoose.Schema({
    name: String,
    email: String,
    password: String
});

// creating a mangoose data model for users 
const User = new mangoose.model("user", usersSchema);

app.get("/", (req, res) => {
    res.send("Registratin and login backend");
});

// creating a route for the registration 
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
        res.send({ message: "user already exists" });
    } else {
        try {
            const userpost = new User({
                name: name,
                email: email,
                password: password
            })
            userpost.save()
            res.send({ message: "User registered successfully" });
        } catch (error) {
            res.status(400).send(error)
        }
    }

});

// creating a route for the login 

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const userlogin = await User.findOne({ email: email });
    // console.log(userlogin);
    try {
        if (userlogin) {
            if (password == userlogin.password) {
                res.status(200).send({ message: "User Login Successful", userlogin})
            } else {
                res.status(400).send({ message: "Incorrect Password" })
            }
        } else {
            res.status(400).send({ message: "Username does not exists." })
        }
    } catch (error) {
        console.log(error);
    }
});

app.get("/users", async (req, res) => {
    const result = await User.aggregate([{ $project: { _id: 1, password: 0 } }]);
    res.send(result);
})

app.listen(PORT, () => {
    console.log("App started on port " + PORT)
})

