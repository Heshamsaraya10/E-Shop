import mongoose, { Connection } from "mongoose";

export const dbConnect = async () => {
  const conn = await mongoose.connect(process.env.DB_URI as string);
  console.log(`Database Connected:  ${conn.connection.host}`);
};

export default dbConnect;
