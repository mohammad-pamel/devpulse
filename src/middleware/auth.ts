// import type { NextFunction, Request, Response } from "express";
// import type { Roles } from "../types";
// import  jwt, { type JwtPayload } from 'jsonwebtoken';
// import config from "../config";
// import { pool } from "../db";

// const auth = (...roles: Roles[]) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         // console.log(roles);
//         try {
//             const token = req.headers.authorization;

//             if (!token) {
//                 res.status(401).json({
//                     success: false,
//                     message: "Unauthorized Access!!!"
//                 })
//             }

//             const decoded = jwt.verify(token as string, config.secret as string) as JwtPayload

//             const userData = await pool.query(`
//             SELECT * FROM users WHERE email=$1
//             `, [decoded.email])

//             const user = userData.rows[0];
//             // console.log(user)

//             if (userData.rows.length === 0) {
//                 res.status(404).json({
//                     success: false,
//                     message: "User not found!!!"
//                 })
//             }

//             if (!user.is_activate) {
//                 res.status(403).json({
//                     success: false,
//                     message: "Forbidden!!!"
//                 })
//             }

//             // console.log("auth: ", user.role)

//             if (roles.length && !roles.includes(user.role)) {
//                 res.status(403).json({
//                     success: false,
//                     message: "Forbidden!!!"
//                 })
//             }

//             req.user = decoded;
//             next();
//         } catch (error) {
//             next(error)
//         }
//     }
// }

// export default auth;

import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new Error("Unauthorized");
      }

      const decoded = jwt.verify(token, config.secret as string) as JwtPayload;

      req.user = decoded;

      console.log("decoded",decoded)

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;