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
    "monospace-regular": ["𝟶","𝟷","𝟸","𝟹","𝟺","𝟻","𝟼","𝟽","𝟾","𝟿"],
  };

  const INDEX = { "48": 0, "49": 1, "50": 2, "51": 3, "52": 4, "53": 5, "54": 6, "55": 7, "56": 8, "57": 9 };

  delay = [...delay.toString()].map(c => {
    const code = c.charCodeAt(0).toString();
    const index = INDEX[code];
    return TABLE["monospace-regular"][index];
  }).join("");

  console.log("Transformed delay: ", delay);

  $done({
    title: `${titlecontent}\n${weathercontent}`,
    content: `𝙵𝚕𝚞𝚜𝚑: ${delay} 𝚖𝚜`,
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
        let formattedData = `${parsedData.city.replace(/市$/, '')} · ${weatherInfo.week}\n${weatherInfo.type} · ${weatherInfo.low} — ${weatherInfo.high} · AQI${weatherInfo.air.aqi}\n${weatherInfo.tip}`;
        resolve(formattedData);
      } else {
        reject('failed to fetch data');
      }
    });
  });
}