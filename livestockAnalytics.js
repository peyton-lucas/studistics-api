const DataFrame = require('dataframe-js').DataFrame;
const linear = require('everpolate').linear;

let dataFrame = function() {
  const data = new DataFrame.fromCSV('/Users/plucas/Documents/livestock-data.csv', true).then(df => df);
  return data;
}

let dfPromise = dataFrame();

dfPromise.then(function(df) {
  const day60Weights = [];
  const day90Weights = [];
  const day120Weights = [];

  df.groupBy('ear_id').aggregate((groupedMetrics) => {
    const animalMetrics = groupedMetrics.select('collection_time', 'weight').castAll([Number, Number]);
    const initialTime = animalMetrics.toArray('collection_time')[0];
    const collectionTimes = animalMetrics
      .toArray('collection_time')
      .map(x => x - initialTime);

    const weights = animalMetrics.toArray('weight');

    if (weights.length >= 3) {
      const predictedWeights = linear([60*86400, 90*86400, 120*86400], collectionTimes, weights);

      day60Weights.push(predictedWeights[0]);
      day90Weights.push(predictedWeights[1]);
      day120Weights.push(predictedWeights[2]);
    }
  });
});