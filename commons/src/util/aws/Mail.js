"use strict";

const AWS = require('aws-sdk');

const sendEmail = async (from, toAddresses, subject, body) => {
    try {
        let mail = new AWS.SES();

        var params = {
            Destination: {
                ToAddresses: toAddresses
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: body
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: body
                    }
                },
                Subject: {
                    Charset: 'UTF-8',
                    Data: subject
                }
            },
            Source: from
        };

        return await mail.sendEmail(params).promise();
    } catch (ex) {
        console.log(ex);
        throw ex;
    }
}

module.exports = {
    sendEmail
}