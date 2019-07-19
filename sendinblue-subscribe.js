'use strict';

const sendInBlueEnum = require('./commons/src/model/enum/SendInBlueEnum');
const sendInBlueService = require('./commons/src/service/SendInBlueService');
const util = require('./commons/src/util/Util');

module.exports.addSubscribe = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.body) {
        console.log('error.add.subscribe.badrequest', 'Request inválido - {event ou event.body} não encontrado na solicitação.');
        return callback(null, util.prepareLambdaReturn(400, 'error.add.subscribe.badrequest', null));
    }

    let subscribe = JSON.parse(event.body);
    
    let email = subscribe.email;
    let uniqueId = sendInBlueEnum.getUniqueId(subscribe.uniqueId);

    addSubscribe(email, uniqueId, function (data) {
        callback(null, util.prepareLambdaReturn(data.statusCode, data.message, {}));
    });
};

const addSubscribe = async (email, uniqueId, callback) => {
    let subscribed = await sendInBlueService.subscribe(email, uniqueId);

    let data = {
        statusCode: subscribed ? 200: 500,
        message: subscribed ? 'sendinblue.add.subscribe.success': 'sendinblue.add.subscribe.error'
    }

    callback(data);
}