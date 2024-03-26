!(async () => {
  let quote = await getQuote();
  let weather = await getWeather();

  let traffic = await httpAPI("/v1/traffic", "GET");
  let dateNow = new Date();
  let dateTime = Math.floor(traffic.startTime * 1000);
  let startTime = timeTransform(dateNow, dateTime);

  let panel = {
    title: `❀ | ${weather}\n❀ | ${quote}`,
    //icon: 'shield.lefthalf.filled.badge.checkmark',
    icon: 'opticid.fill',
    //'icon-color': '#CD853F',
    'icon-color': '#318ce7',
  };

  if ($trigger == "button") {
    await httpAPI("/v1/profiles/reload");
    await httpAPI("/v1/dns/flush");
  }
  
  let dnsCache = await getDNSCache();
  let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
  panel.content = `启动时长⏱️ : ${startTime} | DNS延迟: ${delay} ms${dnsCache}`;

  $done(panel);
})();

function timeTransform(dateNow, dateTime) {
  let dateDiff = dateNow - dateTime;
  let days = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
  let leave1 = dateDiff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  let hours = Math.floor(leave1 / (3600 * 1000)); //计算出小时数
  let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
  let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  let seconds = Math.round(leave3 / 1000);

  if (days == 0) {
    if (hours == 0) {
      if (minutes == 0) return `${seconds}`;
      return `${minutes}:${seconds}`;
    }
    return `${hours}:${minutes}:${seconds}`;
  } else {
    return `${days} · ${hours}:${minutes}`;
  }
}

async function getDNSCache() {
  let dnsCache = (await httpAPI("/v1/dns", "GET")).dnsCache;
  return [...new Set(dnsCache.map((d) => d.server))].join("\n");
}

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}

async function getQuote() {
  return new Promise((resolve, reject) => {
    $httpClient.get("https://international.v1.hitokoto.cn/?c=j&c=e&c=f&c=e&c=g&max_length=15", function(error, response, data) {
      if (error) {
        console.error(`Failed to fetch quote: ${error}`);
        resolve("見面吧，就現在。");
        return;
      }
      
      if (response.status !== 200) {
        console.error(`Failed to fetch quote. Status code: ${response.status}`);
        resolve("見面吧，就現在。");
        return;
      }
      
      let jsonData = JSON.parse(data);
      let hitokoto = jsonData.hitokoto;
      let from = jsonData.from;
      let from_who = jsonData.from_who;
      let result = from_who ? `${hitokoto} \n                  / ${from_who} 《${from}》` : `${hitokoto}\n                  / 《${from}》`;
      resolve(result);
    });
  });
}

async function getWeather() {
  return new Promise((resolve, reject) => {
    $httpClient.get('https://api.vvhan.com/api/weather', function(error, response, data) {
      if (error) {
        console.error(`Failed to fetch weather: ${error}`);
        resolve("天氣好的話，我會去找你。");
        return;
      }
      if (response.status !== 200) {
        console.error(`Failed to fetch weather. Status code: ${response.status}`);
        resolve("天氣好的話，我會去找你。");
        return;
      }
      let parsedData = JSON.parse(data);
      if (parsedData.success) {
        let weatherInfo = parsedData.data;
        let week = weatherInfo.week.replace('星期', '周');
        let result = `${parsedData.city.replace(/市$/, '')} · ${week}\n${weatherInfo.type} · ${weatherInfo.low} — ${weatherInfo.high} · AQI:${parsedData.air.aqi}\n${parsedData.tip}`;
        resolve(result);
      } else {
        console.error('Failed to fetch weather data');
        resolve("天氣好的話，我會去找你。");
      }
    });
  });
}