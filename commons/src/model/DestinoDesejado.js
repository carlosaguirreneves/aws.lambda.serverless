const util = require('../util/Util');

class DestinoDesejado {
    constructor (destinoDesejado = null) {
        if (!destinoDesejado) {
            return;
        }

        this.origem = destinoDesejado.origem;
        this.destino = destinoDesejado.destino;
        this.idaVolta = destinoDesejado.idaVolta;
        this.mes = destinoDesejado.mes;
        this.ano = destinoDesejado.ano;
    }
}

module.exports = DestinoDesejado;