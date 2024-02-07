/*
 * 由@LucaLin233编写
 * 原脚本地址：https://raw.githubusercontent.com/LucaLin233/Luca_Conf/main/Surge/JS/stream-all.js
 * 由@Rabbit-Spec修改
 * 更新日期：2022.06.26
 * 版本：2.2
 */

const REQUEST_HEADERS = {
	"User-Agent":
	  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36",
	"Accept-Language": "en",
  }
  
  // 即将登陆
  const STATUS_COMING = 2
  // 支持解锁
  const STATUS_AVAILABLE = 1
  // 不支持解锁
  const STATUS_NOT_AVAILABLE = 0
  // 检测超时
  const STATUS_TIMEOUT = -1
  // 检测异常
  const STATUS_ERROR = -2
  
  const UA =
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
  
  ;(async () => {
	function convertToItalicUnicode(text) {
	  // 斜体字符的Unicode映射
	  const italicCharMap = {
		A: "𝘈",
		B: "𝘉",
		C: "𝘊",
		D: "𝘋",
		E: "𝘌",
		F: "𝘍",
		G: "𝘎",
		H: "𝘏",
		I: "𝘐",
		J: "𝘑",
		K: "𝘒",
		L: "𝘓",
		M: "𝘔",
		N: "𝘕",
		O: "𝘖",
		P: "𝘗",
		Q: "𝘘",
		R: "𝘙",
		S: "𝘚",
		T: "𝘛",
		U: "𝘜",
		V: "𝘝",
		W: "𝘞",
		X: "𝘟",
		Y: "𝘠",
		Z: "𝘡",
		a: "𝘢",
		b: "𝘣",
		c: "𝘤",
		d: "𝘥",
		e: "𝘦",
		f: "𝘧",
		g: "𝘨",
		h: "𝘩",
		i: "𝘪",
		j: "𝘫",
		k: "𝘬",
		l: "𝘭",
		m: "𝘮",
		n: "𝘯",
		o: "𝘰",
		p: "𝘱",
		q: "𝘲",
		r: "𝘳",
		s: "𝘴",
		t: "𝘵",
		u: "𝘶",
		v: "𝘷",
		w: "𝘸",
		x: "𝘹",
		y: "𝘺",
		z: "𝘻",
		0: "𝟬",
		1: "𝟭",
		2: "𝟮",
		3: "𝟯",
		4: "𝟰",
		5: "𝟱",
		6: "𝟲",
		7: "𝟳",
		8: "𝟴",
		9: "𝟵",
	  }
  
	  return text
		.split("")
		.map((char) => italicCharMap[char] || char)
		.join("")
	}
  
	// 示例用法
	let panel_result = {
	  title: "",
	  content: "",
	  icon: "movieclapper.fill",
	  "icon-color": "#318ce7",
	}
  
	let getquote = new Promise((resolve, reject) => {
		let url = "https://international.v1.hitokoto.cn/?c=a&c=b&c=c&c=h&c=h&max_length=12"
		$httpClient.get(url, function (error, response, data) {
		  if (error) {
			reject(error)
			return
		  }
		  if (response.status !== 200) {
			reject(
			  new Error(`Failed to fetch data. HTTP Status: ${response.status}`),
			)
			return
		  }
		  let jsonData = JSON.parse(data)
		  let hitokoto = jsonData.hitokoto;
		  let from = jsonData.from;
		  let from_who = jsonData.from_who;
		  let result = `${hitokoto} - 《${from}》 -`;
		  if (from_who) {
			result = `${hitokoto} - ${from_who}《${from}》 -`;
		  }
		  resolve(result)
		})
	  })
  
	let quote = await getquote;
	panel_result.title = await quote;
  
	let [{ region, status }] = await Promise.all([testDisneyPlus()])
	await Promise.all([
	  check_youtube_premium(),
	  check_netflix(),
	  check_bilibili(),
	]).then((result) => {
	  let disney_result = "𝘿𝙞𝙨𝙣𝙚𝙮+: "
  
	  if (status === STATUS_COMING) {
		disney_result += `Coming soon. | ${getFlagEmoji(region)}`
	  } else if (status === STATUS_AVAILABLE) {
		disney_result += `Enjoy ur shows now. | ${getFlagEmoji(region)}`
	  } else if (status === STATUS_NOT_AVAILABLE) {
		disney_result += `Not available.`
	  } else if (status === STATUS_TIMEOUT) {
		disney_result += `Failed to check.`
	  }
  
	  // 插入disney_result到结果数组的开始
	  result.unshift(disney_result)
	  let content = result.join("\n")
	  panel_result["content"] = convertToItalicUnicode(content)
  
	  $done(panel_result)
	})
  })()
  
  async function check_youtube_premium() {
	let inner_check = () => {
	  return new Promise((resolve, reject) => {
		let option = {
		  url: "https://www.youtube.com/premium",
		  headers: REQUEST_HEADERS,
		}
		$httpClient.get(option, function (error, response, data) {
		  if (error != null || response.status !== 200) {
			reject("Error")
			return
		  }
  
		  if (data.indexOf("Premium is not available in your country") !== -1) {
			resolve("Not Available")
			return
		  }
  
		  let region = ""
		  let re = new RegExp('"countryCode":"(.*?)"', "gm")
		  let result = re.exec(data)
		  if (result != null && result.length === 2) {
			region = result[1]
		  } else if (data.indexOf("www.google.cn") !== -1) {
			region = "CN"
		  } else {
			region = "US"
		  }
		  resolve(region)
		})
	  })
	}
  
	let youtube_check_result = "𝙔𝙤𝙪𝙏𝙪𝙗𝙚: "
  
	try {
	  const code = await inner_check()
	  if (code === "Not Available") {
		youtube_check_result += "Not Available"
	  } else {
		const flag = getFlagEmoji(code)
		youtube_check_result += `Enjoy ur time now. | ${flag}`
	  }
	} catch (error) {
	  youtube_check_result += "Failed to check."
	}
  
	return youtube_check_result
  }
  
  async function check_netflix() {
	let inner_check = (filmId) => {
	  return new Promise((resolve, reject) => {
		let option = {
		  url: "https://www.netflix.com/title/" + filmId,
		  headers: REQUEST_HEADERS,
		}
		$httpClient.get(option, function (error, response, data) {
		  if (error != null) {
			reject("Error")
			return
		  }
  
		  if (response.status === 403) {
			reject("Not Available")
			return
		  }
  
		  if (response.status === 404) {
			resolve("Not Found")
			return
		  }
  
		  if (response.status === 200) {
			let url = response.headers["x-originating-url"]
			let region = url.split("/")[3]
			region = region.split("-")[0]
			if (region == "title") {
			  region = "us"
			}
			resolve(region)
			return
		  }
  
		  reject("Error")
		})
	  })
	}
  
	let netflix_check_result = "𝙉𝙚𝙩𝙛𝙡𝙞𝙭: "
  
	try {
	  const code1 = await inner_check(80062035)
	  if (code1 === "Not Found") {
		const code2 = await inner_check(80018499)
		if (code2 === "Not Found") {
		  throw "Not Available"
		}
		netflix_check_result += `Only native shows available | ${getFlagEmoji(code2)}`
	  } else {
		netflix_check_result += `Enjoy ur shows now. | ${getFlagEmoji(code1)}`
	  }
	} catch (error) {
	  if (error === "Not Available") {
		netflix_check_result += "Not Available"
	  } else {
		netflix_check_result += "Failed to check."
	  }
	}
  
	return netflix_check_result
  }
  
  async function testDisneyPlus() {
	try {
	  let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
	  console.log(`homepage: region=${region}, cnbl=${cnbl}`)
	  // 即将登陆
	  //  if (cnbl == 2) {
	  //    return { region, status: STATUS_COMING }
	  //  }
	  let { countryCode, inSupportedLocation } = await Promise.race([
		getLocationInfo(),
		timeout(7000),
	  ])
	  console.log(
		`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`,
	  )
  
	  region = countryCode ?? region
	  console.log("region:" + region)
	  // 即将登陆
	  if (inSupportedLocation === false || inSupportedLocation === "false") {
		return { region, status: STATUS_COMING }
	  } else {
		// 支持解锁
		return { region, status: STATUS_AVAILABLE }
	  }
	} catch (error) {
	  console.log("error:" + error)
  
	  // 不支持解锁
	  if (error === "Not Available") {
		console.log("not Available")
		return { status: STATUS_NOT_AVAILABLE }
	  }
  
	  // 检测超时
	  if (error === "timeout") {
		return { status: STATUS_TIMEOUT }
	  }
  
	  return { status: STATUS_ERROR }
	}
  }
  
  function getLocationInfo() {
	return new Promise((resolve, reject) => {
	  let opts = {
		url: "https://disney.api.edge.bamgrid.com/graph/v1/device/graphql",
		headers: {
		  "Accept-Language": "en",
		  Authorization:
			"ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84",
		  "Content-Type": "application/json",
		  "User-Agent": UA,
		},
		body: JSON.stringify({
		  query:
			"mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }",
		  variables: {
			input: {
			  applicationRuntime: "chrome",
			  attributes: {
				browserName: "chrome",
				browserVersion: "94.0.4606",
				manufacturer: "apple",
				model: null,
				operatingSystem: "macintosh",
				operatingSystemVersion: "10.15.7",
				osDeviceIds: [],
			  },
			  deviceFamily: "browser",
			  deviceLanguage: "en",
			  deviceProfile: "macosx",
			},
		  },
		}),
	  }
  
	  $httpClient.post(opts, function (error, response, data) {
		if (error) {
		  reject("Error")
		  return
		}
  
		if (response.status !== 200) {
		  console.log("getLocationInfo: " + data)
		  reject("Not Available")
		  return
		}
  
		data = JSON.parse(data)
		if (data?.errors) {
		  console.log("getLocationInfo: " + data)
		  reject("Not Available")
		  return
		}
  
		let {
		  token: { accessToken },
		  session: {
			inSupportedLocation,
			location: { countryCode },
		  },
		} = data?.extensions?.sdk
		resolve({ inSupportedLocation, countryCode, accessToken })
	  })
	})
  }
  
  function testHomePage() {
	return new Promise((resolve, reject) => {
	  let opts = {
		url: "https://www.disneyplus.com/",
		headers: {
		  "Accept-Language": "en",
		  "User-Agent": UA,
		},
	  }
  
	  $httpClient.get(opts, function (error, response, data) {
		if (error) {
		  reject("Error")
		  return
		}
		if (
		  response.status !== 200 ||
		  data.indexOf("Sorry, Disney+ is not available in your region.") !== -1
		) {
		  reject("Not Available")
		  return
		}
  
		let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
		if (!match) {
		  resolve({ region: "", cnbl: "" })
		  return
		}
  
		let region = match[1]
		let cnbl = match[2]
		resolve({ region, cnbl })
	  })
	})
  }
  
  async function check_bilibili() {
	let check = (url) => {
	  return new Promise((resolve, reject) => {
		let option = {
		  url: url,
		  headers: REQUEST_HEADERS,
		}
		$httpClient.get(option, function (error, response, data) {
		  if (error != null || response.status !== 200) {
			reject("Error")
			return
		  }
  
		  let result = JSON.parse(data)
		  if (result.code === 0) {
			resolve("Available")
			return
		  }
  
		  resolve("Not Available")
		})
	  })
	}
  
	let bilibili_check_result = "𝘽𝙞𝙡𝙞𝙗𝙞𝙡𝙞: "
  
	try {
	  const getCountryCode = async () => {
		return new Promise((resolve, reject) => {
		  let option = {
			url: "https://api.live.bilibili.com/client/v1/Ip/getInfoNew",
			headers: REQUEST_HEADERS,
		  }
		  $httpClient.get(option, function (error, response, data) {
			if (error != null || response.status !== 200) {
			  reject("Error")
			  return
			}
  
			let result = JSON.parse(data)
			if (result.code === 0) {
			  let ip = result.data.addr
			  let option = {
				url: `https://api.ipapi.is/?q=${ip}`,
				headers: REQUEST_HEADERS,
			  }
			  $httpClient.get(option, function (error, response, data) {
				if (error != null || response.status !== 200) {
				  reject("Error")
				  return
				}
  
				let result = JSON.parse(data)
				console.log("Location Info:", result)
				resolve(result.location.country_code)
			  })
			} else {
			  reject("Error")
			}
		  })
		})
	  }
  
	  const countryCode = await getCountryCode()
	  console.log("Country Code:", countryCode)
	  const flag = getFlagEmoji(countryCode)
	  console.log("Flag Emoji:", flag)
	  const mainland = await check(
		"https://api.bilibili.com/pgc/player/web/playurl?avid=82846771&qn=0&type=&otype=json&ep_id=307247&fourk=1&fnver=0&fnval=16",
	  )
	  console.log("Mainland:", mainland)
	  const hkmctw = await check(
		"https://api.bilibili.com/pgc/player/web/playurl?avid=18281381&cid=29892777&qn=0&type=&otype=json&ep_id=183799&fourk=1&fnver=0&fnval=16",
	  )
	  console.log("HK/MC/TW:", hkmctw)
	  const tw = await check(
		"https://api.bilibili.com/pgc/player/web/playurl?avid=50762638&cid=100279344&qn=0&type=&otype=json&ep_id=268176&fourk=1&fnver=0&fnval=16",
	  )
	  console.log("TW:", tw)
  
	  if (tw === "Available") {
		bilibili_check_result += `Enjoy watching BILI TW now. | ${flag}`
	  } else if (hkmctw === "Available") {
		bilibili_check_result += `Enjoy watching BILI GC now. | ${flag}`
	  } else if (mainland === "Available") {
		bilibili_check_result += `Enjoy watching BILI CN now. | ${flag}`
	  } else {
		bilibili_check_result += `Enjoy watching BILI Intl now. | ${flag}`
	  }
	} catch (error) {
	  bilibili_check_result += "Failed to check."
	}
  
	return bilibili_check_result
  }
  
  function timeout(delay = 5000) {
	return new Promise((resolve, reject) => {
	  setTimeout(() => {
		reject("Timeout")
	  }, delay)
	})
  }
  function getFlagEmoji(countryCode) {
	const codePoints = countryCode
	  .toUpperCase()
	  .split("")
	  .map((char) => 127397 + char.charCodeAt())
	return String.fromCodePoint(...codePoints)
  }
  