"use strict";

const axios = require('axios');

const subscribe = async (email, uniqueId) => {
    let mailchimpApi = process.env.mailchimpApi;
    let mailchimpApiKey = process.env.mailchimpApiKey;

    let config = {
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            'Authorization': 'Basic ' + new Buffer('any:' + mailchimpApiKey).toString('base64')
        }
    }

    let body = {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
            FNAME: '',
            LNAME: ''
        }
    }

    let url = mailchimpApi + '3.0/lists/' + uniqueId + '/members/';
    
    try {
        let result = await axios.post(url, body, config);
        if (result.data.status === 'subscribed') {
            return true;
        }
        
        console.log('AddSubscribe Error - Email=' + email + ' - UniqueId=' + uniqueId, result.data);
        return false;
    } catch (ex) {
        if (ex.response && ex.response.data 
            && ex.response.data.status === 400 
            && ex.response.data.title === 'Member Exists') {
            return true;
        }

        console.log('Assinatura não realizada', {
            email: email,
            uniqueId: uniqueId,
            err: ex
        });
    }
    
    return false;
}

module.exports = {
    subscribe
};