const modal = require('./modal.controller');
const renderShopNameFromHeader = function(str){
    let objURL = {};
    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            objURL[$1] = $3;
    });
    return objURL;
}
module.exports = {
    initGetPromotion: (req, res) => {
        var shopName = req.query.shop || '';
        if(shopName === ''){
            let { referer } = req.headers;
            shopName = renderShopNameFromHeader(referer).shop || '';
        }
       
        if(typeof shopName === 'undefined' || !shopName || shopName === ''){
            res.json({ error: true, message: 'Lấy dữ liệu thất bại!! 404', db_shop: {} });
            return false;
        }
        modal.initFindOneShop(shopName, (data) => {
            if (data.shop_domain && data.shop_domain !== '') {
                if(data.shop_domain)
                    delete data.shop_domain;
                res.json({ error: null, message: 'Lấy dữ liệu thành công', db_shop: data });
            } else {
                res.json({ error: true, message: 'Lấy dữ liệu thất bại!! 404', db_shop: {} });
            }
        }) 
    },
    initAddPromotion: (req, res) => {
        const {type, data} = req.body; 
        // console.log(req.body)
        // var list = reqData.list_promotions.map(function (item) {
        //                 return { promotionName: item["promotionName"], promotionLevel: item["promotionLevel"], promotionCode: item["promotionCode"] }
        //             });
        // reqData.list_promotions = list;
        let { referer } = req.headers;
        shop_domain = renderShopNameFromHeader(referer).shop || '';
        console.log('shop_domain', shop_domain);
        if(!shop_domain){
            res.status(404).json({ error: true, message: '404!!!', db_shop: {} })
            return false;
        }
        let dataUpdate = {};
        switch(type){
            case 'info':
                break;
            case 'settings':
                break;
            case 'need_take':
                break;
            case 'list_promotions':
                break
            default:
                break
        }
        if(type === 'multiple'){
            console.log('is array');
            let promise = data.map(item => {
                return new Promise((resolve, reject) => {
                    modal.initUpdateDocumentShop(shop_domain, item.type, item.data, (resp) => {
                        if (resp.error || !resp.data)
                            reject(resp.error);
                        resolve(resp);
                    })
                })
            });
            Promise.all(promise).then(resp => {
                if(resp.length === 2)
                    res.status(200).json({ error: false, statusCode: 200, message: 'Cập nhật dữ liệu thành công!' });
                else
                    res.json({ error: true, message: 'Cập nhật dữ liệu thất bại'});
            })
            return false;
        }
        console.log('not array');
        if(Array.isArray(data)){
            for (var i = 0; i < data.length; i++) {
                delete data[i].toggle;
            }
        }
        console.log(data)
        modal.initUpdateDocumentShop(shop_domain, type, data, (resp) => {
            if (resp.error)
                res.json({ error: true, message: 'Cập nhật dữ liệu thất bại'});
            else if (!resp.data)
                res.json({ error: true, message: '404! Không tìm thấy cửa hàng'});
            else{
                res.status(200).json({ error: false, statusCode: 200, message: 'Cập nhật dữ liệu thành công!' });
            }
        });
        // modal.initFindOneShop(name, (data) => {
        //     if (data) {
        //         const body = req.body.promotion;
        //         //console.log(body)
        //         var data = body.map(function (item) {
        //             return { promotionName: item["promotionName"], promotionLevel: item["promotionLevel"], promotionCode: item["promotionCode"] }
        //         });
        //         //console.log(data)
        //         modal.initUpdateDocumentShop(name, 'list_promotions', data, (err, resp) => {
        //             //console.log(resp);
        //             if (err)
        //                 res.json({ error: true, message: 'Update promotion thất bại' });
        //             else if (!data)
        //                 res.json({ error: true, message: '404! Không tìm thấy shop' });
        //             else
        //                 res.json({ error: false, message: 'Update thành công!', promotions: resp.data });
        //         })
        //     } else {
        //         res.json({ error: true, message: 'Không tìm thấy shop' });
        //     }
        // })
    }
}