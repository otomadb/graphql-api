/**
 * Rewrite of `soundcloud-key-fetch`
 *
 * @see https://gitlab.com/sylviiu/soundcloud-key-fetch/-/blob/1d6cbada58d0117c83cdc8417e35ae13a7189afc/index.js#L1-62
 */
export const fetchSoundcloudKey = async () => {
  const tophtml = await (await fetch("https://soundcloud.com/")).text();
  const res = tophtml.split('<script crossorigin src="');

  const urls: string[] = [];
  res.forEach((urlA) => {
    const urlreg =
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;
    const url = urlA.replace('"></script>\n', "");
    if (urlreg.test(url)) urls.push(url);
  });

  for (const f of urls) {
    const data = await (await fetch(f)).text();
    const a = /client_id:"([A-Za-z\d]*)"/.exec(data);
    if (a) return a[1];
  }
  return null;
};
