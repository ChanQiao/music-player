const ajax = require("../models/api")

const log = console.log.bind("console")
const e = (selector, element = document) => element.querySelector(selector)
const appendHtml = (element, html) => element.insertAdjacentHTML('beforeend', html)

const protocol = 'http://'
const primary = 'localhost'
const port = '8000'
const path = '/'

class Player {

    constructor() {
        this.musicList = []
        this.audioElement = e("#playbar")
        this.musicMax = 0
    }

    async loadMusicInfo() {
        let url = `${protocol}${primary}:${port}${path}`
        let data = await ajax.get(url)
        return data
    }

    template(data) {

        let html = ''
        for (let i = 0; i < data.length; i++){
            let item = data[i]
            let index = i
            let p = `<li><a class="track" data-index="${index}">${item.name} - ${item.author}</a> <span class="time">${item.duration.slice(1)}</span></li>`
            html += p
        }

        return html
    }

    insertTemplate(data) {

        let playlist = e("#playlist")
        let html = this.template(data)
        appendHtml(playlist, html)
    }

    title(item) {
        let t = e("#title")
        let a = e("#author")
        let name = item.name
        let author = item.author
        t.innerText = name
        a.innerText = author
    }

    currentIndex() {
        let playing = e(".playing")
        let cur = e(".track", playing)
        let index = Number(cur.dataset.index)
        return index
    }

    pickOnMusic(index) {
        let playing = e(".playing")
        if (playing) {
            playing.classList.remove("playing")
        }

        let playlist = e("#playlist")
        let arr = playlist.querySelectorAll("li")
        let li = arr[index]
        li.classList.add("playing")
    }

    progressBar() {
        let player = this.audioElement
        let duration = parseInt(player.duration)
        let currentTime = parseInt(player.currentTime)
        let p = currentTime / duration
        let fill = e(".fill")
        fill.style.transform = `scaleX(${p})`
    }

    updateTime() {

        let player = this.audioElement
        let curTime = parseInt(player.currentTime)
        let sec = ("00" + String(curTime % 60)).slice(-2)
        let min = ("00" + parseInt(String(curTime / 60))).slice(-2)

        let cur = e(".current")
        cur.innerText = `${min}:${sec}`

        let index = this.currentIndex()
        let item = this.musicList[index]
        let duration = item.duration
        let end = e(".end")
        end.innerText = duration
    }

    switchCover(path) {
        let cover = e("#main")
        cover.style.backgroundImage = `url(${path})`
    }

    play(index) {

        let player = this.audioElement
        let item = this.musicList[index]
        let url = item['url']

        this.title(item)
        this.switchCover(item.cover)
        this.pickOnMusic(index)

        // 自动播放
        player.src = url
        player.autoplay = true

        // 更新按键状态
        let p = e("#playpause")
        p.classList.remove("fa-play")
        p.classList.remove("loading")
        p.classList.add("fa-pause")
    }

    continued(element) {
        this.audioElement.play()
        element.classList.remove("fa-play")
        element.classList.remove("loading")
        element.classList.add("fa-pause")
        element.dataset.status = "true"
    }

    pause(element) {
        this.audioElement.pause()
        element.classList.add("fa-play")
        element.classList.remove("fa-pause")
        element.dataset.status = "false"
    }

    next() {
        let max = this.musicMax
        let curIndex = this.currentIndex()
        let newIndex = (curIndex + 1) % max
        this.play(newIndex)
    }

    back() {
        let max = this.musicMax
        let curIndex = this.currentIndex()
        let newIndex = (curIndex - 1 + max) % max
        this.play(newIndex)
    }

    playpause() {

        let p = e("#playpause")
        let status = p.dataset.status

        if (status === "true") {
            this.pause(p)
        } else {
            this.continued(p)
        }
    }

    onLoad() {

        let player = this.audioElement
        player.addEventListener("timeupdate", (event) => {
            this.progressBar()
            this.updateTime()
        })

        let fill = e(".slider-back")
        fill.addEventListener("mousedown", (event) => {
            let divWidth = event.target.offsetWidth
            let offset = event.offsetX
            let curPoint = event.clientX
            let start = curPoint - offset

            let tmp = ((curPoint - start) / divWidth)
            let duration = player.duration
            let currentTime = parseInt(tmp * duration)
            player.currentTime = currentTime
        })

        let index = 0
        this.play(index)
    }

    bindEventMenu() {

        let menu = e(".menu")
        menu.addEventListener("click", (event) => {

            let player = e("#player")
            player.classList.toggle("show")
        })
    }

    bindEventButtons() {

        let element = e(".buttons")

        let map = {
            "back": this.back,
            "playpause": this.playpause,
            "next": this.next,
        }

        element.addEventListener("click", (event) => {
            let tag = event.target
            let func = map[tag.id].bind(this)
            if (func !== undefined) {
                func()
            }
        })
    }

    bindEventList() {

        let list = e("#playlist")

        list.addEventListener("click", (event) => {

            let tag = event.target
            if (tag.classList.contains("track")) {
                let index = tag.dataset.index
                this.play(index)
            }
        })
    }

    bindEventEnded() {

        let p = this.audioElement
        p.addEventListener("ended", () => {
            this.next()
        })
    }

    bindEvents() {
        this.bindEventMenu()
        this.bindEventEnded()
        this.bindEventButtons()
        this.bindEventList()
    }

    async init() {
        this.musicList = await this.loadMusicInfo()
        this.musicMax = this.musicList.length
        this.insertTemplate(this.musicList)
        this.bindEvents()
        this.onLoad()
    }

    __main() {
        this.init()
    }
}

var player = new Player()
player.__main()