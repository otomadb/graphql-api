export const isValidYoutubeSourceId = (id: string): boolean => /[a-zA-Z0-9_-]{11}/.test(id); // TODO: Youtubeの動画IDが本当にこの正規表現で妥当なのかを確認する
