# ｎ○ｎ× 表示スクリプト
# (c) Kouhei Yanagita <yanagi at shakenbu.org>
# License: MIT (http://www.opensource.org/licenses/mit-license.php)

ko = window.ko

class Player
  @winPoint = ko.observable(7)
  @losePoint = ko.observable(3)
  @setWinPoint = (n) -> @winPoint(Math.max(n, 1))
  @setLosePoint = (n) -> @losePoint(Math.max(n, 1))

  constructor: (@name) ->
    @pointCorrect = ko.observable(0)
    @pointWrong = ko.observable(0)
    @selected = ko.observable(false)
    @isWinner = ko.computed((-> @pointCorrect() >= Player.winPoint()), @)
    @isLoser = ko.computed((-> @pointWrong() >= Player.losePoint()), @)
  addPointCorrect: (n) ->
    @pointCorrect(Math.max(Math.min(Player.winPoint(), @pointCorrect() + n), 0))
  addPointWrong: (n) ->
    @pointWrong(Math.max(Math.min(Player.losePoint(), @pointWrong() + n), 0))
  select: ->
    @selected(true)
  unselect: ->
    @selected(false)

class KeyHandlerModule
  onKeyDown: (data, event) ->
    event.preventDefault()

    if event.keyCode in [112..122] # F1 .. F12
      target = @players()[event.keyCode - 112]
      if target.selected()
        target.unselect()
      else
        for p in @players()
          if p == target
            p.select()
          else
            p.unselect()
      return

    switch event.keyCode
      when 32 # SPC
        for p in @players()
          p.unselect()
      when 79, 88 # o, x
        meth = if event.keyCode == 79 then 'addPointCorrect' else 'addPointWrong'
        for p in @players() when p.selected()
          p[meth](if event.shiftKey then -1 else 1)


class CountupWatch
  constructor: ->
    @startTime = ko.observable(undefined)
    @currentTime = ko.observable(undefined)
    @isRunning = ko.computed(=> @startTime() != undefined)
    @erapsedTime = ko.observable(0)
    @timerId = undefined
    @time = ko.computed((->
      if @isRunning()
        @erapsedTime() + (@currentTime() - @startTime())
      else
        @erapsedTime()
    ), @)
    @timestr = ko.computed((->
      second = Math.floor(@time() / 1000)
      minute = Math.floor(second / 60)
      sec = second % 60
      minstr = if minute < 10 then "0#{minute}" else "#{minute}"
      secstr = if sec < 10 then "0#{sec}" else "#{sec}"
      "#{minstr}:#{secstr}"
    ), @)

  start: ->
    if !@isRunning()
      @currentTime(new Date())
      @startTime(new Date())
      @timerId = setInterval((=> @onTimer()), 100)
  stop: ->
    if @isRunning()
      clearInterval(@timerId)
      @timerId = undefined
      @erapsedTime(@time())
      @currentTime(undefined)
      @startTime(undefined)
  onTimer: ->
    @currentTime(new Date())


class NonxScoreBoardViewModel extends KeyHandlerModule
  constructor: (players...) ->
    @players = ko.observableArray(new Player(p) for p in players)
    @title = ko.computed((-> "#{Player.winPoint()}o#{Player.losePoint()}x"), @)
    @time = ko.observable("")
    @watch = new CountupWatch()
  onKeyDown: (data, event) ->
    switch event.keyCode
      when 37 # ←
        event.shiftKey && Player.setLosePoint(Player.losePoint() - 1)
      when 38 # ↑
        event.shiftKey && Player.setWinPoint(Player.winPoint() + 1)
      when 39 # →
        event.shiftKey && Player.setLosePoint(Player.losePoint() + 1)
      when 40 # ↓
        event.shiftKey && Player.setWinPoint(Player.winPoint() - 1)
      when 49
        @watch.start()
      when 50
        @watch.stop()
      else
        super


names = [
  'ああああああ',
  'いいいいいい',
  'うううううう',
  'ええええええ',
  'おおおおおお',
  'かかかかかか',
  'きききききき',
  'くくくくくく',
  'けけけけけけ',
  'ここここここ',
  'ささささささ',
  'しししししし',
]
ko.applyBindings(new NonxScoreBoardViewModel(names...))
