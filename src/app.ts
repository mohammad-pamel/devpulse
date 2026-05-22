import express, { type Application, type Request, type Response } from "express"
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
// import config from "./config";
// import { userRoute } from "./modules/users/users.route";
// import { profileRoute } from "./modules/profile/profile.route";
// import { authRoute } from "./modules/auth/auth.route";
// import logger from "./middleware/logger";
// import CookieParser from "cookie-parser";
// import cors from "cors";
// import globalErrorHandler from "./middleware/globalErrorHandler";


const app: Application = express()

app.use(express.json());
// app.use(CookieParser());
// app.use(cors({
//   origin: 'http://localhost:3000'
// }));

// app.use(logger)


app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "Express Serveer",
        "author": "Next Level"
    })
})

app.use('/api/auth', authRoute)

app.use('/api/issues', issuesRoute)

// app.use('/api/auth', authRoute)

// // Global Error Handling Middleware
// app.use(globalErrorHandler);


export default app;