import { nanoid } from 'nanoid';
import { OAuth2Client } from 'google-auth-library';
import { conn } from '../database';
import { validateAll } from '../utils/form';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config';
import User from '../models/users';

export const register = async (req, res) => {
  const rules = {
    name: 'required',
    email: 'required|email',
    password: 'required',
  };

  const errors = await validateAll(req.body, rules);
  if (errors) {
    return res.json({
      success: false,
      message: errors,
    });
  }

  const trx = await conn.transaction();

  try {
    const existing = await User.query().findOne({
      email: req.body.email,
    });
    if (existing) {
      return res.json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);

    const userID = nanoid();
    const data = await User.query(trx).insert({
      email: req.body.email,
      name: req.body.name,
      role: 'USER',
      id: userID,
      password: hashed,
    });

    const payload = {
      id: data.id,
      user_claims: {
        id: data.id,
        email: data.email,
        name: data.name,
      },
    };

    const jwtOptions = {
      issuer: config.JWT_ISSUER,
      subject: 'access',
      algorithm: config.JWT_ALGORITHM,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, jwtOptions);

    await trx.commit();

    return res.json({
      type: 'Bearer',
      token: token,
      success: true,
      data: data,
    });
  } catch (error) {
    await trx.rollback();
    console.error(error);

    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

export const addUser = async (req, res) => {
  const rules = {
    name: 'required',
    email: 'required|email',
    password: 'required',
  };

  const errors = await validateAll(req.body, rules);
  if (errors) {
    return res.json({
      success: false,
      message: errors,
    });
  }

  const trx = await conn.transaction();

  try {
    const existing = await User.query().findOne({
      email: req.body.email,
    });
    if (existing) {
      return res.json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(req.body.password, salt);

    const userID = nanoid();
    const data = await User.query(trx).insert({
      email: req.body.email,
      name: req.body.name,
      role: 'USER',
      id: userID,
      password: hashed,
    });

    await trx.commit();

    return res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    await trx.rollback();
    console.error(error);

    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

export const login = async (req, res) => {
  const rules = {
    email: 'required',
    password: 'required',
  };

  const errors = await validateAll(req.body, rules);
  if (errors) {
    return res.json({
      success: false,
      message: errors,
    });
  }

  try {
    const existing = await User.query().findOne({
      email: req.body.email,
    });

    if (!existing) {
      return res.json({
        success: false,
        message: 'Email not found!',
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, existing.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: 'Password did not match',
      });
    }

    const payload = {
      id: existing.id,
      user_claims: {
        id: existing.id,
        email: existing.email,
        role: existing.role,
      },
    };

    const jwtOptions = {
      issuer: config.JWT_ISSUER,
      subject: 'access',
      algorithm: config.JWT_ALGORITHM,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, jwtOptions);

    return res.json({
      type: 'Bearer',
      token: token,
      success: true,
      data: existing,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

export const loginAdmin = async (req, res) => {
  const rules = {
    email: 'required',
    password: 'required',
  };

  const errors = await validateAll(req.body, rules);
  if (errors) {
    return res.json({
      success: false,
      message: errors,
    });
  }

  try {
    const existing = await User.query().findOne({
      email: req.body.email,
    });

    if (!existing) {
      return res.json({
        success: false,
        message: 'Email not found!',
      });
    }

    if (existing.role !== 'ADMIN') {
      return res.json({
        success: false,
        message: 'Access denied',
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, existing.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: 'Password did not match',
      });
    }

    const payload = {
      id: existing.id,
      user_claims: {
        id: existing.id,
        email: existing.email,
        role: existing.role,
      },
    };

    const jwtOptions = {
      issuer: config.JWT_ISSUER,
      subject: 'access',
      algorithm: config.JWT_ALGORITHM,
    };

    const token = jwt.sign(payload, config.JWT_SECRET, jwtOptions);

    return res.json({
      success: true,
      type: 'Bearer',
      token: token,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.query().findById(req.user.id);

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};

export const edit = async (req, res) => {
  try {
    const user = await User.query().patchAndFetchById(req.user.id, {
      name: req.body.name,
      picture: req.body.picture,
    });
    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: 'Something went wrong.',
    });
  }
};
