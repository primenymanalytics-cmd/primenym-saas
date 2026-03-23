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

    var response;
    try {
        response = UrlFetchApp.fetch(PRIMENYM_API_URL + '/connector/config?connector=shopify', {
            headers: {
                Authorization: 'Bearer ' + getOAuthService().getAccessToken()
            },
            muteHttpExceptions: true
        });
    } catch (e) {
        cc.newUserError()
            .setDebugText('Config fetch failed: ' + e.message)
            .setText('Failed to connect to Primenym. Please try again later.')
            .throwException();
    }

    var statusCode = response.getResponseCode();
    if (statusCode === 403) {
        cc.newUserError()
            .setText('Your Primenym subscription is inactive or expired. Please renew at primenym.com/dashboard.')
            .throwException();
    } else if (statusCode !== 200) {
        cc.newUserError()
            .setDebugText('Config API returned status: ' + statusCode)
            .setText('Could not load your Shopify stores. Please try reconnecting.')
            .throwException();
    }

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

    // --- Order Details ---
    fields.newDimension().setId('order_id').setName('Order ID').setType(types.TEXT);
    fields.newDimension().setId('order_name').setName('Order Name').setType(types.TEXT);
    fields.newDimension().setId('created_at').setName('Created At').setType(types.YEAR_MONTH_DAY_HOUR);
    fields.newDimension().setId('financial_status').setName('Financial Status').setType(types.TEXT);
    fields.newDimension().setId('fulfillment_status').setName('Fulfillment Status').setType(types.TEXT);
    fields.newDimension().setId('sales_channel').setName('Sales Channel').setType(types.TEXT);
    fields.newDimension().setId('payment_gateway').setName('Payment Gateway').setType(types.TEXT);
    fields.newDimension().setId('order_tags').setName('Order Tags').setType(types.TEXT);
    fields.newDimension().setId('currency').setName('Currency').setType(types.TEXT);

    // --- Product & Line Items ---
    fields.newDimension().setId('product_title').setName('Product Title').setType(types.TEXT);
    fields.newDimension().setId('product_id').setName('Product ID').setType(types.TEXT);
    fields.newDimension().setId('sku').setName('SKU').setType(types.TEXT);
    fields.newDimension().setId('variant_title').setName('Variant Title').setType(types.TEXT);
    fields.newDimension().setId('product_type').setName('Product Type/Category').setType(types.TEXT);
    fields.newDimension().setId('vendor_name').setName('Vendor/Brand').setType(types.TEXT);
    fields.newDimension().setId('inventory_location').setName('Inventory Location').setType(types.TEXT);

    // --- Customer Info ---
    fields.newDimension().setId('customer_id').setName('Customer ID').setType(types.TEXT);
    fields.newDimension().setId('customer_type').setName('Customer Type').setType(types.TEXT);
    fields.newDimension().setId('customer_tags').setName('Customer Tags').setType(types.TEXT);
    fields.newDimension().setId('shipping_city').setName('Shipping City').setType(types.TEXT);
    fields.newDimension().setId('shipping_province').setName('Shipping Province').setType(types.TEXT);
    fields.newDimension().setId('shipping_country').setName('Shipping Country').setType(types.TEXT);
    fields.newDimension().setId('billing_city').setName('Billing City').setType(types.TEXT);
    fields.newDimension().setId('billing_province').setName('Billing Province').setType(types.TEXT);
    fields.newDimension().setId('billing_country').setName('Billing Country').setType(types.TEXT);

    // --- Marketing & Attribution ---
    fields.newDimension().setId('utm_source').setName('UTM Source').setType(types.TEXT);
    fields.newDimension().setId('utm_medium').setName('UTM Medium').setType(types.TEXT);
    fields.newDimension().setId('utm_campaign').setName('UTM Campaign').setType(types.TEXT);
    fields.newDimension().setId('referring_site').setName('Referring Site').setType(types.URL);
    fields.newDimension().setId('landing_page_path').setName('Landing Page Path').setType(types.TEXT);
    fields.newDimension().setId('discount_code').setName('Discount Code').setType(types.TEXT);

    // --- Metrics (Numerical Data) ---
    // Sales & Profitability (Line item level)
    fields.newMetric().setId('gross_sales').setName('Gross Sales (Line)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    fields.newMetric().setId('line_discount').setName('Discount (Line)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    fields.newMetric().setId('net_sales').setName('Net Sales (Line)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    // Order Level metrics (Warning: these sum per line item, instruct users to use MAX or AVG in Looker)
    fields.newMetric().setId('order_total_revenue').setName('Total Revenue (Order)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    fields.newMetric().setId('order_refunds').setName('Refunds (Order)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    
    // Order Volume
    fields.newMetric().setId('total_units_sold').setName('Total Units Sold').setType(types.NUMBER).setAggregation(aggregations.SUM);
    
    // Logistics & Other
    fields.newMetric().setId('shipping_amount').setName('Shipping Amount (Order)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    fields.newMetric().setId('tax_amount').setName('Tax Amount (Order)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);
    fields.newMetric().setId('total_tips').setName('Total Tips (Order)').setType(types.CURRENCY_USD).setAggregation(aggregations.SUM);

    return fields;
}

function getSchema(request) {
    var fields = getFields().build();
    return { schema: fields };
}

// =============================================
// DATA
// =============================================

function parseUrlParam(url, param) {
    if (!url) return '';
    var regex = new RegExp('[?&]' + param + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results || !results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getData(request) {
    var cc = DataStudioApp.createCommunityConnector();
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

    var response;
    try {
        response = UrlFetchApp.fetch(url, {
            headers: {
                Authorization: 'Bearer ' + getOAuthService().getAccessToken()
            },
            muteHttpExceptions: true
        });
    } catch (e) {
        cc.newUserError()
            .setDebugText('Data fetch failed: ' + e.message)
            .setText('Failed to fetch Shopify data. Please try again later.')
            .throwException();
    }

    var statusCode = response.getResponseCode();
    if (statusCode === 403) {
        cc.newUserError()
            .setText('Your Primenym subscription is inactive or expired. Please renew at primenym.com/dashboard.')
            .throwException();
    } else if (statusCode === 401) {
        cc.newUserError()
            .setText('Session expired. Please re-authorize the connector.')
            .throwException();
    } else if (statusCode !== 200) {
        cc.newUserError()
            .setDebugText('Data API returned status: ' + statusCode + ' - ' + response.getContentText())
            .setText('Could not fetch Shopify orders. Please try again.')
            .throwException();
    }

    var data = JSON.parse(response.getContentText());
    var rows = [];

    (data.orders || []).forEach(function (order) {
        var lineItems = order.line_items && order.line_items.length > 0 ? order.line_items : [{}]; // Ensure at least 1 row per order
        var lineCount = lineItems.length;

        // Order-level extracted values
        var cust = order.customer || {};
        var bAdd = order.billing_address || {};
        var sAdd = order.shipping_address || {};
        var refunds = order.refunds || [];
        var totalRefunded = refunds.reduce(function(sum, r) {
            return sum + (parseFloat(r.transactions ? (r.transactions[0] ? r.transactions[0].amount : 0) : 0) || 0);
        }, 0);

        var shippingLines = order.shipping_lines || [];
        var totalShipping = shippingLines.reduce(function(sum, sl) { return sum + parseFloat(sl.price || 0); }, 0);
        var totalTips = parseFloat(order.total_tip_received) || 0;
        var discountCodes = order.discount_applications || [];
        var discountCodeName = discountCodes.length > 0 ? discountCodes[0].code || discountCodes[0].title : '';

        // Flatten: emit one row per line item
        lineItems.forEach(function (item) {
            var row = [];
            
            var linePrice = parseFloat(item.price) || 0;
            var lineQty = parseInt(item.quantity) || 0;
            var grossSales = linePrice * lineQty;
            var lineDiscount = parseFloat(item.total_discount) || 0;
            var netSales = grossSales - lineDiscount;

            requestedFields.asArray().forEach(function (field) {
                switch (field.getId()) {
                    // --- Order Dimensions ---
                    case 'order_id': row.push(order.id ? String(order.id) : ''); break;
                    case 'order_name': row.push(order.name || ''); break;
                    case 'created_at':
                        row.push(order.created_at ? order.created_at.replace(/[-:T]/g, '').slice(0, 10) : '');
                        break;
                    case 'financial_status': row.push(order.financial_status || ''); break;
                    case 'fulfillment_status': row.push(order.fulfillment_status || 'unfulfilled'); break;
                    case 'sales_channel': row.push(order.source_name || ''); break;
                    case 'payment_gateway': row.push((order.payment_gateway_names || []).join(', ')); break;
                    case 'order_tags': row.push(order.tags || ''); break;
                    case 'currency': row.push(order.currency || ''); break;

                    // --- Product Dimensions ---
                    case 'product_title': row.push(item.title || item.name || ''); break;
                    case 'product_id': row.push(item.product_id ? String(item.product_id) : ''); break;
                    case 'sku': row.push(item.sku || ''); break;
                    case 'variant_title': row.push(item.variant_title || ''); break;
                    case 'product_type': row.push(item.product_type || ''); break; // Not all shops expose this on line_item
                    case 'vendor_name': row.push(item.vendor || ''); break;
                    case 'inventory_location': row.push(order.location_id ? String(order.location_id) : ''); break;

                    // --- Customer Info ---
                    case 'customer_id': row.push(cust.id ? String(cust.id) : ''); break;
                    case 'customer_type': row.push(cust.orders_count > 1 ? 'Returning' : 'New'); break;
                    case 'customer_tags': row.push(cust.tags || ''); break;
                    case 'shipping_city': row.push(sAdd.city || ''); break;
                    case 'shipping_province': row.push(sAdd.province || ''); break;
                    case 'shipping_country': row.push(sAdd.country || ''); break;
                    case 'billing_city': row.push(bAdd.city || ''); break;
                    case 'billing_province': row.push(bAdd.province || ''); break;
                    case 'billing_country': row.push(bAdd.country || ''); break;

                    // --- Marketing & Attribution ---
                    case 'utm_source': row.push(parseUrlParam(order.landing_site, 'utm_source')); break;
                    case 'utm_medium': row.push(parseUrlParam(order.landing_site, 'utm_medium')); break;
                    case 'utm_campaign': row.push(parseUrlParam(order.landing_site, 'utm_campaign')); break;
                    case 'referring_site': row.push(order.referring_site || ''); break;
                    case 'landing_page_path': row.push(order.landing_site || ''); break;
                    case 'discount_code': row.push(discountCodeName); break;

                    // --- Metrics ---
                    case 'gross_sales': row.push(grossSales); break;
                    case 'line_discount': row.push(lineDiscount); break;
                    case 'net_sales': row.push(netSales); break;
                    
                    // Order-level metrics (Divide by lineCount to prevent sum inflation when rolled up!)
                    case 'order_refunds': row.push(totalRefunded / lineCount); break;
                    case 'order_total_revenue': row.push((parseFloat(order.total_price) || 0) / lineCount); break;
                    case 'shipping_amount': row.push(totalShipping / lineCount); break;
                    case 'tax_amount': row.push((parseFloat(order.total_tax) || 0) / lineCount); break;
                    case 'total_tips': row.push(totalTips / lineCount); break;
                    
                    case 'total_units_sold': row.push(lineQty); break;
                    
                    default:
                        row.push('');
                }
            });
            rows.push({ values: row });
        });
    });

    return {
        schema: requestedFields.build(),
        rows: rows
    };
}
