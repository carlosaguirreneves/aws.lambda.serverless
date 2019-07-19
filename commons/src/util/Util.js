
const crypto = require('crypto');

/**
 * Gera um checksum de um conjunto de bytes.
 * @param {array de bytes} data 
 * @param {Optional} algorithm 
 * @param {Optional} encoding 
 */
const generateChecksum = (data, algorithm, encoding) => {
    return crypto.createHash(algorithm || 'md5')
        .update(data, 'utf8')
        .digest(encoding || 'hex');
}

/**
 * Método responsável por validar se um e-mail é valido ou não.
 * @param {E-mail a ser validado} email 
 */
const isEmailValid = (email) => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Método responsável por retornar um status code, mensagem e dado no final do processamento do lambda.
 * @param {*} code 
 * @param {*} message 
 * @param {*} data 
 */
const prepareLambdaReturn = (code, message, data) => {
    return {
        statusCode: code,
        headers: {'Access-Control-Allow-Origin': '*'},
        body: JSON.stringify({
            'message': message,
            'data': data
        }).trim()
    };
}

const getExtensionImage = (contentType) => {
    var format = "";

    if (contentType == "image/png") {
        format = "png";
    } else if (contentType == "image/jpeg") {
        format = "jpg";
    } else if (contentType == "image/gif") {
        format = "gif";
    } else if (contentType == "image/webp") {
        format = "webp";
    }

    return format;
}

const getContentTypeImage = (extension) => {
    var contentType = "";

    if (extension == "png") {
        contentType = "image/png";
    } else if (extension == "jpg") {
        contentType = "image/jpeg";
    } else if (extension == "gif") {
        contentType = "image/gif";
    }

    return contentType;
}

const error = (key, message, exception) => {
    return {
        code: 500,
        key: key,
        message: message,
        exception: exception
    }
}

const errorCode = (key, message, exception, code) => {
    return {
        code: code,
        key: key,
        message: message,
        exception: exception
    }
}    

/**
 * Remove todos os caracteres especiais e espaços da string informada. 
 * Substitui os espaços pelo "replaceBy".
 * @param {*} val 
 * @param {*} replaceBy parametro opcional (Default = "-")
 */
const makeslug = (val, replaceBy) => {
    replaceBy = replaceBy || '-';
    var mapaAcentosHex 	= { // by @marioluan and @lelotnk
        a : /[\xE0-\xE6]/g,
        A : /[\xC0-\xC6]/g,
        e : /[\xE8-\xEB]/g, // if you're gonna echo this
        E : /[\xC8-\xCB]/g, // JS code through PHP, do
        i : /[\xEC-\xEF]/g, // not forget to escape these
        I : /[\xCC-\xCF]/g, // backslashes (\), by repeating
        o : /[\xF2-\xF6]/g, // them (\\)
        O : /[\xD2-\xD6]/g,
        u : /[\xF9-\xFC]/g,
        U : /[\xD9-\xDC]/g,
        c : /\xE7/g,
        C : /\xC7/g,
        n : /\xF1/g,
        N : /\xD1/g,
    };
    
    for ( var letra in mapaAcentosHex ) {
        var expressaoRegular = mapaAcentosHex[letra];
        val = val.replace(expressaoRegular, letra);
    }
    
    val = val.toLowerCase().trim();
    val = val.replace(/[^a-z0-9\-]/g, " ");
    val = val.replace(/ {2,}/g, " ");
    val = val.replace(/\s/g, replaceBy);
    val = val.replace(/----/g, replaceBy);
    val = val.replace(/---/g, replaceBy);
    val = val.replace(/--/g, replaceBy);
    val = val.replace(/-/g, replaceBy);
    
    return val;
}

/**Gerando um número inteiro aleatório entre dois valores, inclusive */
const getRandomArbitrary = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getMonthName = (month) => {
    let months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return months[month];
}

module.exports = {
    error,
    errorCode,
    makeslug,
    isEmailValid,
    prepareLambdaReturn,
    getExtensionImage,
    getContentTypeImage,
    getRandomArbitrary,
    getMonthName,
    generateChecksum
};