
exports.logError = (message) => {
    const fs = require('fs');
    const logFile = './logs/app.log';
    const logMessage = `[${new Date().toISOString()}] ${message}\n`;

    fs.appendFileSync(logFile, logMessage, (err) => {
        if (err) console.error('Error writing to log file:', err);
    });
};
