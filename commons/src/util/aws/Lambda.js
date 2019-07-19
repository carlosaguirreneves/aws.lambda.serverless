const AWS = require('aws-sdk');

/**
 * Executa a chamada de um lambda de forma assincrona.
 * @param {*} data - payload.
 * @param {*} functionName - nome da funcao lambda or arn
 */
const invokeLambdaAsync = async (data, functionName) => {
    
    let lambda = new AWS.Lambda();

    let event = {};
    event.body = data;

    let stage = process.env.stage;
    let prefixArn = process.env.prefixArn;
    let arnFunction = null;

    if (functionName.indexOf("arn:") == -1) {
        arnFunction = prefixArn + "-" + stage + "-" + functionName;
    } else {
        arnFunction = functionName;
    }

    let config = {  
        FunctionName: arnFunction,
        Payload: JSON.stringify(event),
        InvocationType: "Event",
        LogType: "Tail"
    }

    return lambda.invoke(config).promise();
}

module.exports = {
    invokeLambdaAsync
}