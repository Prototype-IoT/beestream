const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
const config = require('../../config/config');

/*This file handles all socket.io configurations for the comment component.
* This includes creating the listeners and sending the appropriate emit
* messages.  I'll try to keep a list of messages and their meanings here,
* but as we know comment rot is a real thing, so this list might not be final.
* See the actual file for all entries.
*
******************************Incoming Messages********************************
* newComment: Signals that a user has created a new comment to be inserted into
*             the database.  This should insert the comment and return a new
*             comments list for the video.
* getComments: Signals a request for a list of comments for a given datetime/
*              hive pair.  This should return a list of all comments for that
*              datetime/hive.
*
******************************Outgoing Messages********************************
* commentList: Signals that a comment list is being sent.  Should be accompanied
*              by a list of comments.
*
* commentError: indicates that an error occurred in the comment process.  Will
*               be accompanied by an error message in the field message.
*
* commentSuccess: indicates that a comment was successfully saved.
*
*/
module.exports = function(io, socket) {

  /*newComment: Signals that a user has created a new comment to be inserted into
  *             the database.  This should insert the comment and return a new
  *             comments list for the video.
  *
  * commentError: indicates that an error occurred in the comment process.  Will
  *               be accompanied by an error message in the field message.
  *
  * commentSuccess: indicates that a comment was successfully saved.
  *
  */
  socket.on('newComment', (message) => {
    var commentData = JSON.parse(JSON.stringify(message));
    var date = new Date(commentData.datetime);
    var month = (date.getMonth() + 1 < 10) ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
    var day = (date.getDate() < 10) ? `0${date.getDate()}` : `${date.getDate()}`;
    var hour = (date.getHours() < 10) ? `0${date.getHours()}` : `${date.getHours()}`;
    var minute = (date.getMinutes() < 10) ? `0${date.getMinutes()}` : `${date.getMinutes()}`;
    var second = (date.getSeconds() < 10) ? `0${date.getSeconds()}` : `${date.getSeconds()}`;
    var filepath = `${config.videoPath}/${commentData.hive}/` +
                   `${date.getFullYear()}-${month}-${day}` +
                   `/video/${hour}-${minute}-${second}.h264`;
    var newComment = new Comment({
      'Username': commentData.username,
      'Comment': commentData.comment,
      'Hive': commentData.hive,
      'UTCDate': date,
      'FilePath': filepath
    });
    newComment.save((err) => {
      if (err) {
        console.log(`Insertion error: ${err}`);
        socket.emit('commentError', {
          message: 'Error saving comment.  Refresh the page and try again.'
        });
      }
      else {
        socket.emit('commentSuccess', {
          message: 'Comment Successful'
        });
        //TODO: send a new list of comments to the client here.
      }
    });
  });

  /*getComments: Signals a request for a list of comments for a given datetime/
  *              hive pair.  This should return a list of all comments for that
  *              datetime/hive.
  *
  * commentList: Signals that a comment list is being sent.  Should be accompanied
  *              by a list of comments.
  *
  * commentError: indicates that an error occurred in the comment process.  Will
  *               be accompanied by an error message in the field message.
  */
  socket.on('getComments', (message) => {
    var parsedMessage = JSON.parse(JSON.stringify(message));
    var hive = parsedMessage.hive;
    var date = new Date(parsedMessage.datetime);
    Comment.find({UTCDate: date, Hive: hive}, {_id: 0}).sort({Created: 'desc', Username: 'desc'}).exec((err, comments) => {
      if (err) {
        console.log(`Error retrieving comments list with message ${err}.`);
        socket.emit('commentError', {message: 'Reservation listing failed.'});
      }
      else {
        var commentList = [];
        for (comment of comments) {
          commentList.push(comment);
        }
        socket.emit('commentList', {comments: commentList});
      }
    });
  });
}
