import bcrypt from "bcryptjs";
import jwt, { type JwtPayload } from "jsonwebtoken"
import { pool } from "../../db";
import type { IAuth } from "./auth.interface";
import config from "../../config";

const userSignupIntoDB = async (payload: IAuth) => {

    const { name, email, password, role } = payload;

    const hashPassword = await bcrypt.hash(password, 12);

    const result = await pool.query(`
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashPassword, role])

    // delete result.rows[0].password;

    if (!name || !email || !password) {
        throw new Error("All fields are required");
    }

    const validRoles = ["contributor", "maintainer"];

    if (role && !validRoles.includes(role)) {
        throw new Error("Invalid role");
    }

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
    

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
        throw new Error("Invalid Credentials!");
    }

    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    delete user.password;

    const token = jwt.sign(jwtpayload, config.secret as string, { expiresIn: "1d" });

    return { token, user };
}

export const authService = {
    userSignupIntoDB,
    loginUserIntoDB
}