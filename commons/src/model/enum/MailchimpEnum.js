
const memberListEnum = {
    AlertaDePrecos: '0000000000'
}

const getUniqueId = (listName) => {
    return memberListEnum[listName];
}

module.exports = {
    memberListEnum,
    getUniqueId
};