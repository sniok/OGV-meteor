SearchSource.defineSource('modelFiles', function(searchText, options) {
  var options = {sort: {timeUploaded: -1}, limit: 5};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {name: regExp};
    return ModelFiles.find(selector, options).fetch();
  } else {
    return ModelFiles.find({}, options).fetch();
  }
});

SearchSource.defineSource('users', function(searchText, options) {
  var options = {sort: {createdAt: -1}, limit: 5};

  if(searchText) {
    var regExp = buildRegExp(searchText);
    var selector = {'profile.name': regExp};
    return Meteor.users.find(selector, options).fetch();
  } else {
    return Meteor.users.find({}, options).fetch();
  }
});

SearchSource.defineSource('objFiles', function(searchText, options) {
    if(searchText) {
	var regExp = buildRegExp(searchText);
	var selector = {'original.name': regExp, 'gFile': options.gFile};
	return OBJFiles.find(selector).fetch();
     } else {
	return OBJFiles.find({gFile: options.gFile}).fetch();
     }
});

function buildRegExp(searchText) {
  var words = searchText.trim().split(/[ \-\:]+/);
  var exps = _.map(words, function(word) {
    return "(?=.*" + word + ")";
  });
  var fullExp = exps.join('') + ".+";
  return new RegExp(fullExp, "i");
}
