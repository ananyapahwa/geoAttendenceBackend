const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Company = require('../models/company');
const sendEmail = require('../utils/helpers').sendEmail;
