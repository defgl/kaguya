/*
 * 由@fishingworld编写
 * 原脚本地址：https://raw.githubusercontent.com/fishingworld/something/main/PanelScripts/surgepro_reloadprofile.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.15
 * 版本：1.5
 */

!(async () => {
  /* 时间获取 */
  let traffic = (await httpAPI("/v1/traffic","GET"))
  let dateNow = new Date()
  let dateTime = Math.floor(traffic.startTime*1000)
  let startTime = timeTransform(dateNow,dateTime)

  // 打印原始的 startTime
  console.log("Original startTime: ", startTime);

  let titlecontent = await fetchtitlecontent();

  if ($trigger == "button") await httpAPI("/v1/profiles/reload");

  $done({
    title: titlecontent,
    content: `已啟動: ${startTime}`,
    icon: arrowshape.forward.circle.fill,
    "icon-color": "#ffb7c5"
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
          let quote = `${jsondata.hitokoto} ⸺ 「${jsondata.from_who} • ${jsondata.creator}`;
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


  if(days == 0) {
    if(hours == 0) {
      if(minutes == 0) return(`${seconds}`);
      return(`${minutes}.${seconds}`);
    }
    return(`${hours}:${minutes}.${seconds}`);
  } else {
    return(`${days}.${hours}:${minutes}`);
  }

}

function httpAPI(path = "", method = "POST", body = null) {
  return new Promise((resolve) => {
    $httpAPI(method, path, body, (result) => {
      resolve(result);
    });
  });
}