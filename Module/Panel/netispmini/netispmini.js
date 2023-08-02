// 2023-06-21 15:48:46

const defaultData = {
    "内网": true,
    "本机": true,
    nw: true,
    "-----说明:可在持久化数据KeyNetisp中更改是否在面板中显示": "开为:true, 关为:false ------"
  };
  
  function readData() {
    const storedData = $persistentStore.read("KeyNetisp");
    try {
      return storedData ? JSON.parse(storedData) : defaultData;
    } catch (error) {
      console.log("无数据或数据错误");
      delete defaultData.nw;
      $persistentStore.write(JSON.stringify(defaultData), "KeyNetisp");
      return defaultData;
    }
  }
  
  function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `  ${month}月${day} ${hours}:${minutes}`;
  }
  
  async function getLocalIp() {
    const network = $network;
    const dns = network.dns;
    const cellularData = network["cellular-data"];
    const wifi = network.wifi;
    let localIp = "";
    if (wifi.ssid !== null) {
      for (let i = 0; i < dns.length; i++) {
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(dns[i])) {
          localIp = dns[i];
          break;
        }
      }
      const ipType = wifi.ipv6 ? "IPv6" : "";
      localIp = `内网: ${wifi.ssid}: ${ipType} ${wifi.v4.primaryAddress}: ${await getLatency("http://connectivitycheck.platform.hicloud.com/generate_204")}ms\n`;
    } else if (cellularData) {
      const ipType = cellularData.radio ? cellularData.radio : "";
      localIp = `内网: ${ipType}: ${network.v4.primaryAddress}: ${await getLatency("http://connectivitycheck.platform.hicloud.com/generate_204")}ms\n`;
    }
    return localIp;
  }
  
  async function getBiliIp() {
    const response = await getLatency("https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr");
    if (response.code === 0) {
      const { addr, province, city, isp } = response.data;
      const latency = await getLatency("http://ip-api.com/json/" + addr + "?lang=zh-CN");
      const formattedIsp = isp.replace(/.*广电.*/g, "广电");
      return `本机: ${province}${formattedIsp}: ${addr}: ${latency}ms\n`;
    } else {
      return `Biliapi ${response}\n`;
    }
  }
  
  async function getGptIp() {
    const response = await getLatency("http://chat.openai.com/cdn-cgi/trace");
    const countries = ["CN", "TW", "HK", "IR", "KP", "RU", "VE", "BY"];
    if (typeof response === "string") {
      const { loc, tk, warp, ip } = response;
      const countryIndex = countries.indexOf(loc);
      let status = "";
      if (countryIndex === -1) {
        status = "GPT: " + loc + " ✓";
      } else {
        status = "GPT: " + loc + " ×";
      }
      if (warp === "plus") {
        warp = "Plus";
      }
      return `${status}       ➟     Priv: ${warp}   ${tk}ms`;
    } else {
      return `ChatGPT ${response}`;
    }
  }
  
  async function getEntranceIp(ip) {
    let isDirect = false;
    let domain = "spe";
    let isIpv6 = false;
    let isChina = true;
    let latency = "";
    let zone = "";
    if (ip === "Noip") {
      isDirect = true;
    } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      isIpv6 = false;
    } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip)) {
      isIpv6 = true;
    }
    if (ip === pdldip) {
      isChina = false;
      zone = "直连: ";
    } else {
      zone = "落地: ";
      if (!isDirect || isIpv6) {
        const response = await getLatency(`https://api-v3.${domain}edtest.cn/ip?ip=${ip}`);
        if (response.code === 0 && response.data.country === "中国") {
          const { province, isp } = response.data;
          const formattedIsp = sK(isp, 4);
          latency = response.tk;
          return `入口: ${province}${formattedIsp}: ${ip}: ${latency}ms\n`;
        } else {
          isChina = false;
          return `入口IPA${response}\n`;
        }
      }
      if ((!isDirect || !isIpv6) && !isChina) {
        const response = await getLatency(`http://ip-api.com/json/${ip}?lang=zh-CN`);
        if (response.status === "success") {
          const { country, city, org } = response;
          latency = response.tk;
          return `入口: ${city}${org}: ${ip}: ${latency}ms\n`;
        } else {
          return `入口IPB${response}\n`;
        }
      }
    }
    return zone;
  }
  
  async function getLatency(url) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      $httpClient.get(url, (error, response, body) => {
        if (error) {
          reject(error);
        } else {
          const latency = Date.now() - start;
          try {
            const contentType = response.headers["Content-Type"];
            switch (true) {
              case contentType.includes("application/json"):
                const data = JSON.parse(body);
                data.tk = latency;
                resolve(data);
                break;
              case contentType.includes("text/html"):
                resolve("text/html");
                break;
              case contentType.includes("text/plain"):
                const lines = body.split("\n");
                const keyValuePairs = lines.reduce((accumulator, line) => {
                  const [key, value] = line.split("=");
                  accumulator[key] = value;
                  accumulator.tk = latency;
                  return accumulator;
                }, {});
                resolve(keyValuePairs);
                break;
              case contentType.includes("image/svg+xml"):
                resolve("image/svg+xml");
                break;
              default:
                resolve("未知");
                break;
            }
          } catch (error) {
            reject(error);
          }
        }
      });
    });
  }
  
  (async () => {
    const data = readData();
    const loca = data["内网"];
    const bj = data["本机"];
    if (data.nw || typeof loca !== "boolean" || typeof bj !== "boolean") {
      delete defaultData.nw;
      $persistentStore.write(JSON.stringify(defaultData), "KeyNetisp");
    }
    const pdldip = "";
    const outbli = bj ? await getBiliIp() : "";
    const outgpt = await getGptIp();
    const outld = "";
    const outik = "";
    const local = loca ? await getLocalIp() : "";
    const entranceIp = await getEntranceIp(pdldip);
    const date = new Date();
    const day = formatDate(date);
    $done({
      title: outgpt,
      content: local + outbli + outik + entranceIp + outld + day,
      icon: antenna.radiowaves.left.and.right,
      "icon-color": "#4682B4"
    });
  })();