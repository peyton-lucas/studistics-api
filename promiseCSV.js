const csv = require('fast-csv');

export function promiseCSV(stream, options) {
  return new Promise((resolve, reject) => {
    let mergedMetrics = {};
    csv.parseStream(stream, options)
      .on('error', error => reject(error))
      .on('data', (data) => {
        if (Object.keys(data).length > 0) {
          // idColumn is set to the 1st column val of data (i.e. earId)
          let idColumn = Object.keys(data)[0];
          const earId = data[idColumn];

          if (!(earId in mergedMetrics))
            mergedMetrics[earId] = {};
          // for each key that is in data
          for (const key in data) {
            if (key !== idColumn) {
              if ((key.toLowerCase() === 'sire' || key.toLowerCase() === 'dam') && data[key] !== '') {
                mergedMetrics[earId][key] = data[key];
              } else {
                console.log('Should not be sire or dam: ' + key)
                // If there is no key for mergedMetrics[earId] (e.g., "FLY100", "FLY200", etc.),
                // then set mergedMetrics[earId][key] (i.e.current header in iteration) to an empty array
                if (!(key in mergedMetrics[earId])) {
                  // creating empty objects / arrays because vals are currently null
                  mergedMetrics[earId][key] = [];
                }
                // Push data[key] into mergedMetrics[earId][key]
                let value = data[key]
                if (key === 'weight') {
                  value = parseFloat(value);
                } else {
                  value = new Date(value);
                }
                mergedMetrics[earId][key].push(value);
              }
            }
          }
        }
      })
      .on('end', (data) => {
        console.log(mergedMetrics);
        resolve(mergedMetrics);
      });
  });
};