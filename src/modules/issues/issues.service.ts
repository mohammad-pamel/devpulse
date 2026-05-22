import { pool } from "../../db";
import type { IIssues } from "./issues.interface";

const issuesCreateIntoDB = async (payload: IIssues) => {

    const { title, description, type, status, reporter_id } = payload;

    const user = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [reporter_id])

    if (user.rows.length === 0) {
        throw new Error("User not exists");
    }

    // const hashPassword = await bcrypt.hash(password_hash, 10);

    const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
        `, [title, description, type, status, reporter_id])

    // delete result.rows[0].password;

    // console.log("service result",result);
    return result;
}

const getAlllIssuessFromDB = async (userId: number) => {

    // const { reporter_id } = payload;

    //  const user = await pool.query(`
    //     SELECT * FROM users WHERE id=$1
    //     `, [reporter_id])


    const result = await pool.query(`
            SELECT * FROM issues WHERE reporter_id=$1
            `,[userId])

            console.log("user from service", result)
            return result;
}

export const issuesService = {
    issuesCreateIntoDB,
    getAlllIssuessFromDB
}