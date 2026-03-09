function getConfig(request) {
    var cc = DataStudioApp.createCommunityConnector();
    var config = cc.getConfig();

    // Fetch configured stores from Primenym API using OAuth token
    var response = UrlFetchApp.fetch('https://primenym.com/api/connector/config?connector=shopify', {
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
