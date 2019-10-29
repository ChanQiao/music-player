require("chromedriver")
const { Browser, WebDriver, Builder, By, until } = require("selenium-webdriver")
const { Options } = require("selenium-webdriver/chrome")
const fs  = require("fs")
const resolve = require("path")

class MusicInfo {
    constructor() {
        this.index = ""
        this.name = ''
        this.author = ''
        this.duration = ""
        this.cover = ''
        this.url = ''
    }
}

const log = console.log.bind("console")

class Spider {

    constructor() {
        // 热门音乐的URL
        this.url = 'https://music.163.com/#/discover/toplist?id=19723756'
        // 音乐源的URL
        this.musicUrl = 'http://music.163.com/song/media/outer/url?id='
        // 存储所有的音乐信息
        this.musicList = []

        this.init()
    }

    filePath() {

        let path = 'db/musics.json'
        let dir = __dirname
        let index = dir.indexOf("model")
        let p = resolve.join(dir.slice(0, index), path)
        return p
    }

    backupMusicInfo(info) {
        let path = this.filePath()
        info = JSON.stringify(info, null, 2)
        fs.writeFileSync(path, info)
    }

    async parseUrl(items) {

        let res = []

        for(let item of items) {
            let r = await item.findElement(By.css(".txt a")).getAttribute('href')
            let d = await item.findElement(By.css(".s-fc3 span")).getText()
            let info = {
                duration: d,
                url: r,
            }
            res.push(info)
        }

        return res
    }

    async parseItem(driver, item, index) {

        let info = new MusicInfo()
        let p = item.url

        await driver.get(p)
        await driver.wait(until.elementLocated(By.id("g_iframe")), 2000)
        await driver.switchTo().frame(driver.findElement(By.id("g_iframe")))

        let name = await driver.findElement(By.css(".hd em")).getText()
        let author = await driver.findElement(By.css(".des a")).getText()
        let cover = await driver.findElement(By.css(".u-cover img")).getAttribute("src")

        cover = cover.split("?")[0]
        let id = p.split("=")[1]
        let r = `${this.musicUrl}${id}.mp3`

        info.index = index
        info.name = name
        info.author = author
        info.cover = cover
        info.duration = item.duration
        info.url = r

        log(info)
        return info
    }

    async parseItems(driver, items) {

        // 获取所有音乐源的URL
        let tmp = await this.parseUrl(items)

        // 最多获取 50 首音乐
        let info = tmp.slice(0, 50)
        for (let i = 0; i < info.length; i++) {
            let item = info[i]
            let index = i + 1
            let val = await this.parseItem(driver, item, index)
            info[i] = val
        }

        // 将数据写入文件中
        let res = [...info]
        this.backupMusicInfo(res)

        // 将音乐列表更新到最新状态
        this.musicList = res
        return res
    }

    async startSpider() {

        let driver = await new Builder()
            .forBrowser("chrome")                                      // 使用的是chrome浏览器
            .setChromeOptions(new Options().addArguments('headless'))   // 使用无头浏览器
            .build()

        await driver.get(this.url)
        await driver.switchTo().frame(driver.findElement(By.id("g_iframe")))
        let body = await driver.findElement(By.css(".m-table tbody"))
        let items = await body.findElements(By.css("tr"))

        // 解析数据
        let res = await this.parseItems(driver, items)

        // 关闭浏览器
        await driver.quit()
        return res
    }

    loadMusicInfo() {
        // 从文件中读取数据
        let path = this.filePath()
        let data = fs.readFileSync(path)
        let res = JSON.parse(data)
        return res
    }

    getMusicList() {
        return this.musicList
    }

    init() {
        this.musicList = this.loadMusicInfo()
        log('music list')
        log(this.musicList)
    }
}

const spider = new Spider()

// 导出一个对象
module.exports = {
    loadMusicList: spider.getMusicList.bind(spider),
    start: spider.startSpider.bind(spider),
}