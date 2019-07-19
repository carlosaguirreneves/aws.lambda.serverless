const util = require('../util/Util');
const DestinoDesejado = require('./DestinoDesejado');

class Cliente {
    constructor(cliente = null) {
        this.alertas = [];

        if (!cliente) {
            return;
        }

        this.id = cliente.id;
        this.email = cliente.email;

        cliente.alertas.forEach(alerta => {
            this.alertas.push(new DestinoDesejado(alerta));
        });
    }

    static fromFirestore(firestore) {
        let clientes = [];

        console.log(firestore.data)

        if (!firestore.data) {
            return clientes;
        }

        for (let i = 0; i < firestore.data.documents.length; i++) {
            clientes.push(this.fromFirestoreOne(firestore.data.documents[i]));
        }

        return clientes;
    }

    static fromFirestoreOne(document) {
        let cliente = new Cliente();

        cliente.id = document.name.substring(document.name.lastIndexOf('/') + 1);
        cliente.email = document.fields.email.stringValue;

        if (document.fields.alertas) {
            for (let i = 0; i < document.fields.alertas.arrayValue.values.length; i++) {
                let alerta = document.fields.alertas.arrayValue.values[i];

                let destino = new DestinoDesejado();
                destino.origem = alerta.mapValue.fields.origem.stringValue;
                destino.destino = alerta.mapValue.fields.destino.stringValue;
                destino.idaVolta = alerta.mapValue.fields.idaVolta.booleanValue;
                destino.mes = alerta.mapValue.fields.mes.integerValue;
                destino.ano = alerta.mapValue.fields.ano.integerValue;

                cliente.alertas.push(destino);
            }
        }

        return cliente;
    }

    toFirestore() {
        let cliente = {};

        cliente.email = {
            "stringValue": this.email
        };

        let alertas = [];

        if (this.alertas) {
            for (let i = 0; i < this.alertas.length; i++) {
                let alerta = this.alertas[i];
                alertas.push(this.createAlertaMap(alerta.origem, alerta.destino, alerta.mes, alerta.ano, alerta.idaVolta));
            }
        }

        if (alertas.length > 0) {
            cliente.alertas = {
                'arrayValue': {
                    'values': alertas
                }
            }
        }

        let clienteDB = {}
        clienteDB.fields = cliente;

        return clienteDB;
    }

    createAlertaMap(origem, destino, mes, ano, idaVolta) {
        let estatistica = {
            'mapValue': {
                'fields': {
                    'origem': {
                        'stringValue': origem
                    },
                    'destino': {
                        'stringValue': destino
                    },
                    'ano': {
                        'integerValue': parseInt(ano)
                    },
                    'mes': {
                        'integerValue': parseInt(mes)
                    },
                    'idaVolta': {
                        'booleanValue': idaVolta
                    }
                }
            }
        }
        return estatistica;
    }
}

module.exports = Cliente;