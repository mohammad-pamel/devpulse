import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router()

router.post('/', auth("maintainer", "contributor"), issuesController.createIssues)
router.get('/', issuesController.getAllIssues)
router.get('/:id', issuesController.getSingleIssues)
router.patch('/:id', auth("contributor", "maintainer"), issuesController.updateIssues)
router.delete('/:id',auth("maintainer"), issuesController.deleteIssues)

export const issuesRoute = router;