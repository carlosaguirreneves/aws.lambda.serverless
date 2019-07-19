
const memberListEnum = {
    AlertaDePrecos: 1
}

const getUniqueId = (listName) => {
    return memberListEnum[listName];
}

module.exports = {
    memberListEnum,
    getUniqueId
};