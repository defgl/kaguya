/*
 * 由@fishingworld编写
 * 原脚本地址：https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/surgepro_reloadprofile.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.15
 * 版本：1.5
*/

let params = getParams($argument)

!(async () => {
  /* 时间获取 */
  let traffic = (await httpAPI("/v1/traffic","GET"))
  let dateNow = new Date()
  let dateTime = Math.floor(traffic.startTime*1000)
  let startTime = timeTransform(dateNow,dateTime)

    // 打印原始的 startTime
    console.log("Original startTime: ", startTime);

    // 字体转换
    // startTime = transformFont(startTime, TABLE, INDEX);
  
    // 打印转换后的 startTime
    // console.log("Transformed startTime: ", startTime);
  
  let titlecontent = await fetchtitlecontent();

  if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
    title: titlecontent,
    content: `✌𝓢𝓽𝓪𝓻𝓽𝓮𝓭✌: ${startTime}`,
    icon: params.icon,
    "icon-color": params.color
  });

})();

async function fetchtitlecontent() {
    return new Promise((resolve, reject) => {
    let url = 'https://v1.hitokoto.cn';
    $httpClient.get(url, function(error, response, data) {
      if (error) {
        reject(`Error: ${error.message}`);
        return;
      }
      if (response.status !== 200) {
        reject(`HTTP error! status: ${response.status}`);
        return;
      }
      try {
        let jsondata = JSON.parse(data);
        if (jsondata.from_who) {
          let quote = `${jsondata.hitokoto} - ${jsondata.from_who} • ${jsondata.creator}`;
          resolve(quote);
        } else {
          resolve(jsondata.hitokoto);
        }
      } catch (error) {
        reject(`Error parsing JSON: ${error.message}`);
      }
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
  return `${seconds}𝚜`;
} else if (days == 0 && hours == 0) {
  return `${minutes}:${seconds}`;
} else if (days == 0) {
  return `${hours}:${minutes}:${seconds}`;
} else {
  return `${days}𝚍 ${hours}:${minutes}`;
}

}

function httpAPI(path = "", method = "POST", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
}

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}

// 字体表
const TABLE = {
  "monospace-regular": ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿", "𝚊", "𝚋", "𝚌", "𝚍", "𝚎", "𝚏", "𝚐", "𝚑", "𝚒", "𝚓", "𝚔", "𝚕", "𝚖", "𝚗", "𝚘", "𝚙", "𝚚", "𝚛", "𝚜", "𝚝", "𝚞", "𝚟", "𝚠", "𝚡", "𝚢", "𝚣", "𝙰", "𝙱", "𝙲", "𝙳", "𝙴", "𝙵", "𝙶", "𝙷", "𝙸", "𝙹", "𝙺", "𝙻", "𝙼", "𝙽", "𝙾", "𝙿", "𝚀", "𝚁", "𝚂", "𝚃", "𝚄", "𝚅", "𝚆", "𝚇", "𝚈", "𝚉"],
};

// 索引对象
const INDEX = {};
for (let i = 48; i <= 57; i++) INDEX[i] = i - 48; // 数字 0-9
for (let i = 65; i <= 90; i++) INDEX[i] = i - 65 + 36; // 大写字母 A-Z
for (let i = 97; i <= 122; i++) INDEX[i] = i - 97 + 10; // 小写字母 a-z

// 字体转换函数
function transformFont(str, table, index) {
  return [...(str || '')].map(c => {
    const code = c.charCodeAt(0).toString();
    const idx = index[code];
    return table["monospace-regular"][idx] || c;
  }).join('');
}
