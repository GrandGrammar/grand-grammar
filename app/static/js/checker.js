var correctText = $('#correct-text').text();
$('#correct-text').html(correctText.replace(/\b(\w+)\b/g, "<span>$1</span>"));

$('#correct-text span').hoverIntent(
  function() {
    console.log($(this).text());
    $(this).css('background-color','#d1c4e9');
  },
  function() { $(this).css('background-color',''); }
);
