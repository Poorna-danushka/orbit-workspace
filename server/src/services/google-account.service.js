const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

class GoogleAccountConflictError extends Error {
  constructor() {
    super('This email is linked to a different Google account');
    this.name = 'GoogleAccountConflictError';
  }
}

const getUsername = (name, email) => {
  const preferred = name.trim().slice(0, 50);
  const fromEmail = email.split('@')[0].slice(0, 50);
  return preferred || fromEmail || 'user';
};

const resolveGoogleAccount = async (identity, database = prisma) => {
  const linkedUser = await database.user.findUnique({ where: { googleId: identity.sub } });
  if (linkedUser) return { user: linkedUser, created: false };

  const existingUser = await database.user.findUnique({ where: { email: identity.email } });
  if (existingUser) {
    if (existingUser.googleId && existingUser.googleId !== identity.sub) {
      throw new GoogleAccountConflictError();
    }
    try {
      const user = await database.user.update({
        where: { id: existingUser.id },
        data: { googleId: identity.sub },
      });
      return { user, created: false };
    } catch (error) {
      if (error?.code !== 'P2002') throw error;
      const racedUser = await database.user.findUnique({ where: { googleId: identity.sub } });
      if (racedUser) return { user: racedUser, created: false };
      throw new GoogleAccountConflictError();
    }
  }

  const password = crypto.randomBytes(32).toString('hex');
  const hashedPassword = await bcrypt.hash(password, 12);
  try {
    const user = await database.user.create({
      data: {
        email: identity.email,
        username: getUsername(identity.name, identity.email),
        password: hashedPassword,
        avatar: identity.picture,
        googleId: identity.sub,
      },
    });
    return { user, created: true };
  } catch (error) {
    if (error?.code !== 'P2002') throw error;
    const racedUser = await database.user.findUnique({ where: { googleId: identity.sub } });
    if (racedUser) return { user: racedUser, created: false };

    const emailOwner = await database.user.findUnique({ where: { email: identity.email } });
    if (!emailOwner) throw error;
    if (emailOwner.googleId && emailOwner.googleId !== identity.sub) {
      throw new GoogleAccountConflictError();
    }
    try {
      const user = await database.user.update({
        where: { id: emailOwner.id },
        data: { googleId: identity.sub },
      });
      return { user, created: false };
    } catch (linkError) {
      if (linkError?.code !== 'P2002') throw linkError;
      const linked = await database.user.findUnique({ where: { googleId: identity.sub } });
      if (linked) return { user: linked, created: false };
      throw new GoogleAccountConflictError();
    }
  }
};

module.exports = { resolveGoogleAccount, GoogleAccountConflictError };
