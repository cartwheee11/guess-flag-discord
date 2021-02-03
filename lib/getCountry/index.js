const fs = require('fs');
const Flags = require('country-flag-icons');



class Countries {
    constructor() {
        this.codesRelations = JSON.parse(fs.readFileSync(__dirname + '/coutry-codes.json', 'utf-8'));
        this.countries = JSON.parse(fs.readFileSync(__dirname + '/countries.json'));
        this.codes = Flags.countries;
    }

    getRandomCountry(region) {
        let countries = [];
        if(region) {
            this.countries.forEach(country => {
                // console.log(region.toUpperCase(), country.locationPrecise.toUpperCase(), region.toUpperCase() == country.locationPrecise.toUpperCase());
                if((region.toUpperCase() == country.location.toUpperCase()) || (region.toUpperCase() == country.locationPrecise.toUpperCase())) {
                    countries.push(country);
                }
            });
        } else {
            countries = this.countries
        }

        if(countries.length === 0) {
            return new Error('У нас такого региона нет, подумайте еще');
        }

        let rand = Math.floor(Math.random() * countries.length);

        let country = countries[rand];
        country.flagImage = `https://flagcdn.com/h240/${country.alpha2.toLowerCase()}.png`

        if(!Flags.hasFlag(country.alpha2)) return this.getRandomCountry(region);
        return country;
    }
}

// let countries = new Countries();
// let rand = countries.getRandomCountry('Азия');
// console.log(rand);

module.exports = new Countries();