const $ = new Env('network-info')

$.isPanel = () => $.isSurge() && typeof $input != 'undefined' && $.lodash_get($input, 'purpose') === 'panel'
$.isTile = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'tile'
// $.isStashCron = () => $.isStash() && typeof $script != 'undefined' && $.lodash_get($script, 'type') === 'cron'

let arg
if (typeof $argument != 'undefined') {
  arg = Object.fromEntries($argument.split('&').map(item => item.split('=')));
}

let title = ''
let content = ''
let icon = 'licenseplate.fill' // replace with your icon
let iconColor = '#ffff00' // replace with your color

!(async () => {
  if($.isTile()) {
    await notify('网络信息', '面板', '开始查询')
  }
  let { CN_IP = '-', CN_ADDR = '-', CN_ADDR_EN = '-' } = await getDirectInfo()

  // 打印原始的 CN_IP 和时间
  console.log("Original CN_IP: ", CN_IP);
  console.log("Original Time: ", new Date().toTimeString().split(' ')[0]);

  // 字体转换
  const transformedCN_IP = transformFont(CN_IP, TABLE, INDEX);
  const transformedTime = transformFont(new Date().toTimeString().split(' ')[0], TABLE, INDEX);
  const transformedCN_ADDR_EN = transformFont(CN_ADDR_EN, TABLE, INDEX);
  const festivalInfo = await getFestivalInfo();
  const movieInfo = await getMovieInfo();

  // 打印转换后的 CN_IP 和时间
  console.log("Transformed CN_IP: ", transformedCN_IP);
  console.log("Transformed Time: ", transformedTime);
  console.log("Transformed CN_ADDR_EN: ", transformedCN_ADDR_EN);

  title = `${movieInfo}${festivalInfo}\n${transformedCN_ADDR_EN}`
  content = `𝘈𝘥𝘥𝘳:${transformedCN_IP}\n𝘓𝘢𝘴𝘵 𝘊𝘩𝘦𝘤𝘬𝘦𝘥:${transformedTime}`
  icon = 'licenseplate.fill' // replace with your icon
  iconColor = '#ffff00' // replace with your color
  if ($.isTile()) {
	await notify('网络信息', '面板', '查询完成', icon, iconColor)
  } else if(!$.isPanel()) {
	await notify('网络信息', title, content, icon, iconColor)
  }

})()
  .catch(async e => {
    $.logErr(e)
    $.logErr($.toStr(e))
    const msg = `${$.lodash_get(e, 'message') || $.lodash_get(e, 'error') || e}`
    title = `❌`
    content = msg
    await notify('网络信息', title, content)
  })
  .finally(async () => {
    const result = { title, content, ...arg }
    $.log($.toStr(result))
    $.done(result)
  })

// 通知
async function notify(title, subt, desc, opts) {
  if ($.lodash_get(arg, 'notify')) {
    $.msg(title, subt, desc, opts)
  } else {
    $.log('🔕', title, subt, desc, opts)  
  }
}
// async function getDirectInfo() {
//   let CN_IP
//   let CN_ADDR
//   let CN_ADDR_EN
//   try {
//     const res = await $.http.get({
//       url: `http://mip.chinaz.com`,
//       headers: {
//         "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
//         "Accept-Language": "en-US,en;q=0.9",
//         'User-Agent':
//           'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
//       },
//     })
//     let body = String($.lodash_get(res, 'body'))
//     CN_IP = body.match(/您的IP.*?>(.*?)<\//)[1]
//     CN_ADDR = body.match(/地址.*?>(.*?)<\//)[1].replace('中国', '').replace('上海上海', '上海').replace('北京北京', '北京')
//     .replace('联通', '中国联通')
//     .replace('电信', '中国电信')
//     .replace('移动', '中国移动');
//     // 翻译CN_ADDR
//     CN_ADDR_EN = (await Translator("DeepL", "zh", "en", CN_ADDR, {key: "17bd2d86-a5df-9998-ff34-28075a83bc49:fx"}))[0];
//   } catch (e) {
//     $.logErr(e)
//     $.logErr($.toStr(e))
//   }
//   return { CN_IP, CN_ADDR, CN_ADDR_EN }
// }
async function getDirectInfo() {
	let CN_IP;
	let CN_ADDR;
	let CN_ADDR_EN;
	//try {
	//	const res1 = await $.http.get({
	//		url: 'http://v6.ip.zxinc.org/info.php?type=json',
	//		headers: {
	//			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
	//		},
	//	});
	//	const data = JSON.parse(res1.body).data;
	//	let CN_IP = data.myip;
	//	let CN_ADDR = data.location;
	//
	//	// 删除第一个 "中国" 和替换第一个 "\t" 为 "，"
	//	CN_ADDR = CN_ADDR.replace(/^中国\t/, '').replace(/\t/, '，');
	//
	//	// 翻译CN_ADDR
	//	let CN_ADDR_EN = (await Translator('DeepL', 'zh', 'en', CN_ADDR, { key: '17bd2d86-a5df-9998-ff34-28075a83bc49:fx' }))[0];
	//
	//	if (CN_IP && CN_ADDR) {
	//		return { CN_IP, CN_ADDR, CN_ADDR_EN };
	//	}
	//} catch (e) {
	//	$.logErr(e);
	//	$.logErr($.toStr(e));
	//}

try {
    const res1 = await $.http.get({
        url: 'http://v6.ip.zxinc.org/info.php?type=json',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
        },
    });
    const data = JSON.parse(res1.body).data;

    // 如果返回的所有内容里没有中国，记录错误并停止执行
	if (!res1.body.includes("中国") || res1.body.includes("香港") || res1.body.includes("澳门") || res1.body.includes("台湾")) {
        $.logErr("Check routing rules, detected non-mainland IP");
    }

    let CN_IP = data.myip;
    let CN_ADDR = data.location;

    // 删除第一个 "中国" 并替换第一个 "\t" 为 "，" 和 "区" 变为 "区 ・"
    // 判断IP类型
    if (CN_IP.includes(':')) { // IPv6
        CN_ADDR = data.location;
        // 删除第一个 "中国" 并替换第一个 "\t" 为 "，" 和 "区" 变为 "区 • "
        CN_ADDR = CN_ADDR.replace(/^中国\t/, '').replace(/\t/, '，').replace(/\t/, '').replace('区 ', '区 • ');
    } else { // IPv4
        // 提取country和local的内容组合
        CN_ADDR = data.country + data.local;
    }

    // 翻译CN_ADDR
    let CN_ADDR_EN = (await Translator('DeepL', 'zh', 'en', CN_ADDR, { key: '7dda8ddf-e4c2-52a2-c350-09660439db14:fx' }))[0];

    if (CN_IP && CN_ADDR) {
        return { CN_IP, CN_ADDR, CN_ADDR_EN };
    }
} catch (e) {
    $.logErr(e);
    $.logErr($.toStr(e));
}

	try {
		const res1 = await $.http.get({
		  url: 'http://v4.ip.zxinc.org/info.php?type=json',
		  headers: {
			'User-Agent':
			  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
		  },
		});
		const data = JSON.parse(res1.body).data;
		CN_IP = data.myip;
		//CN_ADDR = [data.location].filter(Boolean).join(', ');
		// CN_ADDR = CN_ADDR.replace('电信', 'China Telecom').replace('联通', 'China Unicom').replace('移动', 'China Mobile');
		CN_ADDR = data.country + data.local
		// 翻译CN_ADDR
		CN_ADDR_EN = (await Translator('DeepL', 'zh', 'en', CN_ADDR, { key: '7dda8ddf-e4c2-52a2-c350-09660439db14:fx' }))[0];
		if (CN_IP && CN_ADDR) {
		  return { CN_IP, CN_ADDR, CN_ADDR_EN };
		}
	} catch (e) {
		$.logErr(e);
		$.logErr($.toStr(e));
	}
	try {
		const res2 = await $.http.get({
		  url: 'https://forge.speedtest.cn/api/location/info',
		  headers: {
			'User-Agent':
			  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.14',
		  },
		});
		const info = JSON.parse(res2.body);
		CN_IP = info.ip;
		CN_ADDR = [info.province, info.city, info.isp].filter(Boolean).join(' ');
		// 翻译CN_ADDR
		CN_ADDR_EN = (await Translator('DeepL', 'zh', 'en', CN_ADDR, { key: '17bd2d86-a5df-9998-ff34-28075a83bc49:fx' }))[0];
		if (CN_IP && CN_ADDR) {
		  return { CN_IP, CN_ADDR, CN_ADDR_EN };
		}
	  } catch (e) {
		$.logErr(e);
		$.logErr($.toStr(e));
		CN_IP = '';
		CN_ADDR = '';
		CN_ADDR_EN = '';
	  }
	return { CN_IP, CN_ADDR, CN_ADDR_EN };
  }
// prettier-ignore
function Env(t,s){class e{constructor(t){this.env=t}send(t,s="GET"){t="string"==typeof t?{url:t}:t;let e=this.get;return"POST"===s&&(e=this.post),new Promise((s,i)=>{e.call(this,t,(t,e,r)=>{t?i(t):s(e)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,s){this.name=t,this.http=new e(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $environment&&$environment["surge-version"]}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}isStash(){return"undefined"!=typeof $environment&&$environment["stash-version"]}toObj(t,s=null){try{return JSON.parse(t)}catch{return s}}toStr(t,s=null){try{return JSON.stringify(t)}catch{return s}}getjson(t,s){let e=s;const i=this.getdata(t);if(i)try{e=JSON.parse(this.getdata(t))}catch{}return e}setjson(t,s){try{return this.setdata(JSON.stringify(t),s)}catch{return!1}}getScript(t){return new Promise(s=>{this.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=s&&s.timeout?s.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),r=JSON.stringify(this.data);e?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(s,r):this.fs.writeFileSync(t,r)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return e;return r}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),r=e?this.getval(e):"";if(r)try{const t=JSON.parse(r);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(s),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const s=JSON.parse(h);this.lodash_set(s,r,t),e=this.setval(JSON.stringify(s),i)}catch(s){const o={};this.lodash_set(o,r,t),e=this.setval(JSON.stringify(o),i)}}else e=this.setval(t,s);return e}getval(t){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let e=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{if(t.headers["set-cookie"]){const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();e&&this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t,a=e.decode(h,this.encoding);s(null,{status:i,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:i,response:r}=t;s(i,r,r&&e.decode(r.rawBody,this.encoding))})}}post(t,s=(()=>{})){const e=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[e](t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status?e.status:e.statusCode,e.status=e.statusCode),s(t,e,i)});else if(this.isQuanX())t.method=e,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:r,body:o}=t;s(null,{status:e,statusCode:i,headers:r,body:o},o)},t=>s(t&&t.error||"UndefinedError"));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[e](r,o).then(t=>{const{statusCode:e,statusCode:r,headers:o,rawBody:h}=t,a=i.decode(h,this.encoding);s(null,{status:e,statusCode:r,headers:o,rawBody:h,body:a},a)},t=>{const{message:e,response:r}=t;s(e,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,s=null){const e=s?new Date(s):new Date;let i={"M+":e.getMonth()+1,"d+":e.getDate(),"H+":e.getHours(),"m+":e.getMinutes(),"s+":e.getSeconds(),"q+":Math.floor((e.getMonth()+3)/3),S:e.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(e.getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in i)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[s]:("00"+i[s]).substr((""+i[s]).length)));return t}queryStr(t){let s="";for(const e in t){let i=t[e];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),s+=`${e}=${i}&`)}return s=s.substring(0,s.length-1),s}msg(s=t,e="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()||this.isShadowrocket()||this.isStash()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let s=t.openUrl||t.url||t["open-url"],e=t.mediaUrl||t["media-url"];return{openUrl:s,mediaUrl:e}}if(this.isQuanX()){let s=t["open-url"]||t.url||t.openUrl,e=t["media-url"]||t.mediaUrl,i=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":s,"media-url":e,"update-pasteboard":i}}if(this.isSurge()||this.isShadowrocket()||this.isStash()){let s=t.url||t.openUrl||t["open-url"];return{url:s}}}};if(this.isMute||(this.isSurge()||this.isShadowrocket()||this.isLoon()||this.isStash()?$notification.post(s,e,i,o(r)):this.isQuanX()&&$notify(s,e,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(s),e&&t.push(e),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()||this.isShadowrocket()&&!this.isQuanX()&&!this.isLoon()&&!this.isStash();e?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),this.isSurge()||this.isShadowrocket()||this.isQuanX()||this.isLoon()||this.isStash()?$done(t):this.isNode()&&process.exit(1)}}(t,s)}

async function Translator(type = "DeepL", source = "", target = "", text = "", api = {key: "17bd2d86-a5df-9998-ff34-28075a83bc49:fx"}, database) {
	$.log(`☑️ ${$.name}, Translator`, `orig: ${text}`, "");
	// 构造请求
	let request = await GetRequest(type, source, target, text, database);
	// 发送请求
	let trans = await GetData(type, request);
	$.log(`🚧 ${$.name}, Translator`, `trans: ${trans}`, "");
	return trans
	/***************** Fuctions *****************/
	// Get Translate Request
	async function GetRequest(type = "DeepL", source = "", target = "", text = "", database) {
		$.log(`☑️ ${$.name}, Get Translate Request`, "");
		let request = {};
		switch (type) {
			case "DeepL":
				request = {
					"url": "https://api-free.deepl.com/v2/translate",
					"headers": {
						"Content-Type": "application/x-www-form-urlencoded",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36"
					},
					"body": `auth_key=${api.key}&text=${encodeURIComponent(text)}&source_lang=${source}&target_lang=${target}`
				};
				break;
		}
		//$.log(`✅ ${$.name}, Get Translate Request`, `request: ${JSON.stringify(request)}`, "");
		return request
	};
	// Get Translate Data
	async function GetData(type, request) {
		$.log(`☑️ ${$.name}, Get Translate Data`, "");
		let texts = [];
		await Fetch(request)
			.then(response => JSON.parse(response.body))
			.then(_data => {
				switch (type) {
					case "DeepL":
						texts = _data?.translations?.map(item => item?.text ?? `翻译失败, 类型: ${type}`)
						break;
				};
			})
			.catch(error => Promise.reject(error));
		//$.log(`✅ ${$.name}, Get Translate Data, texts: ${JSON.stringify(texts)}`, "");
		$.log(`✅ ${$.name}, Get Translate Data`, "");
		return texts
	};
};
async function Fetch(request = {}) {
	$.log(`☑️ ${$.name}, Fetch Ruled Reqeust`, "");
	const FORMAT = (request?.headers?.["Content-Type"] ?? request?.headers?.["content-type"])?.split(";")?.[0];
	$.log(`⚠ ${$.name}, Fetch Ruled Reqeust`, `FORMAT: ${FORMAT}`, "");
	if ($.isQuanX()) {
		switch (FORMAT) {
			case "application/json":
			case "text/xml":
			default:
				// 返回普通数据
				delete request.bodyBytes;
				break;
			case "application/x-protobuf":
			case "application/grpc":
				// 返回二进制数据
				delete request.body;
				if (ArrayBuffer.isView(request.bodyBytes)) request.bodyBytes = request.bodyBytes.buffer.slice(request.bodyBytes.byteOffset, request.bodyBytes.byteLength + request.bodyBytes.byteOffset);
				break;
			case undefined: // 视为无body
				// 返回普通数据
				break;
		};
	};
	let response = (request?.body ?? request?.bodyBytes)
		? await $.http.post(request)
		: await $.http.get(request);
	$.log(`✅ ${$.name}, Fetch Ruled Reqeust`, "");
	//$.log(`🚧 ${$.name}, Fetch Ruled Reqeust`, `Response:${JSON.stringify(response)}`, "");
	return response;
};

async function getFestivalInfo() {
    let lunarFestival = "", festivals = [], cnMonth, cnDay;
  
    try {
        // 获取第一个API的信息
        const res1 = await $.http.get("https://api.mu-jie.cc/lunar");
        const data1 = JSON.parse(res1.body).data;
        lunarFestival = data1.lunarFestival || ""; // 如果没有lunarFestival，则默认为空字符串
        
        // 获取第二个API的信息
        const res2 = await $.http.get("https://api.timelessq.com/time");
        const data2 = JSON.parse(res2.body).data;
        festivals = data2.festivals || [];
        cnMonth = data2.lunar.cnMonth;
        cnDay = data2.lunar.cnDay;
    } catch (e) {
        $.logErr(`获取数据时发生错误: ${e.message || e}`);
    }
  
    // 如果lunarFestival不为空且festivals不包含lunarFestival，就将lunarFestival添加到festivals数组中
    if (lunarFestival && !festivals.includes(lunarFestival)) {
        festivals.push(lunarFestival);
    }
  
    // 去重并组合最终的节日信息
    const combinedFestivals = Array.from(new Set(festivals)).join(" / ");
  
    // 输出
    console.log(`农历 ${cnMonth}${cnDay}\n节日: ${combinedFestivals}`);
    // 返回格式化的字符串
    return ` ${cnMonth}${cnDay}\n ${combinedFestivals}`;
}

  async function getquote() {
	let zh, en;
  
	try {
	  const res = await $.http.get('https://api.vvhan.com/api/en');
	  zh = $.lodash_get(res, 'data.zh');
	  en = $.lodash_get(res, 'data.en');
	} catch (e) {
	  $.logErr(`获取数据时发生错误: ${e.message || e}`);
	}
  
	// Return the formatted string
	return `${zh} | ${en}`;
  }

  async function getMovieInfo() {
  let title = "未找到电影", rating = "无", comment = "无相关评论";
  let currentDate;
	try {
	  const movies = {
		"2024-01-01": {
			"title": "功夫熊猫3 Kung Fu Panda 3",
			"rating": "7.8",
			"comment": "—— “你是谁？” —— “我也一直在问同一个问题。我是熊猫的儿子？ 一只鹅的儿子？ 一位学生？还是一位老师？结果这些都是我。我是神龙大侠。”｜元旦"
		  },
		  "2024-01-02": {
			"title": "伊尼舍林的报丧女妖 The Banshees of Inisherin",
			"rating": "7.9",
			"comment": "那我们要是继续漫无目的地闲聊，我的人生就会继续蹉跎下去。"
		  },
		  "2024-01-03": {
			"title": "黑暗荣耀 더 글로리",
			"rating": "8.9",
			"comment": "—— “所以呢，你的梦想是什么？” —— “是你，从今天开始，我的梦想就是你，我们后会有期。”"
		  },
		  "2024-01-04": {
			"title": "套装 The Outfit",
			"rating": "7.9",
			"comment": "完美之所以是个必要的目标，正是因为它是无法实现的。如果你不追求完美，就无法做出伟大的事情。但真正的完美是不可能实现的。"
		  },
		  "2024-01-05": {
			"title": "崖上的波妞 崖の上のポニョ",
			"rating": "8.6",
			"comment": "宗介，现在这个家就像暴风雨中的灯塔，黑暗中的人们都依靠着这个光芒为他们指引方向，所以一定要有人留在这里。｜宫崎骏83 岁生日｜2020年豆瓣电影日历"
		  },
		  "2024-01-06": {
			"title": "灵犬雪莉 Belle et Sébastien",
			"rating": "8.3",
			"comment": "人不会天生凶恶，狗亦一样。"
		  },
		  "2024-01-07": {
			"title": "预见未来 Next",
			"rating": "7.2",
			"comment": "每一次你凝视未来，它会因为你的凝视而发生改变，而那使得其他一切也随之改变了。｜尼古拉斯·凯奇60岁生日"
		  },
		  "2024-01-08": {
			"title": "登山家 The Alpinist",
			"rating": "9.3",
			"comment": "你能控制的只是你所能做的，可你无法控制山的举动，而这才是我觉得最危险的地方。山是活的，环绕着你，而你靠的是它的慈悲。"
		  },
		  "2024-01-09": {
			"title": "最后生还者 第一季 The Last of Us Season 1",
			"rating": "9.0",
			"comment": "重点来了，谨慎选择你相信的人，能背叛我们的，唯有我们信任的人。"
		  },
		  "2024-01-10": {
			"title": "夺宝奇兵5：命运转盘 Indiana Jones and the Dial of Destiny",
			"rating": "7.0",
			"comment": "我想念沙漠奇观，我想念深海探秘，我更想念每天起床都会期待新的一天会发生的精彩冒险。"
		  },
		  "2024-01-11": {
			"title": "旺角黑夜",
			"rating": "7.4",
			"comment": "—— “想找的找不到，不想见的偏见到。” —— “缘分。有缘呢······一定能见到的。” ——  “有孽也可以吧。”"
		  },
		  "2024-01-12": {
			"title": "回我的家 ゴーイング マイ ホーム",
			"rating": "8.8",
			"comment": "所谓后悔，是过去曾经爱过的证明。"
		  },
		  "2024-01-13": {
			"title": "全职 À plein temps",
			"rating": "8.1",
			"comment": "我要恭喜你被录取了，我们很满意你的资历，这份工作是你的了。"
		  },
		  "2024-01-14": {
			"title": "网络谜踪2 Missing",
			"rating": "7.9",
			"comment": "如果她有时间关上定位服务，这代表她可能没事。"
		  },
		  "2024-01-15": {
			"title": "银行家 The Banker",
			"rating": "7.4",
			"comment": "尊重是个昂贵的东西，为了赢得尊重，很多人甘愿冒很大的风险。"
		  },
		  "2024-01-16": {
			"title": "走到尽头 끝까지 간다",
			"rating": "8.0",
			"comment": "世上有两种人，一种是忍辱偷生，另一种是愈挫愈勇，你是哪一种？"
		  },
		  "2024-01-17": {
			"title": "穿靴子的猫2 Puss in Boots: The Last Wish",
			"rating": "8.1",
			"comment": "他们把我塞进袜子，我却在里头长大了。所以我得到了一个很棒的故事和一件免费的毛衣。"
		  },
		  "2024-01-18": {
			"title": "女人们的谈话 Women Talking",
			"rating": "7.2",
			"comment": "在我来的地方，你妈妈来的地方，我们不谈论自己的身体。所以当这样的事情发生时，没有语言可以形容它。如果没有语言，所剩的便是空荡荡的沉默。｜腊八节"
		  },
		  "2024-01-19": {
			"title": "超级马力欧兄弟大电影 The Super Mario Bros. Movie",
			"rating": "7.8",
			"comment": "加油！马力欧！我们的大冒险现在开始了。"
		  },
		  "2024-01-20": {
			"title": "暖暖内含光 Eternal Sunshine of the Spotless Mind",
			"rating": "8.5",
			"comment": "遗忘世界的人，世界也把他遗忘。美丽的心灵闪烁永恒阳光。每一个遗祈求都被接受，每一个愿望都得以实现。｜2019年豆瓣电影日历"
		  },
		  "2024-01-21": {
			"title": "浪客剑心 るろうに剣心",
			"rating": "8.1",
			"comment": "无论世间如何变化，仗剑生，为剑死，这是我们唯一的路。"
		  },
		  "2024-01-22": {
			"title": "悲情三角 Triangle of Sadness",
			"rating": "7.5",
			"comment": "很少有人会照着镜子说：“我看到的这个人是野蛮的怪物。” 相反，他们编造一些说辞来为所做的事辩解。"
		  },
		  "2024-01-23": {
			"title": "蝴蝶效应 The Butterfly Effect",
			"rating": "8.9",
			"comment": "纵使细微如蝴蝶之鼓翼，也能造成千里外之飓风。—— 混池理论｜《蝴蝶效应》上映20周年"
		  },
		  "2024-01-24": {
			"title": "犯罪都市2 범죄도시2",
			"rating": "7.5",
			"comment": "—— “你需要钱吗，怎样，要分你一些吗，五五平分？” —— “谁拿五啊？”"
		  },
		  "2024-01-25": {
			"title": "三体",
			"rating": "8.7",
			"comment": "在宇宙大尺度下来看，是非对错都有可能是别有定论的。小汪，你到了我这个年纪，你会发现，当年以为天要塌下来的那些大事，其实没有什么的，我们以为已经走到了绝境，也许离转机就不远了。"
		  },
		  "2024-01-26": {
			"title": "十三条命 Thirteen Lives",
			"rating": "8.5",
			"comment": "恐惧只是我们的心理作用，闭上眼睛，让内心归于平静，感受呼吸之间空气的流动。"
		  },
		  "2024-01-27": {
			"title": "碟中谍7：致命清算（上） Mission: Impossible – Dead Reckoning Part One",
			"rating": "7.6",
			"comment": "我会永远把你的生命摆在第一位，甚至高于我的生命。"
		  },
		  "2024-01-28": {
			"title": "旋涡 Vortex",
			"rating": "7.9",
			"comment": "每一部电影都是一场梦。"
		  },
		  "2024-01-29": {
			"title": "宿敌 ജന ഗണ മന",
			"rating": "8.5",
			"comment": "—— “就连那女孩的父亲都没抱怨，你是她什么人，要这样为她疯叫？” —— “我是她的老师，老师比任何人都有权为学生发声。”"
		  },
		  "2024-01-30": {
			"title": "蝙蝠侠：黑暗骑士崛起 The Dark Knight Rises",
			"rating": "8.9",
			"comment": "—— “我不怕被他们看到真面目。” —— “戴面具不是为了你自己，而是为了保护你在乎的人。”｜克里斯蒂安·贝尔50岁生日"
		  },
		  "2024-01-31": {
			"title": "顺流逆流 順流逆流",
			"rating": "7.5",
			"comment": "人生一世总有几天是黑洞日。"
		  },
		  "2024-02-01": {
			"title": "唐顿庄园2 Downton Abbey: A New Era",
			"rating": "8.2",
			"comment": "当你爱的人被幸运眷顾，简直比自己走运还美妙。"
		  },
		  "2024-02-02": {
			"title": "他是龙 Он - дракон",
			"rating": "7.6",
			"comment": "不懂，我看鸟，也看鱼，为什么不能看你。｜小年"
		  },
		  "2024-02-03": {
			"title": "星河战队 Starship Troopers",
			"rating": "7.9",
			"comment": "人类自以为是大自然的主宰者，其实并不然。"
		  },
		  "2024-02-04": {
			"title": "澄沙之味 あん",
			"rating": "8.3",
			"comment": "我认为这个世间的一切，都有可以诉说的故事，即使是阳光和风，也可以拥有它们的故事。｜立春"
		  },
		  "2024-02-05": {
			"title": "祝你好运，里奥·格兰德 Good Luck to You, Leo Grande",
			"rating": "8.1",
			"comment": "你为什么不把你想要的东西拿走，当它就在这里，触手可及的时候。"
		  },
		  "2024-02-06": {
			"title": "她说 She Said",
			"rating": "7.8",
			"comment": "我们无法改变过去发生在你身上的事，但我们可以一起借用你的经验，去帮助、去保护其他人。"
		  },
		  "2024-02-07": {
			"title": "舞伎家的料理人 舞妓さんちのまかないさん",
			"rating": "7.9",
			"comment": "—— “日复一日用同样的方式做饭，你不会厌倦吗？” —— “我走进市场，想着当天要做什么料理，或者我会考虑到大家的健康状况，决定是做清淡的还是油腻的。即使我是在同一家店买的鱼或蔬菜，季节或时令不同，味道也会有细微的变化。”"
		  },
		  "2024-02-08": {
			"title": "医院五日 Five Days at Memorial",
			"rating": "8.5",
			"comment": "你记得事情的某一个版本，并不意味着这就是真相。"
		  },
		  "2024-02-09": {
			"title": "万里归途",
			"rating": "7.2",
			"comment": "祖国就在身后，使馆就在身边，祖国不会放弃任何一位同胞，我们一定带大家回家。｜除夕"
		  },
		  "2024-02-10": {
			"title": "人世间",
			"rating": "8.4",
			"comment": "生命的质量比生命的长度更重要。｜春节"
		  },
		  "2024-02-11": {
			"title": "造梦之家 The Fabelmans",
			"rating": "7.4",
			"comment": "电影是令人永难忘怀的梦。"
		  },
		  "2024-02-12": {
			"title": "毒液：致命守护者 Venom",
			"rating": "7.2",
			"comment": "在我的星球上，我算是个跟你差不多的废物。"
		  },
		  "2024-02-13": {
			"title": "爱玛 Emma.",
			"rating": "7.3",
			"comment": "别以你的善良本性去理解恶人。"
		  },
		  "2024-02-14": {
			"title": "沼泽深处的女孩 Where the Crawdads Sing",
			"rating": "7.5",
			"comment": "我是白鹭的羽毛，我是每一个被冲到岸边的贝壳，我是一只萤火虫。你会看到数以百计的人在沼泽深处向你招手，这就是你永远能找到我的地方，在最深处，喇蛄吟唱的地方。｜情人节"
		  },
		  "2024-02-15": {
			"title": "砂之女 砂の女",
			"rating": "8.6",
			"comment": "你是为挖沙而生，还是为了生而挖沙？｜《砂之女》上映60周年｜2021年豆瓣电影日历"
		  },
		  "2024-02-16": {
			"title": "我是格鲁特 第一季 I Am Groot Season 1",
			"rating": "8.5",
			"comment": "别装可怜，别以为你卖个萌就能蒙混过关。"
		  },
		  "2024-02-17": {
			"title": "美国往事 Once Upon a Time in America",
			"rating": "9.2",
			"comment": "有时当我对一切都感到厌倦，我就想到你。｜《美国往事》首映40周年｜2019豆瓣电影日历"
		  },
		  "2024-02-18": {
			"title": "范海辛 Van Helsing",
			"rating": "7.2",
			"comment": "—— “你要记住，伊果，‘己所不欲······’ ” —— “ ‘必施于人’，主人。”"
		  },
		  "2024-02-19": {
			"title": "瑟堡的雨伞 Les parapluies de Cherbourg",
			"rating": "7.8",
			"comment": "—— “我看到你在流眼泪，是因为你很孤单吗？” —— “我并不孤单，我还有我的书。”｜2021年豆瓣电影日历"
		  },
		  "2024-02-20": {
			"title": "火山挚恋 Fire of Love",
			"rating": "9.0",
			"comment": "人会爱上自己所知的事物，却更爱未知的事物。"
		  },
		  "2024-02-21": {
			"title": "叶问2：宗师传奇 葉問2",
			"rating": "7.4",
			"comment": "你认为分胜负重要，还是跟家里人吃饭重要？"
		  },
		  "2024-02-22": {
			"title": "沉默的羔羊 The Silence of the Lambs",
			"rating": "8.9",
			"comment": "那些羔羊停止尖叫时你会告诉我的，是吗？｜乔纳森·戴米诞辰80周年｜2021年豆瓣电影日历"
		  },
		  "2024-02-23": {
			"title": "晨光正好 Un beau matin",
			"rating": "7.5",
			"comment": "通过这些书，他的人格才得以展现，每本书都有自己的一抹颜色，汇聚起来，就组成了他曾经的模样。"
		  },
		  "2024-02-24": {
			"title": "满江红",
			"rating": "7.0",
			"comment": "世上从此有了《满江红》｜元宵节"
		  },
		  "2024-02-25": {
			"title": "核磁共振 R.M.N.",
			"rating": "7.7",
			"comment": "想要生存，你还要学会一样东西，要学会反抗，这不难，你只要别心软就行。"
		  },
		  "2024-02-26": {
			"title": "特种部队：眼镜蛇的崛起 G.I. Joe: The Rise of Cobra",
			"rating": "7.3",
			"comment": "吸引只是一种情感，情感没有科学根据。"
		  },
		  "2024-02-27": {
			"title": "塔尔 Tár",
			"rating": "7.4",
			"comment": "我们唯一的家就是指挥台。"
		  },
		  "2024-02-28": {
			"title": "流人 第一季 Slow Horses Season 1",
			"rating": "8.6",
			"comment": "是，如果一个笑话还必须解释，那是因为它不好笑。"
		  },
		  "2024-02-29": {
			"title": "闰年 Leap Year",
			"rating": "7.8",
			"comment": "—— “你是去出差还是旅游？” —— “我想在闰日向我的男朋友求婚。”｜2019年豆瓣电影日历"
		  },
		  "2024-03-01": {
			"title": "麦克白 Macbeth",
			"rating": "7.3",
			"comment": "美即丑，丑即美，悬空飞过雾与秽。"
		  },
		  "2024-03-02": {
			"title": "生无可恋的奥托 A Man Called Otto",
			"rating": "7.6",
			"comment": "人是会变的，或许也不会变。世事无常，我们越来越疏远，筑起心墙，冒犯了对方，谁知道为什么。"
		  },
		  "2024-03-03": {
			"title": "男孩、鼹鼠、狐狸和马 The Boy, the Mole, the Fox and the Horse",
			"rating": "8.3",
			"comment": "“你说过最勇敢的话是什么？” —— “ ‘帮帮我。’ 寻求帮助并非是放弃，而是拒绝放弃。”"
		  },
		  "2024-03-04": {
			"title": "闪亮女孩 Shining Girls",
			"rating": "8.5",
			"comment": "这种恒星能够在其自身的死亡中复活，它们仍然会发光，它们仍然具有重力场，它们仍然与我们在一起。"
		  },
		  "2024-03-05": {
			"title": "别惹蚂蚁 The Ant Bully",
			"rating": "7.2",
			"comment": "没错，我很弱小，我们都很弱小，但是团结起来就会变强大。｜惊蛰"
		  },
		  "2024-03-06": {
			"title": "猎罪图鉴",
			"rating": "7.5",
			"comment": "一个艺术家，如果总拘泥于画出自己能理解的领域，那注定会走向平庸。我们的画笔应该记录的，是人间的极致与非凡。"
		  },
		  "2024-03-07": {
			"title": "分手的决心 헤어질 결심",
			"rating": "7.6",
			"comment": "你说爱我的瞬间，你的爱就结束了，你的爱结束的瞬间，我的爱就开始了。"
		  },
		  "2024-03-08": {
			"title": "花落花开 Séraphine",
			"rating": "8.5",
			"comment": "当我非常悲伤时，我就到野外去，摸摸树干，跟鸟、花、虫子说说话，心里就好些了。｜妇女节"
		  },
		  "2024-03-09": {
			"title": "印度合伙人 Padman",
			"rating": "7.7",
			"comment": "很多男人甚至都不知道女人的生命里有这样的五天。"
		  },
		  "2024-03-10": {
			"title": "鹿角男孩 第一季 Sweet Tooth Season 1",
			"rating": "8.1",
			"comment": "给你个忠告，孩子。不要问你不想知道答案的问题。"
		  },
		  "2024-03-11": {
			"title": "俄罗斯方块 Tetris",
			"rating": "8.0",
			"comment": "我只玩了五分钟俄罗斯方块，是的，我仍然会在梦中看到掉下来的方块，这款游戏不只是让人上瘾，让人念念不忘。它是诗歌，是艺术和数学神奇地完美结合。"
		  },
		  "2024-03-12": {
			"title": "小树的故事 The Education of Little Tree",
			"rating": "8.6",
			"comment": "别伤心，小树，这就是生存法则，猎鹰捉走飞得慢的鸟儿，慢鸟就不会有后代，帮助鸟儿们变快，明白吗？｜植树节"
		  },
		  "2024-03-13": {
			"title": "解构爱情狂 Deconstructing Harry",
			"rating": "8.6",
			"comment": "我不关心现实世界，我只关心小说里的虚构世界。"
		  },
		  "2024-03-14": {
			"title": "小黄人大眼萌：神偷奶爸前传 Minions: The Rise of Gru",
			"rating": "7.1",
			"comment": "如果有一天你出名了，要记得第一个助你一臂之力的人。"
		  },
		  "2024-03-15": {
			"title": "极品飞车 Need for Speed",
			"rating": "7.3",
			"comment": "有件事情你们必须明白，那就是，赛车就是艺术。"
		  },
		  "2024-03-16": {
			"title": "鼠胆龙威 鼠膽龍威",
			"rating": "7.4",
			"comment": "老兄，我中了一枪都还能撑得住，可是你的对白太肉麻，我快撑不下去了。"
		  },
		  "2024-03-17": {
			"title": "加勒比海盗3：世界的尽头 Pirates of the Caribbean: At World's End",
			"rating": "8.4",
			"comment": "他们会看到什么？惊恐的鼠辈？被弃的破船？不！不！他们会看到自由的人和自由！｜国际航海日"
		  },
		  "2024-03-18": {
			"title": "惊天魔盗团 Now You See Me",
			"rating": "7.8",
			"comment": "当一个魔术师挥舞着他的手然后说，“这是魔术开始的地方”，真正的魔术在别的地方开始。"
		  },
		  "2024-03-19": {
			"title": "小森林 리틀 포레스트",
			"rating": "7.5",
			"comment": "最好的下酒菜是凉飕飕的冷风和陪你一起喝的人。"
		  },
		  "2024-03-20": {
			"title": "春天不是读书天 Ferris Bueller's Day Off",
			"rating": "8.0",
			"comment": "人生匆匆，若你不偶尔停下来看看周围，你会错过很多事。｜国际幸福日｜2019年豆瓣电影日历"
		  },
		  "2024-03-21": {
			"title": "沉睡魔咒 Maleficent",
			"rating": "7.4",
			"comment": "真爱之吻？难道你现在还没明白吗？我下这样的诅咒就是因为它根本不存在。｜世界睡眠日"
		  },
		  "2024-03-22": {
			"title": "我的章鱼老师 My Octopus Teacher",
			"rating": "9.3",
			"comment": "你进入水里会有一种自由自在的感觉，你的所有担忧、麻烦和生活中的戏剧性事件都消失了。渐渐地，你开始关心所有的动物，甚至包括最微小的动物。你意识到每一个生命都很重要，你会感觉到这些野生动物的生命，是多么脆弱，其实在这个星球上万事万物的生命都很脆弱。｜世界水日"
		  },
		  "2024-03-23": {
			"title": "惠子，凝视 ケイコ 目を澄ませて",
			"rating": "7.9",
			"comment": "如果你失去了战斗的意志，这是对你的对手的不尊重，对你自身也很危险。"
		  },
		  "2024-03-24": {
			"title": "小萝莉的猴神大叔 Bajrangi Bhaijaan",
			"rating": "8.4",
			"comment": "如果这个人冒着生命危险把你走失的孩子送回家，你难道也不开门吗？"
		  },
		  "2024-03-25": {
			"title": "阿丽塔：战斗天使 Alita: Battle Angel",
			"rating": "7.5",
			"comment": "面对邪恶，我不能袖手旁观。"
		  },
		  "2024-03-26": {
			"title": "终极名单 第一季 The Terminal List Season 1",
			"rating": "8.3",
			"comment": "—— “这些后遗症，会影响你对行动的记忆吗？” —— “这样的行动是忘不了的，长官。”"
		  },
		  "2024-03-27": {
			"title": "哈利·波特与密室 Harry Potter and the Chamber of Secrets",
			"rating": "8.9",
			"comment": "让我们成为哪种人的并不是我们的能力，而是我们的选择。"
		  },
		  "2024-03-28": {
			"title": "魔力月光 Magic in the Moonlight",
			"rating": "7.2",
			"comment": "我相信我们每个人都必须找到拥抱生活的理由。"
		  },
		  "2024-03-29": {
			"title": "隧道 터널",
			"rating": "7.9",
			"comment": "比任何东西都珍贵的是人的价值。"
		  },
		  "2024-03-30": {
			"title": "星际迷航 Star Trek",
			"rating": "8.1",
			"comment": "如果你排除不可能的，剩下来的无论多荒谬，肯定都是事实。"
		  },
		  "2024-03-31": {
			"title": "波巴·费特之书 The Book of Boba Fett",
			"rating": "8.5",
			"comment": "这是我的城市，他们是我的子民，我不会抛下他们。"
		  },
		  "2024-04-01": {
			"title": "倩女幽魂2：人间道 倩女幽魂II 人間道",
			"rating": "8.1",
			"comment": "—— “我现在才明白，为什么你要避开人间。” —— “人是善忘的，无论你做了什么事情，很快就随风而逝，谁还记得。”｜愚人节｜张国荣逝世21周年"
		  },
		  "2024-04-02": {
			"title": "子弹列车 Bullet Train",
			"rating": "7.8",
			"comment": "如果你不控制自己的命运，命运就会控制你。"
		  },
		  "2024-04-03": {
			"title": "码头风云 On the Waterfront",
			"rating": "7.9",
			"comment": "知道这里出了什么问题吗？为钱不择手段，对钱的热爱胜过对人类的爱。｜马龙·白兰度诞辰100周年"
		  },
		  "2024-04-04": {
			"title": "人生大事",
			"rating": "7.3",
			"comment": "这个是三哥，就是他把我外婆变成星星的。｜清明"
		  },
		  "2024-04-05": {
			"title": "宿醉 The Hangover",
			"rating": "7.7",
			"comment": "记住，把回忆留在拉斯维加斯就好了。"
		  },
		  "2024-04-06": {
			"title": "红海龟 La tortue rouge",
			"rating": "7.8",
			"comment": "我们从哪里来，到哪里去，生命是什么？"
		  },
		  "2024-04-07": {
			"title": "星球大战外传：侠盗一号 Rogue One: A Star Wars Story",
			"rating": "7.3",
			"comment": "记住不要被野心卡住喉咙，总监。"
		  },
		  "2024-04-08": {
			"title": "危机13小时 13 Hours: The Secret Soldiers of Benghazi",
			"rating": "7.8",
			"comment": "我只希望，你不会在某天醒来时才意识到，你已经错失了人生最美好的部分。"
		  },
		  "2024-04-09": {
			"title": "雄狮 Lion",
			"rating": "7.4",
			"comment": "你经历了很多事才来到这里，对吧？小家伙，我相信那一定很不容易，有一天你会告诉我一切的，你会告诉我所有，你是谁，关于你的一切，我永远都会聆听的，永远。"
		  },
		  "2024-04-10": {
			"title": "时间 시간",
			"rating": "7.5",
			"comment": "我不是你过去的那个女人，我是全新的。"
		  },
		  "2024-04-11": {
			"title": "荆轲刺秦王",
			"rating": "8.2",
			"comment": "秦王赢政，你忘记了秦国世代先君，一统天下的大愿了吗？"
		  },
		  "2024-04-12": {
			"title": "在切瑟尔海滩上 On Chesil Beach",
			"rating": "7.4",
			"comment": "爱德华，我想让你开心，但我觉得我经常会让人失望，你总是很主动，我总是在逃避。｜西尔莎·罗南30岁生日"
		  },
		  "2024-04-13": {
			"title": "天降美食2 Cloudy with a Chance of Meatballs 2",
			"rating": "7.4",
			"comment": "朋友是越多越好，我需要你们的帮助，需要你们所有人，水果、蔬菜还有肉！我需要你们帮我进那间工厂救出我们的朋友，夺回我们的家园！"
		  },
		  "2024-04-14": {
			"title": "非常律师禹英禑 이상한 변호사 우영우",
			"rating": "8.8",
			"comment": "我的人生虽然奇特又古怪，但同时也很有价值又美好。"
		  },
		  "2024-04-15": {
			"title": "孤胆特工 아저씨",
			"rating": "8.2",
			"comment": "连你也讨厌了，我就没人可喜欢了。"
		  },
		  "2024-04-16": {
			"title": "巴比龙 Papillon",
			"rating": "7.4",
			"comment": "我要留下来。出于同样的原因，你必须离开。"
		  },
		  "2024-04-17": {
			"title": "游戏之夜 Game Night",
			"rating": "7.2",
			"comment": "我在《游戏人生》中招摇撞骗，在人生游戏中同样如此。"
		  },
		  "2024-04-18": {
			"title": "假结婚 The Proposal",
			"rating": "7.2",
			"comment": "我们不会白头偕老的，我们很快就会离婚快乐了。"
		  },
		  "2024-04-19": {
			"title": "毁灭之路 Road to Perdition",
			"rating": "7.7",
			"comment": "如果你一意孤行打开那扇门，你得孤独地走下去，所谓的忠诚、信任，对你来说将不复存在。而且，麦克，你不可能成功，单枪匹马不可能，带着小孩更不可能。"
		  },
		  "2024-04-20": {
			"title": "甘古拜·卡蒂娅瓦迪 Gangubai Kathiawadi",
			"rating": "7.8",
			"comment": "她的命运充满了悲伤，但她微笑着度过了一生。没成为电影明星，但她的生活就像一部宏大的电影。"
		  },
		  "2024-04-21": {
			"title": "X战警：天启 X-Men: Apocalypse",
			"rating": "7.7",
			"comment": "不管你认为在我心里看到了什么，查尔斯，我已将它和我的家人一同埋葬了。｜詹姆斯·麦卡沃伊45岁生日"
		  },
		  "2024-04-22": {
			"title": "地球 Earth",
			"rating": "9.4",
			"comment": "阳光和淡水给地球的每个角落带来了生命。｜世界地球日"
		  },
		  "2024-04-23": {
			"title": "查令十字街84号 84 Charing Cross Road",
			"rating": "8.6",
			"comment": "如果你们刚好经过查令十字街84号，替我吻它吧！我欠它太多。｜世界读书日"
		  },
		  "2024-04-24": {
			"title": "流浪地球2",
			"rating": "8.3",
			"comment": "危难当前，唯有责任。｜中国航天日"
		  },
		  "2024-04-25": {
			"title": "东京！ Tokyo!",
			"rating": "7.8",
			"comment": "你必须能在这个世界里，以自己的所作所为定义你自己。"
		  },
		  "2024-04-26": {
			"title": "坏姐妹 第一季 Bad Sisters Season 1",
			"rating": "8.5",
			"comment": "—— “有任何我能帮忙的，你尽管开口，随时给我打电话。” —— “我没有你的电话号码。”"
		  },
		  "2024-04-27": {
			"title": "蚁人2：黄蜂女现身 Ant-Man and the Wasp",
			"rating": "7.2",
			"comment": "亲爱的，你唯一可以拿走的就是我的心，让时间为我疗伤。"
		  },
		  "2024-04-28": {
			"title": "睁开你的双眼 Abre los ojos",
			"rating": "8.0",
			"comment": "最妙的是，你照着自己心意去活，完全照着自己心意。｜佩内洛普·克鲁兹50岁生日"
		  },
		  "2024-04-29": {
			"title": "中央舞台 Center Stage",
			"rating": "8.2",
			"comment": "聪明的舞蹈演员知道如何审视困难，不是寻找借口，而是在舞蹈本身。无论在课堂上，在表演中，上个星期，五分钟之前发生了什么事，你一旦回到这里，你就有了归属。｜世界舞蹈日"
		  },
		  "2024-04-30": {
			"title": "坏蛋联盟 The Bad Guys",
			"rating": "7.4",
			"comment": "别人可能会相信你，也可能会质疑你，但这并不重要，别管别人的想法，要为自己而活。"
		  },
		  "2024-05-01": {
			"title": "憨豆的黄金周 Mr. Bean's Holiday",
			"rating": "8.2",
			"comment": "—— “你是谁？要去哪里？” —— “我要去海滩。”｜劳动节"
		  },
		  "2024-05-02": {
			"title": "彩排 第一季 The Rehearsal Season 1",
			"rating": "8.8",
			"comment": "我能理解有时你无话可说，却又想让别人知道你的存在。"
		  },
		  "2024-05-03": {
			"title": "早间新闻 第一季 The Morning Show Season 1",
			"rating": "8.6",
			"comment": "这不是事实。大部分都是谎言，全部都是谎言，就是谎言，我不会再向你们撒谎了。｜世界新闻自由日"
		  },
		  "2024-05-04": {
			"title": "歌舞青春 High School Musical",
			"rating": "7.8",
			"comment": "说真的，和你一起唱歌是这个假期中最愉快的事。｜青年节"
		  },
		  "2024-05-05": {
			"title": "二十五，二十一 스물다섯 스물하나",
			"rating": "8.1",
			"comment": "爱情，是爱情呀。我正爱着你，罗希度。我不需要彩虹。｜立夏"
		  },
		  "2024-05-06": {
			"title": "谍影重重3 The Bourne Ultimatum",
			"rating": "8.8",
			"comment": "这是我开始的地方，也是结束的地方。"
		  },
		  "2024-05-07": {
			"title": "猎魔人 第一季 The Witcher Season 1",
			"rating": "7.5",
			"comment": "有时候花就仅仅是花，能为我们做的最好的事情就是凋谢。"
		  },
		  "2024-05-08": {
			"title": "天使爱美丽 Le fabuleux destin d'Amélie Poulain",
			"rating": "8.7",
			"comment": "—— “你相信奇迹吗？” —— “今天不相信。”｜世界微笑日｜2019年豆瓣电影日历"
		  },
		  "2024-05-09": {
			"title": "玩命快递 The Transporter",
			"rating": "7.4",
			"comment": "规则一：不能改变约定。"
		  },
		  "2024-05-10": {
			"title": "怒呛人生 Beef",
			"rating": "8.6",
			"comment": "—— “是的，我知道该怎么走，向着那些树走。” —— “哪些树？到处都是树。”"
		  },
		  "2024-05-11": {
			"title": "幻影凶间 1408",
			"rating": "7.6",
			"comment": "因为我们尊重每位客人的选择，安斯林先生。您可以一遍遍地度过这难忘的1小时，或者选择我们提供的特快退房系统。"
		  },
		  "2024-05-12": {
			"title": "渔港的肉子酱 漁港の肉子ちゃん",
			"rating": "8.1",
			"comment": "麻烦别人没关系的，我不会嫌你麻烦的。｜母亲节"
		  },
		  "2024-05-13": {
			"title": "RRR",
			"rating": "7.2",
			"comment": "比姆，我们猎杀这些豺狼多久了，该去抓狮子了。"
		  },
		  "2024-05-14": {
			"title": "本杰明·巴顿奇事 The Curious Case of Benjamin Button",
			"rating": "9.0",
			"comment": "我希望你能活出精彩，我希望你能见识到让你惊叹的事，我希望你能体验你从未体验过的感觉，我希望你能遇见不同想法的人，我希望你能过上引以为豪的生活。｜凯特·布兰切特55岁生日｜2021年豆瓣电影日历"
		  },
		  "2024-05-15": {
			"title": "阿尔卡拉斯 Alcarràs",
			"rating": "7.4",
			"comment": "他们要的是土地属于你的合同，但我们没有。｜国际家庭日"
		  },
		  "2024-05-16": {
			"title": "侏罗纪世界 Jurassic World",
			"rating": "7.8",
			"comment": "别忘了我们打造这里的意义，克莱尔，侏罗纪世界的存在是要提醒我们人类是如此渺小，更微不足道，那是无法用金额去衡量的。"
		  },
		  "2024-05-17": {
			"title": "镀金时代 第一季 The Gilded Age Season 1",
			"rating": "8.5",
			"comment": "这是你的家，玛丽安。我们很欢迎你住在这里，一切都会好起来。"
		  },
		  "2024-05-18": {
			"title": "博物馆奇妙夜3 Night at the Museum: Secret of the Tomb",
			"rating": "7.3",
			"comment": "我们是博物馆展品，拉瑞，这就是我们。有游客来参观看看我们，也许能学到点什么，那才是活着。｜国际博物馆日"
		  },
		  "2024-05-19": {
			"title": "小飞侠 Peter Pan",
			"rating": "8.4",
			"comment": "你知道吗？我有一种好奇怪的感觉，我好像见过那艘船耶。"
		  },
		  "2024-05-20": {
			"title": "初恋 First Love 初恋",
			"rating": "8.5",
			"comment": "那一天是你给我的生活赋予意义，将我引向我要遵循的道路，我的梦想就是让你幸福。｜网络情人节"
		  },
		  "2024-05-21": {
			"title": "诺丁山 Notting Hill",
			"rating": "8.0",
			"comment": "我也只是个普通的女孩，站在一个男孩面前，请求他来爱她。｜《诺丁山》上映25周年｜2019年豆瓣电影日历"
		  },
		  "2024-05-22": {
			"title": "审死官 審死官",
			"rating": "7.9",
			"comment": "—— “这里守卫森严，闲杂人等不是随便说一句话就可以进得来的。你能够来到这里，相信你已经想尽办法，历尽千辛万苦。” —— “可是我刚进来只随便说一句，喝喜酒的。”"
		  },
		  "2024-05-23": {
			"title": "龙之家族 第一季 House of the Dragon Season 1",
			"rating": "8.8",
			"comment": "听好这个冷酷的事实，别人才不会好心告诉你。男人们宁愿将王国付之一炬，也不愿看到女人登上铁王座。"
		  },
		  "2024-05-24": {
			"title": "洞 Il buco",
			"rating": "7.3",
			"comment": "我们从北部一座拥挤的车站出发，黎明时分到达卡拉布里亚一片荒凉的海岸。在此之前，意大利洞穴学从未在南方推动过这样一场探险运动....."
		  },
		  "2024-05-25": {
			"title": "异形 Alien",
			"rating": "8.3",
			"comment": "我崇拜它的纯净。强者生存，不被良知、悔意和道德左右思想。｜《异形》上映 45 周年｜2019年豆瓣电影日历"
		  },
		  "2024-05-26": {
			"title": "新警察故事",
			"rating": "7.8",
			"comment": "我玩游戏，是高手中的高手，跟我玩，你输定了！"
		  },
		  "2024-05-27": {
			"title": "致所有我曾爱过的男孩 To All the Boys I've Loved Before",
			"rating": "7.4",
			"comment": "因为你让越多人进入你的生活，就会有越多人能离开。"
		  },
		  "2024-05-28": {
			"title": "后天 The Day After Tomorrow",
			"rating": "8.3",
			"comment": "你见过这么清澈的天空吗？｜《后天》上映20周年｜2021年豆瓣电影日历"
		  },
		  "2024-05-29": {
			"title": "圣蛛 Les nuits de Mashhad",
			"rating": "7.4",
			"comment": "拉希米小姐，放弃这个案子吧。这就像是一个黑洞，没有尽头。"
		  },
		  "2024-05-30": {
			"title": "极限职业 극한직업",
			"rating": "7.8",
			"comment": "放弃羞愧的成功，选择好的失败，这应该是对的吧。"
		  },
		  "2024-05-31": {
			"title": "军舰岛 군함도",
			"rating": "7.9",
			"comment": "一定要活着，在更好的世界相见。"
		  },
		  "2024-06-01": {
			"title": "恐龙当家 The Good Dinosaur",
			"rating": "7.5",
			"comment": "有时候你需要克服内心的恐惧，才能看见彼端的美。｜儿童节"
		  },
		  "2024-06-02": {
			"title": "死亡诗社 Dead Poets Society",
			"rating": "9.2",
			"comment": "虽然学习医药、法律、商业、工程都是高尚的人生目标，也是人类存活发展之必需。但追求诗与美，浪漫与爱情，却是我们活着的意义。｜《死亡诗社》上映35周年｜2019年豆瓣电影日历"
		  },
		  "2024-06-03": {
			"title": "修女也疯狂 Sister Act",
			"rating": "8.2",
			"comment": "有时候不做回真正的自己就要崩溃。"
		  },
		  "2024-06-04": {
			"title": "平凡岁月的魅力 The Magic of Ordinary Days",
			"rating": "8.5",
			"comment": "—— “这个机器是不是应该有一个使用手册？” —— “好吧，如果有，你认为他们会读它？”"
		  },
		  "2024-06-05": {
			"title": "可可西里",
			"rating": "8.9",
			"comment": "见过磕长头的人吗？他们的手和脸脏得很，可他们的心特别干净。｜世界环境日"
		  },
		  "2024-06-06": {
			"title": "变形金刚 Transformers",
			"rating": "8.3",
			"comment": "我是警天柱，在这里召唤所有在宇宙中流亡的汽车人，我们在这里，我们在等待。"
		  },
		  "2024-06-07": {
			"title": "塔尔萨之王 第一季 Tulsa King Season 1",
			"rating": "8.4",
			"comment": "有种生活方式是，选择为自己的信仰而活，想要什么就去争取。"
		  },
		  "2024-06-08": {
			"title": "海洋深处 In the Heart of the Sea",
			"rating": "7.5",
			"comment": "当我们经历这一切后，你还觉得我们是地球的主宰吗？我们什么都不是，我们......我们是微粒，是尘土。｜世界海洋日"
		  },
		  "2024-06-09": {
			"title": "保你平安",
			"rating": "7.7",
			"comment": "—— “我从小在福利院长大，没有家，长大了以后也没买房子，我就想啊，这人死就死这一回，干脆，奢侈一把。” \n—— “别老死死死的，那叫活完了。”"
		  },
		  "2024-06-10": {
			"title": "白蛇：缘起",
			"rating": "7.8",
			"comment": "无论他在世间何处，无论他是何模样，无论他还记不记得我，我都要找到他，因为我记得。｜端午节"
		  },
		  "2024-06-11": {
			"title": "太空救援 Салют-7",
			"rating": "7.6",
			"comment": "以我进入太空的经验，带一头驴上来都不是问题。"
		  },
		  "2024-06-12": {
			"title": "超能查派 Chappie",
			"rating": "7.4",
			"comment": "内心才是最特别的地方，你的内在让你与众不同。"
		  },
		  "2024-06-13": {
			"title": "十二罗汉 Ocean's Twelve",
			"rating": "7.3",
			"comment": "你罔顾那么多人的性命就为了自己能玩一场。你会为此后悔的。"
		  },
		  "2024-06-14": {
			"title": "小说家的电影 소설가의 영화",
			"rating": "7.5",
			"comment": "如果她选择了她的道路并为之开心，我们应该尊重她。"
		  },
		  "2024-06-15": {
			"title": "狮子王 The Lion King",
			"rating": "9.1",
			"comment": "我只有在必要的时候才勇敢。辛巴，勇敢并不表示你要去找麻烦。｜《狮子王》上映30周年｜2019年豆瓣电影日历"
		  },
		  "2024-06-16": {
			"title": "神偷奶爸2 Despicable Me 2",
			"rating": "8.1",
			"comment": "—— “仙女怎么这么胖？” —— “因为，我住在糖果屋里！烦心的时候我就会吃糖果逃避现实！”｜父亲节"
		  },
		  "2024-06-17": {
			"title": "千谎百计 第一季 Lie to Me Season 1",
			"rating": "8.8",
			"comment": "如果给真正的凶手看被杀者的照片，他会表现出恶心、轻蔑，甚至是害怕。但不会吃惊。绝不会吃惊。"
		  },
		  "2024-06-18": {
			"title": "平原上的摩西",
			"rating": "7.6",
			"comment": "我不嫌你糙，你也不要嫌我细，只要你不嫌我胡思乱想，我们就能一起过。"
		  },
		  "2024-06-19": {
			"title": "弥留之国的爱丽丝 第一季 今際の国のアリス",
			"rating": "8.0",
			"comment": "生命有限，我活到现在从没想过这种事，那些家伙把一切托付给我后死了，搞不好我也很快就会死。我现在一分一秒都不想浪费。"
		  },
		  "2024-06-20": {
			"title": "唐人街 Chinatown",
			"rating": "8.4",
			"comment": "你看，吉斯先生，大多数人无法面对一个事实，有时候有些人就是可以为所欲为。｜《唐人街》上映50周年"
		  },
		  "2024-06-21": {
			"title": "沙滩上的宝莲 Pauline à la plage",
			"rating": "8.1",
			"comment": "你错过了机会，你应该更主动一点表白。｜夏至"
		  },
		  "2024-06-22": {
			"title": "狼行者 Wolfwalkers",
			"rating": "7.7",
			"comment": "—— “我不能永远保护你。我很害怕有一天你会被关进牢笼。” —— “但我已经在牢笼中了。”"
		  },
		  "2024-06-23": {
			"title": "阿甘正传 Forrest Gump",
			"rating": "9.5",
			"comment": "我妈妈总是说：“你得放下往事，才能不断继续前进。” 我想那就是我跑步的意义所在。｜《阿甘上传》首映30周年｜国际奥林匹克日｜2019年豆瓣电影日历"
		  },
		  "2024-06-24": {
			"title": "爱与怪物 Love and Monsters",
			"rating": "7.2",
			"comment": "因为一些陌生人的慷慨相助和一只狗狗的好意，我才会活到现在。"
		  },
		  "2024-06-25": {
			"title": "恋恋笔记本 The Notebook",
			"rating": "8.5",
			"comment": "我想要完全拥有你，直到永远。你和我，每一天。｜《恋恋笔记本》上映20周年｜2020年豆瓣电影日历"
		  },
		  "2024-06-26": {
			"title": "恶童 鉄コン筋クリート",
			"rating": "8.5",
			"comment": "说人坏话的话，心会变得干巴巴的。"
		  },
		  "2024-06-27": {
			"title": "英雄本色2",
			"rating": "8.4",
			"comment": "我失败了三年，就是要等一个机会，我要争回一口气，不是要证明我有多威风，只是要告诉人家，我失去的东西我要自己拿回来。"
		  },
		  "2024-06-28": {
			"title": "我的错误 Culpa mía",
			"rating": "7.2",
			"comment": "—— “诺亚，我们将会成为自己生活的主人公。” —— “那是你的生活，我的生活在千里之外。”"
		  },
		  "2024-06-29": {
			"title": "茜茜公主3 Sissi - Schicksalsjahre einer Kaiserin",
			"rating": "8.4",
			"comment": "我相信我们之间可以互相谅解。"
		  },
		  "2024-06-30": {
			"title": "活着",
			"rating": "9.3",
			"comment": "春生，你记着，你还欠我们家一条命呢，你得好好活着。｜《活着》上映30周年｜2019年豆瓣电影日历"
		  },
		  "2024-07-01": {
			"title": "理想照耀中国",
			"rating": "8.2",
			"comment": "我每一次按下快门，留下的影像也许就能唤醒一颗心。如果四万万同胞的心一起跳动，一定会坚不可摧。｜建党节"
		  },
		  "2024-07-02": {
			"title": "看车人的七月",
			"rating": "8.1",
			"comment": "爸不能照顾你了，好好学习，好好吃饭，钱就在床头柜的抽屉里。"
		  },
		  "2024-07-03": {
			"title": "教授与疯子 The Professor and the Madman",
			"rating": "7.6",
			"comment": "站在书脊上，我飞跃这围墙；借文字之翼，我抵达世界之巅。"
		  },
		  "2024-07-04": {
			"title": "花与爱丽丝杀人事件 花とアリス殺人事件",
			"rating": "8.2",
			"comment": "—— “那种痛永生难忘，到底有多爱我啊。” —— “是吗？” —— “别说了，谎言也好，幻觉也好，我现在只想沉浸在这份幸福中。”"
		  },
		  "2024-07-05": {
			"title": "全民情敌 Hitch",
			"rating": "7.5",
			"comment": "但是请永远记住，人生的本质不在于你活了多久，而在于那些令你怦然心动的时刻。"
		  },
		  "2024-07-06": {
			"title": "若能与你共乘海浪之上 きみと、波にのれたら",
			"rating": "7.0",
			"comment": "新的海浪会不断地涌来，不仅会有好的海浪，也有应该放走的。但是一直潜在水里的话，是永远无法站在海浪之上的。｜小暑"
		  },
		  "2024-07-07": {
			"title": "决战中途岛 Midway",
			"rating": "7.5",
			"comment": "你的余生都会记得这一刻，当人们把希望寄托在你身上的时候，如果你挺过来了，以后不管遇到什么，你都有能力面对。"
		  },
		  "2024-07-08": {
			"title": "黑衣人2 Men in Black II",
			"rating": "7.8",
			"comment": "当你仰望星空，你会感到好像不认识自己了，好像你对外星的了解比对自己的了解还多。"
		  },
		  "2024-07-09": {
			"title": "雾都孤儿 Oliver Twist",
			"rating": "8.0",
			"comment": "我太饿了，我怕把睡在我旁边的人当面包吃了。"
		  },
		  "2024-07-10": {
			"title": "流感 감기",
			"rating": "7.8",
			"comment": "—— “智久，那里边有感染者啊。” —— “我知道，但是我是救援队。” —— “这里没有任何人知道你是救援队的啊。”—— “可我知道啊.....我知道。”"
		  },
		  "2024-07-11": {
			"title": "发掘 The Dig",
			"rating": "7.9",
			"comment": "从人类在洞壁上留下第一个手印开始，我们就在历史上一直存在着。"
		  },
		  "2024-07-12": {
			"title": "毒舌律师 毒舌大狀",
			"rating": "7.5",
			"comment": "穷就可以为所欲为吗？那冬天是不是可以放火烧隔壁的屋子来取暖啊？"
		  },
		  "2024-07-13": {
			"title": "惊天营救 Extraction",
			"rating": "7.2",
			"comment": "因为不管你觉得自己有多厉害，总有比你更厉害的人。"
		  },
		  "2024-07-14": {
			"title": "加菲猫 Garfield",
			"rating": "7.7",
			"comment": "—— “你说我该怎么处置你？” —— “爱我。饲养我。不要离开我。”"
		  },
		  "2024-07-15": {
			"title": "龙与地下城：侠盗荣耀 Dungeons & Dragons: Honor Among Thieves",
			"rating": "7.5",
			"comment": "又来这套，人们总以为用魔法可以解决任何问题。这是有限制的，这不是童话故事，这是真实的世界。"
		  },
		  "2024-07-16": {
			"title": "虞美人盛开的山坡 コクリコ坂から",
			"rating": "8.1",
			"comment": "一个劲儿地奔向新事物，对历史弃而不顾的你们，会有所谓的未来吗？"
		  },
		  "2024-07-17": {
			"title": "24小时  第一季 24 Season 1",
			"rating": "8.7",
			"comment": "等到一月，你就要宣誓了，你想清楚点，站在你身边的那个人，只能是我。"
		  },
		  "2024-07-18": {
			"title": "特工 공작",
			"rating": "8.7",
			"comment": "人呢，出生几个月就能学会说话，但活几十年都学不会怎么去闭嘴。"
		  },
		  "2024-07-19": {
			"title": "超人：钢铁之躯 Man of Steel",
			"rating": "7.3",
			"comment": "人类总是对无法理解的事情产生恐慌。"
		  },
		  "2024-07-20": {
			"title": "雷蒙德和雷 Raymond & Ray",
			"rating": "7.1",
			"comment": "我这一生都在努力不被压碎。"
		  },
		  "2024-07-21": {
			"title": "盟约 The Covenant",
			"rating": "7.4",
			"comment": "—— “你越界了，艾哈迈德。你只是来翻译的。” —— “实际上，我的工作是翻译加解释。”"
		  },
		  "2024-07-22": {
			"title": "晒后假日 Aftersun",
			"rating": "8.2",
			"comment": "有些人认为，一旦你离开了长大的地方，你就不再完全属于那里了。｜大暑"
		  },
		  "2024-07-23": {
			"title": "狂飙",
			"rating": "8.5",
			"comment": "我这么多年，不一直也没有赢过吗，不是也活得蛮好吗？"
		  },
		  "2024-07-24": {
			"title": "欲望都市 Sex and the City",
			"rating": "7.7",
			"comment": "也许当我们给人加上标签，新娘、新郎、丈夫、妻子、已婚、未婚，我们已经忘记透过虚名看本质了。"
		  },
		  "2024-07-25": {
			"title": "胡丽叶塔 Julieta",
			"rating": "7.5",
			"comment": "我戒掉你很多年。"
		  },
		  "2024-07-26": {
			"title": "坠落的审判 Anatomie d'une chute",
			"rating": "8.5",
			"comment": "两个人的感情有时会处于一种复杂的状态，在这混乱中每个人都会迷失自己，你明白吗？有时候我们一致向外，有时候我们自我挣扎，有时候我们也会互相指责。"
		  },
		  "2024-07-27": {
			"title": "流浪巴黎 Paris pieds nus",
			"rating": "7.7",
			"comment": "我一直都想爬埃菲尔铁塔，不知道为什么我一直都没有爬过。"
		  },
		  "2024-07-28": {
			"title": "浴血黑帮 第一季 Peaky Blinders Season 1",
			"rating": "9.1",
			"comment": "处于守势的人不能谈判，我们得先回击一拳。"
		  },
		  "2024-07-29": {
			"title": "法外之徒 Bande à part",
			"rating": "8.6",
			"comment": "—— “既然没什么话说，我们就沉默一分钟吧。” —— “有时你真弱智。” —— “一分钟沉默可以很长，真正的一分钟沉默会像永远那么长。”｜《法外之徒》首映 60 周年｜2020年豆瓣电影日历"
		  },
		  "2024-07-30": {
			"title": "弹子球游戏 第一季 Pachinko Season 1",
			"rating": "8.3",
			"comment": "因为即便是最卑微的生物也渴望生存。"
		  },
		  "2024-07-31": {
			"title": "谎言大师 The Good Liar",
			"rating": "7.2",
			"comment": "如果你的自我介绍能够更准确些，我们可以避免浪费所有的时间和精力。在我们这个年纪，时间和精力我们都浪费不起。"
		  },
		  "2024-08-01": {
			"title": "狙击手",
			"rating": "7.7",
			"comment": "这个距离，看准头，更看眼力，没有人比你眼睛快，你娃只要手不慢，你比我霸道！｜建军节"
		  },
		  "2024-08-02": {
			"title": "铃芽之旅 すずめの戸締まり",
			"rating": "7.2",
			"comment": "铃芽，无论现在多么痛彻心扉，这是成长的必经过程。所以，你不用担心，未来充满着希望。你会遇见自己喜欢的人，也会遇见喜欢你的人。虽然现在黑夜看似无穷无尽，但是黎明的曙光一定会来的。"
		  },
		  "2024-08-03": {
			"title": "贝隆夫人 Evita",
			"rating": "7.7",
			"comment": "过往荆棘满途，我仍屹立不倒。"
		  },
		  "2024-08-04": {
			"title": "西游降魔篇",
			"rating": "7.2",
			"comment": "一万年太久了，就爱我现在。"
		  },
		  "2024-08-05": {
			"title": "孤堡惊情 El orfanato",
			"rating": "7.4",
			"comment": "你是个好妈妈，伤痛会给你力量，带你往前走，但只有你知道自己能走多远。"
		  },
		  "2024-08-06": {
			"title": "喜鹊谋杀案 Magpie Murders",
			"rating": "8.3",
			"comment": "我相信世间没有所谓的巧合，人生中的万物都隶属某种模式，而巧合单纯是那个模式暂时显现的瞬间。"
		  },
		  "2024-08-07": {
			"title": "蒂莫西的奇异生活 The Odd Life of Timothy Green",
			"rating": "7.8",
			"comment": "当其他孩子长大了，搬走了。而我，失去我的叶子，我也会离开。｜立秋"
		  },
		  "2024-08-08": {
			"title": "官方机密 Official Secrets",
			"rating": "7.8",
			"comment": "—— “你没做错什么。” —— “我也没做什么正确的事。”"
		  },
		  "2024-08-09": {
			"title": "沉默 Silence",
			"rating": "7.7",
			"comment": "没人有资格干预别人的内心。"
		  },
		  "2024-08-10": {
			"title": "去有风的地方",
			"rating": "8.7",
			"comment": "当你看向我，跟人谈论我，反复回忆起我时，我就在你的身边。｜七夕节"
		  },
		  "2024-08-11": {
			"title": "美梦成真 What Dreams May Come",
			"rating": "7.9",
			"comment": "我不会丢下你，我会常在你左右。｜罗宾·威廉姆斯 逝世10周年"
		  },
		  "2024-08-12": {
			"title": "大创业家 The Founder",
			"rating": "7.6",
			"comment": "你知道，合同就像是心脏，就是为了心碎那天而存在。"
		  },
		  "2024-08-13": {
			"title": "亢奋 第二季 Euphoria Season 2",
			"rating": "8.0",
			"comment": "—— “还有比爱更强烈的感情吗？” —— “失去爱。”"
		  },
		  "2024-08-14": {
			"title": "甜蜜家园 스위트홈",
			"rating": "7.8",
			"comment": "在做不到的情况下做出明确的保证，有很大的概率是谎言。"
		  },
		  "2024-08-15": {
			"title": "金矿 Gold",
			"rating": "8.2",
			"comment": "如果连梦想都能卖，你还能剩下什么？"
		  },
		  "2024-08-16": {
			"title": "阿凡达：水之道 Avatar: The Way of Water",
			"rating": "7.8",
			"comment": "水把万物联系在一起，生与死，黑暗与光明。｜詹姆斯·卡梅隆70岁生日"
		  },
		  "2024-08-17": {
			"title": "极盗者 Point Break",
			"rating": "7.2",
			"comment": "—— “根本没路可走。” —— “当然有。”"
		  },
		  "2024-08-18": {
			"title": "永远的托词 永い言い訳",
			"rating": "7.6",
			"comment": "遗忘也是很重要的，有些事非放下不可。｜中元节"
		  },
		  "2024-08-19": {
			"title": "鱼之子 さかなのこ",
			"rating": "8.1",
			"comment": "—— “要是大家学习成绩都那么好，全是优秀学生，那跟机器人一样了。” —— “这个，我理解您的想法，但是将来麻烦的是这孩子啊。” —— “这样不挺好的嘛，这孩子喜欢鱼，还画了鱼的画，这就行了，这样挺好的。”"
		  },
		  "2024-08-20": {
			"title": "利器 Sharp Objects",
			"rating": "8.3",
			"comment": "令人畏惧比受人爱戴要更安全。｜艾米·亚当斯50岁生日"
		  },
		  "2024-08-21": {
			"title": "血战摩苏尔 Mosul",
			"rating": "7.7",
			"comment": "他们不在乎是否毁掉一切，反正他们不需要进行重建。"
		  },
		  "2024-08-22": {
			"title": "夏日细语 An Cailín Ciúin",
			"rating": "8.3",
			"comment": "有时候人失去了很多，恰恰是因为他错过了保持沉默的恰当时机。｜处暑"
		  },
		  "2024-08-23": {
			"title": "好小子们 Good Boys",
			"rating": "7.2",
			"comment": "所以我想总有一天我们会对上眼。"
		  },
		  "2024-08-24": {
			"title": "侏罗纪公园3 Jurassic Park III",
			"rating": "7.4",
			"comment": "若不是洪水使它们绝迹，如今控制地球生物的很可能不是人类，而是迅猛龙。"
		  },
		  "2024-08-25": {
			"title": "火锅英雄",
			"rating": "7.2",
			"comment": "你不是说，走之前一起吃顿火锅的吗？"
		  },
		  "2024-08-26": {
			"title": "死寂 Dead Silence",
			"rating": "7.9",
			"comment": "—— “你想要什么？” —— “让那些使我安静下来的人全都安静下来。”"
		  },
		  "2024-08-27": {
			"title": "黄飞鸿 黃飛鴻",
			"rating": "8.3",
			"comment": "如果这个世界真有金山的话，这些洋船为什么要来我们的港口呢？也许我们已经站在金山上了。"
		  },
		  "2024-08-28": {
			"title": "重返十七岁 17 Again",
			"rating": "7.4",
			"comment": "你知道吗，你小时候以为所有糟糕的事都是世界末日，其实不然。"
		  },
		  "2024-08-29": {
			"title": "铁雨 강철비",
			"rating": "8.2",
			"comment": "不可以发动战争，这样我们全都会自取灭亡。｜PS.由于政治题材敏感，《狩猎》的页面没有“添加到片单”的功能，只能以此片来替代。"
		  },
		  "2024-08-30": {
			"title": "木乃伊 The Mummy",
			"rating": "7.9",
			"comment": "我把话说在前头，我就算出不去，也不当木乃伊。"
		  },
		  "2024-08-31": {
			"title": "黑袍纠察队 第三季 The Boys Season 3",
			"rating": "8.6",
			"comment": "勇敢并不是毫无畏惧。勇敢是你虽心怀惧意，但还是会去放手一搏。"
		  },
		  "2024-09-01": {
			"title": "佩小姐的奇幻城堡 Miss Peregrine's Home for Peculiar Children",
			"rating": "7.2",
			"comment": "重置时间圈，就可以重新生活这一天。"
		  },
		  "2024-09-02": {
			"title": "黑客帝国3：矩阵革命 The Matrix Revolutions",
			"rating": "8.8",
			"comment": "凡事只要有开始，就有结束，尼奥。｜基努·里维斯60岁生日"
		  },
		  "2024-09-03": {
			"title": "八佰",
			"rating": "7.5",
			"comment": "你看看对面，靠我们这区区四百来人是扛不住的，得靠身后这四万万人来扛。｜抗战纪念日"
		  },
		  "2024-09-04": {
			"title": "梦乡 Slumberland",
			"rating": "7.5",
			"comment": "没有永远不醒的梦，好吗？只要是梦，迟早会消失。"
		  },
		  "2024-09-05": {
			"title": "哈尔的移动城堡 ハウルの動く城",
			"rating": "9.1",
			"comment": "苏菲的头发染上星光的颜色，真漂亮。｜《哈尔的移动城堡》首映20周年｜2020年豆瓣电影日历"
		  },
		  "2024-09-06": {
			"title": "为黛西小姐开车 Driving Miss Daisy",
			"rating": "8.3",
			"comment": "—— “黛西夫人，要是我像你这样有钱的话，我会向所有人都炫耀的。” —— “粗俗！”"
		  },
		  "2024-09-07": {
			"title": "血迷宫 Blood Simple",
			"rating": "7.8",
			"comment": "在俄罗斯，人们都是这样做的，每个人都能找到能帮他的人，这也成了一种理论。但是我的理论却是基于得克萨斯，在得州，你只能靠你自己。｜白露｜《血迷宫》上映40周年"
		  },
		  "2024-09-08": {
			"title": "恶人传 악인전",
			"rating": "7.8",
			"comment": "我们拿命干活，你们这些拿薪水的才不用这样。"
		  },
		  "2024-09-09": {
			"title": "大腕",
			"rating": "7.9",
			"comment": "什么叫成功人士，你知道吗？成功人士就是买什么东西，都买最贵的，不买最好的。"
		  },
		  "2024-09-10": {
			"title": "地球上的星星 Taare Zameen Par",
			"rating": "8.9",
			"comment": "每个小孩都是不同的，他们迟早会明白，每个孩子都有自己的步调。｜教师节"
		  },
		  "2024-09-11": {
			"title": "无处可逃 No Escape",
			"rating": "7.3",
			"comment": "这里没有善恶，你只是把你的家人从地狱里拉出来。"
		  },
		  "2024-09-12": {
			"title": "荒野大镖客 Per un pugno di dollari",
			"rating": "8.4",
			"comment": "当一个男人口袋里有钱的时候，他就开始欣赏和平。｜《荒野大镖客》上映60周年"
		  },
		  "2024-09-13": {
			"title": "黑色的风采 Black",
			"rating": "8.5",
			"comment": "对于我来说，一切都是黑色的，但我的老师教我黑色的新的意义。黑色并不只代表黑暗和窒息，它是成绩的颜色，知识的颜色，毕业长袍的颜色，我们今天所分享的一切的颜色。"
		  },
		  "2024-09-14": {
			"title": "德州巴黎 Paris, Texas",
			"rating": "8.5",
			"comment": "你离开以后，我常常会有好多话跟你说。我一直跟你讲话，即使在我一个人的时候。有好几个月，我边走边跟你讲话，而现在，我却不知道说什么好。当我只是想象你的时候，事情容易多了。｜《德州巴黎》上映40周年｜2019年豆瓣电影日历"
		  },
		  "2024-09-15": {
			"title": "校合唱团的秘密 Mindenki",
			"rating": "8.8",
			"comment": "任何人都能加入合唱团，这是我的基本原则之一。"
		  },
		  "2024-09-16": {
			"title": "马丁·伊登 Martin Eden",
			"rating": "8.0",
			"comment": "—— “这个世界就像一个监狱。” —— “只要你有钥匙，监狱也可以是家。爱情就是那把钥匙。”"
		  },
		  "2024-09-17": {
			"title": "宝贝计划 寶貝計劃",
			"rating": "7.5",
			"comment": "—— “小时候叫你好好读书，将来做医生、做律师，还求校长让你读名校，谁知道读来读去这么没出息。” —— “难道不是律师就不是你儿子了，我也想做律师、工程师、医生，我做到才行啊。”｜中秋节"
		  },
		  "2024-09-18": {
			"title": "精武英雄",
			"rating": "8.6",
			"comment": "—— “那最强的防守又是什么？—— “是进攻，与其尽力地防守，不如全力地进攻，在最短的时间击倒对手。”"
		  },
		  "2024-09-19": {
			"title": "怒海救援 The Finest Hours",
			"rating": "7.4",
			"comment": "柏尼，那你最好一出海就迷航。"
		  },
		  "2024-09-20": {
			"title": "007之金手指 Goldfinger",
			"rating": "7.1",
			"comment": "一杯伏特加马天尼。摇匀，不要搅拌。《007之金手指》上映60周年"
		  },
		  "2024-09-21": {
			"title": "黑板 تخته سیاه: خانه",
			"rating": "8.0",
			"comment": "我们，我们永远不能停止奔走。｜国际和平日"
		  },
		  "2024-09-22": {
			"title": "当哈利遇到莎莉 When Harry Met Sally...",
			"rating": "8.3",
			"comment": "我今晚来这里，是因为当你明白，你想和某个人共度余生的时候，你会希望你的余生越早开始越好。｜秋分｜2019年豆瓣电影日历"
		  },
		  "2024-09-23": {
			"title": "气垫传奇 AIR",
			"rating": "7.5",
			"comment": "只有当某个人穿上了鞋子，那鞋子才有了生命，然后它才有了意义。"
		  },
		  "2024-09-24": {
			"title": "酒会 The Party",
			"rating": "7.3",
			"comment": "有时候为了获胜，你不得不伪装。"
		  },
		  "2024-09-25": {
			"title": "我与梦露的一周 My Week with Marilyn",
			"rating": "7.3",
			"comment": "我现在想起她的时候，就想起那个梦想成真的时刻。"
		  },
		  "2024-09-26": {
			"title": "信笺故事 The Tale",
			"rating": "8.2",
			"comment": "人们是怎么改变的？当我还是个孩子的时候，我完全沉迷于改变自己，现在我几乎记不得我是怎么变成这样的，或是我曾经是怎样的。"
		  },
		  "2024-09-27": {
			"title": "人再囧途之泰囧",
			"rating": "7.5",
			"comment": "人在旅途，要相互帮助，就像一对组合。｜世界旅游日"
		  },
		  "2024-09-28": {
			"title": "风骚律师 第六季 Better Call Saul Season 6",
			"rating": "9.7",
			"comment": "我觉得会如何收场？当然是我一如既往地大获全胜。"
		  },
		  "2024-09-29": {
			"title": "童年的许诺 La promesse de l'aube",
			"rating": "8.3",
			"comment": "他是我的儿子，他未来会当法国大使、作家、荣誉军团骑士，甚至是一名将军，他会找伦敦最好的裁缝师为他制作套装。"
		  },
		  "2024-09-30": {
			"title": "太阳泪 Tears of the Sun",
			"rating": "7.3",
			"comment": "当善良袖手旁观时，就成全了邪恶的胜利。—— 爱德蒙·柏克｜真妮卡·贝鲁奇60岁生日"
		  },
		  "2024-10-01": {
			"title": "夺冠",
			"rating": "7.1",
			"comment": "人最不愿意的就是年轻的时候对不起自己。｜国庆节"
		  },
		  "2024-10-02": {
			"title": "宇宙探索编辑部",
			"rating": "8.0",
			"comment": "这不是普通的电视雪花点，这是宇宙诞生时的余晖。"
		  },
		  "2024-10-03": {
			"title": "蒙上你的眼 Bird Box",
			"rating": "7.2",
			"comment": "人类在被审判，我们被判处罪有应得。"
		  },
		  "2024-10-04": {
			"title": "吉尔莫·德尔·托罗的匹诺曹 Guillermo Del Toro's Pinocchio",
			"rating": "7.8",
			"comment": "世间一切，皆有定数。"
		  },
		  "2024-10-05": {
			"title": "大侦探福尔摩斯 Sherlock Holmes",
			"rating": "7.7",
			"comment": "我一静下来就会抓狂。快点给我出难题，快点给我工作。"
		  },
		  "2024-10-06": {
			"title": "下一个素熙 다음 소희",
			"rating": "8.3",
			"comment": "下次冲动前，一定要找个人说出来。对我说也行没事的，对警察说没问题。"
		  },
		  "2024-10-07": {
			"title": "咒术回战 0 劇場版 呪術廻戦 0",
			"rating": "8.3",
			"comment": "强大的力量就应该用于现实伟大的目标。"
		  },
		  "2024-10-08": {
			"title": "传奇的诞生 Pelé: Birth of a Legend",
			"rating": "7.7",
			"comment": "这已经不是一场单纯的球赛了，而是一场华丽无比的表演！"
		  },
		  "2024-10-09": {
			"title": "边缘世界 The Peripheral",
			"rating": "7.4",
			"comment": "是的，图特，有时候吧，人到了某个阶段，就会觉得自己需要改变。我是说，核心理念要改。"
		  },
		  "2024-10-10": {
			"title": "当怪物来敲门 A Monster Calls",
			"rating": "7.2",
			"comment": "人是复杂的动物，你清楚痛苦真相的同时，却又相信安慰人的谎言，这让谎言变得更为必要了。"
		  },
		  "2024-10-11": {
			"title": "妈妈！",
			"rating": "7.5",
			"comment": "睡吧孩子，睡个安稳觉，世上的人都比你想象的坚强。｜重阳节"
		  },
		  "2024-10-12": {
			"title": "了不起的麦瑟尔夫人 第四季 The Marvelous Mrs. Maisel Season 4",
			"rating": "9.0",
			"comment": "但言论是有力量的，它能照亮躲藏在黑暗中的事物。"
		  },
		  "2024-10-13": {
			"title": "银河护卫队3 Guardians of the Galaxy Vol. 3",
			"rating": "8.3",
			"comment": "总有一天，我会制造出会飞的伟大机器，而我和我的朋友们要一起去飞行，飞向永恒而美丽的天空。"
		  },
		  "2024-10-14": {
			"title": "肖申克的救赎 The Shawshank Redemption",
			"rating": "9.7",
			"comment": "请记住，瑞德，希望是美好的，也许是最美好的，而美好之物，永不消逝。｜《肖申克的救赎》上映30周年｜2019年豆瓣电影日历"
		  },
		  "2024-10-15": {
			"title": "天堂的颜色 رنگ خدا",
			"rating": "8.7",
			"comment": "你必须用手来抚摸木头，感觉你所碰到的一切。你必须用你的手指来感觉，并且用你的心观察。｜国际盲人节"
		  },
		  "2024-10-16": {
			"title": "一九四二",
			"rating": "8.2",
			"comment": "—— ”爹，什么叫逃荒呀？“ —— ”没有吃的了，你愿意饿死啊。“ —— ”不愿意饿死。“ —— ”不愿意饿死，出门寻吃的，就叫逃荒。“｜世界粮食日"
		  },
		  "2024-10-17": {
			"title": "天际行者 Время первых",
			"rating": "7.8",
			"comment": "别催我，出错的话，我们就会被弹入太空中。"
		  },
		  "2024-10-18": {
			"title": "如果·爱",
			"rating": "7.7",
			"comment": "过去唯一的用处，就是让我不再想回到过去。｜周迅50岁生日｜2019年豆瓣电影日历"
		  },
		  "2024-10-19": {
			"title": "贼巢 Den of Thieves",
			"rating": "7.5",
			"comment": "—— ”休想让我戴上手铐。“ —— ”无所谓，反正我今天也没带。“"
		  },
		  "2024-10-20": {
			"title": "深夜食堂：东京故事 深夜食堂 -Tokyo Stories-",
			"rating": "8.8",
			"comment": "不管是以前还是现在的自己，我都喜欢得不得了。｜世界厨师日"
		  },
		  "2024-10-21": {
			"title": "最后一班地铁 Le dernier métro",
			"rating": "7.7",
			"comment": "你令我心跳，其他一切我也不在乎了。｜弗朗索瓦·特吕弗逝世40周年"
		  },
		  "2024-10-22": {
			"title": "动物园长的夫人 The Zookeeper's Wife",
			"rating": "7.3",
			"comment": "也许这也是为什么我如此爱动物，当你望向动物的眼睛，就立刻能看穿它们的内心，不像人类般复杂。"
		  },
		  "2024-10-23": {
			"title": "冰风暴 The Ice Storm",
			"rating": "7.9",
			"comment": "家庭就像是你自己的“反物质”，你的家庭就是你生而在的地方，你死后的归处。其中的矛盾在于：你越被拉近，你就越觉得空虚。｜李安70岁生日｜2021年豆瓣电影日历"
		  },
		  "2024-10-24": {
			"title": "一个好人 一個好人",
			"rating": "7.3",
			"comment": "我们千万不要忘记，当我们每天在头痛，今天吃什么的时候，世界上同时有很多人，在担心今天有没有东西吃。"
		  },
		  "2024-10-25": {
			"title": "红气球 Le ballon rouge",
			"rating": "8.8",
			"comment": "气球!你得听从我的话，乖乖的。"
		  },
		  "2024-10-26": {
			"title": "奇幻精灵事件簿 The Spiderwick Chronicles",
			"rating": "7.4",
			"comment": "—— “我不能留下，如果我留下，那逝去的岁月将使我瞬间灰飞烟灭。” —— “那这次，就带上我一起吧。”"
		  },
		  "2024-10-27": {
			"title": "6/45 육사오",
			"rating": "7.6",
			"comment": "一点的失败对于漫长的一生来说不算什么，以后会幸福的。"
		  },
		  "2024-10-28": {
			"title": "一呼一吸 Breathe",
			"rating": "8.0",
			"comment": "所以我选择了活着，因为是她告诉我要继续活着的。因为她，陪伴她，为了她。"
		  },
		  "2024-10-29": {
			"title": "红色沙漠 Il deserto rosso",
			"rating": "8.0",
			"comment": "你必须学会去爱，爱别人或某样事物······你的丈夫，你的儿子，工作，甚至狗。｜《红色沙漠》上映60周年｜2021年豆瓣电影日历"
		  },
		  "2024-10-30": {
			"title": "星期三 第一季 Wednesday Season 1",
			"rating": "7.8",
			"comment": "我认为社交媒体是追求无谓肯定的灵魂黑洞。"
		  },
		  "2024-10-31": {
			"title": "怪兽屋 Monster House",
			"rating": "7.4",
			"comment": "没有糖果，你家就会遭受小鬼的大破坏。｜万圣夜"
		  },
		  "2024-11-01": {
			"title": "珀尔 Pearl",
			"rating": "7.4",
			"comment": "如果你不趁你年轻的时候把握机会活到极致，你就没有第二次机会了。｜万圣节"
		  },
		  "2024-11-02": {
			"title": "夺宝联盟 도둑들",
			"rating": "7.3",
			"comment": "知道小偷为什么穷吗？因为偷的都是贵重的东西，但是却贱卖。"
		  },
		  "2024-11-03": {
			"title": "谁是超级英雄 Super-héros malgré lui",
			"rating": "7.4",
			"comment": "每个人都有一个人生理想，我呢，就有两个。"
		  },
		  "2024-11-04": {
			"title": "在糟糕的日子里 I onde dager",
			"rating": "7.5",
			"comment": "—— “你们觉得自己是如何幸存下来的？” —— “我觉得是因为，爱是坚不可摧的。”"
		  },
		  "2024-11-05": {
			"title": "正义回廊 正義迴廊",
			"rating": "7.5",
			"comment": "管教这把尺无论是长或短，软或硬，有个量度标准一定要坚持到底，就是爱。"
		  },
		  "2024-11-06": {
			"title": "地心营救 The 33",
			"rating": "7.5",
			"comment": "因为从这件事里我们什么都得不到，什么都没有。我们进来时候是矿工，我们出去之后还是矿工。"
		  },
		  "2024-11-07": {
			"title": "超能陆战队 Big Hero 6",
			"rating": "8.7",
			"comment": "你好，我叫大白，你的私人健康伙伴。｜立冬｜《超能陆战队》上映10周年"
		  },
		  "2024-11-08": {
			"title": "怪奇物语 第四季 Stranger Things Season 4",
			"rating": "9.2",
			"comment": "你一直说着怪物、超级英雄，那是传说和童话里的东西，现实往往没那么简单。"
		  },
		  "2024-11-09": {
			"title": "希望的另一面 Toivon tuolla puolen",
			"rating": "7.9",
			"comment": "我无法给人带来快乐，我让自己沉沦，才能帮助别人。"
		  },
		  "2024-11-10": {
			"title": "布兰卡和弹吉他的人 ブランカとギター弾き",
			"rating": "8.2",
			"comment": "我见过成年人给自己买小孩，就因为我是小孩，就不能给自己买个成年人吗？"
		  },
		  "2024-11-11": {
			"title": "边缘日记 The Basketball Diaries",
			"rating": "8.2",
			"comment": "最终你只是会把它看作是一场日场演出，一场被黑暗笼罩着的演出。｜莱昂纳多·迪卡普里奥50岁生日"
		  },
		  "2024-11-12": {
			"title": "嫌疑人 용의자",
			"rating": "7.5",
			"comment": "看什么看，我会舍不得你的。"
		  },
		  "2024-11-13": {
			"title": "2012",
			"rating": "8.0",
			"comment": "这本书已经成为人类文化遗产的一部分了。为什么？因为我正在读这本书。｜《2012》上映15周年"
		  },
		  "2024-11-14": {
			"title": "有史以来最棒的啤酒运送 The Greatest Beer Run Ever",
			"rating": "7.8",
			"comment": "真相会伤害我们？不，真相不会伤害我们，谎言才会。"
		  },
		  "2024-11-15": {
			"title": "道熙呀 도희야",
			"rating": "7.8",
			"comment": "大人打小孩是很糟糕的事情，如果有人那样揍你，一定要告诉别人，懂吗？"
		  },
		  "2024-11-16": {
			"title": "铁拳 Southpaw",
			"rating": "7.4",
			"comment": "拳击场上另一个人是你的敌人，但如果你一门心思只想杀了他，你就会暴露你自己，让自己受到攻击。要保护自己，然后抓住对方的错误，一击制胜。"
		  },
		  "2024-11-17": {
			"title": "扑克脸 第一季 Poker Face Season 1",
			"rating": "7.9",
			"comment": "你心是好的，你选择把好心用在陌生人身上，然后跟阵风一样就离开了。"
		  },
		  "2024-11-18": {
			"title": "她和她的她",
			"rating": "8.6",
			"comment": "这世界继续运转着，请你每天也试着往前，一步两步都没关系，不要勉强自己。"
		  },
		  "2024-11-19": {
			"title": "芬妮的旅程 Le voyage de Fanny",
			"rating": "8.5",
			"comment": "当战争结束的时候，我眼前全是人们欢欣庆祝的场景，同盟国的坦克驶进巴黎，姑娘们欢欣着朝空中丢花瓣，我们会有这么一天的。"
		  },
		  "2024-11-20": {
			"title": "有关时间旅行的热门问题 Frequently Asked Questions About Time Travel",
			"rating": "7.8",
			"comment": "—— “你们真想看看未来吗？” —— “当然。”"
		  },
		  "2024-11-21": {
			"title": "雷蒙·斯尼奇的不幸历险 Lemony Snicket's A Series of Unfortunate Events",
			"rating": "7.6",
			"comment": "也许你们从未注意到，第一印象往往是完全错误的。"
		  },
		  "2024-11-22": {
			"title": "复仇者联盟 The Avengers",
			"rating": "8.3",
			"comment": "复仇者联盟，我们这么称呼自己，算是个团队，一个地球上最强大的英雄组合。｜斯嘉丽·约翰逊40岁生日"
		  },
		  "2024-11-23": {
			"title": "年轻的维多利亚 The Young Victoria",
			"rating": "7.3",
			"comment": "摸透所有规则，直到你比他们强。"
		  },
		  "2024-11-24": {
			"title": "东方快车谋杀案 Murder on the Orient Express",
			"rating": "8.5",
			"comment": "波洛先生，我是个有钱人。自然，我这种地位的人会有敌人。｜《东方快车谋杀案》上映50周年"
		  },
		  "2024-11-25": {
			"title": "漫长的婚约 Un long dimanche de fiançailles",
			"rating": "8.1",
			"comment": "以前你为比我大一岁扬扬得意，你可知道现在我已经比你老了吗。｜加斯帕德·尤利尔诞辰40周年｜2021年豆瓣电影日历"
		  },
		  "2024-11-26": {
			"title": "不能说的游戏 Les chatouilles",
			"rating": "8.0",
			"comment": "你可以说我说谎，这一切不值一提，但我今天要把话都说出来，我不想再做行尸走肉了，你懂吗？"
		  },
		  "2024-11-27": {
			"title": "乐高蝙蝠侠大电影 The Lego Batman Movie",
			"rating": "8.0",
			"comment": "有时失去别人也是生活的一部分，但不代表你心中从此没了他们的位置。"
		  },
		  "2024-11-28": {
			"title": "落难见真情 Planes, Trains & Automobiles",
			"rating": "7.6",
			"comment": "我当然可以像你一样冷血，但我不想伤害别人的感情。随你怎么想我，我是不会改变的。｜感恩节"
		  },
		  "2024-11-29": {
			"title": "指环王1：护戒使者 The Lord of the Rings: The Fellowship of the Ring",
			"rating": "9.1",
			"comment": "—— “真希望这一切都从未发生。” —— “每个遇到困难的人都会这么想，但这由不得他们做主。我们所能做主的，是在这有限的时日之内应该如何应对。｜2019年豆瓣电影日历"
		  },
		  "2024-11-30": {
			"title": "教授 The Professor",
			"rating": "7.6",
			"comment": "我们背叛了自己肩负的最重要的责任，那就是过上我们自己选择的，精彩丰富的一生。"
		  },
		  "2024-12-01": {
			"title": "重启人生 ブラッシュアップライフ",
			"rating": "9.4",
			"comment": "象这样随着年纪增长，人生当中一年的比例会越来越短，所以会觉得时间过得很快。"
		  },
		  "2024-12-02": {
			"title": "正常人 Normal People",
			"rating": "8.5",
			"comment": "—— ”今晚准备干点啥？“ —— ”看个电影。“ —— ”不错哟。“"
		  },
		  "2024-12-03": {
			"title": "漂亮妈妈",
			"rating": "7.4",
			"comment": "郑大，好好听话，上小学，上中学，上大学。｜国际残疾人日"
		  },
		  "2024-12-04": {
			"title": "阿薇尔与虚构世界 Avril et le monde truqué",
			"rating": "8.1",
			"comment": "音乐，我承认是人类创造的罕见的愉悦之一。"
		  },
		  "2024-12-05": {
			"title": "精灵鼠小弟 Stuart Little",
			"rating": "7.8",
			"comment": "我们常说任何事情如果要成功，最重要的事就是不要放弃尝试。好吗？｜《精灵鼠小弟》首映25周年"
		  },
		  "2024-12-06": {
			"title": "雪怪大冒险 Smallfoot",
			"rating": "7.3",
			"comment": "我们觉得他们是怪物，他们觉得我们才是。｜大雪"
		  },
		  "2024-12-07": {
			"title": "哭泣的拳头 주먹이 운다",
			"rating": "7.5",
			"comment": "拳击手套才是打架的正道，只有努力付出的人才能赢得胜利。"
		  },
		  "2024-12-08": {
			"title": "旅行终点 The End of the Tour",
			"rating": "8.0",
			"comment": "如果我可以，我想对戴维说，那些和他在一起的日子，提醒了我生活应该是什么样子，而不是从生活中寻求解脱。"
		  },
		  "2024-12-09": {
			"title": "不留痕迹 Leave No Trace",
			"rating": "7.6",
			"comment": "—— “你住在哪里？你的家在哪？” —— “和我爸爸一起就是家。”"
		  },
		  "2024-12-10": {
			"title": "绿里奇迹 The Green Mile",
			"rating": "8.9",
			"comment": "我妈说快刀斩乱麻就不会疼。｜《绿里奇迹》上映25周年"
		  },
		  "2024-12-11": {
			"title": "迫降航班 Flight",
			"rating": "7.4",
			"comment": "就好像我已经说尽了一辈子的谎言，我不能再继续说谎了。也许我是个傻瓜，因为我只要再多说一次谎，我就可以摆脱这一切麻烦，继续飞行，保持我虚假的自尊。"
		  },
		  "2024-12-12": {
			"title": "我的国王 Mon roi",
			"rating": "7.7",
			"comment": "有时候，我们在生活中会有些盲目，不知道自己要去往何方，却一味向前奔跑，越跑越快，根本不去看看身后的风景。"
		  },
		  "2024-12-13": {
			"title": "南京 Nanking",
			"rating": "8.3",
			"comment": "直到那一天，南京仍是一座让人自豪的城市，一座有法有序的美丽城市。｜国家公祭日"
		  },
		  "2024-12-14": {
			"title": "塔利 Tully",
			"rating": "7.7",
			"comment": "我不知道······假如我有未曾实现的梦想，那我至少还能对这世界生气，结果，我只能气自己。"
		  },
		  "2024-12-15": {
			"title": "河畔须臾 川っぺりムコリッタ",
			"rating": "8.1",
			"comment": "有心发现这些小幸福的话，那你怎么都能撑过去，一时的困顿算不了什么，要是因为穷啊孤独啊，被逼得走投无路，就大大方方地说，“我身上没钱”，放心，天无绝人之路。"
		  },
		  "2024-12-16": {
			"title": "安多 第一季 Andor Season 1",
			"rating": "9.1",
			"comment": "火已经烧起来了，他只是第一颗火花。"
		  },
		  "2024-12-17": {
			"title": "我的事说来话长 俺の話は長い",
			"rating": "9.1",
			"comment": "—— “要是用最短时间走最短距离度过一生，那欢愉的果实是不会砸到你头上的哦。” —— “欢愉的果实是什么？” —— “那是不靠导航和网络，甘愿绕远路的人才能找到的小小的奖励。”"
		  },
		  "2024-12-18": {
			"title": "无间道2 無間道II",
			"rating": "8.7",
			"comment": "拿起容易，放下难。我今天放得下，你该替我高兴。"
		  },
		  "2024-12-19": {
			"title": "记忆裂痕 Paycheck",
			"rating": "7.3",
			"comment": "如果能看到未来，就没有未来。没有了奥秘，也就没有了希望······"
		  },
		  "2024-12-20": {
			"title": "平家物语：犬王 犬王",
			"rating": "7.9",
			"comment": "那里有我们的故事啊。"
		  },
		  "2024-12-21": {
			"title": "暴雪将至",
			"rating": "7.0",
			"comment": "—— “好像做了场梦，突然间一切都不真实了。” —— “回去吧。” —— “我都醒了，你还在做梦。”｜冬至"
		  },
		  "2024-12-22": {
			"title": "生死狙击 Shooter",
			"rating": "7.8",
			"comment": "我不是说了别被任何事干扰，慢就是稳，稳就是快，再来！"
		  },
		  "2024-12-23": {
			"title": "功夫",
			"rating": "8.8",
			"comment": "小弟，看你的骨骼精奇，是万中无一的练武奇才，维护世界和平就靠你了。｜《功夫》上映20周年｜2019年豆瓣电影日历"
		  },
		  "2024-12-24": {
			"title": "克劳斯：圣诞节的秘密 Klaus",
			"rating": "8.8",
			"comment": "—— “他很高大，但他可以钻进任何烟肉里。” —— “真的？ 怎么做到的？” —— “我不知道，我想是魔法吧。”｜平安夜"
		  },
		  "2024-12-25": {
			"title": "窈窕淑女 My Fair Lady",
			"rating": "8.2",
			"comment": "抛开装扮来看淑女和卖花女的区别不是在于她的行为，而在于人们对待她的态度。｜圣诞节｜《窈宛淑女》上映60周年"
		  },
		  "2024-12-26": {
			"title": "深海",
			"rating": "7.2",
			"comment": "我呢，也不用低声下气的；你呢，也不用那么过分懂事。不想笑你就别笑，想哭你就大声哭出来。"
		  },
		  "2024-12-27": {
			"title": "我的解放日志 나의 해방일지",
			"rating": "9.0",
			"comment": "虽然我可能没办法彻底从时间的制约中解脱，但我觉得忙够了就休息，睡饱了就起床，这样走出自己的步调，也许就是我最需要的解放方式。"
		  },
		  "2024-12-28": {
			"title": "巴比伦 Babylon",
			"rating": "8.0",
			"comment": "有一天，今年拍的所有电影中的人都会死去，有一天，这些电影都将会重见天日，他们的灵魂将再次重聚，共同聚餐、冒险、去丛林、赴战场。｜世界第一部电影诞生129周年"
		  },
		  "2024-12-29": {
			"title": "疾速追杀4 John Wick: Chapter 4",
			"rating": "7.3",
			"comment": "一个人的野心永远不应该超过他的价值，先生，你最好记住。"
		  },
		  "2024-12-30": {
			"title": "柯莱特 Colette",
			"rating": "7.6",
			"comment": "我读你就像读视力表的第一行一样。"
		  },
		  "2024-12-31": {
			"title": "穿越时空的少女 時をかける少女",
			"rating": "8.6",
			"comment": "我在未来等你。｜2020年豆瓣电影日历"
		  }
		// ... 其他电影信息
	  };
  
    const now = new Date();
    currentDate = now.toISOString().split('T')[0];
    console.log(`当前日期: ${currentDate}`); // 日志记录当前日期

    const movie = movies[currentDate];
    if (movie) {
      title = movie.title;
      rating = movie.rating;
      comment = movie.comment;
    }
  } catch (e) {
    console.error(`获取数据时发生错误: ${e.message}`);
  }

  console.log(`${title} | ${rating}\n${currentDate} | ${comment}`);
  return `${title} | ${rating}\n${currentDate} | ${comment}`;
}
  
  
// 字体表
const TABLE = {
	"monospace-regular": ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿", 
  "𝘢", "𝘣", "𝘤", "𝘥", "𝘦", "𝘧", "𝘨", "𝘩", "𝘪", "𝘫", // a-j
  "𝘬", "𝘭", "𝘮", "𝘯", "𝘰", "𝘱", "𝘲", "𝘳", "𝘴", "𝘵", // k-t
  "𝘶", "𝘷", "𝘸", "𝘹", "𝘺", "𝘻", // u-z
  "𝘈", "𝘉", "𝘊", "𝘋", "𝘌", "𝘍", "𝘎", "𝘏", "𝘐", "𝘑", // A-J
  "𝘒", "𝘓", "𝘔", "𝘕", "𝘖", "𝘗", "𝘘", "𝘙", "𝘚", "𝘛", // K-T
  "𝘜", "𝘝", "𝘞", "𝘟", "𝘠", "𝘡"  // U-Z
]
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
  