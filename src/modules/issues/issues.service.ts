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

     if (description.length < 20) {
        throw new Error("Description must be at least 20 characters")
    }

    if (type !== "bug" && type !== "feature_request") {
        throw new Error("Type must be bug or feature_request");
    }


    const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
        `, [title, description, type, status, reporter_id])

   

    // delete result.rows[0].password;

    // console.log("service result",result);
    return result;
}


const getAllIssuesFromDB = async (query: {
    sort?: string;
    type?: string;
    status?: string;
}) => {

    const { sort = "newest", type, status } = query;

    let sql = `SELECT * FROM issues WHERE 1=1`;
    const values: any[] = [];

    if (type) {
        values.push(type);
        sql += ` AND type = $${values.length}`;
    }

    if (status) {
        values.push(status);
        sql += ` AND status = $${values.length}`;
    }

    sql += sort === "oldest"
        ? ` ORDER BY created_at ASC`
        : ` ORDER BY created_at DESC`;

    const { rows: issues } = await pool.query(sql, values);

    const result = [];

    for (let i = 0; i < issues.length; i++) {

        const issue = issues[i];

        const { rows: users } = await pool.query(
            `SELECT id, name, role FROM users WHERE id=$1`,
            [issue.reporter_id]
        );

        const user = users[0];

        result.push({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter: user,
            created_at: issue.created_at,
            updated_at: issue.updated_at
        });
    }

    return result;
};

const getSingleIssuesFromDB = async (id: string) => {

    const issuesresult = await pool.query(
        `SELECT * FROM issues WHERE id=$1`,
        [id]
    );

    console.log("service", issuesresult)
    // issue exists check
    if (issuesresult.rows.length === 0) {
        return null;
    }

    const issue = issuesresult.rows[0];

    const userresult = await pool.query(
        `SELECT id, name, role FROM users WHERE id=$1`,
        [issue.reporter_id]
    );

    console.log("sevice user", userresult)

    const user = userresult.rows[0];

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
    };
};

const updateIssuesFromDB = async (payload: IIssues, id: string) => {

    const { title, description, type, status, reporter_id } = payload

    const result = await pool.query(`
        UPDATE issues
        SET
        title=COALESCE($1, title),
        description=COALESCE($2, description),
        type=COALESCE($3, type),
        status=COALESCE($4, status),
        updated_at = NOW()
        WHERE id=$5 RETURNING *
        `, [title, description, type, status, id])

    return result;

}

const deleteIssuesFromDB = async (id: string) => {
    const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
            `, [id])

    return result;
}

export const issuesService = {
    issuesCreateIntoDB,
    getAllIssuesFromDB,
    getSingleIssuesFromDB,
    updateIssuesFromDB,
    deleteIssuesFromDB
}