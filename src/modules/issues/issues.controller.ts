import type { Request, Response } from "express";
import sendResponse from "../../utility/sendResponse";
import { issuesService } from "./issues.service";

const createIssues = async (req: Request, res: Response) => {
    console.log("issues controller", req.body);
    // const { name, email } = req.body;

    try {
        console.log("controller hit", req.body)

        const payload = {
            ...req.body,
            reporter_id: req.user?.id,
        };

        const result = await issuesService.issuesCreateIntoDB(payload);

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

const getAllIssues = async (req: Request, res: Response) => {
     try {
            const userId = req.user?.id;
            const result = await issuesService.getAlllIssuessFromDB(userId);

            console.log("result from controller",result)
    
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

export const issuesController = {
    createIssues,
    getAllIssues
}