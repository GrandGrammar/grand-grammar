$(document).mouseup(function(e) {
  var container = $('#synonyms-popup');
  // if the target of the click isn't the container nor a descendant of the container
  if (!container.is(e.target) && container.has(e.target).length === 0) {
    container.hide();
  }

  $('.tooltipped').tooltip();
  $('.modal').modal();
});
