// @timestamp thenkey 2024-03-29 13:54:57
let icon = "globe.asia.australia";
let iconColor = "#6699FF";
let checkGPT = false;
let hideIP = true;
let cnTimeout = 1000;
let usTimeout = 3000;
let result = {};

if (typeof $argument !== "undefined" && $argument !== "") {
    const args = parseArgument("$argument");
    icon = args.icon || icon;
    iconColor = args.icolor || iconColor;
    checkGPT = args.GPT !== 0;
    hideIP = args.hideIP !== 0;
    cnTimeout = args.cnTimeout || 1000;
    usTimeout = args.usTimeout || 3000;
}

function parseArgument(argument) {
    return Object.fromEntries(
        $argument.split("&")
            .map(param => param.split("="))
            .map(([key, value]) => [key, decodeURIComponent(value)])
    );
}

function truncateString(str, length) {
    if (str.length > length) {
        return str.slice(0, length);
    } else if (str.length < length) {
        return str.toString().padEnd(length, " ");
    }
    return str;
}

function removeSpecialChars(str, maxWords) {
    return str.split(" ", maxWords).join(" ")
        .replace(/\.|\,|com|\u4e2d\u56fd/g, "");
}

function maskIP(ip) {
    return ip.replace(/(\w{1,4})(\.|\:)(\w{1,4}|\*)$/, (match, p1, p2, p3) => {
        return `${"∗".repeat(p1.length)}.${"∗".repeat(p3.length)}`;
    });
}

async function httpRequest(path = "/v1/requests/recent", method = "GET", body = null) {
    return new Promise((resolve, reject) => {
        $httpAPI(method, path, body, (response) => {
            resolve(response);
        });
    });
}

function getFlagEmoji(countryCode) {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints).replace(/🇹🇼/g, "🇨🇳");
}

async function getLocationInfo(url, timeout) {
    let retryCount = 1;
    const promise = new Promise((resolve, reject) => {
        const fetchData = async attemptCount => {
            try {
                const response = await Promise.race([
                    new Promise((resolve, reject) => {
                        let startTime = Date.now();
                        $httpClient.get({
                            url: url
                        }, (error, response, data) => {
                            if (error) {
                                reject(error);
                            } else {
                                let endTime = Date.now() - startTime;
                                switch (response.status) {
                                    case 200:
                                        let contentType = response.headers["Content-Type"];
                                        switch (true) {
                                            case contentType.includes("application/json"):
                                                let json = JSON.parse(data);
                                                json.tk = endTime;
                                                resolve(json);
                                                break;
                                            case contentType.includes("text/html"):
                                                resolve("text/html");
                                                break;
                                            case contentType.includes("text/plain"):
                                                let plainText = data.split("\n").reduce((result, line) => {
                                                    let [key, value] = line.split("=");
                                                    result[key] = value;
                                                    result.tk = endTime;
                                                    return result;
                                                }, {});
                                                resolve(plainText);
                                                break;
                                            case contentType.includes("image/svg+xml"):
                                                resolve("image/svg+xml");
                                                break;
                                            default:
                                                resolve("未知");
                                        }
                                        break;
                                    case 204:
                                        resolve({
                                            tk: endTime
                                        });
                                        break;
                                    case 429:
                                        console.log("次数过多");
                                        resolve("次数过多");
                                        break;
                                    case 404:
                                        console.log("404");
                                        resolve("404");
                                        break;
                                    default:
                                        resolve("nokey");
                                }
                            }
                        });
                    }),
                    new Promise((resolve, reject) => {
                        setTimeout(() => reject(new Error("timeout")), timeout);
                    })
                ]);
                if (response) {
                    resolve(response);
                } else {
                    resolve("超时");
                    reject(new Error(error.message));
                }
            } catch (error) {
                if (attemptCount < 1) {
                    retryCount++;
                    fetchData(attemptCount + 1);
                } else {
                    resolve("检测失败, 重试次数" + retryCount);
                    reject(error);
                }
            }
        };
        fetchData(0);
    });
    return promise;
}

(async () => {
    let landingIP = "";
    let infoTitle = "节点信息查询";
    let proxyChain = "代理链";
    let entryInfo = "";
    let landingInfo = "";
    let policyName = "";

    const ipApiResponse = await getLocationInfo("http://ip-api.com/json/?lang=zh-CN", usTimeout);
    if (ipApiResponse.status === "success") {
        console.log("ipapi" + JSON.stringify(ipApiResponse, null, 2));
        let {
            country,
            countryCode,
            regionName,
            query,
            city,
            org,
            isp,
            as,
            tk
        } = ipApiResponse;
        landingIP = query;
        if (hideIP) {
            query = maskIP(query);
        }
        if (country === city) {
            city = "";
        }
        landingInfo = " \t" + (getFlagEmoji(countryCode) + country + " " + city) +
            "\n落地IP: \t" + query + ": " + tk + "ms\n落地ISP: \t" + isp +
            "\n落地ASN: \t" + as;
    } else {
        console.log("ild" + JSON.stringify(ipApiResponse));
        landingInfo = "";
    }

    if (checkGPT) {
        const traceResponse = await getLocationInfo("http://chat.openai.com/cdn-cgi/trace", usTimeout);
        const blockedCountries = ["CN", "TW", "HK", "IR", "KP", "RU", "VE", "BY"];
        if (typeof traceResponse !== "string") {
            let {
                loc,
                tk,
                warp,
                ip
            } = traceResponse;
            let gptStatus = "";
            if (blockedCountries.indexOf(loc) == -1) {
                gptStatus = "GPT: " + loc + " ✓";
            } else {
                gptStatus = "GPT: " + loc + " ×";
            }
            if (warp === "plus") {
                warp = "Plus";
            }
            infoTitle = gptStatus + "       ➟     Priv: " + warp + "   " + tk + "ms";
        } else {
            infoTitle = "ChatGPT " + traceResponse;
        }
    }

    let entryIP;
    let proxyLocation = "";
    let recentRequests = (await httpRequest()).requests.slice(0, 6).filter(request => /ip-api\.com/.test(request.URL));

    if (recentRequests.length > 0) {
        const latestRequest = recentRequests[0];
        policyName = ": " + latestRequest.policyName;
        if (/\(Proxy\)/.test(latestRequest.remoteAddress)) {
            entryIP = latestRequest.remoteAddress.replace(" (Proxy)", "");
            proxyChain = "";
        } else {
            entryIP = "Noip";
            proxyLocation = "代理链地区:";
        }
    } else {
        entryIP = "Noip";
    }

    let isNoIP = false;
    let isIPv4 = false;
    let isIPv6 = false;
    let isCN = true;

    if (entryIP === "Noip") {
        isNoIP = true;
    } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(entryIP)) {
        isIPv4 = true;
    } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(entryIP)) {
        isIPv6 = true;
    }

    if (entryIP == landingIP) {
        isCN = false;
        proxyLocation = "直连节点:";
    } else {
        if (proxyLocation === "") {
            proxyLocation = "落地地区:";
        }

        if (!isNoIP || isIPv4) {
            const speedtestResponse = await getLocationInfo(`https://api-v3.speedtest.cn/ip?ip=${entryIP}`, cnTimeout);
            if (speedtestResponse.code === 0 && speedtestResponse.data.country === "中国") {
                let {
                    province,
                    isp,
                    city,
                    countryCode
                } = speedtestResponse.data;
                let tk = speedtestResponse.tk;
                console.log("ik" + JSON.stringify(speedtestResponse, null, 2));
                isCN = true;
                if (hideIP) {
                    entryIP = maskIP(entryIP);
                }
                entryInfo = "入口国家: \t" + getFlagEmoji(countryCode) + province + " " + city +
                    "\n入口IP: \t" + entryIP + ": " + tk + "ms\n入口ISP: \t" + isp + proxyChain +
                    "\n---------------------\n";
            } else {
                isCN = false;
                console.log("ik" + JSON.stringify(speedtestResponse));
                entryInfo = "入口IPA Failed\n";
            }
        }

        if ((!isNoIP || isIPv6) && !isCN) {
            const ipApiResponse = await getLocationInfo(`http://ip-api.com/json/${entryIP}?lang=zh-CN`, usTimeout);
            if (ipApiResponse.status === "success") {
                console.log("iai" + JSON.stringify(ipApiResponse, null, 2));
                let {
                    countryCode,
                    country,
                    city,
                    tk,
                    isp
                } = ipApiResponse;
                if (hideIP) {
                    entryIP = maskIP(entryIP);
                }
                let location = country + " " + city;
                entryInfo = "入口国家: \t" + getFlagEmoji(countryCode) + location +
                    "\n入口IP: \t" + entryIP + ": " + tk + "ms\n入口ISP: \t" + isp + proxyChain +
                    "\n---------------------\n";
            } else {
                console.log("iai" + JSON.stringify(ipApiResponse));
                entryInfo = "入口IPB Failed\n";
            }
        }
    }

    result = {
        title: infoTitle + policyName,
        content: "" + entryInfo + proxyLocation + landingInfo,
        icon: icon,
        "icon-color": iconColor
    };
})()
.catch(error => console.log(error.message))
.finally(() => $done(result));