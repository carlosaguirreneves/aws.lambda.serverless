'use strict';

const util = require('./commons/src/util/Util');
const alertaDePrecosService = require('./commons/src/service/AlertaDePrecosService');

module.exports.snsBouncesEmail = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.Records || event.Records.length == 0 || !event.Records[0].Sns) {
        console.log('error.snsbounces.badrequest', 'Request inválido - {event ou event.Records[0].Sns} não encontrado na solicitação.');
        return callback(null, util.prepareLambdaReturn(400, 'error.snsbounces.badrequest', null));
    }

    let sns = event.Records[0].Sns;

    console.log("Stage======", process.env.stage);

    let message = JSON.parse(sns.Message);

    removerAlertaByEmails(message).then(result => {
        callback(null, util.prepareLambdaReturn(200, "snsbounce.success", {}));
    }).catch(err => {
        console.log(err);
        callback(null, util.prepareLambdaReturn(200, "error.snsbounce", {}));
    });
};

const removerAlertaByEmails = async (message) => {
    if (message && message.bounce && message.bounce.bouncedRecipients) {
        if (message.bounce.bounceType === 'Permanent') {
            for (let i = 0; i < message.bounce.bouncedRecipients.length; i++) {
                let recipient = message.bounce.bouncedRecipients[i];
                let alertas = await alertaDePrecosService.getAlertaPrecosByEmail(recipient.emailAddress);
                
                if (alertas.length == 0) {
                    alertas = await alertaDePrecosService.getAlertaPrecosByEmail(recipient.emailAddress + " ");
                    console.log("Encontrou e-mail com espaço no final.");
                }
                
                for (let j = 0; j < alertas.length; j++) {
                    let alerta = alertas[j];
                    await alertaDePrecosService.deleteAlerta(alerta.id);
                }

                console.log("Alertas Removidos:", {
                    email: recipient.emailAddress,
                    alertas: alertas.length
                });
            }
        }
    }
}