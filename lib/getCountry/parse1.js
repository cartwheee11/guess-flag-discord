let fs = require('fs');

let file = fs.readFileSync('./dataSet', 'utf-8');
file = file.split('\n');

let country = {}
let resultArray = [];
file.forEach((string, id) => {
    // console.log(id);
    if(id % 2 == 0) {
        console.log('хуй');
        country.name = string;
    } else {
        console.log('пизда');
        country.code = string;
        resultArray.push(JSON.parse(JSON.stringify(country)));
    }
});

fs.writeFileSync('./coutry-codes.json', JSON.stringify(resultArray));