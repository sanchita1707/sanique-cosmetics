const mongoose = require('mongoose');

const uri = "mongodb+srv://sanchita:U77sFrsCgBfLhPUA@cluster0.x3dwapj.mongodb.net/sanique-cosmetics?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
    .then(() => {
        console.log("✅ MongoDB Atlas Connected Successfully");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Connection Error:");
        console.error(err);
        process.exit(1);
    });