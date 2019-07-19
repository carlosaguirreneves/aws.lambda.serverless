'use strict';

const util = require('./commons/src/util/Util');
const AlertaPreco = require('./commons/src/model/AlertaPreco');
const alertaDePrecosService = require('./commons/src/service/AlertaDePrecosService');

module.exports.sendAlertaDePrecos = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.body) {
        console.log("error.send.alerta.badrequest", "Request inválido - {event ou event.body} não encontrado na solicitação.");
        return callback(null, util.prepareLambdaReturn(400, "error.send.alerta.badrequest", null));
    }

    let alerta = event.body;

    if (!alerta.email || !alerta.origem || !alerta.destino || alerta.idaVolta === null || alerta.idaVolta === undefined || !alerta.mes || !alerta.ano) {
        console.log("error.send.alerta.badrequest", "Os seguintes campos são obrigatórios: {email, origem, destino, idaVolta, mes, ano}");
        console.log("Dados do alerta enviado:", {
            email: alerta.email,
            origem: alerta.origem,
            destino: alerta.destino,
            idaVolta: alerta.idaVolta,
            mes: alerta.mes,
            ano: alerta.ano
        });
        return callback(null, util.prepareLambdaReturn(400, "error.send.alerta.badrequest", null));
    }

    alertaDePrecosService.sendAlertaPrecos(new AlertaPreco(alerta)).then(result => {
        callback(null, util.prepareLambdaReturn(200, "send.alerta.precos.success", {}));
    }).catch(err => {
        console.log("error.send.alerta.precos", err);
        callback(null, util.prepareLambdaReturn(200, "error.send.alerta.precos", {}));
    });
};

