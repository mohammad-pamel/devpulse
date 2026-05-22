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

// const getAlllIssuessFromDB = async (userId: number) => {

//     // const { reporter_id } = payload;

//     //  const user = await pool.query(`
//     //     SELECT * FROM users WHERE id=$1
//     //     `, [reporter_id])


//     const result = await pool.query(`
//             SELECT * FROM issues WHERE reporter_id=$1
//             `,[userId])

//             console.log("user from service", result)
//             return result;
// }

//Challenge part
const getAllIssuesFromDB = async (query: any) => {

    const { sort = "newest", type, status } = query;

    let sql = `
        SELECT 
            i.*,
            u.id AS user_id,
            u.name,
            u.role
        FROM issues i
        JOIN users u ON i.reporter_id = u.id
        WHERE 1=1
    `;

    const values: any[] = [];

    if (type) {
        values.push(type);
        sql += ` AND i.type = $${values.length}`;
    }

    if (status) {
        values.push(status);
        sql += ` AND i.status = $${values.length}`;
    }

    sql += sort === "oldest"
        ? " ORDER BY i.created_at ASC"
        : " ORDER BY i.created_at DESC";

    const result = await pool.query(sql, values);

    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        reporter: {
            id: row.user_id,
            name: row.name,
            role: row.role,
        },
    }));
};

const getSingleIssuesFromDB = async (id: string) => {
    const issuesresult = await pool.query(`
            SELECT * FROM issues WHERE id=$1
            `, [id]);

    const userresult = await pool.query(`
            SELECT id, name, role FROM users WHERE id=$1
            `, [issuesresult.rows[0].reporter_id]);

    const issue = issuesresult.rows[0]
    const user = userresult.rows[0]

    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        
        reporter: {
            id: user.id,
            name: user.name,
            role: user.role,
        },
        created_at: issue.created_at,
        updated_at: issue.updated_at
    }
}

export const issuesService = {
    issuesCreateIntoDB,
    getAllIssuesFromDB,
    getSingleIssuesFromDB
}