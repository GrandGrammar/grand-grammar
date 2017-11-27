Vue.config.devtools = true;

var app = new Vue({
  el: '#vue-app',
  data: {
    inputEssay: 'Computer science are scientific and practical approach to compute and its applications. It is the systematic studying of the feasibility, structure, expression, and mechanization of the methodic procedures that underlies the acquisition, representation, processing, storage, communication of, and access for information, whether such information are encoded of bits in a computer memory or transgribed in genes and protein structures in a biological cell. An alternative, more succinct definitions of computer science is the study of automating algorithmic processes that scale.',
    originalEssay: '',
    edittingEssay: true
  },
  mounted: function() {
    // $(document).ready(function() {
    //   $('#correct-text span').hoverIntent(
    //     function() {
    //       console.log($(this).text());
    //       $(this).css('background-color','#d1c4e9');
    //     },
    //     function() { $(this).css('background-color',''); }
    //   );
    //   $('#correct-text span').click(function() {
    //     console.log($(this).text());
    //   });
    // })
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
          var lastStart = 0;
          for (var i = 0; i < errorList.length; i++) {
            correctedText += _this.inputEssay.substring(lastStart, errorList[i].from) + '<b style="color:green;">' + errorList[i].suggestion + '</b>';
            errorText += _this.inputEssay.substring(lastStart, errorList[i].from) + '<b style="color:red;">' + _this.inputEssay.substring(errorList[i].from, errorList[i].to + 1) + '</b>';
            lastStart = errorList[i].to + 1;
          }
          correctedText += _this.inputEssay.substring(lastStart);
          errorText += _this.inputEssay.substring(lastStart);

          _this.edittingEssay = false;

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
              console.log($(this).text());
            });
          })
        }
      })
    },
    editEssay: function() {
      this.edittingEssay = true;
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
