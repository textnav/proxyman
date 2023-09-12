import express, { Router } from "express";
import serverless from "serverless-http";

const data = (hosts?: string, server = "127.0.0.1", port = "9090") =>
  hosts
    ? `function FindProxyForURL(url, host) {
  const hosts = ${hosts};
  for (var i = 0; i < hosts.length; i++) {
    if (dnsDomainIs(host, hosts[i]) || shExpMatch(host, hosts[i])) {
      if (shExpMatch(url, "api*")) return "DIRECT";
      return "PROXY ${server}:${port}";
    }
  }
  return "DIRECT";
}
`
    : `function FindProxyForURL(url, host) {
  return "PROXY ${server}:${port}";
}
`;

const api = express();

api.get("/", (req, res) => {
  const query = req.query;
  let hosts64 = (query.hosts as string) || undefined;
  let port = (query.port as string) || undefined;
  let server = (query.server as string) || undefined;
  let hosts: string | undefined;

  try {
    hosts = hosts64 ? atob(hosts64) : undefined;
  } catch (error) {
    //
  }
  return res.send(data(hosts, server, port));
});

export const handler = serverless(api);
