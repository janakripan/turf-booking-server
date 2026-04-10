

const getValidationErrorMessage = (err) => {
  const keys = Object.keys(err.errors);
  const messages = Object.values(err.errors);
  const messageObject = {};
  for (let i = 0; i < keys.length; i++) {
    messageObject[keys[i]] = messages[i].message;
  }
  return messageObject;
};

module.exports = {getValidationErrorMessage}