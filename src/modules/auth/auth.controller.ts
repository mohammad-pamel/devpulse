import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
    console.log("controller", req.body);
    // const { name, email } = req.body;

    try {

        const result = await authService.usersCreateIntoDB(req.body);

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User Registered Successfully",
            data: result.rows[0],
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}


const loginUser = async (req: Request, res: Response) => {

    try {

        const result = await authService.loginUserIntoDB(req.body);

        const { token } = result;

        res.cookie("token", token, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax'
        })

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data: result
        })

    } catch (error: any) {

        sendResponse(res, {
            statusCode: 500,
             success: false,
            message: error.message,
            error: error
        })

    }
}

export const authController = {
    createUser,
    loginUser
}