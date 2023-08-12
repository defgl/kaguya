/*
 * 由@LucaLin233编写
 * 原脚本地址：https://raw.githubusercontent.com/LucaLin233/Luca_Conf/main/Surge/JS/stream-all.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.26
 * 版本：2.2
 */

const REQUEST_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
  'Accept-Language': 'en',
}

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

  ;(async () => {
    let panel_result = {
      title: "",
      content: '',
      icon: 'visionpro.badge.play.fill',
      'icon-color': '#FFB6C1',
    }

    let fetchTextContent = new Promise((resolve, reject) => {
      let url = 'https://v.api.aa1.cn/api/api-wenan-qg/index.php?aa1=json';
      $httpClient.get(url, function(error, response, data) {
        if (error) {
          reject(error);
          return;
        }
        if (response.status !== 200) {
          reject(new Error(`Failed to fetch data. HTTP Status: ${response.status}`));
          return;
        }
        let jsonData = JSON.parse(data);
        resolve(jsonData[0].qinggan);
      });
    });
    
      // 使用await来获取text内容并设置为title
      panel_result.title = await fetchTextContent;
  
    let [{ region, status }] = await Promise.all([testDisneyPlus()])
    await Promise.all([check_youtube_premium(), check_netflix()])
      .then((result) => {
        let disney_result = '';
        if (status == STATUS_COMING) {
          disney_result = `Disney+:  Coming Soon  →  ${getFlagEmoji(region)} `;
        } else if (status == STATUS_AVAILABLE) {
          disney_result = `Disney+:  ✓  →  ${getFlagEmoji(region)} `;
        } else if (status == STATUS_NOT_AVAILABLE) {
          disney_result = `Disney+:  ✗`;
        } else if (status == STATUS_TIMEOUT) {
          disney_result = `Disney+:  Timeout`;
        }
  
        result.push(disney_result);
        let content = result.join('\n');
        panel_result['content'] = content;
      })
      .finally(() => {
        $done(panel_result);
      });
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
          reject('Error')
          return
        }

        if (data.indexOf('Premium is not available in your country') !== -1) {
          resolve(' Not Available')
          return
        }

        let region = ''
        let re = new RegExp('"countryCode":"(.*?)"', 'gm')
        let result = re.exec(data)
        if (result != null && result.length === 2) {
          region = result[1]
        } else if (data.indexOf('www.google.cn') !== -1) {
          region = 'CN'
        } else {
          region = 'US'
        }
        resolve(region)
      })
    })
  }

  let youtube_check_result = 'YouTube:  '

  try {
    const code = await inner_check()
    youtube_check_result +=
      code === 'Not Available'
        ? ' ✗'
        : ` ✓  →  ${getFlagEmoji(code)}`
  } catch (error) {
    youtube_check_result += 'Failed to detect, please refresh the panel.'
  }

  return youtube_check_result
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
          reject('Error')
          return
        }

        if (response.status === 403) {
          reject('Not Available')
          return
        }

        if (response.status === 404) {
          resolve('Not Found')
          return
        }

        if (response.status === 200) {
          let url = response.headers['x-originating-url']
          let region = url.split('/')[3]
          region = region.split('-')[0]
          if (region == 'title') {
            region = 'us'
          }
          resolve(region)
          return
        }

        reject('Error')
      })
    })
  }

  let netflix_check_result = 'Netflix:  '

  try {
    const code1 = await inner_check(80062035)
    if (code1 === 'Not Found') {
      const code2 = await inner_check(80018499)
      if (code2 === 'Not Found') {
        throw 'Not Available'
      }
      netflix_check_result += ` ﹆  →  ${getFlagEmoji(code2)}`;
    } else {
      netflix_check_result += ` ✓  →  ${getFlagEmoji(code1)}`
    }
  } catch (error) {
    if (error === 'Not Available') {
      netflix_check_result += ' ✗ '
    } else {
      netflix_check_result += 'Failed to detect, please refresh the panel.'
    }
  }

  return netflix_check_result
}

async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
    console.log(`homepage: region=${region}, cnbl=${cnbl}`)
    // 即将登陆
    //  if (cnbl == 2) {
    //    return { region, status: STATUS_COMING }
    //  }
    let { countryCode, inSupportedLocation } = await Promise.race([
      getLocationInfo(),
      timeout(7000),
    ])
    console.log(
      `getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`,
    )

    region = countryCode ?? region
    console.log('region:' + region)
    // 即将登陆
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    } else {
      // 支持解锁
      return { region, status: STATUS_AVAILABLE }
    }
  } catch (error) {
    console.log('error:' + error)

    // 不支持解锁
    if (error === 'Not Available') {
      console.log('not Available')
      return { status: STATUS_NOT_AVAILABLE }
    }

    // 检测超时
    if (error === 'timeout') {
      return { status: STATUS_TIMEOUT }
    }

    return { status: STATUS_ERROR }
  }
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      headers: {
        'Accept-Language': 'en',
        Authorization:
          'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query:
          'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
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
    }

    $httpClient.post(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }

      if (response.status !== 200) {
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      }

      data = JSON.parse(data)
      if (data?.errors) {
        console.log('getLocationInfo: ' + data)
        reject('Not Available')
        return
      }

      let {
        token: { accessToken },
        session: {
          inSupportedLocation,
          location: { countryCode },
        },
      } = data?.extensions?.sdk
      resolve({ inSupportedLocation, countryCode, accessToken })
    })
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts = {
      url: 'https://www.disneyplus.com/',
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }

    $httpClient.get(opts, function (error, response, data) {
      if (error) {
        reject('Error')
        return
      }
      if (
        response.status !== 200 ||
        data.indexOf('Sorry, Disney+ is not available in your region.') !== -1
      ) {
        reject('Not Available')
        return
      }

      let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
      if (!match) {
        resolve({ region: '', cnbl: '' })
        return
      }

      let region = match[1]
      let cnbl = match[2]
      resolve({ region, cnbl })
    })
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}
