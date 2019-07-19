'use strict';

const linhaAereaService = require('./commons/src/service/LinhaAereaService');
const util = require('./commons/src/util/Util');

module.exports.snsComplaintsEmail = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.Records || event.Records.length == 0 || !event.Records[0].Sns) {
        console.log('error.snscomplaint.badrequest', 'Request inválido - {event ou event.Records[0].Sns} não encontrado na solicitação.');
        return callback(null, util.prepareLambdaReturn(400, 'error.snscomplaint.badrequest', null));
    }

    let sns = event.Records[0].Sns;

    console.log("SNSComplaint ======= ", sns);
    console.log("Stage======", process.env.stage);

    let message = JSON.parse(sns.Message);
    console.log("Message", message);
    

    callback(null, util.prepareLambdaReturn(200, "snscomplaint.success", {}));
};