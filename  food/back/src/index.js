
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const port = 8000;
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://amynga80_db_user:qkgYYzHFUqkOuwzr@cluster0.76rfmru.mongodb.net/").then(() => console.log ("Connected"));
app.listen(port,() => {
    console.log(`Server is running on http://localhost:${port}`)
});
