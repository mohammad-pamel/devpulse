import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router()

router.post('/', auth(), issuesController.createIssues)
router.get('/', issuesController.getAllIssues)

router.put('/:id', issuesController.updateIssues)

export const issuesRoute = router;