const pino = require('pino');
const rfs = require('rotating-file-stream');
const { DateTime } = require('luxon');

const logFile = rfs.createStream(`${DateTime.local().toFormat('yyyy-MM')}.log`, {
  interval: '1M',
  path: './logs',
});

const prettyStream = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    ignore: 'host,node_version',
  },
});

const streams = [{ stream: logFile }, { stream: prettyStream }];

const logger = pino(
  {
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      bindings: (bindings) => {
        return {
          pid: bindings.pid,
          host: bindings.hostname,
          node_version: process.version,
        };
      },
    },
    timestamp: () => `,"timestamp":"${DateTime.local()}"`,
  },
  pino.multistream(streams),
);

module.exports = logger;
