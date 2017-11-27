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

          _this.edittingEssay = false;

          Vue.nextTick(function() {
            // var correctText = $('#correct-text').text();
            // $('#correct-text').html(correctText.replace(/\b(\w+)\b/g, "<span>$1</span>"));
            $('#correct-text').html(correctedText);
            $('#error-text').html(errorText);
            // $('#correct-text span').hoverIntent(
            //   function() {
            //     console.log($(this).text());
            //     $(this).css('background-color','#d1c4e9');
            //   },
            //   function() { $(this).css('background-color',''); }
            // );
            // $('#correct-text span').click(function() {
            //   console.log($(this).text());
            // });
          })
        }
      })
    }
  }
});
