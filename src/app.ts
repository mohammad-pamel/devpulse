import express, { type Application, type Request, type Response } from "express"
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";
import cors from "cors";
import globalErrorHandler from "./middleware/globalErrorHandler";


const app: Application = express()

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));



app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "message": "DevPulse",
        "author": "Mohammad Pamel"
    })
})

app.use('/api/auth', authRoute)

app.use('/api/issues', issuesRoute)


// Global Error Handling Middleware
app.use(globalErrorHandler);


export default app;