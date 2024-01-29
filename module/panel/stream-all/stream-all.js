const STATUS_AVAILABLE = 1;
const STATUS_NOT_AVAILABLE = 0;
const STATUS_TIMEOUT = -1;
const STATUS_ERROR = -2;

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36';

(async () => {
  let panel_result = {
    title: "",
    content: '',
    icon: 'checkmark.gobackward',
    'icon-color': '#2F4F4F',
  };

  let fetchTextContent = (url) => {
    return new Promise((resolve, reject) => {
      $httpClient.get(url, function(error, response, data) {
        if (error || response.status !== 200) {
          reject(error || new Error(`Failed to fetch data. HTTP Status: ${response.status}`));
          return;
        }
        let jsonData = JSON.parse(data);
        resolve(jsonData);
      });
    });
  };

  let fetchTextContents = [
    'https://api.vvhan.com/api/ian?type=json&cl=ac',
    // Add more URLs here
  ];

  let results = await Promise.all(fetchTextContents.map(url => fetchTextContent(url)));
  let content = results.map(result => `${result.data.vhan} — ${result.data.source}`).join('\n');
  panel_result.title = content;

  let [{ region, status }] = await Promise.all([testDisneyPlus()]);
  let result = await Promise.all([check_youtube_premium(), check_netflix()]);
  let disney_result = '𝑫𝒊𝒔𝒏𝒆𝒚+: ';

  if (status === STATUS_COMING) {
    disney_result += `Coming soon | ${getFlagEmoji(region)}`;
  } else if (status === STATUS_AVAILABLE) {
    disney_result += `Enjoy ur shows now | ${getFlagEmoji(region)}`;
  } else if (status === STATUS_NOT_AVAILABLE) {
    disney_result += `Not available`;
  } else if (status === STATUS_TIMEOUT) {
    disney_result += `Please refresh the data`;
  }

  result.push(disney_result);
  panel_result['content'] = result.join('\n');
  $done(panel_result);
})();

async function check_youtube_premium() {
  let inner_check = () => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.youtube.com/premium',
        headers: REQUEST_HEADERS,
      }
      $httpClient.get(option, function (error, response, data) {
        if (error != null || response.status !== 200) {
          reject('Error');
          return;
        }

        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve(' Not Available');
          return;
        }

        let region = '';
        let re = new RegExp('"countryCode":"(.*?)"', 'gm');
        let result = re.exec(data);
        if (result != null && result.length === 2) {
          region = result[1];
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN';
        } else {
          region = 'US';
        }
        resolve(region);
      });
    });
  };

  let youtube_check_result = '𝒀𝒐𝒖𝑻𝒖𝒃𝒆: ';

  try {
    const code = await inner_check();
    if (code === 'Not Available') {
      youtube_check_result += 'Not available';
    } else {
      const flag = getFlagEmoji(code);
      youtube_check_result += `Enjoy ur shows now | ${flag}`;
    }
  } catch (error) {
    youtube_check_result += 'Please refresh the data.';
  }

  return youtube_check_result;
}

async function check_netflix() {
  let inner_check = (filmId) => {
    return new Promise((resolve, reject) => {
      let option = {
        url: 'https://www.netflix.com/title/' + filmId,
        headers: REQUEST_HEADERS,
      }
      $httpClient.get(option, function (error, response, data) {
        if (error != null) {
          reject('Error');
          return;
        }

        if (response.status === 403) {
          reject('Not Available');
          return;
        }

        if (response.status === 404) {
          resolve('Not Found');
          return;
        }

        if (response.status === 200) {
          let url = response.headers['x-originating-url'];
          let region = url.split('/')[3];
          region = region.split('-')[0];
          if (region == 'title') {
            region = 'us';
          }
          resolve(region);
          return;
        }

        reject('Error');
      });
    });
  };

  let netflix_check_result = '𝑵𝒆𝒕𝒇𝒍𝒊𝒙: ';

  try {
      const code1 = await inner_check(80062035);
      if (code1 === 'Not Found') {
        const code2 = await inner_check(80018499);
        if (code2 === 'Not Found') {
          throw 'Not Available';
        }
        netflix_check_result += `Only original shows can be watched | ${getFlagEmoji(code2)}`;
      } else {
        netflix_check_result += `Enjoy your shows now | ${getFlagEmoji(code1)}`;
      }
    } catch (error) {
      if (error === 'Not Available') {
        netflix_check_result += 'Currently unavailable';
      } else {
        netflix_check_result += 'Please refresh the data';
      }
    }

  return netflix_check_result;
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
      if (error || response.status !== 200) {
        reject('Error');
        return;
      }

      data = JSON.parse(data);
      if (data?.errors) {
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
      if (error || response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
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

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout');
    }, delay);
  });
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode.toUpperCase().split('').map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}