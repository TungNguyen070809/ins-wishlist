const config = require('./../../../config');
module.exports = {
    initGetHaravanThemes: function (callback) {
        var self = this;
        const themeUrl = '/admin/themes.json';
        self.initGetRequest(themeUrl, function (error, body) {
            if (error) {
                console.log(error);
                return false;
            } else {
                callback(body)
            }
        })
    },
    initInstallCodeTheme: function () {
        var self = this;
        this.initGetHaravanThemes(data => {
            var { themes } = data;
            var themeid = '';
            for (var i = 0; i < themes.length; i++) {
                if (themes[i].role === 'main')
                    themeid = parseInt(themes[i].id);
            }
            if (themeid !== '') {
                const AssetUrl = '/admin/themes/' + themeid + '/assets.json';
                const URI_GET_LIQID = AssetUrl + '?asset[key]=layout/theme.liquid';
                const promotionPage = {
                    "asset": {
                        "key": "templates\/page.ins-promotion.liquid",
                        "value": `
<div id="insPromotionApp">
    <div class="hso-animation">
        <div class="sprite sprite-light-1"></div>
        <div class="sprite sprite-light-2"></div>
        <div class="sprite sprite-light-2 sprite-light-2__2"></div>
    </div>
    <div class="qContent"></div>
    <div class="promotionShow">
        <h2 class="title">
            Danh sách quà tặng
        </h2>
        <div class="listGift clearfix">
        </div>
    </div>
    <div id="insPromotionPopup" class="promotionModal engo-popup styleModal">
        <div class="overlay"></div>
        <div class="content">
            <div class="popupBody">
                <h3 class="title">
                    Danh sách quà đạt được
                </h3>
                <div class="receivedPromotion">

                </div>
            </div>
            <a class="btnClose closePromotions" href="javascript:;"></a>
        </div>
    </div>
</div>
                        `
                    }
                }
                self.initPutRequest(AssetUrl, promotionPage, function (error, data) {
                    if (error) return false;
                    console.log('Cài đặt template page.ins-promotion.liquid thành công!!');
                });
                const promotionStyle = {
                    "asset": {
                        "key": "assets\/ins_promotion.scss.liquid",
                        "src": "https:\/\/theme.hstatic.net\/1000339952\/1000431455\/14\/qc.scss.css?v=339"
                    }
                }
                const addImage = {
                    "asset": {
                        "key": "assets\/ins_title_turn.png",
                        "src": "http:\/\/file.hstatic.net/1000339952\/file\/ins_title_turn.png"
                    }
                }
                self.initPutRequest(AssetUrl, promotionStyle, function (error, data) {
                    if (error) console.log(error.error);
                    else console.log('Upload ', promotionStyle.asset.key.split('\/')[1], ' vào assets thành công!');
                });
                const promotionSnippet = {
                    "asset": {
                        "key": "snippets\/ins-promotion.liquid",
                        "value": `
<script>
window.customerEmail = '{{ customer.email }}' || '';
window.customerName = '{{ customer.name }}' || '';
window.customerPhone = '{{ customer.default_address.phone }}' || '';
window.isLogin = {% if customer %}true{% else %}false{% endif %};
</script>
{{ 'ins_promotion.scss.css' | asset_url | stylesheet_tag }}`
                    }
                }
                self.initPutRequest(AssetUrl, promotionSnippet, function (error, data) {
                    if (error) console.log(error.error);
                    else console.log('Upload ', promotionSnippet.asset.key.split('\/')[1], ' vào assets thành công!');
                });
                self.initGetRequest(URI_GET_LIQID, function (error, theme) {
                    if (error) return console.log(error);
                    try {
                        var themeValue = theme.asset.value;
                        if (themeValue.indexOf('ins-promotion') == -1) {
                            themeValue = themeValue.replace('</head>', '\n{% include "ins-promotion" %}\n</head>');
                        }
                        const promotionLayout = {
                            "asset": {
                                "key": "layout\/theme.liquid",
                                "value": themeValue
                            }
                        }
                        self.initPutRequest(AssetUrl, promotionLayout, function (error, data) {
                            if (error) return false;
                            console.log('Update layout theme.liquid thành công!!');
                        });
                    } catch (error) {
                        console.log('lỗi update theme.liquid')
                    }

                });
                const scripTagURL = '/admin/script_tags.json';
                const promotionScripTag = {
                    "script_tag": {
                        "event": "onload",
                        "src": "https:\/\/theme.hstatic.net\/1000339952\/1000431455\/14\/ins-promotion.js?v=342"
                    }
                }
                self.initPostRequest(scripTagURL,promotionScripTag, (error, data) => {
                    if (error) return console.log(error);
                    console.log('Update script_tag thành công!!');
                })
            } else {
                console.log('Không tìm thấy themeid')
            }
        })
    },
    initMakeRequest: function (endpoint, method, data, callback, retry) {
        var https = require('https'),
            dataString = JSON.stringify(data),
            options = {
                hostname: config.shop.split(".")[0] + '.myharavan.com',
                path: endpoint,
                method: method.toLowerCase() || 'get',
                port: config.port,
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            self = this;

        if (config.access_token) {
            options.headers['Authorization'] = "Bearer " + config.access_token;
        }

        if (options.method === 'post' || options.method === 'put' || options.method === 'delete') {
            options.headers['Content-Length'] = new Buffer(dataString).length;
        }

        var request = https.request(options, function (response) {
            //self.conditional_console_logself.conditional_console_log('STATUS: ' + response.statusCode);
            //self.conditional_console_log('HEADERS: ' + JSON.stringify(response.headers));

            if (response.headers && response.headers.http_x_haravan_shop_api_call_limit) {
                //self.conditional_console_log('API_LIMIT: ' + response.headers.http_x_haravan_shop_api_call_limit);
            }

            response.setEncoding('utf8');

            var body = '';

            response.on('data', function (chunk) {
                //self.conditional_console_log('BODY: ' + chunk);
                body += chunk;
            });

            response.on('end', function () {

                var delay = 0;

                // If the request is being rate limited by Haravan, try again after a delay
                if (response.statusCode === 429) {
                    return setTimeout(function () {
                        self.initMakeRequest(endpoint, method, data, callback);
                    }, config.rate_limit_delay || 10000);
                }

                // If the backoff limit is reached, add a delay before executing callback function
                if (response.statusCode === 200 && self.has_header(response, 'http_x_haravan_shop_api_call_limit')) {
                    var api_limit = parseInt(response.headers['http_x_haravan_shop_api_call_limit'].split('/')[0], 10);
                    if (api_limit >= (config.backoff || 35)) delay = config.backoff_delay || 1000; // in ms
                }

                setTimeout(function () {

                    var json = {}
                        , error;

                    try {
                        if (body.trim() != '') { //on some requests, Haravan retuns an empty body (several spaces)
                            json = JSON.parse(body);
                            if (json.hasOwnProperty('error') || json.hasOwnProperty('errors')) {
                                error = {
                                    error: (json.error || json.errors)
                                    , code: response.statusCode
                                };
                            }
                        }
                    } catch (e) {
                        error = e;
                    }

                    callback(error, json, response.headers);
                }, delay); // Delay the callback if we reached the backoff limit

            });

        });

        request.on('error', function (e) {
            //self.conditional_console_log("Request Error: ", e);
            if (config.retry_errors && !retry) {
                var delay = config.error_retry_delay || 10000;
                //self.conditional_console_log("retrying once in " + delay + " milliseconds");
                setTimeout(function () {
                    self.initMakeRequest(endpoint, method, data, callback, true);
                }, delay);
            } else {
                callback(e);
            }
        });

        if (options.method === 'post' || options.method === 'put' || options.method === 'delete') {
            request.write(dataString);
        }
        request.end();
    },
    initPutRequest: function (endpoint, data, callback) {
        this.initMakeRequest(endpoint, 'PUT', data, callback);
    },
    initGetRequest: function (endpoint, data, callback) {
        if (typeof data === 'function' && arguments.length < 3) {
            callback = data;
            data = null;
        }
        this.initMakeRequest(endpoint, 'GET', data, callback);
    },
    initPostRequest: function (endpoint, data, callback) {
        this.initMakeRequest(endpoint, 'POST', data, callback);
    },
    has_header: function (response, header) {
        return response.headers.hasOwnProperty(header) ? true : false;
    }
}