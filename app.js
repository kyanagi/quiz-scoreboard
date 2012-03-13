(function() {
  var CountupWatch, KeyHandlerModule, NonxScoreBoardViewModel, Player, ko, names,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  ko = window.ko;

  Player = (function() {

    Player.winPoint = ko.observable(7);

    Player.losePoint = ko.observable(3);

    Player.setWinPoint = function(n) {
      return this.winPoint(Math.max(n, 1));
    };

    Player.setLosePoint = function(n) {
      return this.losePoint(Math.max(n, 1));
    };

    function Player(name) {
      this.name = name;
      this.pointCorrect = ko.observable(0);
      this.pointWrong = ko.observable(0);
      this.selected = ko.observable(false);
      this.isWinner = ko.computed((function() {
        return this.pointCorrect() >= Player.winPoint();
      }), this);
      this.isLoser = ko.computed((function() {
        return this.pointWrong() >= Player.losePoint();
      }), this);
    }

    Player.prototype.addPointCorrect = function(n) {
      return this.pointCorrect(Math.max(Math.min(Player.winPoint(), this.pointCorrect() + n), 0));
    };

    Player.prototype.addPointWrong = function(n) {
      return this.pointWrong(Math.max(Math.min(Player.losePoint(), this.pointWrong() + n), 0));
    };

    Player.prototype.select = function() {
      return this.selected(true);
    };

    Player.prototype.unselect = function() {
      return this.selected(false);
    };

    return Player;

  })();

  KeyHandlerModule = (function() {

    function KeyHandlerModule() {}

    KeyHandlerModule.prototype.onKeyDown = function(data, event) {
      var meth, p, target, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4, _results, _results2;
      event.preventDefault();
      if (_ref = event.keyCode, __indexOf.call([112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122], _ref) >= 0) {
        target = this.players()[event.keyCode - 112];
        if (target.selected()) {
          target.unselect();
        } else {
          _ref2 = this.players();
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            p = _ref2[_i];
            if (p === target) {
              p.select();
            } else {
              p.unselect();
            }
          }
        }
        return;
      }
      switch (event.keyCode) {
        case 32:
          _ref3 = this.players();
          _results = [];
          for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
            p = _ref3[_j];
            _results.push(p.unselect());
          }
          return _results;
          break;
        case 79:
        case 88:
          meth = event.keyCode === 79 ? 'addPointCorrect' : 'addPointWrong';
          _ref4 = this.players();
          _results2 = [];
          for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
            p = _ref4[_k];
            if (p.selected()) _results2.push(p[meth](event.shiftKey ? -1 : 1));
          }
          return _results2;
      }
    };

    return KeyHandlerModule;

  })();

  CountupWatch = (function() {

    function CountupWatch() {
      var _this = this;
      this.startTime = ko.observable(void 0);
      this.currentTime = ko.observable(void 0);
      this.isRunning = ko.computed(function() {
        return _this.startTime() !== void 0;
      });
      this.erapsedTime = ko.observable(0);
      this.timerId = void 0;
      this.time = ko.computed((function() {
        if (this.isRunning()) {
          return this.erapsedTime() + (this.currentTime() - this.startTime());
        } else {
          return this.erapsedTime();
        }
      }), this);
      this.timestr = ko.computed((function() {
        var minstr, minute, sec, second, secstr;
        second = Math.floor(this.time() / 1000);
        minute = Math.floor(second / 60);
        sec = second % 60;
        minstr = minute < 10 ? "0" + minute : "" + minute;
        secstr = sec < 10 ? "0" + sec : "" + sec;
        return "" + minstr + ":" + secstr;
      }), this);
    }

    CountupWatch.prototype.start = function() {
      var _this = this;
      if (!this.isRunning()) {
        this.currentTime(new Date());
        this.startTime(new Date());
        return this.timerId = setInterval((function() {
          return _this.onTimer();
        }), 100);
      }
    };

    CountupWatch.prototype.stop = function() {
      if (this.isRunning()) {
        clearInterval(this.timerId);
        this.timerId = void 0;
        this.erapsedTime(this.time());
        this.currentTime(void 0);
        return this.startTime(void 0);
      }
    };

    CountupWatch.prototype.onTimer = function() {
      return this.currentTime(new Date());
    };

    return CountupWatch;

  })();

  NonxScoreBoardViewModel = (function(_super) {

    __extends(NonxScoreBoardViewModel, _super);

    function NonxScoreBoardViewModel() {
      var p, players;
      players = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.players = ko.observableArray((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = players.length; _i < _len; _i++) {
          p = players[_i];
          _results.push(new Player(p));
        }
        return _results;
      })());
      this.title = ko.computed((function() {
        return "" + (Player.winPoint()) + "o" + (Player.losePoint()) + "x";
      }), this);
      this.time = ko.observable("");
      this.watch = new CountupWatch();
    }

    NonxScoreBoardViewModel.prototype.onKeyDown = function(data, event) {
      switch (event.keyCode) {
        case 37:
          return event.shiftKey && Player.setLosePoint(Player.losePoint() - 1);
        case 38:
          return event.shiftKey && Player.setWinPoint(Player.winPoint() + 1);
        case 39:
          return event.shiftKey && Player.setLosePoint(Player.losePoint() + 1);
        case 40:
          return event.shiftKey && Player.setWinPoint(Player.winPoint() - 1);
        case 49:
          return this.watch.start();
        case 50:
          return this.watch.stop();
        default:
          return NonxScoreBoardViewModel.__super__.onKeyDown.apply(this, arguments);
      }
    };

    return NonxScoreBoardViewModel;

  })(KeyHandlerModule);

  names = ['ああああああ', 'いいいいいい', 'うううううう', 'ええええええ', 'おおおおおお', 'かかかかかか', 'きききききき', 'くくくくくく', 'けけけけけけ', 'ここここここ', 'ささささささ', 'しししししし'];

  ko.applyBindings((function(func, args, ctor) {
    ctor.prototype = func.prototype;
    var child = new ctor, result = func.apply(child, args);
    return typeof result === "object" ? result : child;
  })(NonxScoreBoardViewModel, names, function() {}));

}).call(this);
