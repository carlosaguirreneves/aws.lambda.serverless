"use strict";

const axios = require('axios');
const moment = require('moment');
const util = require('../util/Util');
const firebaseRest = require('../util/google/FirebaseRest');
const mail = require('../util/aws/Mail');
const agentEnum = require('../model/enum/AgentEnum');
const AlertaPreco = require('../model/AlertaPreco');
const flightCheapestTemplate = require('../template/AlertaDePrecosPorDatas');
const cheapestQuoteService = require('./CheapestQuoteService');

const getAllAlertaPrecosPaginated = async (pageSize, pageToken) => {
    try {
        let pageTokenQuery = (pageToken) ? "&pageToken=" + pageToken : "";

        let url = firebaseRest.getUrlBaseWith("alertadeprecos?pageSize=" + pageSize + pageTokenQuery);
        let result = await axios.get(url);
        
        let nextPageToken = null;
        if (result.data && result.data.nextPageToken) {
            nextPageToken = result.data.nextPageToken;
        }

        return {
            alertaPrecos: AlertaPreco.fromFirestore(result),
            nextPageToken: nextPageToken
        }
    } catch (ex) {
        throw new Error("error.firebase.getallalertaprecos" + ex);
    }
}

const getAlertaPrecosByFilter = async (limit) => {
    moment.locale("pt-BR");
    let lastDate = moment().subtract(3, 'days').toDate();

    let where = {
        "structuredQuery": {
            "from": [
                {
                    "collectionId": "alertadeprecos"
                }
            ],
            "where": {
                "fieldFilter": {
                    "field": {
                        "fieldPath": "dataEnvioAlerta"
                    },
                    "op": "LESS_THAN_OR_EQUAL",
                    "value": {
                        "timestampValue": lastDate
                    }
                }
            },
            "limit": limit
        }
    }

    let urlTotal = firebaseRest.getUrlBaseRunQuery();
    let result = await axios.post(urlTotal, where);

    return AlertaPreco.fromFirestorePost(result);
}

const getAlertaPrecosByEmail = async (email) => {
    let where = {
        "structuredQuery": {
            "from": [
                {
                    "collectionId": "alertadeprecos"
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

    let urlTotal = firebaseRest.getUrlBaseRunQuery();
    let result = await axios.post(urlTotal, where);

    return AlertaPreco.fromFirestorePost(result);
}

const sendAlertaPrecos = async (alerta) => {
    try {
        moment.locale("pt-BR");

        let result = await cheapestQuoteService.getAllForApiBy(alerta.origem, alerta.destino, alerta.idaVolta, alerta.mes, alerta.dias);
        if (!result.data || result.data.length == 0) {
            alerta.dataEnvioAlerta = moment().subtract(2, 'days').toDate();
            await insertOrUpdate(alerta);
            return;
        }

        let cityPair = result.data[0];

        let flightInfo = {
            destination: cityPair.DestinationLocation,
            origin: cityPair.OriginLocation,
            airCompanies: cityPair.AirCompaniesReference
        }

        let flightCheapestQuotes = createFlightCheapestQuote(cityPair, alerta);
        if (flightCheapestQuotes.length > 0) {
            let nomeDoMes = "";
            if (alerta.mes) {
                nomeDoMes = " em " + moment(new Date(alerta.ano, alerta.mes -1, 1)).format('MMMM');
            }

            let bestPrices = await cheapestQuoteService.getAllBestPrices(alerta.origem);
            let idCliente = util.generateChecksum(alerta.email);

            alerta.dataEnvioAlerta = new Date();
            insertOrUpdate(alerta);

            let assunto = "Quando Viajar para " + flightInfo.destination.City + nomeDoMes;
            const htmlBody = flightCheapestTemplate(flightCheapestQuotes, bestPrices.data, flightInfo, idCliente);
            await mail.sendEmail(process.env.noreply, [alerta.email], assunto, htmlBody);
        } else {
            alerta.dataEnvioAlerta = moment().subtract(2, 'days').toDate();
            await insertOrUpdate(alerta);
        }
    } catch (ex) {
        console.log(ex);
        throw new Error("error.alerta.sendalertaprecos" + ex);
    }
}

const insertOrUpdate = async (alerta = AlertaPreco) => {
    try {
        if (alerta.id) {
            let url = firebaseRest.getUrlBaseWith('alertadeprecos/' + alerta.id);
            return await axios.patch(url, alerta.toFirestore());
        } else {
            let url = firebaseRest.getUrlBaseWith('alertadeprecos?documentId=');
            return await axios.post(url, alerta.toFirestore());
        }
    } catch (ex) {
        throw new Error("error.firebase.insert " + ex);
    }
}

const deleteAlerta = async (idDocument) => {
    try {
        let url = firebaseRest.getUrlBaseWith('alertadeprecos/' + idDocument);
        return await axios.delete(url);
    } catch (ex) {
        throw new Error("error.firebase.insert " + ex);
    }
}

const createFlightCheapestQuote = (cityPair, alerta) => {

    let flightCheapestQuotes = [];

    if (!cityPair || !cityPair.PricesDates || cityPair.PricesDates.length == 0) {
        console.log("========= EmptyFlightCheapestQuote =========", alerta);
        return flightCheapestQuotes;
    }

    if (cityPair.PricesDates) {
        let dataPartida = null;
        let rangeMin = null;
        let rangeMax = null;

        if (alerta.dataPartida) {
            dataPartida = new Date(alerta.ano, alerta.mes -1, alerta.dataPartida);
            rangeMin = moment(dataPartida).subtract(5, 'days');
            rangeMax = moment(dataPartida).add(5, 'days');
        } else {
            dataPartida = new Date(alerta.ano, alerta.mes -1);
            rangeMin = moment(dataPartida);
            rangeMax = moment(dataPartida).add(1, 'months');
        }

        for (let j = 0; j < cityPair.PricesDates.length; j++) {
            let priceDate = cityPair.PricesDates[j];

            if (moment().subtract(7, 'hours') >= moment(priceDate.Created)) {
                continue;
            }
            
            let departure = moment(priceDate.Departure);
            if (departure.isBefore(rangeMin) || departure.isAfter(rangeMax)) {
                continue;
            }

            if (priceDate.BestPrices && priceDate.BestPrices.length > 0) {
                let bestPricesOrdenaded = priceDate.BestPrices.sort(function(a, b) {
                    let v1 = a.Value + a.Fee + a.Tax;
                    let v2 = b.Value + b.Fee + b.Tax
                    return v1-v2;
                });

                for (let l = 0; l < bestPricesOrdenaded.length; l++) {
                    let bestPrice = bestPricesOrdenaded[l];

                    let flightCheapestQuote = {
                        agent: agentEnum.AgenciaDeViagens,
                        createDate: priceDate.Created,
                        departureDate: priceDate.Departure,
                        originStationCode: bestPrice.Origin,
                        originCityCode: cityPair.Origin,
                        destinationStationCode: bestPrice.Destination,
                        destinationCityCode: cityPair.Destination,
                        carrierCode: bestPrice.AirCompany,
                        minPrice: bestPrice.Value + bestPrice.Fee + bestPrice.Tax
                    };
                    
                    if (alerta.idaVolta) {
                        flightCheapestQuote.return = {
                            agent: agentEnum.AgenciaDeViagens,
                            departureDate: priceDate.Arrival,
                            originStationCode: bestPrice.Destination,
                            originCityCode: cityPair.Destination,
                            destinationStationCode: bestPrice.Origin,
                            destinationCityCode: cityPair.Origin,
                            carrierCode: bestPrice.AirCompany
                        };
                    }

                    flightCheapestQuotes.push(flightCheapestQuote);

                    break;
                }
            }
        }
    }

    if (flightCheapestQuotes.length > 0) {
        let flightsOrdenaded = flightCheapestQuotes.sort(function(a, b) {
            return a.minPrice - b.minPrice;
        });

        flightCheapestQuotes = flightsOrdenaded.slice(0, 5);
    }

    return flightCheapestQuotes;
}

module.exports = {
    getAllAlertaPrecosPaginated,
    getAlertaPrecosByFilter,
    getAlertaPrecosByEmail,
    sendAlertaPrecos,
    insertOrUpdate,
    deleteAlerta
}