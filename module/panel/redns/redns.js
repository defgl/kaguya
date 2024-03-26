!(async () => {
  let quote = await getQuote();
  let weather = await getWeather();
  let panel = {
    title: `今日天气：${weather}\n\n${quote}`,
    icon: 'shield.lefthalf.filled.badge.checkmark',
    'icon-color': '#CD853F',
  };

  if ($trigger == "button") {
    await httpAPI("/v1/profiles/reload");
    await httpAPI("/v1/dns/flush");
  }
  
  let dnsCache = await getDNSCache();
  let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
  panel.content = `DNS: ${delay} ms\n${dnsCache}`;

  $done(panel);
})();

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
    $httpClient.get("https://international.v1.hitokoto.cn/?c=j&c=e&c=f&c=e&c=g&max_length=11", function(error, response, data) {
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
      let result = from_who ? `${hitokoto} \n            / ${from_who} 《${from}》` : `${hitokoto}\n            / ${from}》`;
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