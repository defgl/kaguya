let pro = {
  内网: true,
  本机: true,
  nw: true,
  "-----说明:可在持久化数据KeyNetisp中更改是否在面板中显示":
    "开为:true, 关为:false ------",
}
let readd = $persistentStore.read("KeyNetisp")
let data
try {
  data = readd ? JSON.parse(readd) : pro
} catch (t) {
  data = pro
}
let loca = data.内网
let bj = data.本机
if (
  data.nw ||
  typeof data.内网 !== "boolean" ||
  typeof data.本机 !== "boolean"
) {
  console.log("无数据或数据错误")
  delete pro.nw
  $persistentStore.write(JSON.stringify(pro), "KeyNetisp")
}
let pdldip = "",
  outbli = "",
  outgpt = "",
  local = ""
Promise.all([
  (async () => {
    try {
      const t = await tKey("http://ip-api.com/json", 1200)
      let e = new Date()
      let s =
        "  " +
        e.getDate() +
        "/" +
        (e.getMonth() + 1) +
        " " +
        e.getHours() +
        ":" +
        e.getMinutes()
      if (loca) {
        let t = $network,
          e = t.dns,
          s = ""
        let l = (t["cellular-data"] && t["cellular-data"].radio) || ""
        let i = t.v4.primaryAddress,
          a = t.v6.primaryAddress !== null ? "IPv6:" : ""
        let o = t.wifi.ssid !== null ? "WiFi: " : ""
        const n = await tKey(
          `http://connectivitycheck.platform.hicloud.com/generate_204`,
          500,
        )
        if (o !== "") {
          for (let t = 0; t < e.length; t++) {
            if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(e[t])) {
              s = e[t]
              break
            }
          }
          local = "LAN:" + o + a + " " + i + "\n"
        } else {
          local = "LAN:" + l + a + " " + i + "\n"
        }
      }
      if (bj) {
        const t = await tKey(
          "https://api.live.bilibili.com/ip_service/v1/ip_service/get_ip_addr",
          500,
        )
        if (t.code === 0) {
          let { addr: e, province: s, city: l, isp: i } = t.data,
            a = t.tk
          i = i.replace(/.*广电.*/g, "广电")
          outbli = "Bilibili: " + s + i + ":" + e + ":" + a + "ms\n"
        } else {
          outbli = "Biliapi " + t + "\n"
        }
      }
      const l = await tKey("http://chat.openai.com/cdn-cgi/trace", 1e3)
      const i = ["CN", "TW", "HK", "IR", "KP", "RU", "VE", "BY"]
      if (typeof l !== "string") {
        let { loc: t, tk: e, warp: s, ip: a } = l,
          o = i.indexOf(t),
          n = ""
        n = `GPT: ${t} ${o === -1 ? "✔️" : "✖️"}`
        if ((s = "plus")) {
          s = "Plus"
        }
        outgpt = n + " - Priv:" + s + "   " + e + "ms"
      } else {
        outgpt = "ChatGPT " + l
      }
      const a = await httpAPI()
      let o
      const n = a.requests.slice(0, 6)
      let r = n
        .filter(
          (t) => /\(Proxy\)/.test(t.remoteAddress) && /ip-api\.com/.test(t.URL),
        )
        .map((t) => t.remoteAddress.replace(" (Proxy)", ""))
      if (r.length > 0) {
        o = r[0]
      } else {
        o = "Noip"
      }
      let c = false,
        d = "spe",
        p = false,
        u = "edtest"
      ;(isv6 = false), (cn = true), (zl = "")
      if (o === "Noip") {
        c = true
      } else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(o)) {
        p = true
      } else if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(o)) {
        isv6 = true
      }
      $done({
        title: outgpt,
        icon: "minus.plus.and.fluid.batteryblock",
        "icon-color": "#2E8B57",
        content: local + outbli + zl + s,
      })
    } catch (t) {
      $done({
        title: outgpt,
        icon: "minus.plus.and.fluid.batteryblock",
        "icon-color": "#2E8B57",
        content: local + outbli + zl + day,
      })
    }
  })(),
])

function sM(t, e) {
  if (t.length > e) {
    return t.slice(0, e)
  } else if (t.length < e) {
    return t.toString().padEnd(e, " ")
  } else {
    return t
  }
}

function sK(t, e) {
  return t
    .split(" ", e)
    .join(" ")
    .replace(/\.|\,|com|\u4e2d\u56fd/g, "")
}

async function httpAPI(t = "/v1/requests/recent", e = "GET", s = null) {
  return new Promise((l, i) => {
    $httpAPI(e, t, s, (t) => {
      l(t)
    })
  })
}

async function tKey(url, timeout) {
  let retryCount = 1
  const promise = new Promise((resolve, reject) => {
    const check = async (retry) => {
      try {
        const result = await Promise.race([
          new Promise((resolve, reject) => {
            let startTime = Date.now()
            $httpClient.get(
              {
                url: url,
              },
              (error, response, body) => {
                if (error) {
                  reject(error)
                } else {
                  let elapsedTime = Date.now() - startTime
                  let statusCode = response.status
                  switch (statusCode) {
                    case 200:
                      let contentType = response.headers["Content-Type"]
                      switch (true) {
                        case contentType.includes("application/json"):
                          let data = JSON.parse(body)
                          data.tk = elapsedTime
                          resolve(data)
                          break
                        case contentType.includes("text/html"):
                          resolve("text/html")
                          break
                        case contentType.includes("text/plain"):
                          let lines = body.split("\n")
                          let info = lines.reduce((result, line) => {
                            let [key, value] = line.split("=")
                            result[key] = value
                            result.tk = elapsedTime
                            return result
                          }, {})
                          resolve(info)
                          break
                        case contentType.includes("image/svg+xml"):
                          resolve("image/svg+xml")
                          break
                        default:
                          resolve("unknown")
                          break
                      }
                      break
                    case 204:
                      let data = {
                        tk: elapsedTime,
                      }
                      resolve(data)
                      break
                    case 429:
                      console.log("Too many requests")
                      reject("Too many requests")
                      break
                    case 404:
                      console.log("404 Not Found")
                      reject("404 Not Found")
                      break
                    default:
                      reject("nokey")
                      break
                  }
                }
              },
            )
          }),
          new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("timeout")), timeout)
          }),
        ])
        if (result) {
          resolve(result)
        } else {
          resolve("timeout")
          reject(new Error(n.message))
        }
      } catch (error) {
        if (retry < retryCount) {
          retry++
          check(retry)
        } else {
          resolve(`Detection failed, retry count: ${retryCount}`)
          reject(error)
        }
      }
    }
    check(0)
  })
  return promise
}
