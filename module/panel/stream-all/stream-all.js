const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';
const REQUEST_HEADERS = {
    'User-Agent': UA,
    'Accept-Language': 'en',
};

(async () => {
  let panel_result = {
    title: "",
    content: '',
    icon: 'checkmark.gobackward',
    'icon-color': '#2F4F4F',
  };

  let fetchTextContent = async (url) => {
    try {
      const response = await $httpClient.get({ url, headers: REQUEST_HEADERS });
      if (response.status === 200) {
        return JSON.parse(response.data);
      } else {
        throw new Error(`Failed to fetch data. HTTP Status: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  };

  let fetchTextContents = [
    'https://api.vvhan.com/api/ian?type=json&cl=ac',
    // Add more URLs here
  ];

  try {
    let results = await Promise.all(fetchTextContents.map(url => fetchTextContent(url)));
    let content = results.map(result => `${result.data.vhan} — ${result.data.source}`).join('\n');
    panel_result.title = content;
  } catch (error) {
    panel_result.title = "Error fetching data";
  }

  try {
    let disneyResult = await testDisneyPlus();
    let youtubeResult = await check_youtube_premium();
    let netflixResult = await check_netflix();

    let disney_display = formatDisneyResult(disneyResult);
    panel_result['content'] = [youtubeResult, netflixResult, disney_display].join('\n');
  } catch (error) {
    panel_result['content'] = "Error in processing";
  }

  $done(panel_result);
})();

async function check_youtube_premium() {
  try {
    let data = await $httpClient.get({ url: 'https://www.youtube.com/premium', headers: REQUEST_HEADERS });
    if (data.status !== 200) throw new Error('Error');

    if (data.data.indexOf('Premium is not available in your country') !== -1) {
      return '𝒀𝒐𝒖𝑻𝒖𝒃𝒆: Not available';
    }

    let region = '';
    let re = new RegExp('"countryCode":"(.*?)"', 'gm');
    let result = re.exec(data.data);
    if (result != null && result.length === 2) {
      region = result[1];
    } else if (data.data.indexOf('www.google.cn') !== -1) {
      region = 'CN';
    } else {
      region = 'US';
    }

    return `𝒀𝒐𝒖𝑻𝒖𝒃𝒆: Enjoy ur shows now | ${getFlagEmoji(region)}`;
  } catch (error) {
    return '𝒀𝒐𝒖𝑻𝒖𝒃𝒆: Please refresh the data.';
  }
}

async function check_netflix() {
  try {
    let checkResult = await checkNetflixTitle(80062035);
    if (checkResult === 'Not Found') {
      checkResult = await checkNetflixTitle(80018499);
      if (checkResult === 'Not Found') throw 'Not Available';
      return `𝑵𝒆𝒕𝒇𝒍𝒊𝒙: Only original shows can be watched | ${getFlagEmoji(checkResult)}`;
    }
    return `𝑵𝒆𝒕𝒇𝒍𝒊𝒙: Enjoy your shows now | ${getFlagEmoji(checkResult)}`;
  } catch (error) {
    if (error === 'Not Available') {
      return '𝑵𝒆𝒕𝒇𝒍𝒊𝒙: Currently unavailable';
    } else {
      return '𝑵𝒆𝒕𝒇𝒍𝒊𝒙: Please refresh the data';
    }
  }
}

async function checkNetflixTitle(filmId) {
  let response = await $httpClient.get({ url: `https://www.netflix.com/title/${filmId}`, headers: REQUEST_HEADERS });
  if (response.status === 403) throw 'Not Available';
  if (response.status === 404) return 'Not Found';

  let url = response.headers['x-originating-url'];
  let region = url.split('/')[3].split('-')[0];
  return region === 'title' ? 'us' : region;
}

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)]);
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)]);
    region = countryCode ?? region;

    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING };
    } else {
      return { region, status: STATUS_AVAILABLE };
    }
  } catch (error) {
    if (error === 'Not Available') {
      return { status: STATUS_NOT_AVAILABLE };
    }

    if (error === 'timeout') {
      return { status: STATUS_TIMEOUT };
    }

    return { status: STATUS_ERROR };
  }
}

function formatDisneyResult({ region, status }) {
  switch (status) {
    case STATUS_COMING:
      return `𝑫𝒊𝒔𝒏𝒆𝒚+: Coming soon | ${getFlagEmoji(region)}`;
    case STATUS_AVAILABLE:
      return `𝑫𝒊𝒔𝒏𝒆𝒚+: Enjoy ur shows now | ${getFlagEmoji(region)}`;
    case STATUS_NOT_AVAILABLE:
      return `𝑫𝒊𝒔𝒏𝒆𝒚+: Not available`;
    case STATUS_TIMEOUT:
      return `𝑫𝒊𝒔𝒏𝒆𝒚+: Please refresh the data`;
    default:
      return `𝑫𝒊𝒔𝒏𝒆𝒚+: Error`;
  }
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('timeout');
    }, delay);
  });
}
function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization: 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'apple',
              model: null,
              operatingSystem: 'macintosh',
              operatingSystemVersion: '10.15.7',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'macosx',
          },
        },
      }),
    };

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error');
        return;
      }

      if (response.status !== 200) {
        console.log('getLocationInfo: ' + data);
        reject('Not Available');
        return;
      }

      data = JSON.parse(data);
      if (data?.errors) {
        console.log('getLocationInfo: ' + data);
        reject('Not Available');
        return;
      }

      let {
        token: { accessToken },
        session: {
          inSupportedLocation,
          location: { countryCode },
        },
      } = data?.extensions?.sdk;
      resolve({ inSupportedLocation, countryCode, accessToken });
    });
  });
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    };

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error');
        return;
      }
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
        reject('Not Available');
        return;
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/);
      if (!match) {
        resolve({ region: '', cnbl: '' });
        return;
      }

      let region = match[1];
      let cnbl = match[2];
      resolve({ region, cnbl });
    });
  });
}
