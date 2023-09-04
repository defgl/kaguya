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
  // let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);

  // $done({
  //   title: titlecontent,
  //   // content: `𝙵𝚕𝚞𝚜𝚑: ${delay}𝚖𝚜${dnsCache ? `\nserver:\n${dnsCache}` : ""}`,
  //   content: `𝙵𝚕𝚞𝚜𝚑: ${delay} 𝚖𝚜`,
  //   icon: 'arcade.stick.and.arrow.left.and.arrow.right',
  //   'icon-color': '#CD853F',
  // });

  const TABLE = {
    "monospace-regular": ["𝟶","𝟷","𝟸","𝟹","𝟺","𝟻","𝟼","𝟽","𝟾","𝟿","𝚊","𝚋","𝚌","𝚍","𝚎","𝚏","𝚐","𝚑","𝚒","𝚓","𝚔","𝚕","𝚖","𝚗","𝚘","𝚙","𝚚","𝚛","𝚜","𝚝","𝚞","𝚟","𝚠","𝚡","𝚢","𝚣","𝙰","𝙱","𝙲","𝙳","𝙴","𝙵","𝙶","𝙷","𝙸","𝙹","𝙺","𝙻","𝙼","𝙽","𝙾","𝙿","𝚀","𝚁","𝚂","𝚃","𝚄","𝚅","𝚆","𝚇","𝚈","𝚉"],
};

const INDEX = { "48": 0, "49": 1, "50": 2, "51": 3, "52": 4, "53": 5, "54": 6, "55": 7, "56": 8, "57": 9 };

let delay = ((await httpAPI("/v1/test/dns_delay")).delay * 1000).toFixed(0);
delay = [...delay.toString()].map(c => {
    const code = c.charCodeAt(0).toString();
    const index = INDEX[code];
    return TABLE["monospace-regular"][index];
}).join("");

$done({
    title: titlecontent,
    content: `𝙵𝚕𝚞𝚜𝚑: ${delay} 𝚖𝚜`,
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