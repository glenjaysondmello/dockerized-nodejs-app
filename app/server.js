const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
let cors = require('cors');

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const mongoUrl = "mongodb://admin:password@mongodb:27017";
// const mongoUrl = "mongodb://admin:password@localhost:27017";

const databaseName = "user-account";
let db;

MongoClient.connect(mongoUrl)
    .then(client => {
        console.log("Connected to Database");
        db = client.db(databaseName);
    })
    .catch(err => {
        console.error("Database connection error:", err);
        process.exit(1);
    });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get('/profile-picture', (req, res) => {
    const imagePath = path.join(__dirname, "images/profile.jpg");
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        res.status(404).send("Image not found");
    }
});

app.post('/update-profile', async (req, res) => {
    try {
        const userObj = { ...req.body, userid: 1 };

        const result = await db.collection("users").updateOne(
            { userid: 1 },
            { $set: userObj },
            { upsert: true }
        );

        if (result.modifiedCount > 0 || result.upsertedCount > 0) {
            res.json(userObj);
            console.log("Profile updated successfully");
            
        } else {
            res.status(400).json({ message: "No updates were made" });
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/get-profile', async (req, res) => {
    try {
        const user = await db.collection("users").findOne({ userid: 1 });

        if (user) {
            res.json(user);
        } else {
            res.json({
                name: "Anna Smith",
                email: "anna.smith@example.com",
                interests: "coding"
            });
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.listen(4000, () => {
    console.log("Server listening on port 4000!");
});
