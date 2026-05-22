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
            message: "Issue Created Successfully",
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

    try {

        const { id } = req.params;

        console.log(id)
        const result = await issuesService.getSingleIssuesFromDB(id as string);

        if (!result) {
            return sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "Issue not found",
                data: {}
            })
        }

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "User Retrieve Successfully",
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

const updateIssues = async (req: Request, res: Response) => {
    
    try {
        const { id } = req.params;

        const issuesResult = await issuesService.getSingleIssuesFromDB(id as string)


        if (!issuesResult) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
                data: {}
            })
        }

        const user = req.user;

        if(user?.role === "maintainer"){
            if(issuesResult?.reporter.id !== user?.id){
                return sendResponse(res, {
                    statusCode: 403,
                    success: false,
                    message: "Forbidden Access",
                    data: {}
                });
            }

            if(issuesResult?.status !== "open"){
                return sendResponse(res, {
                    statusCode: 409,
                    success: false,
                    message: "Issue already in progress/resolved",
                    data: {}
                });
            }

        }
        
        const result = await issuesService.updateIssuesFromDB(req.body, id as string)
        

        // console.log(result);
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Issue Updated Successfully",
            data: result.rows[0]
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

const deleteIssues = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {

        const result = await issuesService.deleteIssuesFromDB(id as string)

        if (result.rowCount === 0) {
            sendResponse(res, {
                statusCode: 404,
                success: false,
                message: "User not found",
                data: {}
            })

        }

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Issue Deleted Successfully",
            data: {}
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

export const issuesController = {
    createIssues,
    getAllIssues,
    getSingleIssues,
    updateIssues,
    deleteIssues
}