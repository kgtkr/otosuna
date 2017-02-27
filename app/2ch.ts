import * as request from 'request';
import * as iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
const urlencode: {
  (str: string, encode?: string): string,
} = require('urlencode');

export async function kakikomi({ ua, server, board, thread, name, mail, message }:
  {
    ua: string,
    server: string,
    board: string,
    thread: string,
    name: string,
    mail: string,
    message: string
  }): Promise<string> {
  let cookie: string | undefined = undefined;
  let submit: "書き込む" | "上記全てを承諾して書き込む" = "書き込む";

  let result: string[] = [];
  for (let i = 0; i < 2; i++) {
    //ヘッダーを定義
    let headers = {
      "User-Agent": ua,
      "Referer": `http://${server}.2ch.net/test/read.cgi/${board}/${thread}/`,
      "Origin": `http://${server}.2ch.net`,
      "Host": `${server}.2ch.net`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie
    }

    type ReqOpt = (request.UriOptions & request.CoreOptions) | (request.UrlOptions & request.CoreOptions);

    let options: ReqOpt = {
      url: `http://${server}.2ch.net/test/bbs.cgi?guid=ON`,
      method: 'POST',
      headers: headers,
      encoding: null,
      form: serializeFormData({
        bbs: board,
        key: thread,
        time: "1",
        submit: submit,
        FROM: name,
        mail: mail,
        MESSAGE: message,
        suka: "pontan"
      }, "sjis")
    }
    await new Promise<void>((resolve, reject) => {
      request(options, (err, res, body) => {
        if (err) {
          reject(err);
          return;
        }

        let html = iconv.decode(body, "sjis");
        result.push(cheerio.load(html)("title").text());

        cookie = res.headers["set-cookie"];
        submit = "上記全てを承諾して書き込む";
        resolve();
      })
    })
  }

  return "クッキー取得:" + result[0] + " 書き込み:" + result[1];
}

function serializeFormData(obj: { [key: string]: string }, encode?: string): string {
  return Object.keys(obj)
    .map((key) => urlencode(key) + "=" + urlencode(obj[key], encode))
    .join("&");
}