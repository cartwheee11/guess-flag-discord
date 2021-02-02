const fs = require('fs');
const Flags = require('country-flag-icons');

class CountriesFlags {
    constructor() {
        this.codesRelations = JSON.parse(fs.readFileSync('coutry-codes.json', 'utf-8'));
        this.countries = JSON.parse(fs.readFileSync('./countries.json'));
        this.codes = Flags.countries;
    }

    getRandomCountry(region) {
        console.log(region);
        let countries = [];
        if(region) {
            this.countries.forEach(country => {
                console.log(region.toUpperCase(), country.locationPrecise.toUpperCase(), region.toUpperCase() == country.locationPrecise.toUpperCase());
                if((region.toUpperCase() == country.location.toUpperCase()) || (region.toUpperCase() == country.locationPrecise.toUpperCase())) {
                    countries.push(country);
                }
            });
        } else {
            console.log('вошло в элс');
            console.log(region);
            countries = this.countries
        }

        if(countries.length === 0) {
            return new Error('У нас такого региона нет, подумайте еще');
        }

        let rand = Math.floor(Math.random() * countries.length);
        // let code = this.codes[rand];

        let country = countries[rand];

        if(!Flags.hasFlag(country.alpha2)) return this.getRandomCountry(region);
        return country;
    }
}

module.exports = new CountriesFlags();