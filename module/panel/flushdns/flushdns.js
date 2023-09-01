/*
 * 由@zZPiglet编写
 * 原脚本地址：https://raw.githubusercontent.com/zZPiglet/Task/master/asset/flushDNS.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.17
 * 版本：1.6
 */

!(async () => {

  let titlecontent = await fetchtitlecontent();
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

  $done({
    title: titlecontent,
    // content: `𝙵𝚕𝚞𝚜𝚑: ${delay}𝚖𝚜${dnsCache ? `\nserver:\n${dnsCache}` : ""}`,
    content: `𝙵𝚕𝚞𝚜𝚑: ${delay}𝚖𝚜`,
    icon: 'arcade.stick.and.arrow.left.and.arrow.right',
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

async function fetchtitlecontent() {
  return new Promise((resolve, reject) => {
    let url = 'https://api.sfhzb.cn/api/wenrou.php';
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (response.status !== 200) {
        reject(`failed to fetch data. http status: ${response.status}`);
        return;
      }
      let regex = /━━━━━━━━━\n(.+)\n━━━━━━━━━/;
      let extractedtext = data.match(regex)[1];
      resolve(extractedtext);
    });
  });
}