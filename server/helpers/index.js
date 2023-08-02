const { createDbOperationsLists } = require("./createDbOperationsLists");
const { isEmpty } = require("./isEmpty");
const { replaceObjectKeyWithApiId } = require("./replaceObjectKeyWithApiId");
const {
  replaceWildcardWithModelNames,
} = require("./replaceWildcardWithModelNames");

module.exports = {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceWildcardWithModelNames,
};
