const activeRefreshTokenWhere = (where) => ({
  ...where,
  OR: [{ revokedAt: null }, { revokedAt: { isSet: false } }],
});

module.exports = { activeRefreshTokenWhere };
