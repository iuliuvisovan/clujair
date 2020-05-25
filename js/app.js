async function getAndDisplayData() {
  neighbourhoods
    .filter((x) => x.shouldShow)
    .forEach(({ id, name }) => {
      const neighbourhoodNameElement = document.querySelector(`#${id} .name`);

      neighbourhoodNameElement.innerText = name;
    });

  await getAndPopulateClujDevices();

  neighbourhoods
    .filter((x) => x.shouldShow)
    .forEach(({ id, name }) => {
      const neighbourhoodBodyElement = document.querySelector(`#${id}`);
      const neighbourhoodValueElement = document.querySelector(`#${id} .current-value`);

      const grade = getAirQualityForNeighbourhood(id);

      const neighbourhoodAirQuality = grade;
      neighbourhoodValueElement.innerText = neighbourhoodAirQuality;
      neighbourhoodBodyElement.style.backgroundColor = getColor(grade);
    });
}

async function getAndPopulateClujDevices() {
  const response = await fetch('https://data.uradmonitor.com/api/v1/devices/', {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'X-User-hash': 'global',
      'X-User-id': 'www',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
  const devices = await response.json();

  allClujDevices = devices.filter((x) => x.city.toLowerCase().includes('cluj'));
}

function getAirQualityForNeighbourhood(neighbourhoodId) {
  const deviceIdsInNeighbourhood = neighbourhoods.find((x) => x.id == neighbourhoodId).deviceIds;
  const devicesInNeighbourhood = allClujDevices.filter((x) => deviceIdsInNeighbourhood.includes(x.id));

  let sumForNeighbourhood = 0;

  devicesInNeighbourhood.forEach(({ avg_pm1, avg_pm25, avg_pm10 }) => {
    const valueForThisSenson = +avg_pm25;

    sumForNeighbourhood += valueForThisSenson;
  });

  const neighbourHoodValue = sumForNeighbourhood / devicesInNeighbourhood.length;

  var currentValue = neighbourHoodValue;

  const grade = 10 - currentValue / 10;

  return grade.toFixed(1);
}

const neighbourhoods = [
  {
    id: 'grigorescu',
    name: 'Grigorescu',
    deviceIds: ['160000C7'],
    shouldShow: true,
  },
  {
    id: 'plopilor',
    name: 'Mănăștur',
    deviceIds: ['160000CB'],
    shouldShow: true,
  },
  {
    id: 'manastur',
    name: 'Mănăștur',
    deviceIds: ['160000CA'],
  },
  {
    id: 'europa',
    name: 'Europa',
    deviceIds: ['160000FA', '160000C6', '820001CF'],
  },
  {
    id: 'bunaziua',
    name: 'Bună Ziua',
    deviceIds: ['160000D3', '160000A2', '160000A5'],
    shouldShow: true,
  },
  {
    id: 'dambulrotund',
    name: 'Dâmbul Rotund',
    deviceIds: ['82000141'],
  },
];

getAndDisplayData();

let allClujDevices = undefined;

const getColor = (value) => {
  if (value >= 9.5) {
    return '#4ac355';
  }
  if (value >= 9.0) {
    return '#71c34a';
  }
  if (value >= 8.5) {
    return '#93c34a';
  }
  if (value >= 7.5) {
    return '#a4c34a';
  }
  if (value >= 7.0) {
    return '#bac34a';
  }
  if (value >= 6.5) {
    return '#c3bb4a';
  }
  if (value >= 6.5) {
    return '#c3aa4a';
  }
  if (value >= 6) {
    return '#c39a4a';
  }
  if (value >= 5.5) {
    return '#c3944a';
  }
  if (value >= 5.0) {
    return '#c3734a';
  }
  if (value >= 4.5) {
    return '#c35c4a';
  }
  if (value >= 4.0) {
    return '#c34a4a';
  }
  if (value >= 3.5) {
    return '#a43434';
  }
  if (value >= 3.0) {
    return '#871f1f';
  }
  if (value >= 2.5) {
    return '#600e0e';
  }
  if (value >= 2.0) {
    return '#3b0404';
  }

  return '#000';
};
