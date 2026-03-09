var PRIMENYM_API_URL = 'https://primenym.com/api'; // Replace with the actual deployed URL
var OAUTH_CLIENT_ID = 'looker_studio_client';
var OAUTH_CLIENT_SECRET = 'looker_studio_secret'; // In a real app, this should be handled securely

function getAuthType() {
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
