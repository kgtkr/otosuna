// 必要なモジュールを読み込み
const electron = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

// アプリを閉じた時の処理
app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// アプリが起動した時の処理
app.on('ready', function () {

    // アプリ起動時の横幅・高さを設定
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800
    });
    mainWindow.setMenuBarVisibility(false);

    // アプリ本体を読み込み
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // アプリを閉じた時に初期化
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

});