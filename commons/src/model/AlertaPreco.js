const moment = require('moment');
const util = require('../util/Util');

class AlertaPreco {
    constructor (alertaPreco = AlertaPreco) {
        if (!alertaPreco) {
            return;
        }

        this.id = alertaPreco.id;
        this.email = alertaPreco.email;
        this.origem = alertaPreco.origem;
        this.destino = alertaPreco.destino;
        this.idaVolta = alertaPreco.idaVolta;
        this.mes = alertaPreco.mes;
        this.dias = alertaPreco.dias;
        this.ano = alertaPreco.ano;
        this.dataPartida = alertaPreco.dataPartida;
        this.dataEnvioAlerta = alertaPreco.dataEnvioAlerta;
    }

    static fromFirestore (firestore) {

        let alertaPrecos = [];

        if (!firestore.data) {
            return alertaPrecos;
        }

        if (firestore.data.documents) {
            for (let i = 0; i < firestore.data.documents.length; i++) {
                alertaPrecos.push(this.fromFirestoreOne(firestore.data.documents[i]));
            }
        }

        return alertaPrecos;
    }

    static fromFirestorePost (firestore) {
        let alertaPrecos = [];

        if (!firestore || !firestore.data) {
            return alertaPrecos;
        }

        for (let i = 0; i < firestore.data.length; i++) {
            if (!firestore.data[i] 
                || !firestore.data[i].document 
                || !firestore.data[i].document.name) {
                continue;
            }

            alertaPrecos.push(this.fromFirestoreOne(firestore.data[i].document));
        }

        return alertaPrecos;
    }

    static fromFirestoreOne (document) {
        let alertaPreco = new AlertaPreco();

        alertaPreco.id =  document.name.substring(document.name.lastIndexOf('/') + 1);
        alertaPreco.email = document.fields.email.stringValue;
        alertaPreco.origem = document.fields.origem.stringValue;
        alertaPreco.destino = document.fields.destino.stringValue;
        alertaPreco.idaVolta = document.fields.idaVolta.booleanValue;
        alertaPreco.mes = document.fields.mes.integerValue;
        alertaPreco.ano = document.fields.ano.integerValue;

        if (document.fields.dias) {
            alertaPreco.dias = document.fields.dias.integerValue;
        }

        if (document.fields.dataEnvioAlerta) {
            alertaPreco.dataEnvioAlerta = document.fields.dataEnvioAlerta.timestampValue;
        }

        if (document.fields.dataPartida) {
            alertaPreco.dataPartida = document.fields.dataPartida.integerValue;
        }
    
        return alertaPreco;
    }

    generateHash() {
        let values = this.email 
            + this.origem 
            + this.destino
            + this.idaVolta
            + this.mes
            + ((this.dias) ? this.dias : "")
            + this.ano
            + ((this.dataPartida) ? this.dataPartida : "");
            
        return util.generateChecksum(values);
    }

    isExpirated() {
        let dataPartida = null;

        if (this.dataPartida) {
            dataPartida = moment(new Date(this.ano, this.mes -1, this.dataPartida));
        } else {
            dataPartida = moment(new Date(this.ano, this.mes -1, 28));
        }

        return dataPartida.isBefore(moment());
    }

    toFirestore() {
        let alerta = {};

        if (this.email)
            alerta.email = {
                "stringValue": this.email
            };
    
        if (this.origem)
            alerta.origem = {
                "stringValue": this.origem
            };
    
        if (this.destino)
            alerta.destino = {
                "stringValue": this.destino
            };
    
        
        alerta.idaVolta = {
            "booleanValue": false
        };

        if (this.idaVolta) {
            alerta.idaVolta = {
                "booleanValue": this.idaVolta
            };
        }
    
        if (this.mes)
            alerta.mes = {
                "integerValue": parseInt(this.mes)
            };
    
        if (this.dias)
            alerta.dias = {
                "integerValue": parseInt(this.dias)
            };
        
        if (this.ano)
            alerta.ano = {
                "integerValue": parseInt(this.ano)
            };
    
        if (this.dataPartida)
            alerta.dataPartida = {
                "integerValue": parseInt(this.dataPartida)
            };

        if (this.dataEnvioAlerta)
            alerta.dataEnvioAlerta = {
                "timestampValue": this.dataEnvioAlerta
            };
    
        let alertaDB = {}
        alertaDB.fields = alerta;
    
        return alertaDB;
    }
}

module.exports = AlertaPreco;