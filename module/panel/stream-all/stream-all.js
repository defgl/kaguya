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
    function convertToItalicUnicode(text) {
  // 斜体字符的Unicode映射
  const italicCharMap = {
    'A': '𝐴', 'B': '𝐵', 'C': '𝐶', 'D': '𝐷', 'E': '𝐸',
    'F': '𝐹', 'G': '𝐺', 'H': '𝐻', 'I': '𝐼', 'J': '𝐽',
    'K': '𝐾', 'L': '𝐿', 'M': '𝑀', 'N': '𝑁', 'O': '𝑂',
    'P': '𝑃', 'Q': '𝑄', 'R': '𝑅', 'S': '𝑆', 'T': '𝑇',
    'U': '𝑈', 'V': '𝑉', 'W': '𝑊', 'X': '𝑋', 'Y': '𝑌',
    'Z': '𝑍', 'a': '𝑎', 'b': '𝑏', 'c': '𝑐', 'd': '𝑑',
    'e': '𝑒', 'f': '𝑓', 'g': '𝑔', 'h': '𝒉', 'i': '𝒊',
    'j': '𝒋', 'k': '𝒌', 'l': '𝒍', 'm': '𝒎', 'n': '𝒏',
    'o': '𝒐', 'p': '𝒑', 'q': '𝒒', 'r': '𝒓', 's': '𝒔',
    't': '𝒕', 'u': '𝒖', 'v': '𝒗', 'w': '𝒘', 'x': '𝒙',
    'y': '𝒚', 'z': '𝒛', '0': '𝟎', '1': '𝟏', '2': '𝟐',
    '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕',
    '8': '𝟖', '9': '𝟗'
  };

  return text.split('').map(char => italicCharMap[char] || char).join('');
}

// 示例用法
let panel_result = {
  title: "",
  content: '',
  icon: 'movieclapper.fill',
  'icon-color': '#318ce7',
};

    //let fetchTextContent = new Promise((resolve, reject) => {
    //  let url = 'https://v.api.aa1.cn/api/api-wenan-yingwen/index.php?type=json';
    //  $httpClient.get(url, function(error, response, data) {
    //    if (error) {
    //      reject(error);
    //      return;
    //    }
    //    if (response.status !== 200) {
    //      reject(new Error(`Failed to fetch data. HTTP Status: ${response.status}`));
    //      return;
    //    }
    //    let jsonData = JSON.parse(data);
    //    // 访问数组的第一个元素，并获取其 'qinggan' 字段
    //    resolve(jsonData.text);
    //  });
    //});

    // let fetchTextContent = new Promise((resolve, reject) => {
    //   let url = 'https://zj.v.api.aa1.cn/api/wenan-mj/?type=json';
    //   $httpClient.get(url, function(error, response, data) {
    //     if (error) {
    //       reject(error);
    //       return;
    //     }
    //     if (response.status !== 200) {
    //       reject(new Error(`Failed to fetch data. HTTP Status: ${response.status}`));
    //       return;
    //     }
    //     let jsonData = JSON.parse(data);
    //     resolve(jsonData.msg);
    //   });
    // });

    // let fetchTextContent = new Promise((resolve, reject) => {
    //   let url = 'https://v.api.aa1.cn/api/api-wenan-qg/index.php?aa1=json';
    //   $httpClient.get(url, function(error, response, data) {
    //     if (error) {
    //       reject(error);
    //       return;
    //     }
    //     if (response.status !== 200) {
    //       reject(new Error(`Failed to fetch data. HTTP Status: ${response.status}`));
    //       return;
    //     }
    //     let jsonData = JSON.parse(data);
    //     resolve(jsonData[0].qinggan);
    //   });
    // });

    let fetchTextContent = new Promise((resolve, reject) => {
      let url = 'https://api.vvhan.com/api/ian?type=json&cl=ac';
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
        let vhan = jsonData.data.vhan;
        let source = jsonData.data.source;
        let result = `${vhan} — ${source}`;
        resolve(result);
      });
    });



      // 使用await来获取text内容并设置为title
      panel_result.title = await fetchTextContent;
  
    let [{ region, status }] = await Promise.all([testDisneyPlus()])
    await Promise.all([check_youtube_premium(), check_netflix()])
      .then((result) => {
        let disney_result = '𝑫𝒊𝒔𝒏𝒆𝒚+: ';

        if (status === STATUS_COMING) {
          disney_result += `Coming soon. | ${getFlagEmoji(region)}`;
        } else if (status === STATUS_AVAILABLE) {
          disney_result += `Enjoy ur shows now. | ${getFlagEmoji(region)}`;
        } else if (status === STATUS_NOT_AVAILABLE) {
          disney_result += `Not available.`;
        } else if (status === STATUS_TIMEOUT) {
          disney_result += `Failed to check.`;
        }
  
          // 构建结果并应用斜体转换
  result.push(disney_result);
  let content = result.join('\n');
  panel_result['content'] = convertToItalicUnicode(content);

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
          resolve('Not Available')
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

  let youtube_check_result = '𝒀𝒐𝒖𝑻𝒖𝒃𝒆: '

  try {
    const code = await inner_check();
    if (code === 'Not Available') {
      youtube_check_result += 'Not Available';
    } else {
      const flag = getFlagEmoji(code);
      youtube_check_result += `Enjoy ur time now. | ${flag}`;
    }
  } catch (error) {
    youtube_check_result += 'Failed to check.';
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

  let netflix_check_result = '𝑵𝑬𝑻𝑭𝑳𝑰𝑿: ';

  try {
    const code1 = await inner_check(80062035);
    if (code1 === 'Not Found') {
      const code2 = await inner_check(80018499);
      if (code2 === 'Not Found') {
        throw 'Not Available';
      }
      netflix_check_result += `Only native shows available | ${getFlagEmoji(code2)}`;
    } else {
      netflix_check_result += `Enjoy ur shows now. | ${getFlagEmoji(code1)}`;
    }
  } catch (error) {
    if (error === 'Not Available') {
      netflix_check_result += 'Not Available';
    } else {
      netflix_check_result += 'Failed to check.';
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
      if(data?.errors){
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
      if (response.status !== 200 || data.indexOf('Sorry, Disney+ is not available in your region.') !== -1) {
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
