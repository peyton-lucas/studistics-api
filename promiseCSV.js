const csv = require('fast-csv');

export default function promiseCSV(stream, options) {
  return new Promise((resolve, reject) => {
    let rows = [];
    csv.parseStream(stream, options)
      .on('error', error => { console.log(error); reject(error) })
      .on('data', (row) => {
        rows.push(row);
      })
      .on('end', (row) => {
        console.log(rows);
        resolve(rows);
      });
  });
};