import { Router } from "express";
import { authController } from "./auth.controller";
// import { userController } from "./users.controller";
// import auth from "../../middleware/auth";
// import { user_roles } from "../../types";

const router = Router()

router.post('/signup', authController.createUser)
router.post('/login', authController.loginUser)

// router.post('/api/auth/signup', )

router.get('/', authController.getAllUsers)
// router.get('/', auth(user_roles.admin, user_roles.agent), userController.getAllUsers)

// router.get('/:id', userController.getSingleUser)

// router.put('/:id', userController.updateUser)

// router.delete('/:id', userController.deleteUser)

export const authRoute = router;