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

const getAlllUsersFromDB = async () => {
    const result = await pool.query(`
            SELECT * FROM users
            `)

            return result;
}

const loginUserIntoDB = async (payload: {
    email: string;
    password: string;
}) => {

    const { email, password } = payload;

    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);

    if (userData.rows.length === 0) {
        throw new Error("Invalid Credentials!");
    }

    const user = userData.rows[0];
    delete user.password;

    // const matchPassword = await bcrypt.compare(password, user.password);
    // console.log(matchPassword)

    // if (!matchPassword) {
    //     throw new Error("Invalid Credentials!");
    // }

    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = jwt.sign(jwtpayload, config.secret as string, { expiresIn: "1d" });

    // const refreshToken = jwt.sign(jwtpayload, config.refresh_secret as string, { expiresIn: "10d" });

    return { accessToken, user };
}

export const authService = {
    usersCreateIntoDB,
    getAlllUsersFromDB,
    loginUserIntoDB
    // getSingleUserFromDB,
    // updateUserFromDB,
    // deleteUserFromDB
}