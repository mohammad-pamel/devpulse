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

// const getAllIssues = async (req: Request, res: Response) => {
//      try {
//             const userId = req.user?.id;
//             const result = await issuesService.getAlllIssuessFromDB(userId);

//             console.log("result from controller",result)
    
//             res.status(201).json({
//                 success: true,
//                 message: "Users Retrieve Successfully",
//                 data: result.rows
//             })
//         } catch (error: any) {
//             res.status(500).json({
//                 success: false,
//                 message: error.message,
//                 error: error
//             })
//         }
// }


//Challeng part
const getAllIssues = async (req: Request, res: Response) => {
    try {
        const { sort = "newest", type, status } = req.query;

        const result = await issuesService.getAllIssuesFromDB({
            sort: sort as string,
            type: type as string,
            status: status as string,
        });

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issues fetched successfully",
            data: result,
        });

    } catch (error: any) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
        });
    }
};

const getSingleIssues = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
       
        const result = await issuesService.getSingleIssuesFromDB(id as string);

        console.log("issues controller",result);

        if (!result) {
            res.status(404).json({
                success: false,
                message: "User not found",
                data: {}
            })
        }

        res.status(201).json({
            success: true,
            message: "User Retrieve Successfully",
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

export const issuesController = {
    createIssues,
    getAllIssues,
    getSingleIssues
}