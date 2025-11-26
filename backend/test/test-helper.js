const http = require("http");
const { URL } = require("url");

function makeRequest(port, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, `http://localhost:${port}`);
    const options = {
      method,
      hostname: "localhost",
      port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const data = Buffer.concat(chunks).toString();
        let parsed = null;
        if (data && res.headers["content-type"]?.includes("application/json")) {
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
        } else {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }

    req.end();
  });
}

module.exports = { makeRequest };

