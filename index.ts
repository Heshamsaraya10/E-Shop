import express, { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config({ path: "config.env" });

import ApiError from "./utils/apiError";
import globalError from "./middlewares/errorMiddleware";
import dbConnect from "./databaseConfig/database";
import categoryRoute from "./routes/categoryRoute";
import subCategoryRoute from "./routes/subCategoryRoute";
import BrandRoute from "./routes/brandRoute";
import ProductRoute from "./routes/productRoute";
import UserRoute from "./routes/userRoute";
import AuthRoute from "./routes/authRoute";

//conncet with db
dbConnect();

//express app
const app = express();

//Middlewares
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}



//Mount Routes
app.use("/api/v1/categoris", categoryRoute);
app.use("/api/v1/subcategoris", subCategoryRoute);
app.use("/api/v1/brands", BrandRoute);
app.use("/api/v1/products", ProductRoute);
app.use("/api/v1/users", UserRoute);
app.use("/api/v1/auth", AuthRoute);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can’t find this route: ${req.originalUrl}`, 400));
});

//Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

//Handele rejection outside express
process.on("unhandledRejection", (err: Error) => {
  console.error(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down...`);
    process.exit(1);
  });
});
