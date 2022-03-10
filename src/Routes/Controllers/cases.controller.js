const csv = require('csv-parser');
const res = require('express/lib/response');
const fs = require('fs')
const path = require('path');

const parseCSV = async () => { 
    const csvPath = path.join(__dirname, '../../DB/01-01-2021.csv');
    const results = [];
    const data = new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', data => results.push(data))
        .on('end', () => resolve(results))
        .on('error', () => reject);
    });
    return data
};

const filterDataByProp = (data, props) => {
    const {type, name} = props;
    let result = [];
    if (type === "country") {
        result = data.filter(cCase => cCase.Country_Region === name);
    } else {
        result = data.filter(cCase => cCase.Province_State === name);
    }
    return result;
};

const getTotalConfirmedCases = (dataByCountry) => {
    const totalConfirmedCases = dataByCountry.reduce((previousValue, currentValue) => {
        return parseInt(previousValue) + parseInt(currentValue.Confirmed);
    }, 0)

    return totalConfirmedCases;
}

const getTotalCasesByCountry = (data ,countryName) => {
    const props = { type: "country", name: countryName}
    const dataByCountry = filterDataByProp(data, props);
    const totalConfirmedCasesByCountry = getTotalConfirmedCases(dataByCountry);
    return { 
        country: countryName,
        totalConfirmedCases: totalConfirmedCasesByCountry
    };
};

const getConfirmedCasesByProvince = (data, provinceName) => {
    const props = { type: "province", name: provinceName}
    const dataByProvince = filterDataByProp(data, props);
    const resultData = getTotalConfirmedCases(dataByProvince);
    return { 
        country: dataByProvince[0]?.Country_Region || "",
        province: provinceName,
        confirmedCases: resultData
    };
}; 

const getCases = async (req, res) => {
    const {country, province} = req.query;
    const data = await parseCSV();
    if(country && province) {
        res.json([
            getTotalCasesByCountry(data, country),
            getConfirmedCasesByProvince(data, province)
        ]);
    } 
    else if (country) {
        res.json(getTotalCasesByCountry(data, country));
    }
    else if (province) {
        res.json(getConfirmedCasesByProvince(data, province));
    } 
    else {
        res.json({error: "Please enter a query"})
    }
};

const groupByCountry = (data) => {
    const countries = {};
    data.forEach(el => {
        if(countries.hasOwnProperty(el.Country_Region)) {
            countries[el.Country_Region].push(parseInt(el.Confirmed));
        }
        else {
            countries[el.Country_Region] = [];
            countries[el.Country_Region].push(parseInt(el.Confirmed));
        }
    })
    return countries;
}

const getRangePerCountry = (data) => {
    const groupedByCountry = groupByCountry(data);
    const rangeArr = [];
    Object.entries(groupedByCountry)
    .forEach(([key, value]) => {
        if(value.length > 1) {
            rangeArr.push(
                {
                    country: key,
                    range: Math.max(...value) - Math.min(...value)
                });
        }
    })
    return rangeArr;
};

const getRangeCases = async (req, res) => {
    const data = await parseCSV();
    const rangeByCountry = getRangePerCountry(data);
    res.json(rangeByCountry);
}

module.exports = {
    getCases,
    getRangeCases
}