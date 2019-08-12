# Convert to python Lambda function
# In return statement - return data as JSON object output instead of asarray output

import json
import numpy as np
import pandas as pd


from datetime import datetime

def averageDailyGain(event, context):
    """
    for each livestock_id in livestock
      metrics = weightsAndDates(row[0])
      livestockFit = np.polyfit(metrics[:, 0], metrics[:, 1], 1)
      livestockFunction = np.poly1d(livestockFit)

      benchmarkInterval = [60, 90, 120]
      for each interval in benchmarkInterval
        print(interval + " weight is " + livestockFunction(interval))
    """
    # Livestock Data Fetch for userID
    # Define getFarm(), retrieve output from weights.js for event
    event = getFarm()

    ids = np.unique(points[:,0])
    day60Weights = []
    day90Weights = []
    day120Weights = []
    for id in ids:
        # print('id: ' + str(id))
        metrics = points[np.where(points[:, 0] == id)[0]]

        if metrics.size > 3:
            x = metrics[:, 1] - metrics[0, 1]
            y = metrics[:, 2]
            livestockFit = np.polyfit(np.float32(x), np.float32(y), 1)
            livestockFunction = np.poly1d(livestockFit)

            day60Weights.append(livestockFunction(60*86400))
            day90Weights.append(livestockFunction(90*86400))
            day120Weights.append(livestockFunction(120*86400))

    # print(np.asarray(day60Weights), np.asarray(day90Weights), np.asarray(day120Weights))
    return json.dumps({
        'day60Weights': day60Weights,
        'day90Weights': day90Weights,
        'day120Weights': day120Weights
    })
