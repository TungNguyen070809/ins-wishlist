const db_modal = require('./../modal/modal.db'); 
module.exports = {
    initAddOneShop: (item, callback) => {
        db_modal.create(item, (err, data) => {
            if (err) {
                callback({'erorr': true, err});
                return false;
            }
            callback({'erorr': false, data});
        })
    },
    initFindOneShop: async (domain, callback) => {
        await db_modal.findOne({ 'shop_domain': domain }).select('shop_domain need_take info settings list_promotions totalTurned').lean().exec((err,data)=>{
            if (err)
                callback(err);
            else if (!data)
                callback({'erorr': '404'});
            else
                callback(data);
        })
    },
    initAjaxRequestFindShop: async (domain) => {
        const request = await db_modal.findOne({ 'shop_domain': domain }).lean().exec().then(r => r )
        .catch(err => err);
        return request;
    },
    initRefreshTokenShop: (domain, newToken, callback) => {
        db_modal.findOneAndUpdate({ 'shop_domain': domain }, { $set: { 'refresh_token': newToken } }, { new: true}).lean().exec((err, data) => {
            if (err)
                callback({'erorr': true, err});
            else if (!data)
                callback({'erorr': true, 'err': '404'});
            else
                callback({'erorr': false, data});
        })
    },
    initUpdateDocumentShop: (domain, type, objValue, callback) => {
        /*
            Book.findOneAndUpdate({ "_id": bookId }, { "$set": { "name": name, "genre": genre, "author": author, "similar": similar}}).exec(function(err, book){
                if(err) {
                    console.log(err);
                    res.status(500).send(err);
                } else {
                    res.status(200).send(book);
                }
            });
        */
       //console.log(objValue.need_take);
        db_modal.findOneAndUpdate({ 'shop_domain': domain }, { $set: { [type]: objValue } }, { new: true}).lean().exec((err, data) => {
            if (err)
                callback({'error': true, err});
            else if (!data)
                callback({'error': true, data: {}});
            else
                callback({'error': false, data});
        })
    },
    initUpdateListCustomer: (domain, list_customer, callback) => {
        db_modal.findOneAndUpdate({ 'shop_domain': domain }, { $set: { "list_customer": list_customer } }, { new: true}).lean().exec((err, data) => {
            if (err)
                callback({'error': true, err});
            else if (!data)
                callback({'error': true, data: {}});
            else
                callback({'error': false, data});
        })
    }
}