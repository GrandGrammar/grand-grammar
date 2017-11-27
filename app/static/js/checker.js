Vue.config.devtools = true;

var app = new Vue({
  el: '#vue-app',
  data: {
    inputEssay: 'Computer science are scientific and practical approach to compute and its applications. It is the systematic studying of the feasibility, structure, expression, and mechanization of the methodic procedures that underlies the acquisition, representation, processing, storage, communication of, and access for information, whether such information are encoded of bits in a computer memory or transgribed in genes and protein structures in a biological cell. An alternative, more succinct definitions of computer science is the study of automating algorithmic processes that scale.',
    outputEssay: '',
    edittingEssay: true,
    topics: [],
    queryWord: '',
    nouDef: [],
    vrbDef: [],
    adjDef: [],
    advDef: []
  },
  methods: {
    checkGrammar: function() {
      var _this = this;
      $.ajax({
        method: 'GET',
        url: '/api/check_grammar',
        data: { text: this.inputEssay },
        success: function(resp) {
          var errorList = JSON.parse(resp);

          var correctedText = '';
          var errorText = '';
          var outputEssay = '';
          var lastStart = 0;
          for (var i = 0; i < errorList.length; i++) {
            correctedText += _this.inputEssay.substring(lastStart, errorList[i].from) + '<b style="color:green;">' + errorList[i].suggestion + '</b>';
            errorText += _this.inputEssay.substring(lastStart, errorList[i].from) + '<b style="color:red;">' + _this.inputEssay.substring(errorList[i].from, errorList[i].to + 1) + '</b>';
            outputEssay += _this.inputEssay.substring(lastStart, errorList[i].from) + errorList[i].suggestion;
            lastStart = errorList[i].to + 1;
          }
          correctedText += _this.inputEssay.substring(lastStart);
          errorText += _this.inputEssay.substring(lastStart);
          outputEssay += _this.inputEssay.substring(lastStart);

          _this.edittingEssay = false;
          _this.outputEssay = outputEssay;

          Vue.nextTick(function() {
            $('#correct-text').html(_this.addSpanTag(correctedText));
            $('#error-text').html(errorText);
            $('#correct-text span').hoverIntent(
              function() {
                $(this).css('background-color','#d1c4e9');
              },
              function() { $(this).css('background-color',''); }
            );
            $('#correct-text span').click(function() {
              _this.queryWord = $(this).text();
              _this.searchWord();
            });
          });
        }
      });
    },
    editEssay: function() {
      this.edittingEssay = true;
      this.outputEssay = '';
    },
    generateTopicTags: function() {
      if (!this.outputEssay) {
        Materialize.toast('Please check grammar first!', 3000);
        return;
      }
      var _this = this;
      $.ajax({
        method: 'GET',
        url: '/api/get_topics',
        data: { text: this.outputEssay },
        success: function(resp) {
          var topicObj = JSON.parse(resp);
          var sortedTopics = [];
          for (var topic in topicObj) {
            sortedTopics.push([topic, topicObj[topic]]);
          }
          sortedTopics.sort(function(a, b) {
            return b[1] - a[1];
          });
          _this.topics = [];
          for (var i = 0; i < Math.min(10, sortedTopics.length); i++) {
            _this.topics.push(sortedTopics[i][0]);
          }
        }
      });
    },
    searchWord: function() {
      if (!this.queryWord) {
        Materialize.toast('Please enter the word!', 3000);
        return;
      }
      var _this = this;
      $.ajax({
        method: 'GET',
        url: '/api/get_definition',
        data: { word: this.queryWord },
        success: function(resp) {
          var respJson = JSON.parse(resp);
          if (respJson.result_msg !== 'Success') {
            Materialize.toast(respJson.result_msg, 3000);
            return;
          }
          var meaningObj = respJson.meaning;
          _this.nouDef = [];
          _this.vrbDef = [];
          _this.adjDef = [];
          _this.advDef = [];
          if (meaningObj['noun']) {
            var meanings = meaningObj['noun'].split('\n');
            for (var i = 0; i < meanings.length; i++) {
              _this.nouDef.push(meanings[i].substring(6));
            }
          }
          if (meaningObj['verb']) {
            meanings = meaningObj['verb'].split('\n');
            for (var i = 0; i < meanings.length; i++) {
              _this.vrbDef.push(meanings[i].substring(6));
            }
          }
          if (meaningObj['adjective']) {
            meanings = meaningObj['adjective'].split('\n');
            for (var i = 0; i < meanings.length; i++) {
              _this.adjDef.push(meanings[i].substring(6));
            }
          }
          if (meaningObj['adverb']) {
            meanings = meaningObj['adverb'].split('\n');
            for (var i = 0; i < meanings.length; i++) {
              _this.advDef.push(meanings[i].substring(6));
            }
          }
        }
      });
    },
    addSpanTag: function(text) {
      var res = '';
      var lastIndex = 0;
      var index = text.indexOf('<b');
      while (index != -1) {
        res += this.addSpanTagNoBolder(text.substring(lastIndex, index));
        var beginClose = text.indexOf('>', index);
        res += text.substring(index, beginClose + 1);
        var end = text.indexOf('</b>', beginClose);
        res += this.addSpanTagNoBolder(text.substring(beginClose + 1, end)) + '</b>';
        lastIndex = end + 4;
        index = text.indexOf('<b', lastIndex);
      }
      res += this.addSpanTagNoBolder(text.substring(lastIndex));
      return res;
    },
    addSpanTagNoBolder: function(text) {
      var res = '';
      var re = /\w+/;
      var parts = text.match(/\w+|\s+|[^\s\w]+/g);
      for (var i = 0; i < parts.length; i++) {
        if (re.test(parts[i])) {
          res += '<span>' + parts[i] + '</span>';
        } else {
          res += parts[i];
        }
      }
      return res;
    }
  }
});
