// =============================================
// Primenym Shopify Connector for Looker Studio
// =============================================

var PRIMENYM_API_URL = 'https://www.primenym.com/api';
var OAUTH_CLIENT_ID = 'looker_studio_client';
var OAUTH_CLIENT_SECRET = 'looker_studio_secret';

// =============================================
// AUTH
// =============================================

function getAuthType() {
    var cc = DataStudioApp.createCommunityConnector();
    var AuthTypes = cc.AuthType;
    return cc.newAuthTypeResponse()
        .setAuthType(AuthTypes.OAUTH2)
        .build();
}

function getOAuthService() {
    return OAuth2.createService('Primenym')
        .setAuthorizationBaseUrl(PRIMENYM_API_URL + '/oauth/authorize')
        .setTokenUrl(PRIMENYM_API_URL + '/oauth/token')
        .setClientId(OAUTH_CLIENT_ID)
        .setClientSecret(OAUTH_CLIENT_SECRET)
        .setPropertyStore(PropertiesService.getUserProperties())
        .setCallbackFunction('authCallback');
}

function authCallback(request) {
    var authorized = getOAuthService().handleCallback(request);
    if (authorized) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab.');
    }
}

function isAuthValid() {
    return getOAuthService().hasAccess();
}

function get3PAuthorizationUrls() {
    return getOAuthService().getAuthorizationUrl();
}

function resetAuth() {
    getOAuthService().reset();
}

// =============================================
// CONFIG
// =============================================

function getConfig(request) {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();

    var response = UrlFetchApp.fetch(PRIMENYM_API_URL + '/connector/config?connector=shopify', {
        headers: {
            Authorization: 'Bearer ' + getOAuthService().getAccessToken()
        }
    });

    var data = JSON.parse(response.getContentText());
    var stores = data.sources || [];

    if (stores.length === 0) {
        config.newInfo()
            .setId('no_stores')
            .setText('No Shopify stores connected. Please connect a store in your Primenym Dashboard.');
        return config.build();
    }

    var storeSelect = config.newSelectSingle()
        .setId('store_id')
        .setName('Select Shopify Store')
        .setHelpText('Choose which Shopify store you want to pull data from.');

    stores.forEach(function (store) {
        storeSelect.addOption(config.newOptionBuilder().setLabel(store.name).setValue(store.id));
    });

    config.newInfo()
        .setId('instructions')
        .setText('Select the store and click Connect.');

    return config.build();
}

// =============================================
// SCHEMA
// =============================================

function getFields() {
    var cc = DataStudioApp.createCommunityConnector();
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields.newDimension()
        .setId('order_id')
        .setName('Order ID')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('created_at')
        .setName('Created At')
        .setType(types.YEAR_MONTH_DAY_HOUR);

    fields.newDimension()
        .setId('financial_status')
        .setName('Financial Status')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('customer_email')
        .setName('Customer Email')
        .setType(types.TEXT);

    fields.newMetric()
        .setId('total_price')
        .setName('Total Price')
        .setType(types.CURRENCY_USD)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('subtotal_price')
        .setName('Subtotal Price')
        .setType(types.CURRENCY_USD)
        .setAggregation(aggregations.SUM);

    fields.newMetric()
        .setId('total_tax')
        .setName('Total Tax')
        .setType(types.CURRENCY_USD)
        .setAggregation(aggregations.SUM);

    return fields;
}

function getSchema(request) {
    var fields = getFields().build();
    return { schema: fields };
}

// =============================================
// DATA
// =============================================

function getData(request) {
    var storeId = request.configParams.store_id;

    var requestedFields = getFields().forIds(
        request.fields.map(function (field) {
            return field.name;
        })
    );

    var url = PRIMENYM_API_URL + '/connector/shopify/data?storeId=' + storeId;

    if (request.dateRange) {
        url += '&startDate=' + request.dateRange.startDate + '&endDate=' + request.dateRange.endDate;
    }

    var response = UrlFetchApp.fetch(url, {
        headers: {
            Authorization: 'Bearer ' + getOAuthService().getAccessToken()
        }
    });

    var data = JSON.parse(response.getContentText());
    var rows = [];

    data.orders.forEach(function (order) {
        var row = [];
        requestedFields.asArray().forEach(function (field) {
            switch (field.getId()) {
                case 'order_id':
                    row.push(order.id);
                    break;
                case 'created_at':
                    row.push(order.created_at.replace(/[-:T]/g, '').slice(0, 10));
                    break;
                case 'financial_status':
                    row.push(order.financial_status);
                    break;
                case 'customer_email':
                    row.push(order.customer ? order.customer.email : '');
                    break;
                case 'total_price':
                    row.push(parseFloat(order.total_price));
                    break;
                case 'subtotal_price':
                    row.push(parseFloat(order.subtotal_price));
                    break;
                case 'total_tax':
                    row.push(parseFloat(order.total_tax));
                    break;
                default:
                    row.push('');
            }
        });
        rows.push({ values: row });
    });

    return {
        schema: requestedFields.build(),
        rows: rows
    };
}
