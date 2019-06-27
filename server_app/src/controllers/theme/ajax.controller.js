const modal = require('../install/modal.controller');
module.exports = {
    initRenderPromotionHTML: async function (req, res) {
        const self = this;
        var jsonResponse = {}, requireLogin = true;
        const { email, shop } = req.query;
        const limitElement = 50;
        var turnArr = [], transArr = [], totalTurn = 5, message = 'Lấy được dữ liệu thành công!!!', err = false;
        const dataShop = await modal.initAjaxRequestFindShop(shop).then(r => { return r; })
        //console.log('--------------- dataShop -------------------- ')
        //console.log(dataShop)
        if(dataShop.error === '404' || dataShop.error){
            message = 'Lỗi... không lấy được dữ liệu';
            err = true;
            return false;
        }
        requireLogin = dataShop.settings.require_login;
        var limit = dataShop.settings.limit_turn;
        var { list_customer, list_promotions, info, need_take } = dataShop;
        totalTurn = dataShop.settings.limit_turn;
        //console.log(list_promotions);
        if (!list_promotions || list_promotions.length == 0)
            return false;
        //jsonResponse.limit = limit;
        const initFormatQuestionText = text => {
            var lenghtText = text.length;
            if(lenghtText == 0)
                return '?Z' + Math.floor((Math.random() * 10) + 1) + 'H?' + Math.floor((Math.random() * 10) + 1) + '?G';
            else if (lenghtText < 5)
                return '?' +text.substring(1, 1)+ '??' + text + '?' +text.substring(0, 2)+ '??';
            else {
                let firstText = text.substring(0, 2),
                    lastText = text.substring(text.length - 2, text.length);
                return firstText + '???' + lastText + '?'
            }
        };
        var promotionSended = list_promotions.map(function (item) {
            return { promotionName: item["promotionName"], promotionLevel: item["promotionLevel"], promotionCode: initFormatQuestionText(item["promotionCode"]) }
        });
        // console.log('------------- promotionSended ------------------ ')
        // console.log(promotionSended)
        jsonResponse.listPromotion = promotionSended;
        //config.api_shop.promotions = promotions;
        if (email && email !== ''){
            if (list_customer.length == 0) {
                list_customer.push({
                    email: email,
                    turned: 0,
                    vouchers: [],
                    time: {},
                    device: []
                })
                modal.initUpdateListCustomer(shop, list_customer, (data) => {
                    
                })
                jsonResponse.turn = limit;
                jsonResponse.turned = 0; 
                //jsonResponse.customerIndex = 0;
            } else {
                var currentCustomer = list_customer.filter(x => x.email === email)
                //console.log(currentCustomer);
                if (currentCustomer && currentCustomer.length > 0) {
                    console.log('Đã có email này');
                    jsonResponse.turn = (limit - currentCustomer[0].turned < 0) ? 0 : limit - currentCustomer[0].turned;
                    jsonResponse.turned = currentCustomer[0].turned;
                    let arrGift = currentCustomer[0].vouchers;
                    let uniq = arrGift.reduce(function(a,b){
                        function indexOfProperty (a, b){
                            for (var i=0;i<a.length;i++){
                                if(a[i].name == b.name && a[i].code == b.code){
                                     return i;
                                 }
                            }
                           return -1;
                        }
                  
                        if (indexOfProperty(a,b) < 0 ) a.push(b);
                          return a;
                    },[]);
                    jsonResponse.listGift = uniq;
                    //jsonResponse.customerIndex = 0;
                }else{
                    console.log('Chưa có email này');
                    list_customer.push({
                        email: email,
                        turned: 0,
                        vouchers: [],
                        time: {},
                        device: []
                    })
                    modal.initUpdateListCustomer(shop, list_customer, (data) => {
                        //console.log(data)
                    })
                    jsonResponse.turn = limit;
                    jsonResponse.turned = 0;
                }
            }
        }else
            jsonResponse.turn = limit;
        var sizeItem = Math.ceil(limitElement / promotionSended.length),
            arrTam = [];
        for (let i = 0; i < sizeItem; i++) {
            for (let j = 0; j < promotionSended.length; j++) {
                arrTam.push(promotionSended[j]);
                if (arrTam.length >= limitElement)
                    break;
            }
        }
        // console.log('------ Array tam --------------- ')
        // console.log(arrTam);
        turnArr = arrTam;
        const getShuffledArr = arr => {
            const newArr = arr.slice();
            for (let i = newArr.length - 1; i > 0; i--) {
                const rand = Math.floor(Math.random() * (i + 1));
                [newArr[i], newArr[rand]] = [newArr[rand], newArr[i]];
            }
            return newArr;
        };
        const initRandomArray = (arr,limit,index) => {
            if(arr.length == 1) return arr;
            var finalArray = [];
            //const keyArr = ['',0,1];
            const keyCenter = Math.ceil(limit/2);
            var transArr = getShuffledArr(arr);
            var key = parseInt(index);
            for(let i=0; i<transArr.length-1; i++){
                if(finalArray.length >= limit) break;
                const ranIndex = Math.floor((Math.random() * 10) + 1);
                switch(key){
                    case -1:
                        if(finalArray.length > 0 && finalArray.length > keyCenter){
                            if(ranIndex == 1){
                                if(transArr[i].promotionCode == '' || transArr[i].promotionLevel == 0 ){
                                    finalArray.push(transArr[i]);
                                }
                            }else{
                                if(transArr[i].promotionCode == ''){
                                    finalArray.push(transArr[i]);
                                }
                            }
                        }else{
                            if(transArr[i].promotionCode == ''){
                                finalArray.push(transArr[i]);
                            }
                        }
                        break;
                    case 0:
                        if(finalArray.length > 0 && finalArray.length > keyCenter){
                            if(ranIndex < 2){
                                if(transArr[i].promotionLevel == 0 || transArr[i].promotionLevel == 1 )
                                    finalArray.push(transArr[i]);
                            }else{
                                if(transArr[i].promotionLevel == 0)
                                    finalArray.push(transArr[i]);
                            }
                        }else{
                            if(transArr[i].promotionLevel == 0){
                                finalArray.push(transArr[i]);
                            }
                        }
                        break;
                    case 1:
                        if(transArr[i].promotionLevel == 1){
                            finalArray.push(transArr[i]);
                        }
                        break;
                    default:
                        break;
                }
            }
            if(finalArray.length == 0){
                if(key === -1){
                    return initRandomArray(arr,limit,0);
                }else if (key === 0){
                    return initRandomArray(arr,limit,1);
                }
            }	else if (finalArray.length < limit){
                let need = limit - finalArray.length;
                for(let i = 0; i< need; i++){
                    finalArray.push(finalArray[0]);
                }
            }
            return finalArray;
        }
        const resPromotionArray = initRandomArray(list_promotions,limit, -1)
        // console.log('------ Final array --------------- ')
        // console.log(resPromotionArray);
        var jKey = arrTam.length - 20;
        for (let i = 0; i < resPromotionArray.length; i++) {
            const arrTamRandom = arrTam; //getShuffledArr(arrTam);
            for (let j = arrTamRandom.length - 20; j >= 0; j--) {
                if(jKey >= j && resPromotionArray[i].promotionLevel === arrTamRandom[j].promotionLevel && resPromotionArray[i].promotionName === arrTamRandom[j].promotionName){
                    //let indexTrans = j * widthElement;
                    let indexTrans = j;
                    let objSend = {
                        index: indexTrans,
                        code: arrTamRandom[j].promotionCode,
                        name: arrTamRandom[j].promotionName
                    }
                    transArr.push(objSend);
                    jKey = jKey - (Math.floor(Math.random() * 5 + 2));
                    break;
                }
            }
        }
        res.json({
            error: err,
            message,
            data: {
                info,
                need_take,
                jsonResponse,
                totalTurn,
                transArr,
                turnArr,
                requireLogin
            }
        });
    },
    initRenderPromotionCode: async function (req, res) {
        const { shop, objTake, objPost } = req.body;
        if (!objTake || !objPost) {
            console.log('Lỗi post dữ liệu...');
            res.json({
                error: true,
                message: 'Lỗi post dữ liệu'
            });
            return false;
        }
        var customerFull = false;
        var jsonData = {};
        const dataShop = await modal.initAjaxRequestFindShop(shop).then(r => r);
        var { list_customer, list_promotions } = dataShop;
        var limit = dataShop.settings.limit_turn;
        //var limit = dataShop.setting.limit;
        const {index, code, name, device} = objPost;
        const limitElement = 50;
        const promotionSended = list_promotions.map(function (item) {
            return { promotionName: item["promotionName"], promotionLevel: item["promotionLevel"], promotionCode: item["promotionCode"] }
        });
        var sizeItem = Math.ceil(limitElement / list_promotions.length),
            arrTam = [];
        for (let i = 0; i < sizeItem; i++) {
            for (let j = 0; j < promotionSended.length; j++) {
                arrTam.push(promotionSended[j]);
                if (arrTam.length >= limitElement)
                    break;
            }
        }
        const currentPromotion = arrTam[index];
        if (!currentPromotion || currentPromotion.promotionName !== name){
            res.json({
                error: true,
                message: 'Lỗi post dữ liệu'
            });
            return false;
        }
        for (let i = 0; i < list_customer.length; i++) {
            let currentEl = list_customer[i];
            if (currentEl.email === objTake.customerEmail) {
                if (currentEl.turned + 1 > limit) {
                    customerFull = true;
                    jsonData.customerFull = customerFull;
                    currentEl.time = new Date();
                    currentEl.device = device;
                    let arrGift = currentEl.vouchers;
                    let uniq = arrGift.reduce(function(a,b){
                        function indexOfProperty (a, b){
                            for (var i=0;i<a.length;i++){
                                if(a[i].name == b.name && a[i].code == b.code){
                                     return i;
                                 }
                            }
                           return -1;
                        }
                  
                        if (indexOfProperty(a,b) < 0 ) a.push(b);
                          return a;
                    },[]);
                    jsonData.listGift = uniq;
                    //jsonData.listGift = currentEl.vouchers;
                    break;
                } else {
                    currentEl.turned = currentEl.turned + 1;
                    if(currentEl.turned == limit){
                        console.log('Lần cuối rồi....');
                        currentEl.time = new Date();
                        currentEl.device = device;
                        jsonData.lastTurn = true;
                    }
                    if(objTake.customerName && !currentEl.name )
                        currentEl.name = objTake.customerName;
                    if(objTake.customerPhone && !currentEl.phone)
                        currentEl.phone = objTake.customerPhone;
                    let vcItem = {
                        name: currentPromotion.promotionName,
                        code: currentPromotion.promotionCode
                    }
                    if(currentPromotion.promotionCode !== ''){
                        currentEl.vouchers.push(vcItem);
                    }
                    jsonData.customerCode = vcItem;
                    jsonData.customerFull = customerFull;
                    let arrGift = currentEl.vouchers;
                    let uniq = arrGift.reduce(function(a,b){
                        function indexOfProperty (a, b){
                            for (var i=0;i<a.length;i++){
                                if(a[i].name == b.name && a[i].code == b.code){
                                     return i;
                                 }
                            }
                           return -1;
                        }
                  
                        if (indexOfProperty(a,b) < 0 ) a.push(b);
                          return a;
                    },[]);
                    jsonData.listGift = uniq;
                    //jsonData.listGift = currentEl.vouchers;
                }
            }
        }
        if(customerFull){
            res.json({
                error: true,
                message: 'Email này đã hết lượt quay...'
            });
            return false;
        }
        modal.initUpdateListCustomer(shop, list_customer, (data) => {
            //console.log(data.list_customer);
        }) 
        res.json({
            error: false,
            message: 'Lấy dữ liệu thành công...',
            jsonData
        })
    }
}