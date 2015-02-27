Template.home.events({
  'click #start': function (e) {
    e.preventDefault();
    $('#mocha').html('');
    window.Target = $('#target').val();
    mocha.run();
  }
})
