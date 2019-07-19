'use strict';

const moment = require('moment');
const util = require('./commons/src/util/Util');
const Cliente = require('./commons/src/model/Cliente');
const AlertaPreco = require('./commons/src/model/AlertaPreco');
const DestinoDesejado = require('./commons/src/model/DestinoDesejado');
const sendInBlueEnum = require('./commons/src/model/enum/SendInBlueEnum');
const alertaDePrecosService = require('./commons/src/service/AlertaDePrecosService');
const clienteService = require('./commons/src/service/ClienteService');
const sendInBlueService = require('./commons/src/service/SendInBlueService');

module.exports.insertAlertaDePrecos = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!event || !event.body) {
        console.log("error.insert.alerta.badrequest", "Request inválido - {event ou event.body} não encontrado na solicitação.");
        return callback(null, util.prepareLambdaReturn(400, "error.insert.alerta.badrequest", null));
    }

    let alerta = new AlertaPreco(JSON.parse(event.body));

    if (!alerta.email || !alerta.origem || !alerta.destino || alerta.idaVolta === null || alerta.idaVolta === undefined || !alerta.mes || !alerta.ano) {
        console.log("error.insert.alerta.badrequest", "Os seguintes campos são obrigatórios: {email, origem, destino, idaVolta, mes, ano}");
        console.log("Dados do alerta enviado:", {
            email: alerta.email,
            origem: alerta.origem,
            destino: alerta.destino,
            idaVolta: alerta.idaVolta,
            mes: alerta.mes,
            ano: alerta.ano
        });
        return callback(null, util.prepareLambdaReturn(400, "error.insert.alerta.badrequest", null));
    }

    inserirAlertaDePrecos(alerta).then(result => {
        callback(null, util.prepareLambdaReturn(200, "insert.alerta.precos.success", {}));
    }).catch(err => {
        console.log('error.insert.alerta.precos', err);
        callback(null, util.prepareLambdaReturn(200, "error.insert.alerta.precos", {}));
    });
};

const inserirAlertaDePrecos = async (alerta) => {
    try {
        alerta.email = alerta.email.trim();
        alerta.dataEnvioAlerta = moment().subtract(1, 'days').toDate();

        await alertaDePrecosService.insertOrUpdate(alerta);
        
        let cliente = new Cliente();
        cliente.email = alerta.email;

        cliente.alertas = [];

        let destino = new DestinoDesejado({
            origem: alerta.origem,
            destino: alerta.destino,
            idaVolta: alerta.idaVolta,
            mes: alerta.mes,
            ano: alerta.ano
        });

        cliente.alertas.push(destino);

        await clienteService.insertOrUpdate(cliente);

        let uniqueId = sendInBlueEnum.memberListEnum.AlertaDePrecos;
        await sendInBlueService.subscribe(alerta.email, uniqueId);
    } catch (ex) {
        throw ex;
    }
}
