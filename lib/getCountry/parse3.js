
const countries = require('./countries.json');
const fs = require('fs');
const Flags = require('country-flag-icons');

countries.forEach(country => {
    let code = country.alpha2;
    if(!Flags.hasFlag(code)) {
        console.log(country);
    }
});


