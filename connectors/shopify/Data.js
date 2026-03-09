function getData(request) {
    var storeId = request.configParams.store_id;

    var requestedFields = getFields().forIds(
        request.fields.map(function (field) {
            return field.name;
        })
    );

    // Example: requesting data from Primenym backend
    var url = 'https://primenym.com/api/connector/shopify/data?storeId=' + storeId;

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

    // Structure data for Looker Studio based on requested fields
    data.orders.forEach(function (order) {
        var row = [];
        requestedFields.asArray().forEach(function (field) {
            switch (field.getId()) {
                case 'order_id':
                    row.push(order.id);
                    break;
                case 'created_at':
                    // Convert ISO to YYYYMMDDHH format
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
