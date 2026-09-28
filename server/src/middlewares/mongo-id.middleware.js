const validateMongoIdParam = (parameterName) => (req, res, next, value) => {
  if (!/^[a-f\d]{24}$/i.test(value)) {
    return res.status(400).json({ message: `Invalid ${parameterName}` });
  }
  return next();
};

module.exports = { validateMongoIdParam };
