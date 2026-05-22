import type { NextFunction, Request, Response } from "express";
import type { Roles } from "../types";
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from "../config";
import { pool } from "../db";
import sendResponse from "../utility/sendResponse";

const auth = (...roles: Roles[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log("roles auth.ts", roles);
    try {
      const token = req.headers.authorization;

      if (!token) {
        return sendResponse(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!!!"
        })
      }

      const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload

      const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email])

      const user = userData.rows[0];

      if (userData.rows.length === 0) {
        return sendResponse(res, {
          statusCode: 404,
          success: false,
          message: "User not found!!!"
        })
      }

      if (roles.length && !roles.includes(user.role as Roles)) {
        return sendResponse(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!!!"
        })
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error)
    }
  }
}

export default auth;
