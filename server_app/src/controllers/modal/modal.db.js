const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/db_promotion', {
    useNewUrlParser: true,
    useFindAndModify: false
})
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var modalSchema = new mongoose.Schema({
    shop_domain: String,
    access_token: String,
    refresh_token: String,
    totalTurned: Number,
    need_take: { 
        take_name: Boolean,
        take_email: Boolean,
        take_phone: Boolean
    },
    info: {
        name_button: String,
        name_button_turnning: String,
        name_button_view: String,
        name_popup: String,
        name_list_gift: String,
        name_miss_gift: String
    },
    settings: {
        limit_turn: Number,
        require_login: Boolean,
        time_return: Number
    },
    list_customer: [{
        email: String,
        name: String,
        phone: String,
        turned: Number,
        vouchers: Array,
        time: Object,
        device: Array
    }],
    list_promotions: [{
        promotionName: String,
        promotionLevel: Number,
        promotionCode: String
    }]
})
module.exports = mongoose.model('modal', modalSchema)