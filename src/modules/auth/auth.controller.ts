import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { authService } from "./auth.service";

const createUser = async (req: Request, res: Response) => {
    console.log("controller",req.body);
    // const { name, email } = req.body;

    try {

        const result = await authService.usersCreateIntoDB(req.body);
        
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "User Created Successfully",
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

const getAllUsers = async (req: Request, res: Response) => {
    // console.log("controller", req.user)
    try {
        
        const result = await authService.getAlllUsersFromDB();

        res.status(201).json({
            success: true,
            message: "Users Retrieve Successfully",
            data: result.rows
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const loginUser = async (req: Request,res: Response) => {
    
    try {

        const result = await authService.loginUserIntoDB(req.body);
        console.log(result)

        const{ accessToken } = result;

        res.cookie("refreshToken", accessToken, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax'
        })

        res.status(201).json({
        success: true,
        message: "Profile login successfully",
        data: result
    })
        
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
        
    }
}

export const authController ={
    createUser,
    getAllUsers,
    loginUser
}