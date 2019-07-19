"use strict";

const SibApiV3Sdk = require('sib-api-v3-sdk');

const subscribe = async (email, uniqueId) => {
    try {
        let defaultClient = SibApiV3Sdk.ApiClient.instance;
        
        let apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.sendInBlueApiKey;

        let apiInstance = new SibApiV3Sdk.ContactsApi();

        let createContact = new SibApiV3Sdk.CreateContact();
        createContact.email = email;
        createContact.listIds = [uniqueId];

        await apiInstance.createContact(createContact);
        return true;
    } catch (error) {
        if (error.response && error.response.body 
            && error.response.body.code === 'duplicate_parameter') {
            return true;
        }
        console.log('Assinatura não realizada', {
            email: email,
            uniqueId: uniqueId,
            err: error
        });
    }

    return false;
}

module.exports = {
    subscribe
};