
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.JWT_REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) CHECK(role IN ('contributor','maintainer')),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL,
            type VARCHAR(20) CHECK(type IN ('bug','feature_request')),
            status VARCHAR(20) DEFAULT 'open' CHECK(status IN ('open','in_progress','resolved')),
            reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);
    console.log("database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/auth/auth.service.ts
var usersCreateIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 12);
  const result = await pool.query(`
        INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,COALESCE($4,'contributor')) RETURNING id, name, email, role, created_at, updated_at
        `, [name, email, hashPassword, role]);
  if (!name || !email || !password) {
    throw new Error("All fields are required");
  }
  const validRoles = ["contributor", "maintainer"];
  if (role && !validRoles.includes(role)) {
    throw new Error("Invalid role");
  }
  return result;
};
var getAlllUsersFromDB = async () => {
  const result = await pool.query(`
            SELECT * FROM users
            `);
  return result;
};
var loginUserIntoDB = async (payload) => {
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
  };
  delete user.password;
  const token = jwt.sign(jwtpayload, config_default.secret, { expiresIn: "1d" });
  return { token, user };
};
var authService = {
  usersCreateIntoDB,
  getAlllUsersFromDB,
  loginUserIntoDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  console.log("controller", req.body);
  try {
    const result = await authService.usersCreateIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User Registered Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await authService.getAlllUsersFromDB();
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result.rows
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);
    const { token } = result;
    res.cookie("token", token, {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    });
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var authController = {
  createUser,
  getAllUsers,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
router.get("/", authController.getAllUsers);
var authRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var issuesCreateIntoDB = async (payload) => {
  const { title, description, type, status, reporter_id } = payload;
  const user = await pool.query(`
        SELECT * FROM users WHERE id=$1
        `, [reporter_id]);
  if (user.rows.length === 0) {
    throw new Error("User not exists");
  }
  if (description.length < 20) {
    throw new Error("Description must be at least 20 characters");
  }
  if (type !== "bug" && type !== "feature_request") {
    throw new Error("Type must be bug or feature_request");
  }
  const result = await pool.query(`
        INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
        `, [title, description, type, status, reporter_id]);
  return result;
};
var getAllIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues WHERE 1=1`;
  const values = [];
  if (type) {
    values.push(type);
    sql += ` AND type = $${values.length}`;
  }
  if (status) {
    values.push(status);
    sql += ` AND status = $${values.length}`;
  }
  sql += sort === "oldest" ? ` ORDER BY created_at ASC` : ` ORDER BY created_at DESC`;
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
var getSingleIssuesFromDB = async (id) => {
  const issuesresult = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [id]
  );
  console.log("service", issuesresult);
  if (issuesresult.rows.length === 0) {
    return null;
  }
  const issue = issuesresult.rows[0];
  const userresult = await pool.query(
    `SELECT id, name, role FROM users WHERE id=$1`,
    [issue.reporter_id]
  );
  console.log("sevice user", userresult);
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
      role: user.role
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssuesFromDB = async (payload, id) => {
  const { title, description, type, status, reporter_id } = payload;
  const result = await pool.query(`
        UPDATE issues
        SET
        title=COALESCE($1, title),
        description=COALESCE($2, description),
        type=COALESCE($3, type),
        status=COALESCE($4, status),
        updated_at = NOW()
        WHERE id=$5 RETURNING *
        `, [title, description, type, status, id]);
  return result;
};
var deleteIssuesFromDB = async (id) => {
  const result = await pool.query(`
            DELETE FROM issues WHERE id=$1
            `, [id]);
  return result;
};
var issuesService = {
  issuesCreateIntoDB,
  getAllIssuesFromDB,
  getSingleIssuesFromDB,
  updateIssuesFromDB,
  deleteIssuesFromDB
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  console.log("issues controller", req.body);
  try {
    console.log("controller hit", req.body);
    const payload = {
      ...req.body,
      reporter_id: req.user?.id
    };
    const result = await issuesService.issuesCreateIntoDB(payload);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue Created Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort = "newest", type, status } = req.query;
    const result = await issuesService.getAllIssuesFromDB({
      sort,
      type,
      status
    });
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found!"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const result = await issuesService.getSingleIssuesFromDB(id);
    if (!result) {
      return sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "Issue not found",
        data: {}
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "User Retrieve Successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const issuesResult = await issuesService.getSingleIssuesFromDB(id);
    if (!issuesResult) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: {}
      });
    }
    const user = req.user;
    if (user?.role === "maintainer") {
      if (issuesResult?.reporter.id !== user?.id) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden Access",
          data: {}
        });
      }
      if (issuesResult?.status !== "open") {
        return sendResponse_default(res, {
          statusCode: 409,
          success: false,
          message: "Issue already in progress/resolved",
          data: {}
        });
      }
    }
    const result = await issuesService.updateIssuesFromDB(req.body, id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue Updated Successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issuesService.deleteIssuesFromDB(id);
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: false,
        message: "User not found",
        data: {}
      });
    }
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue Deleted Successfully",
      data: {}
    });
  } catch (error) {
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    console.log("roles auth.ts", roles);
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized Access!!!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(`
            SELECT * FROM users WHERE email=$1
            `, [decoded.email]);
      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found!!!"
        });
      }
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "Forbidden!!!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/", auth_default("maintainer", "contributor"), issuesController.createIssues);
router2.get("/", issuesController.getAllIssues);
router2.get("/:id", issuesController.getSingleIssues);
router2.patch("/:id", auth_default("contributor", "maintainer"), issuesController.updateIssues);
router2.delete("/:id", auth_default("maintainer"), issuesController.deleteIssues);
var issuesRoute = router2;

// src/app.ts
import cors from "cors";

// src/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  sendResponse_default(res, {
    statusCode: 500,
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000"
}));
app.get("/", (req, res) => {
  res.status(200).json({
    "message": "Express Serveer",
    "author": "Next Level"
  });
});
app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map