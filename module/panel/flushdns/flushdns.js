/*
 * 由@zZPiglet编写
 * 原脚本地址：https://raw.githubusercontent.com/zZPiglet/Task/master/asset/flushDNS.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.17
 * 版本：1.6
 */

!(async () => {

  let titlecontent = await fetchwenxueyiyan();
  let weathercontent = await fetchweather();
  let showServer = false;

  if ($trigger == "button") {
    await httpAPI("/v1/profiles/reload");
    await httpAPI("/v1/dns/flush");
  }

  if (showServer) {
    let dnsCache = (await httpAPI("/v1/dns", "GET")).dnsCache;
    dnsCache = [...new Set(dnsCache.map((d) => d.server))].toString().replace(/,/g, "\n");
  }

  let dnsCache = (await httpAPI("/v1/dns", "GET")).dnsCache;
  dnsCache = [...new Set(dnsCache.map((d) => d.server))].toString().replace(/,/g, "\n");

  let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
  console.log("API returned delay: ", delay);

  const TABLE = {
    "monospace-regular": [
      "𝘼", "𝙖", "𝘽", "𝙗", "𝘾", "𝙘", "𝘿", "𝙙", "𝙀", "𝙚", "𝙁", "𝙛", "𝙂", "𝙜", "𝙃", "𝙝", "𝙄", "𝙞", "𝙅", "𝙟", "𝙆", "𝙠", "𝙇", "𝙡", "𝙈", "𝙢", "𝙉", "𝙣", "𝙊", "𝙤", "𝙋", "𝙥", "𝙌", "𝙦", "𝙍", "𝙧", "𝙎", "𝙨", "𝙏", "𝙩", "𝙐", "𝙪", "𝙑", "𝙫", "𝙒", "𝙬", "𝙓", "𝙭", "𝙔", "𝙮", "𝙕", "𝙯", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵", "𝟬"
    ],
  };

  const INDEX = {};
  'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890'.split('').forEach((char, i) => {
    INDEX[char.charCodeAt(0)] = i;
  });

  delay = [...delay.toString()].map(c => {
    const code = c.charCodeAt(0);
    if ((code >= 48 && code <= 57) || // numeric (0-9)
        (code >= 65 && code <= 90) || // upper alpha (A-Z)
        (code >= 97 && code <= 122)) { // lower alpha (a-z)
      const index = INDEX[code];
      return TABLE["monospace-regular"][index];
    } else {
      return c;
    }
  }).join("");

  console.log("Transformed delay: ", delay);
  console.log("Transformed weather content: ", weathercontent);
  
  weathercontent = [...weathercontent].map(c => {
    const code = c.charCodeAt(0);
    if ((code >= 48 && code <= 57) || // numeric (0-9)
        (code >= 65 && code <= 90) || // upper alpha (A-Z)
        (code >= 97 && code <= 122)) { // lower alpha (a-z)
      const index = INDEX[code];
      return TABLE["monospace-regular"][index];
    } else {
      return c;
    }
  }).join("");

  console.log("Transformed weather content: ", weathercontent);

  $done({
    title: `${weathercontent}\n${titlecontent}`,
    content: `𝘍𝘭𝘶𝘴𝘩: ${delay} 𝘮𝘴`,
    icon: 'shield.lefthalf.filled.badge.checkmark',
    'icon-color': '#CD853F',
  });

})();

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
      $httpAPI(method, path, body, (result) => {
          resolve(result);
      });
  });
}

// async function fetchtitlecontent() {
//   return new Promise((resolve, reject) => {
//     let url = 'https://api.sfhzb.cn/api/wenrou.php';
//     $httpClient.get(url, function(error, response, data) {
//       if (error) {
//         reject(`error: ${error.message}`);
//         return;
//       }
//       if (response.status !== 200) {
//         reject(`failed to fetch data. http status: ${response.status}`);
//         return;
//       }
//       let regex = /━━━━━━━━━\n(.+)\n━━━━━━━━━/;
//       let extractedtext = data.match(regex)[1];
//       resolve(extractedtext);
//     });
//   });
// }
async function fetchwenxueyiyan() {
  return new Promise((resolve, reject) => {
    let url = 'https://api.vvhan.com/api/ian?cl=wx&type=json';
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (response.status !== 200) {
        reject(`failed to fetch data. http status: ${response.status}`);
        return;
      }
      let parsedData = JSON.parse(data);
      if (parsedData.success) {
        let extractedtext = `「${parsedData.data.vhan} - ${parsedData.data.source}」`;
        resolve(extractedtext);
      } else {
        reject('failed to fetch data');
      }
    });
  });
}

async function fetchweather() {
  return new Promise((resolve, reject) => {
    let url = 'https://api.vvhan.com/api/weather';
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (response.status !== 200) {
        reject(`failed to fetch data. http status: ${response.status}`);
        return;
      }
      let parsedData = JSON.parse(data);
      if (parsedData.success) {
        let weatherInfo = parsedData.info;
        let week = weatherInfo.week.replace('星期', '周');
        let formattedData = `${parsedData.city.replace(/市$/, '')} · ${weatherInfo.week}\n${weatherInfo.type} · ${weatherInfo.low} — ${weatherInfo.high} · AQI:${weatherInfo.air.aqi}\n${weatherInfo.tip}`;
        resolve(formattedData);
      } else {
        reject('failed to fetch data');
      }
    });
  });
}