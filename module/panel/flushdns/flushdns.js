/*
 * 由@zZPiglet编写
 * 原脚本地址：https://raw.githubusercontent.com/zZPiglet/Task/master/asset/flushDNS.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.17
 * 版本：1.6
 */

!(async () => {
  let showServer = true,
      dnsCache;
  if (typeof $argument != "undefined") {
      let arg = Object.fromEntries($argument.split("&").map((item) => item.split("=")));
      if (arg.title) panel.title = arg.title;
      if (arg.icon) panel.icon = arg.icon;
      if (arg.color) panel["icon-color"] = arg.color;
      if (arg.server == "false") showServer = false;
  }
  if (showServer) {
      dnsCache = (await httpAPI("/v1/dns", "GET")).dnsCache;
      dnsCache = [...new Set(dnsCache.map((d) => d.server))].toString().replace(/,/g, "\n");
  }
  if ($trigger == "button") await httpAPI("/v1/dns/flush");
  let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);

  let titlecontent = await fetchtitlecontent();

  if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
    title: titlecontent,
    content: `Flush: ${delay}ms${dnsCache ? `\nserver:\n${dnsCache}` : ""}`,
    icon: params.icon,
    "icon-color": params.color
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
    let url = 'https://zj.v.api.aa1.cn/api/wenan-shici/?type=json';
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        reject(`error: ${error.message}`);
        return;
      }
      if (response.status !== 200) {
        reject(`failed to fetch data. http status: ${response.status}`);
        return;
      }
      let jsondata = JSON.parse(data);
      let fulltext = jsondata.msg;
      let extractedtext = fulltext.split("。——")[0] + "。";
      resolve(extractedtext);
    });
  });
}