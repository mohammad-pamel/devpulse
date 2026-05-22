import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router()

router.post('/', auth(), issuesController.createIssues)
router.get('/', issuesController.getAllIssues)
router.get('/:id', issuesController.getSingleIssues)
router.put('/:id', issuesController.updateIssues)
router.delete('/:id', issuesController.deleteIssues)

export const issuesRoute = router;