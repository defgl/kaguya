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
  const getMovieInfo = await getMovieInfo
  // 打印转换后的 CN_IP 和时间
  console.log("Transformed CN_IP: ", transformedCN_IP);
  console.log("Transformed Time: ", transformedTime);
  console.log("Transformed CN_ADDR_EN: ", transformedCN_ADDR_EN);

  title = `${festivalInfo}\n${getMovieInfo}\n${transformedCN_ADDR_EN}`
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
    if (!res1.body.includes('中国')) {
        $.logErr("Check routing rules, detected non-mainland IP");
        return;
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
	let lunarFestival, festivals, cnMonth, cnDay;
  
	try {
	  const res1 = await $.http.get('https://api.mu-jie.cc/lunar');
	  lunarFestival = $.lodash_get(res1, 'data.data.lunarFestival');
  
	  const res2 = await $.http.get('https://api.timelessq.com/time');
	  festivals = $.lodash_get(res2, 'data.data.festivals');
	  cnMonth = $.lodash_get(res2, 'data.data.lunar.cnMonth');
	  cnDay = $.lodash_get(res2, 'data.data.lunar.cnDay');
	} catch (e) {
	  $.logErr(`获取数据时发生错误: ${e.message || e}`);
	}
  
	// Combine and deduplicate festivals
	const combinedFestivals = Array.from(new Set([...festivals, lunarFestival]));
  
	// Output
	console.log(`农历 ${cnMonth}${cnDay}\n${combinedFestivals.join(', ')}`);
	// Return the formatted string
	return `农历 ${cnMonth}${cnDay}\n${combinedFestivals.join(', ')}`;
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
	let title, rating, comment;
  
	try {
	  const res = await $.http.get('https://raw.githubusercontent.com/yes1am/douban-movie-calendar/master/douban-movie-calendar-2024.json');
	  const movies = $.lodash_get(res, 'data');
  
	  // Get current date in 'yyyy-mm-dd' format
	  const now = new Date();
	  const currentDate = now.toISOString().split('T')[0];
  
	  // Find the movie that matches the current date
	  const movie = movies.find(movie => movie.comment.startsWith(currentDate));
	  if (movie) {
		title = movie.title;
		rating = movie.rating;
		comment = movie.comment;
	  } else {
		throw new Error(`没有找到 ${currentDate} 的电影信息`);
	  }
	} catch (e) {
	  $.logErr(`获取数据时发生错误: ${e.message || e}`);
	}
  
	// Output
	console.log(`${title} | ${rating}\n${comment}`);
	// Return the formatted string
	return `${title} | ${rating}\n${comment}`;
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
  