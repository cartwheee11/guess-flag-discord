
const fs = require('fs');
const x2j = require('xml2js');
const request = require('request');

request('https://www.artlebedev.ru/country-list/xml/', function(error, something, body) {
    
    let xml = body;
    x2j.parseString(xml, function(err, data) {
        let countries = data['country-list'].country;
        countries.forEach(function(elem) {
            elem.locationPrecise = elem['location-precise'][0];
            delete elem['location-precise'];
            elem.name = elem.name[0];
            elem.fullName = elem.fullname[0];
            delete elem.fullname;
            elem.alpha2 = elem.alpha2[0];
            elem.iso = elem.iso[0];
            elem.location = elem.location[0];
            elem.english = elem.english[0];
        });

        console.log(countries);

        fs.writeFileSync('./coutries.json', JSON.stringify(countries));
    });
});




