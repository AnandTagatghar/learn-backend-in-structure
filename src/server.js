import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env"
});

connectDB().then(() => {
  console.log(`MONGODB connection success`);

  app.listen(process.env.PORT, () => {
    console.log(`Server listening at port: http://127.0.0.1:${process.env.PORT}`);
  })
}).catch(err => {
  console.error(`Error Connection to MONGODB`);
})