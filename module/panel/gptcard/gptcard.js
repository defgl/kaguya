(async () => {
  
  let titlecontent = await fetchtitlecontent();

  // 定义默认值
  const defaultValues = {
    icon: 'dial.high.fill',
    iconerr: 'dial.low.fill',
    'icon-color': '#483d8b',
    'iconerr-color': '#d8bfd8'
  };

  // 处理 argument 参数
  let titlediy, icon, iconerr, iconColor, iconerrColor;
  if (typeof $argument !== 'undefined') {
    const args = $argument.split('&');
    for (let i = 0; i < args.length; i++) {
      const [key, value] = args[i].split('=');
      if (key === 'title') {
        titlediy = value;
      } else if (key === 'icon') {
        icon = value;
      } else if (key === 'iconerr') {
        iconerr = value;
      } else if (key === 'icon-color') {
        iconColor = value;
      } else if (key === 'iconerr-color') {
        iconerrColor = value;
      }
    }
  } else {
    // 如果没有传入参数，使用默认值
    icon = defaultValues.icon;
    iconerr = defaultValues.iconerr;
    iconColor = defaultValues['icon-color'];
    iconerrColor = defaultValues['iconerr-color'];
  }

  // 发送 HTTP 请求获取所在地信息
  $httpClient.get(url, function(error, response, data){
    if (error) {
    console.error(error);
    $done();
    return;
    }

    let lines = data.split("\n");
    let cf = lines.reduce((acc, line) => {
    let [key, value] = line.split("=");
    acc[key] = value;
    return acc;
    }, {});
    let ip = cf.ip;
    let warp = cf.warp;
    let loc = getCountryFlagEmoji(cf.loc) + cf.loc;

    // 判断 ChatGPT 是否支持该国家/地区
    let l = tf.indexOf(cf.loc);
    let gpt, iconUsed;
    if (l !== -1) {
    gpt = "GPT: ⚡︎";
    iconUsed = icon ? icon : undefined;
    iconCol = iconColor ? iconColor : undefined;

    } else {
    gpt = "GPT: ⚠︎";
    iconUsed = iconerr ? iconerr : undefined;
    iconCol = iconerrColor ? iconerrColor : undefined;

    }

    // 获取 Warp 状态
    let w = tff.indexOf(warp);
    let warps;
    if (w !== -1) {
    warps = "✅";
    } else {
    warps = "❌";
    }

    // 组装通知数据
    let body = {
      title: titlediy ? titlediy : titlecontent,
      content: `${gpt}   Zone: ${loc}`,
      icon: iconUsed ? iconUsed : undefined,
      'icon-color': iconCol ? iconCol : undefined
    };

    // 发送通知
    $done(body);
  });

  // 获取国旗Emoji函数
  function getCountryFlagEmoji(countryCode) {
      const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt());
      return String.fromCodePoint(...codePoints);
  }

  async function fetchtitlecontent() {
    return new Promise((resolve, reject) => {
      let url = 'https://v.api.aa1.cn/api/api-wenan-qg/index.php?aa1=json';
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
        let extractedtext = jsondata[0].qinggan;
        resolve(extractedtext);
      });
    });
  }
})();