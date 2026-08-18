/**
 * Backend smoke-test script.
 *
 * Usage:
 *   XCART_ADMIN_EMAIL=you@example.com XCART_ADMIN_PASSWORD=secret node scripts/test-backend.mjs
 *
 * Never commit real credentials here — pass them via environment variables.
 */

import https from "https"

const BASE = process.env.XCART_API_URL ?? "xcart-ecommerce.onrender.com"
const EMAIL = process.env.XCART_ADMIN_EMAIL
const PASSWORD = process.env.XCART_ADMIN_PASSWORD

if (!EMAIL || !PASSWORD) {
  console.error(
    "Error: set XCART_ADMIN_EMAIL and XCART_ADMIN_PASSWORD environment variables before running this script."
  )
  process.exit(1)
}

function request(method, path, bodyObj, token) {
  return new Promise((resolve, reject) => {
    const json = bodyObj ? JSON.stringify(bodyObj) : null
    const headers = { "Content-Type": "application/json" }
    if (json) headers["Content-Length"] = Buffer.byteLength(json)
    if (token) headers["Authorization"] = "Bearer " + token

    const req = https.request({ hostname: BASE, path, method, headers }, (res) => {
      let data = ""
      res.on("data", (c) => (data += c))
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }) }
        catch { resolve({ status: res.statusCode, body: data }) }
      })
    })
    req.setTimeout(90_000, () => req.destroy(new Error("Timed out")))
    req.on("error", reject)
    if (json) req.write(json)
    req.end()
  })
}

async function main() {
  console.log(`Testing ${BASE} as ${EMAIL}…`)

  const login = await request("POST", "/auth/login", { email: EMAIL, password: PASSWORD })
  console.log("POST /auth/login →", login.status)
  console.log(JSON.stringify(login.body, null, 2))

  const token = login.body?.data?.accessToken
  if (!token) { console.error("No token — aborting."); process.exit(1) }

  const me = await request("GET", "/auth/me", null, token)
  console.log("\nGET /auth/me →", me.status)
  console.log(JSON.stringify(me.body, null, 2))

  const roles = me.body?.data?.roles
  console.log("\nroles raw    :", JSON.stringify(roles))
  console.log("isArray      :", Array.isArray(roles))
  if (Array.isArray(roles) && roles.length) {
    console.log("roles[0] type:", typeof roles[0])
    console.log("roles[0]     :", JSON.stringify(roles[0]))
  }
}

main().catch((e) => { console.error(e.message); process.exit(1) })
