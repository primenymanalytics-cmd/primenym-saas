function getFields() {
    var cc = DataStudioApp.createCommunityConnector();
    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    // DIMENSIONS
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

    // METRICS
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
