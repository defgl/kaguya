!(async () => {
  let titlecontent = await new Promise((resolve) => getQuote(resolve));
  let weathercontent = await new Promise((resolve) => fetchweather(resolve));
  
  let panel = {
    title: `今日天气：${weathercontent}\n\n${titlecontent}`,
    icon: 'shield.lefthalf.filled.badge.checkmark',
    'icon-color': '#CD853F',
  };

  if ($trigger == "button") {
    await httpAPI("/v1/profiles/reload");
    await httpAPI("/v1/dns/flush");
  }

  let dnsCache = await new Promise((resolve) => getDNSCache(resolve));
  let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
  panel.content = `DNS: ${delay} ms\n${dnsCache}`;

  $done(panel);
})();

function getDNSCache(callback) {
  httpAPI("/v1/dns", "GET").then((result) => {
    let dnsCache = result.dnsCache;
    callback([...new Set(dnsCache.map((d) => d.server))].join("\n"));
  });
}

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}

function getQuote(callback) {
  $httpClient.get("https://international.v1.hitokoto.cn/?c=j&c=e&c=f&c=e&c=g&max_length=11", function(error, response, data) {
    if (error) {
      console.error(`Failed to fetch quote: ${error || '春宵一刻値千金.'}`);
      callback("");
    } else {
      let jsonData = JSON.parse(data);
      let hitokoto = jsonData.hitokoto;
      let from = jsonData.from;
      let from_who = jsonData.from_who;
      callback(from_who ? `${hitokoto} \n / ${from_who} 《${from}》` : `${hitokoto}\n /《${from}》`);
    }
  });
}

function fetchweather(callback) {
  $httpClient.get('https://api.vvhan.com/api/weather', function(error, response, data) {
    if (error || !JSON.parse(data).success) {
      console.error(`Failed to fetch weather: ${error || '花有淸香月有陰.'}`);
      callback("");
    } else {
      let weatherInfo = JSON.parse(data).info;
      let week = weatherInfo.week.replace('星期', '周');
      callback(`${JSON.parse(data).city.replace(/市$/, '')} · ${week}\n${weatherInfo.type} · ${weatherInfo.low} — ${weatherInfo.high} · AQI:${weatherInfo.air.aqi}\n${weatherInfo.tip}`);
    }
  });
}