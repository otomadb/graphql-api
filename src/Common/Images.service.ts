import { PromiseClient } from "@connectrpc/connect";

import { ProxyService } from "../protobuf/ixgyohn/proxy/v2/proxy_connect.js";

export const mkImageService = ({ i }: { i: PromiseClient<typeof ProxyService> }) => {
  return {
    proxyThis(imgUrl: string, scale: "LARGE" | "OGP"): Promise<string> {
      switch (scale) {
        case "LARGE":
          return i.proxyUrl({ url: imgUrl, width: 700, height: 400 }).then((r) => r.proxiedUrl);
        case "OGP":
          return i.proxyUrl({ url: imgUrl, width: 700, height: 400 }).then((r) => r.proxiedUrl);
      }
    },
  };
};

export type ImagesService = ReturnType<typeof mkImageService>;
