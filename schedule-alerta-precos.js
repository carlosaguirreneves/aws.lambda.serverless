'use strict';

const moment = require('moment');
const util = require('./commons/src/util/Util');
const lambda = require('./commons/src/util/aws/Lambda');
const AlertaPreco = require('./commons/src/model/AlertaPreco');
const alertaDePrecosService = require('./commons/src/service/AlertaDePrecosService');

let alertaCount = 0;

module.exports.sendAllAlertasDePrecos = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    getAlertaPrecosByFilter(function () {
        callback(null, util.prepareLambdaReturn(200, "send.all.alertas.precos.success", {}));
    });
};

const getAlertaPrecosByFilter = async (callback) => {
    let expirateds = 0;
    let alertas = await alertaDePrecosService.getAlertaPrecosByFilter(100);

    for (let i = 0; i < alertas.length; i++) {
        try {
            let alerta = alertas[i];
            if (alerta.isExpirated()) {
                expirateds++;
                alertaDePrecosService.deleteAlerta(alerta.id);
                continue;
            }
            
            await lambda.invokeLambdaAsync(alerta, "sendAlertaDePrecos");
        } catch (ex) {
            console.log("error.invoke.lambda.sendAlertaDePrecos", ex);
        }
    }

    console.log("Resumo de Disparo: ", {
        qtdAlertas: alertas.length,
        expirateds: expirateds,
        disparados: (alertas.length - expirateds)
    });

    callback();
}

const getAllAlertasRecursive = async (pageSize, pageToken, callback) => {
    try {
        let result = await alertaDePrecosService.getAllAlertaPrecosPaginated(pageSize, pageToken);
        alertaCount += result.alertaPrecos.length;
        console.log("===============AlertaCount================", alertaCount);

        for (let i = 0; i < result.alertaPrecos.length; i++) {
            try {
                let alerta = result.alertaPrecos[i];
                if (alerta.isExpirated()) {
                    alertaDePrecosService.deleteAlerta(alerta.id);
                    continue;
                }
                
                await lambda.invokeLambdaAsync(alerta, "sendAlertaDePrecos");
            } catch (ex) {
                console.log("error.invoke.lambda.sendAlertaDePrecos", ex);
            }
        }
    
        if (result.nextPageToken) {
            getAllAlertasRecursive(pageSize, result.nextPageToken, callback);
        } else {
            console.log("===============AlertaCountFinish================", alertaCount);
            callback({});
        }
    } catch (ex) {
        console.log("error.getAllEmails", ex);
        callback({erro: ex});
    }
};
