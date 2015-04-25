// accept either an ID or a slug
Meteor.publish('singleUser', function(idOrSlug) {
  var findById = Meteor.users.findOne(idOrSlug);
  var findBySlug = Meteor.users.findOne({slug: idOrSlug});
  var user = typeof findById !== 'undefined' ? findById : findBySlug;
  var options = Users.isAdminById(this.userId) ? {} : {fields: Users.pubsub.publicProperties};
  if (user) {
    return Meteor.users.find({_id: user._id}, options);
  }
  return [];
});

Meteor.publish('userPosts', function(terms) {
  var parameters = Posts.getSubParams(terms);
  var posts = Posts.find(parameters.find, parameters.options);
  return posts;
});

Meteor.publish('userUpvotedPosts', function(terms) {
  var parameters = Posts.getSubParams(terms);
  var posts = Posts.find(parameters.find, parameters.options);
  return posts;
});

Meteor.publish('userDownvotedPosts', function(terms) {
  var parameters = Posts.getSubParams(terms);
  var posts = Posts.find(parameters.find, parameters.options);
  return posts;
});

Meteor.publish('userComments', function(userId, limit) {
  var comments = Comments.find({userId: userId}, {limit: limit});
  // if there are comments, find out which posts were commented on
  var commentedPostIds = comments.count() ? _.pluck(comments.fetch(), 'postId') : [];
  return [
    comments,
    Posts.find({_id: {$in: commentedPostIds}})
  ]
});


// Publish the current user

Meteor.publish('currentUser', function() {
  var user = Meteor.users.find({_id: this.userId}, {fields: Users.pubsub.privateProperties});
  return user;
});

// publish all users for admins to make autocomplete work
// TODO: find a better way

Meteor.publish('allUsersAdmin', function() {
  var selector = Settings.get('requirePostInvite') ? {isInvited: true} : {}; // only users that can post
  if (Users.isAdminById(this.userId)) {
    return Meteor.users.find(selector, {fields: {
      _id: true,
      profile: true,
      slug: true
    }});
  }
  return [];
});

// Publish all users to reactive-table (if admin)
// Limit, filter, and sort handled by reactive-table.
// https://github.com/aslagle/reactive-table#server-side-pagination-and-filtering-beta

ReactiveTable.publish("all-users", function() {
  if(Users.isAdminById(this.userId)){
    return Meteor.users;
  } else {
    return [];
  }
});
