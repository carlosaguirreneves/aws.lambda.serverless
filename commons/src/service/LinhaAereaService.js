'use strict';

const axios = require('axios');
const LinhaAerea = require('../model/LinhaAerea');
const RotaAerea = require('../model/RotaAerea');
const Lugar = require('../model/Lugar');
const util = require('../util/Util');
const firebaseRest = require('../util/google/FirebaseRest');

const getAirLinhasByRotes = (routes) => {
    let linhasAereas = [];

    if (routes.PricesDates) {
        for (let i = 0; i < routes.PricesDates.length; i++) {
            let pricesDates = routes.PricesDates[i];
            if (pricesDates.BestPrices) {
                for (let j = 0; j < pricesDates.BestPrices.length; j++) {
                    let bestPrices = pricesDates.BestPrices[j];

                    let linhaAerea = new LinhaAerea();
                    linhaAerea.code = bestPrices.AirCompany;
                    linhaAerea.nome = routes.AirCompaniesReference[bestPrices.AirCompany];

                    if (bestPrices.AirCompanyName) {
                        linhaAerea.nome = bestPrices.AirCompanyName;
                        linhaAerea.logo = bestPrices.AirCompanyImage;
                        linhaAerea.logoIcon = bestPrices.AirCompanyImageIcon;
                    }

                    let rota = new RotaAerea();
                    rota.id = routes.Origin + '_' + routes.Destination;
                    rota.isInternational = routes.IsInternational;

                    rota.origem = new Lugar();
                    rota.origem.iata = routes.Origin;
                    rota.origem.cidade = routes.OriginLocation.City;
                    rota.origem.estado = routes.OriginLocation.State;
                    rota.origem.pais = routes.OriginLocation.Country;
                    rota.origem.continente = routes.OriginLocation.Continent;
                    rota.origem.nome = routes.OriginLocation.Name;
                    rota.origem.isoPais = routes.OriginLocation.ISOCountry;
                    rota.origem.isoContinent = routes.OriginLocation.ISOContinent;
                    rota.origem.latitude = routes.OriginLocation.Latitude;
                    rota.origem.longitude = routes.OriginLocation.Longitude;
                    rota.origem.isInternacional = routes.OriginLocation.IsInternational;
                    rota.origem.tipoLocal = routes.OriginLocation.LocationType;
                    rota.origem.tipo = routes.OriginLocation.Type;

                    rota.destino = new Lugar();
                    rota.destino.iata = routes.Destination;
                    rota.destino.cidade = routes.DestinationLocation.City;
                    rota.destino.estado = routes.DestinationLocation.State;
                    rota.destino.pais = routes.DestinationLocation.Country;
                    rota.destino.continente = routes.DestinationLocation.Continent;
                    rota.destino.nome = routes.DestinationLocation.Name;
                    rota.destino.isoPais = routes.DestinationLocation.ISOCountry;
                    rota.destino.isoContinent = routes.DestinationLocation.ISOContinent;
                    rota.destino.latitude = routes.DestinationLocation.Latitude;
                    rota.destino.longitude = routes.DestinationLocation.Longitude;
                    rota.destino.isInternacional = routes.DestinationLocation.IsInternational;
                    rota.destino.tipoLocal = routes.DestinationLocation.LocationType;
                    rota.destino.tipo = routes.DestinationLocation.Type;
                    
                    linhaAerea.rotas.push(rota);
                    linhasAereas.push(linhaAerea);
                }
            }
        }
    }

    return linhasAereas;
}

const insertOrUpdateAll = async (linhasAereas) => {
    try {
        for (let i = 0; i < linhasAereas.length; i++) {
            let linhaAerea = linhasAereas[i];
            try {
                await insertOrUpdate(linhaAerea);
            } catch (ex) {
                console.log(ex);
            }
        }
    } catch (ex) {
        throw new Error('error.firebase.linhasaereas.insertAll' + ex);
    }
}

const insertOrUpdate = async (linhaAerea) => {
    try {
        let rotas = [...linhaAerea.rotas];
        linhaAerea.rotas = null;

        for (let i = 0; i < rotas.length; i++) {
            let rota = rotas[i];
            
            let url = firebaseRest.getUrlBaseWith('linhasaereas/' + linhaAerea.code + '/rotas/' + rota.id);
            axios.patch(url, rota.toFirestore());

            let urlLugarOrigem = firebaseRest.getUrlBaseWith('lugares/' + rota.origem.iata);
            axios.patch(urlLugarOrigem, rota.origem.toFirestore());

            let urlLugarDestino = firebaseRest.getUrlBaseWith('lugares/' + rota.destino.iata);
            axios.patch(urlLugarDestino, rota.destino.toFirestore());
        }

        let url = firebaseRest.getUrlBaseWith('linhasaereas/' + linhaAerea.code);
        await axios.patch(url, linhaAerea.toFirestore());
    } catch (ex) {
        console.log('error.firebase.linhasaereas.insert', ex);
        throw new Error('error.firebase.linhasaereas.insert' + ex);
    }
}

module.exports = {
    getAirLinhasByRotes,
    insertOrUpdateAll,
    insertOrUpdate
}