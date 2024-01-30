/*
 * 由@fishingworld编写
 * 原脚本地址：https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/surgepro_reloadprofile.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.15
 * 版本：1.5
*/

function getParams() {
  return {
    icon: "opticid.fill",
    color: "#318ce7"
  };
}

// 剩下的代码保持不变
let params = getParams();
// 使用params对象中的数据

const TABLE = {
  "monospace-regular": [
    "𝘼", "𝙖", "𝘽", "𝙗", "𝘾", "𝙘", "𝘿", "𝙙", "𝙀", "𝙚", "𝙁", "𝙛", "𝙂", "𝙜", "𝙃", "𝙝", "𝙄", "𝙞", "𝙅", "𝙟", "𝙆", "𝙠", "𝙇", "𝙡", "𝙈", "𝙢", "𝙉", "𝙣", "𝙊", "𝙤", "𝙋", "𝙥", "𝙌", "𝙦", "𝙍", "𝙧", "𝙎", "𝙨", "𝙏", "𝙩", "𝙐", "𝙪", "𝙑", "𝙫", "𝙒", "𝙬", "𝙓", "𝙭", "𝙔", "𝙮", "𝙕", "𝙯", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵", "𝟬"
  ],
};

const INDEX = {};
'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890'.split('').forEach((char, i) => {
  INDEX[char.charCodeAt(0)] = i;
});

let transformedStartTime = [...startTime.toString()].map(c => {
  const code = c.charCodeAt(0);
  if ((code >= 48 && code <= 57) || // numeric (0-9)
      (code >= 65 && code <= 90) || // upper alpha (A-Z)
      (code >= 97 && code <= 122)) { // lower alpha (a-z)
    const index = INDEX[code];
    return TABLE["monospace-regular"][index];
  } else {
    return c;
  }
}).join("");

// Modify the content to use transformedStartTime
let content = `已啟動: ${transformedStartTime}`;

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
    content,
    icon: params.icon,
    "icon-color": params.color
  });

})();


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

if(days==0){

	if(hours==0){
	if(minutes==0)return(`${seconds}秒`);
	return(`${minutes}分${seconds}秒`)
	}
	return(`${hours}时${minutes}分${seconds}秒`)
	}else {
	return(`${days}天${hours}时${minutes}分`)
	}
}

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
          let quote = `${jsondata.hitokoto} - ${jsondata.from_who}《${jsondata.from}》 -`;
          resolve(quote);
        } else {
          resolve(`${jsondata.hitokoto} - 《${jsondata.from}》 -`);
        }
      } catch (error) {
        reject(`Error parsing JSON: ${error.message}`);
      }
    });
  });
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