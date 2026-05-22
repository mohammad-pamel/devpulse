import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { pool } from "../../db";
import type { IAuth } from "./auth.interface";
import config from "../../config";

const usersCreateIntoDB = async (payload: IAuth) => {

    const {name, email, password, role} = payload;

    // const hashPassword = await bcrypt.hash(password_hash, 10);

    const result = await pool.query(`
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING *
        `, [name, email, password, role])

        // delete result.rows[0].password;

        console.log("service result",result);
        return result;
}



export const authService = {
    usersCreateIntoDB,
    getAlllUsersFromDB,
    loginUserIntoDB
    // getSingleUserFromDB,
    // updateUserFromDB,
    // deleteUserFromDB
}