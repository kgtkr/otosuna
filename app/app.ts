import { kakikomi } from './2ch';

import * as Vue from 'vue';
import Component from 'vue-class-component';

@Component({
  template: `
  <div>
    <h1>設定</h1>
    <div>
      <div>
        UA:<input v-model="ua">
      </div>
      <div>
        URL:<input v-model="url">
      </div>
      <div>
        書き込み間隔:<input v-model="minWait">
      </div>
      <div>
        保守間隔:<input v-model="maxWait">
      </div>
    </div>
    <div>
      <div>
        <label>名前</label>
        <input v-model="defName">
  
        <label>メール</label>
        <input v-model="defMail">
      </div>
      <div>
        <textarea v-model="defMessage"></textarea>
      </div>
    </div>
    <button type="button" v-on:click="play()">{{timer===null?'start':'stop'}}</button>
    <h1>書き込み予約</h1>
    <form>
      <div>
        <label>名前</label>
        <input v-model="name">
  
        <label>メール</label>
        <input v-model="mail">
      </div>
      <div>
        <textarea v-model="message"></textarea>
      </div>
      <button type="button" v-on:click="pushWriteData()">書き込む</button>
    </form>
    <h1>予約一覧</h1>
    <table>
      <tr>
        <td>名前</td>
        <td>メール</td>
        <td>本文</td>
        <td>削除</td>
      </tr>
      <tr v-for="(data,index) in writeData">
        <td>{{data.name}}</td>
        <td>{{data.mail}}</td>
        <td>{{convertNoLineStr(data.message)}}</td>
        <td><button type="button" v-on:click="delWriteData(index)">x</button></td>
      </tr>
    </table>
    <h1>ログ</h1>
    <ul>
      <li v-for="log in logs">[{{log.date}}] {{log.message}}</li>
    </ul>
  </div>
  `,
  name: "app"
})
class App extends Vue {
  //書き込み予約
  name = "";
  mail = "";
  message = "";

  //予約済み
  writeData: { name: string, mail: string, message: string }[] = [];

  //新たに予約する
  pushWriteData() {
    this.writeData.push({ name: this.name, mail: this.mail, message: this.message });
    this.message = "";
  }

  //予約を解除する
  delWriteData(i: number) {
    this.writeData.splice(i, 1);
  }

  //改行なしのテキストに変換
  convertNoLineStr(str: string): string {
    return str.replace(/\r?\n/g, ' ');
  }

  //ログ一覧
  logs: { date: Date, message: string }[] = [];
  //ログ出力
  log(message: string) {
    this.logs.unshift({ date: new Date(), message });
  }

  //設定
  ua = "Monazilla/1.00";
  url = "";
  wait = "20";
  defName = "";
  defMail = "";
  defMessage = "保守({rand})";
  minWait = 15;
  maxWait = 30;

  timer: NodeJS.Timer | null = null;

  constructor() {
    super();
  }

  play() {
    if (this.timer === null) {
      let count = 0;
      this.timer = setInterval(async () => {
        count++;

        let name: string;
        let mail: string;
        let message: string;
        if (this.writeData.length !== 0 && count > this.minWait) {
          let wd = this.writeData[0];
          name = wd.name;
          mail = wd.mail;
          message = wd.message;
          this.writeData.splice(0, 1);
        } else if (count > this.maxWait) {
          name = this.defName;
          mail = this.defMail;
          message = this.defMessage.replace(/\{rand\}/g, String(Math.floor(Math.random() * 999)));
        } else {
          return;
        }
        count = 0;

        let url = this.url.match(/http:\/\/([0-9a-z]+)\.2ch\.net\/test\/read\.cgi\/([0-9a-z]+)\/([0-9]+)\/?/);
        if (url) {
          this.log("書き込みます");
          this.log(await kakikomi({
            ua: this.ua,
            server: url[1],
            board: url[2],
            thread: url[3],
            name: name,
            mail: mail,
            message: message
          }));
        } else {
          this.log("URLパースに失敗");
        }
      }, 1000);
    } else {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

new Vue({
  el: "#app",
  template: '<app-root></app-root>',
  components: {
    'app-root': App
  }
});