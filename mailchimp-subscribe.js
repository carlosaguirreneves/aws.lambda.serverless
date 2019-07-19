'use strict';

const mailchimpEnum = require('./commons/src/model/enum/MailchimpEnum');
const mailchimpService = require('./commons/src/service/MailchimpService');
const util = require('./commons/src/util/Util');

module.exports.addSubscribe = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.body) {
        console.log('error.add.subscribe.badrequest', 'Request inválido - {event ou event.body} não encontrado na solicitação.');
        return callback(null, util.prepareLambdaReturn(400, 'error.add.subscribe.badrequest', null));
    }

    let subscribe = JSON.parse(event.body);
    
    let email = subscribe.email;
    let uniqueId = mailchimpEnum.getUniqueId(subscribe.uniqueId);

    addSubscribe(email, uniqueId, function (data) {
        callback(null, util.prepareLambdaReturn(data.statusCode, data.message, {}));
    });
};

const addSubscribe = async (email, uniqueId, callback) => {
    let subscribed = await mailchimpService.subscribe(email, uniqueId);

    let data = {
        statusCode: subscribed ? 200: 500,
        message: subscribed ? 'mailchimp.add.subscribe.success': 'mailchimp.add.subscribe.error'
    }

    callback(data);
}