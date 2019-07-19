const moment = require('moment');
const util = require('../util/Util');

const getHtmlFlightCheapestQuotes = (flightCheapestQuotes, flightInfo) => {

    let html = "";

    for (let i = 0; i < flightCheapestQuotes.length; i++) {
        html += getHtmlItem(flightCheapestQuotes[i], flightInfo);
    }

    return html;
}

const getHtmlItem = (flight, flightInfo) => {
    return `
        <li style="display: inline-block;margin: 5px 0 10px;width: 100%;border-style: solid;border-color: #fff;border: 1px solid #bcd5f5;background-color: #fff;position: relative;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;">
            <a href="${getUrlFlight(flightInfo)}" data-saferedirecturl="https://www.google.com/url?q=${getUrlFlight(flightInfo)}" target="_blank" 
                style="float:left; display: inline-block;background-color: #fff;width: 100%;min-height: 65px;padding: 12px 0 10px 0;-webkit-border-radius: 4px;-moz-border-radius: 4px;border-radius: 4px;">
                <div style="float: left;width: 15%;text-align:center;padding: 10px 2px 0 0;">
                    <img src="${process.env.flightPriceApi}img/linhas-aereas/icons/${flight.carrierCode}.gif" alt="Passagens aéreas Azul" class="display: block;margin: 15px auto 0;">
                </div>
                <div style="float: left;width: 83%;">
                    <div style="float: left;display: inline;max-width: 270px;position: relative;">
                        <div style="float: left;width: 100%;color: #094883;">
                            <h3 style="float: left;margin-right: 3px;font-size: 16px;margin-bottom: 1px; margin-top: 0;font-family:Arial; font-size:17px; font-weight:normal;">
                                Passagens para ${flightInfo.destination.City}
                            </h3>
                        </div>
                        <div style="float: left;margin-bottom: 10px;color:#777;font-family:Arial; font-size:13px; width: 100%;">
                            <span>Saindo de ${flightInfo.origin.City}</span>
                        </div>
                        <div style="text-align: left;margin-bottom: 2px;padding-top: 5px;font-weight: 400;color: #222;font-size: 12px;font-family:Arial; font-size:12px;">
                            ${getHtmlFlightDate(flight)}
                        </div>
                    </div>
                    <div style="color: #0775e2;display:inline-block;margin-top:20px;font-family:Arial; font-size: 14px;">
                        <span>a partir de </span>
                        <span style="font-weight: 700;font-size: 18px;"> R$</span>
                        <span style="font-weight: 700;font-size: 18px;">
                            ${flight.minPrice}
                        </span>
                    </div>
                </div>
            </a>
        </li>
    `
}

const getHtmlAllBestPrices = (bestPrices) => {
    let html = "";
    let bitLogic = false;

    for (let i = 0; i < bestPrices.BestPricesList.length; i++) {
        let bestPrice = bestPrices.BestPricesList[i];
        bestPrice.destinationCity = bestPrices.LocationsReference[bestPrice.Destination].City;
        html += getHtmlBestPrice(bestPrice, bestPrices.LocationsReference, bitLogic);
        bitLogic = !bitLogic;
    }

    return html;
}

const getHtmlBestPrice = (bestPrice, locationsReference, bitLogic) => {
    return `
        <tr style="${bitLogic ? 'background-color: #ededed' : ''}">
            <td style="padding-right:10px;padding-left:10px;">
                <p style="font-weight:400;font-size:16px;line-height:28px;font-family:-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif;color:#222d39;margin:8px auto;letter-spacing:0.15px;padding:0px 0px;text-align:left">
                    <strong>${bestPrice.destinationCity}</strong>
                    <a href="${getUrlFlightBestPrice(bestPrice, locationsReference)}" data-saferedirecturl="https://www.google.com/url?q=${getUrlFlightBestPrice(bestPrice, locationsReference)}" rel="noopener" style="float:right;color:#287bc9;font-weight:bold;text-decoration:underline" target="_blank">
                        Veja aqui
                    </a>
                    <span style="float:right;margin-right:25px;font-size: 15px;color:#ff9900;font-weight:bold;">
                        R$ ${bestPrice.FullPriceTotal}
                    </span>
                </p>
            </td>
        </tr>
    `
}

const getHtmlFlightDate = (flight) => {
    let departureDate = moment(flight.departureDate).format('DD MMM');

    let returnDate = '';
    if (flight.return) {
        returnDate = "Volta " + (moment(flight.return.departureDate).format('DD MMM'));
    }

    return `
        <span>Ida ${departureDate}</span>
        <div style="display: inline">
            &nbsp;&nbsp;&nbsp;&nbsp;
            <span>${returnDate}</span>
        </div>
    `
}

const getUrlFlight = (flightInfo) => {
    let originCode = flightInfo.origin.IATA.toLowerCase();
    let originCity = flightInfo.origin.City.toLowerCase();
    let destinationCode = flightInfo.destination.IATA.toLowerCase();
    let destinationCity = flightInfo.destination.City.toLowerCase();

    let description = util.makeslug("passagens para " + destinationCity + " de " + originCity);
    let utms = `?utm_source=alertadeprecos&utm_medium=email&utm_content=${originCode.toUpperCase()}_${destinationCode.toUpperCase()}&utm_campaign=passagens%20aereas`;
    
    return `${process.env.flightPriceApi}passagens-aereas/${originCode}-${destinationCode}/${description}` + utms;
}

const getUrlFlightBestPrice = (bestPrice, locationsReference) => {
    let originCode = bestPrice.Origin.toLowerCase();
    let originCity = locationsReference[bestPrice.Origin].City.toLowerCase();
    let destinationCode = bestPrice.Destination.toLowerCase();
    let destinationCity = locationsReference[bestPrice.Destination].City.toLowerCase();

    let description = util.makeslug("passagens para " + destinationCity + " de " + originCity);
    let utms = `?utm_source=alertadeprecos&utm_medium=email&utm_content=${originCode.toUpperCase()}_${destinationCode.toUpperCase()}&utm_campaign=passagens%20aereas`;
    
    return `${process.env.flightPriceApi}passagens-aereas/${originCode}-${destinationCode}/${description}` + utms;
}

module.exports = (flightCheapestQuotes, bestPrices, flightInfo, idCliente) => {
    return `
    <html>    
    <body style="margin:0;padding:0;">
        <span style="display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden">
            Planeje sua viagem - Planejamento é tudo!
        </span>
        <table style="max-width: 612px;width: 100%;margin: 0;padding: 0;">
            <tr>
                <td valign="top" style="background:#ffffff none no-repeat center/cover;background-color:#ffffff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0px;padding-bottom:0">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse">
                        <tbody>
                            <tr>
                                <td valign="top" style="padding:0px">
                                    <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" style="min-width:100%;border-collapse:collapse">
                                        <tbody>
                                            <tr>
                                                <td valign="top" style="height:144px;background-color:#174790;padding-right:0px;padding-left:0px;padding-top:0;padding-bottom:0;text-align:center;-webkit-border-top-left-radius: 4px;-webkit-border-top-right-radius: 4px;-moz-border-radius-topleft: 4px;-moz-border-radius-topright: 4px;border-top-left-radius: 4px;border-top-right-radius: 4px;">

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            
            <tr>
                <td>
                    <ul style="display: inline-block;width: 100%;margin: 0; padding: 0;list-style: none;">
                        ${getHtmlFlightCheapestQuotes(flightCheapestQuotes, flightInfo)}
                    </ul>
                </td>
            </tr>

            <tr>
                <td style="padding-top: 10px;">
                    <center>
                        <table align="center" border="0" cellpadding="0" cellspacing="0" style="width:255px;border-top-left-radius:5px;border-top-right-radius:5px;border-bottom-right-radius:5px;border-bottom-left-radius:5px;background-color:#c7d834;border-collapse:collapse">
                            <tbody>
                                <tr>
                                    <td align="center" valign="middle" style="width:auto!important;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:16px;padding:17px 0 17px 24px;border-collapse:collapse">
                                        <a href="${getUrlFlight(flightInfo)}" data-saferedirecturl="https://www.google.com/url?q=${getUrlFlight(flightInfo)}" style="font-weight:bold;letter-spacing:1px;line-height:100%;text-align:center;text-decoration:none;color:#373737;word-wrap:break-word!important;display:block;width:100%;height:100%" target="_blank">
                                            VER OUTRAS DATAS
                                        </a>
                                    </td>
                                    <td style="width:30px;padding:3px 0 0" align="center" valign="middle">
                                        <a target="_blank" href="" style="text-decoration:none" target="_blank">
                                            <img src="${process.env.flightPriceApi}img/seta.png" width="10" height="15" alt="" style="outline:none" border="0" class="CToWUd" />
                                        </a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </center>
                </td>
            </tr>
            <tr>
                <td style="padding-top: 1px;">&nbsp;</td>
            </tr>
            <tr>
                <td>
                    <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td bgcolor="#174790" style="padding:10px;font-family: Arial;-webkit-border-top-left-radius: 4px;-webkit-border-top-right-radius: 4px;-moz-border-radius-topleft: 4px;-moz-border-radius-topright: 4px;border-top-left-radius: 4px;border-top-right-radius: 4px;">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td style="font-family: Arial;font-size:16px">
                                                <span style="color:#fff;text-decoration:none">
                                                    Veja outros destinos saindo de <strong style="color:fff">${flightInfo.origin.City}</strong>
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="font-family:'Arial';font-size:13px">
                                                <span style="color:#c7ddef;text-decoration:none">
                                                    Nossa equipe para encontrar as melhores ofertas para quem está planejando viajar.
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td valign="top" style="background:#ffffff none no-repeat center/cover;background-color:#ffffff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border:1px solid #ededed; border-top:0;padding:0;margin:0"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse">
                                <tbody>
                                <tr>
                                    <td valign="top">
                                        <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%;min-width:100%;border-collapse:collapse" width="100%">
                                        <tbody>
                                            ${getHtmlAllBestPrices(bestPrices)}
                                        </tbody>
                                        </table>
                                    </td>
                                </tr>
                                </tbody>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                </td>
            </tr>
            <tr>
                <td style="height: 30px">&nbsp;</td>
            </tr>
            <tr>
                <td valign="top" style="background:#ffffff none no-repeat center/cover;background-color:#ffffff;background-image:none;background-repeat:no-repeat;background-position:center;background-size:cover;border-top:0;border-bottom:0;padding-top:0px;padding-bottom:0">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;border-collapse:collapse">
                        <tbody>
                                <tr>
                                    <td valign="top" style="padding:0px">
                                        <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" style="min-width:100%;border-collapse:collapse">
                                            <tbody>
                                                <tr>
                                                    <td valign="top" style="height:43px;background-color: #174790;padding-right:0px;padding-left:0px;padding-top:0;padding-bottom:0;text-align:center">
                                                        
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </table>
        
    </body>
    </html>
    `
}