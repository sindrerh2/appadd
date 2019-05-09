const yaml = require('js-yaml');
const fs = require('fs');

module.exports = function readInput({ file }) {
    const input = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    console.log(input);
    return input;
};