const express = require('express');
const router = express.Router();
const authToken = require('./../controllers/install/token.controller');
const promotion = require('./../controllers/install/promotion.controller');
const ajaxReq = require('../controllers/theme/ajax.controller');
router.route('/auth/authenticate')
    .get(authToken.initGetCodeToken);

router.route('/promotion')
    .get(promotion.initGetPromotion)
    .post(promotion.initAddPromotion)

router.route('/ajax')
    .get(ajaxReq.initRenderPromotionHTML)
    .post(ajaxReq.initRenderPromotionCode)
module.exports = router;