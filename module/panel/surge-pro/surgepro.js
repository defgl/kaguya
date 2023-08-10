/*
 * 由@fishingworld编写
 * 原脚本地址：https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/surgepro_reloadprofile.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.15
 * 版本：1.5
*/

// let params = getParams($argument)

const icon = "bubbles.and.sparkles.fill";
const color = "#f6c970";

!(async () => {
  /* 时间获取 */
  let traffic = (await httpAPI("/v1/traffic","GET"))
  let dateNow = new Date()
  let dateTime = Math.floor(traffic.startTime*1000)
  let startTime = timeTransform(dateNow,dateTime)

  let titlecontent = await fetchtitlecontent();

  if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
    title: titlecontent,
    content: `Started: ${startTime}\n${dnsContent}`,
    icon: params.icon,
    "icon-color": params.color
});

})();

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

function timeTransform(dateNow,dateTime) {
let dateDiff = dateNow - dateTime;
let days = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
let leave1=dateDiff%(24*3600*1000)    //计算天数后剩余的毫秒数
let hours=Math.floor(leave1/(3600*1000))//计算出小时数
//计算相差分钟数
let leave2=leave1%(3600*1000)    //计算小时数后剩余的毫秒数
let minutes=Math.floor(leave2/(60*1000))//计算相差分钟数
//计算相差秒数
let leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
let seconds=Math.round(leave3/1000)

if (days == 0 && hours == 0 && minutes == 0) {
  return `${seconds}s`;
} else if (days == 0 && hours == 0) {
  return `${minutes}:${seconds}`;
} else if (days == 0) {
  return `${hours}:${minutes}:${seconds}`;
} else {
  return `${days}D ${hours}:${minutes}`;
}

}


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
  dnsContent = `Ping DNS: ${delay}ms${dnsCache ? `\nserver:\n${dnsCache}` : ""}`;
})();


function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

// function getParams(param) {
//   return Object.fromEntries(
//     $argument
//       .split("&")
//       .map((item) => item.split("="))
//       .map(([k, v]) => [k, decodeURIComponent(v)])
//   );
// }