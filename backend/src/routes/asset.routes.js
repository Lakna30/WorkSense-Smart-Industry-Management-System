import { Router } from 'express';
import * as assetController from '../controllers/asset.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAsset } from '../middleware/validation.js';

const router = Router();

// All asset routes require authentication
router.use(authenticateToken);

router.get('/', assetController.getAllAssets);
router.get('/:id', assetController.getAssetById);
router.post('/', validateAsset, assetController.createAsset);
router.put('/:id', validateAsset, assetController.updateAsset);
router.delete('/:id', assetController.deleteAsset);

export default router;
