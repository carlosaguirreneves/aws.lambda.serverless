"use strict";

const axios = require('axios');
const util = require('../util/Util');
const Cliente = require('../model/Cliente');
const firebaseRest = require('../util/google/FirebaseRest');

const insertOrUpdate = async (cliente) => {
    try {
        let clienteNew = null;

        let clienteBD = await getById(cliente.email);
        if (clienteBD) {
            let clienteMerge = {...cliente, ...clienteBD}

            if (!clienteMerge.alertas) {
                clienteMerge.alertas = [];
            }

            if (cliente.alertas) {
                clienteMerge.alertas.push(...cliente.alertas);
            }

            clienteNew = new Cliente(clienteMerge);
        } else {
            cliente.id = util.generateChecksum(cliente.email);
            clienteNew = new Cliente(cliente);
        }

        let url = firebaseRest.getUrlBaseWith('clientes/' + clienteNew.id);
        return await axios.patch(url, clienteNew.toFirestore());
    } catch (ex) {
        console.log(ex);
        throw new Error("error.firebase.cliente.insertOrUpdate " + ex);
    }
}

const getById = async (email) => {
    let id = util.generateChecksum(email);
    let url = firebaseRest.getUrlBaseWith('clientes/' + id);

    try {
        let result = await axios.get(url);
        return Cliente.fromFirestoreOne(result.data);
    } catch (ex) {
        if (ex.response 
            && ex.response.data 
            && ex.response.data.error 
            && ex.response.data.error.code === 404) {
            return null;
        }
        throw ex;
    }
}

const findByEmail = async (email) => {
    let where = {
        "structuredQuery": {
            "from": [
                {
                    "collectionId": "clientes"
                }
            ],
            "where": {
                "fieldFilter": {
                    "field": {
                        "fieldPath": "email"
                    },
                    "op": "EQUAL",
                    "value": {
                        "stringValue": email
                    }
                }
            }
        }
    }

    let url = firebaseRest.getUrlBaseRunQuery();
    let clientes = await axios.post(url, where);

    Cliente.fromFirestore(clientes);

    return null;
}

module.exports = {
    getById,
    findByEmail,
    insertOrUpdate
}