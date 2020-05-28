let allClujDevices = [];

async function getAndDisplayData() {
  drawNeighborhoods();
  await getAndPopulateClujDevices();
  drawNeighborhoods();

  setInterval(async () => {
    await getAndPopulateClujDevices();
    drawNeighborhoods();
  }, 10 * 1000);
}

function drawNeighborhoods() {
  const pageRoot = document.getElementById('root');

  pageRoot.innerHTML = '';

  neighbourhoods
    .filter((x) => x.shouldShow)
    .forEach(({ id, name, imageUrl }) => {
      const overallGrade = getAirQualityForNeighbourhood(id);

      const { pm1, pm25, pm10 } = getPmAveragesForNeighborhood(id);

      const neighbourhoodHtml = getHtmlForNeighbourhood({ id, name, value: overallGrade, imageUrl, pm1, pm25, pm10 });

      pageRoot.insertAdjacentHTML('beforeend', neighbourhoodHtml);
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

  if (!devicesInNeighbourhood.length) {
    return '';
  }

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

function getPmAveragesForNeighborhood(neighbourhoodId) {
  const deviceIdsInNeighbourhood = neighbourhoods.find((x) => x.id == neighbourhoodId).deviceIds;
  const devicesInNeighbourhood = allClujDevices.filter((x) => deviceIdsInNeighbourhood.includes(x.id));

  let averages = {
    pm1: 0,
    pm25: 0,
    pm10: 0,
  };

  devicesInNeighbourhood.forEach(({ avg_pm1, avg_pm25, avg_pm10 }) => {
    averages.pm1 += +avg_pm1;
    averages.pm25 += +avg_pm25;
    averages.pm10 += +avg_pm10;
  });

  return {
    pm1: averages.pm1 / devicesInNeighbourhood.length,
    pm25: averages.pm25 / devicesInNeighbourhood.length,
    pm10: averages.pm10 / devicesInNeighbourhood.length,
  };
}

const neighbourhoods = [
  {
    id: 'grigorescu',
    name: 'Grigorescu',
    imageUrl: 'https://www.clujlife.com/wp-content/uploads/2018/08/cartier-grigorescu1-1.jpg',
    deviceIds: ['160000C7'],
    shouldShow: true,
  },
  {
    id: 'plopilor',
    name: 'Plopilor',
    imageUrl: 'https://cdn.cluj.com/cluj/octavian2k-zoom-750x380.jpg',
    deviceIds: ['160000CB'],
    shouldShow: true,
  },
  {
    id: 'manastur',
    name: 'Mănăștur',
    deviceIds: ['160000CA'],
    shouldShow: true,
    imageUrl: 'https://i0.wp.com/cluju.ro/wp-content/uploads/2018/01/13475165_1800244116865752_2793115031474893207_o.jpg?fit=940%2C528&ssl=1',
  },
  {
    id: 'europa',
    name: 'Europa',
    deviceIds: ['160000FA', '160000C6', '820001CF'],
    imageUrl: 'https://i.imgur.com/K1YKwqc.png',
    shouldShow: true,
  },
  {
    id: 'bunaziua',
    name: 'Bună Ziua',
    deviceIds: ['160000D3', '160000A2', '160000A5'],
    imageUrl: 'https://eclujeanul.ro/wp-content/uploads/2020/05/modernizare-strada-buna-ziua.jpg',
    shouldShow: true,
  },
  {
    id: 'dambulrotund',
    name: 'Dâmbul Rotund',
    deviceIds: ['82000141'],
  },
];

getAndDisplayData();

function getHtmlForNeighbourhood({ id, name, value, imageUrl, pm1, pm25, pm10 }) {
  return `
    <div class="neighborhood" id="${id}" style="background-color: ${getColor(value)}">
    <div class="header">
      Cartierul&nbsp;
      <span class="name">${name}</span>
    </div>
    <div class="body">
      <span class="current-value">${value}</span>
      <div class="info">
        ${getHtmlForProgressBar({ name: 'PM1.0', value: pm1, legalValue: 20 })}
        ${getHtmlForProgressBar({ name: 'PM2.5', value: pm25, legalValue: 25 })}
        ${getHtmlForProgressBar({ name: 'PM10', value: pm10, legalValue: 40 })}
      </div>
      <div class="gradient"></div>
      <img
        src="${imageUrl}"
        style="height: 280px;"
        alt="Cartierul ${name}"
      />
    </div>
  </div>
    `;
}

function getHtmlForProgressBar({ name, value, legalValue }) {
  let percentage = (value / legalValue) * 100;
  if (percentage < 15) {
    percentage = 15;
  }

  return `
    <div class="progress-bar-wrapper">
      <div class="progress-bar">
        <div class="progress" style="background-color: ${getColor(13 - (value / legalValue) * 10)}; width: ${percentage}%">
          <div class="progress-value">
            ${(value || 0).toFixed(1)}
          </div>
        </div>
      </div>
      <div class="progress-bar-name">
        ${name}
      </div>
      <div class="progress-bar-max-value">/ <b>${legalValue}</b> µg/m³</div>
    </div>
    `;
}

function getColor(value) {
  if (!value) {
    return '';
  }

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
}
