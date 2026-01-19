// Main email service exports
const EmailVerifier = require('./EmailVerifier');
const SMTPChecker = require('./SMTPChecker');
const MXResolver = require('./MXResolver');
const DisposableChecker = require('./DisposableChecker');
const SyntaxValidator = require('./SyntaxValidator');

module.exports = {
  EmailVerifier,
  SMTPChecker,
  MXResolver,
  DisposableChecker,
  SyntaxValidator
};