"use strict";

var moment = require('moment');
var axios = require('axios');

const getAllForApiBy = async (from, to, isRoundTrip, month, tripDays) => {
    try {
        let url = process.env.flightPriceApi + "Handler/CheapestQuoteService.ashx?path=price/city-pair";
        let body = {
            Origin: from,
            Destination: to,
            IsRoundTrip: isRoundTrip,
            DepartureRangeMonths: (month) ? 1 : 12,
            ResultsAmount: 200,
            IgnoreCache: true,
            LoadLocations: true,
            LoadAirCompanies: true
        }
        
        moment.locale("pt-BR");

        if (month) {
            let period = new Date(new Date().getFullYear(), month -1, 1);
            body.Departure = moment(period).format("YYYY-MM-DD");
        }

        if (tripDays) {
            body.TripDays = tripDays;
        }
        
        return await axios.post(url, body);
    } catch (ex) {
        console.log(ex);
        throw new Error("exception.agencia.getallforapiby" + ex);
    }
}

const getAllBestPrices = async (from) => {
    try {
        let url = process.env.flightPriceApi + "Handler/CheapestQuoteService.ashx?path=price/best-prices-list";
        
        let body = {
            Origin: from,
            LoadAirCompanies: false,
            LoadLocations: true,
            OnlyBestAirCompany: true,
            ResultsAmount: 100,
            IgnoreCache: true
        };
        
        return await axios.post(url, body);
    } catch (ex) {
        console.log(ex);
        throw new Error("exception.agencia.getallbestprices" + ex);
    }
}

module.exports = {
    getAllForApiBy,
    getAllBestPrices
}