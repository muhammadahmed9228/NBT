import connectDB from "./src/config/db.js";
import { app } from "./src/app.js";

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`⚙️ Server is running at port : ${PORT}`);
});

connectDB().catch((err) => {
    console.log("MongoDB connection failed !!! ", err);
});