'use strict';

import {
  User, 
  createUser
} from 'database/users/user';

import {
  BackgroundImage, 
  getBackgroundImages
} from 'database/backgroundImages/backgroundImage';

import {
  updateWidgetEnabled, 
  updateWidgetData
} from 'database/widgets/userWidget/userWidget';

import Async from 'asyncawait/async';
import Await from 'asyncawait/await';
import moment from 'moment';

import tfacMgr from './tfac';

/**
 * Sets the user profile data for the user 
 * currently beign migrated.
 * @param {Object} userprofile - The user profile data.
 * @return {boolean} True if data was saved without any 
 * problems false otherwise.
 */
const setUserProfile = Async((userProfile) => {
  try {
    const user = new User(userProfile.id);

    user.username = userProfile.username;
    user.email = userProfile.email;
    user.vcCurrent = userProfile.vcCurrent;
    user.vcAllTime = userProfile.vcAllTime;
    user.level = userProfile.level;
    user.heartsUntilNextLevel = userProfile.heartsUntilNextLevel;

    user.backgroundOption = User.BACKGROUND_OPTION_PHOTO;
    switch(userProfile.backgroundOption){
      case User.BACKGROUND_OPTION_CUSTOM:
        user.backgroundOption = User.BACKGROUND_OPTION_CUSTOM;
        break;
      case User.BACKGROUND_OPTION_COLOR:
        user.backgroundOption = User.BACKGROUND_OPTION_COLOR;
        break;
      case User.BACKGROUND_OPTION_DAILY:
        user.backgroundOption = User.BACKGROUND_OPTION_DAILY;
        break;
      default:
        break;
    }

    const bkgImages = Await (getBackgroundImages());

    user.backgroundImage = {
      id: 'fb5082cc-151a-4a9a-9289-06906670fd4e',
      name: 'Mountain Lake',
      fileName: 'lake.jpg',
      timestamp: moment.utc().format()
    };

    for(var index in bkgImages){
      var bkg = bkgImages[index];
      if(bkg.name === userProfile.backgroundImage){
        user.backgroundImage = {
          id: bkg.id,
          name: bkg.name,
          fileName: bkg.fileName,
          timestamp: moment.utc().format()
        }
        break;
      }
    }

    user.customImage = userProfile.customImage || null;
    user.backgroundColor = userProfile.backgroundColor || null;

    Await (createUser(user));
    
    return true;
  } catch(err) {
    // Log the err in here
    return false;
  }
});

/**
 * Setup the bookmarks for the user.
 * @param {Object[]} bookmarks - The bookmark list.
 * @return {boolean} True if data was saved without any 
 * problems false otherwise.
 */
const setBookmarksData = Async((userId, bookmarks) => {
  try {
    if(!bookmarks || !bookmarks.length)
      return true;

    const bookmarkWidgetId = '4162cc79-d192-4435-91bd-5fda9b6f7c08';
    
    Await (updateWidgetEnabled(userId, bookmarkWidgetId, true));
    Await (updateWidgetData(
        userId, 
        bookmarkWidgetId, 
        { bookmarks: bookmarks }));

    return true;
  } catch(err) {
    // Log the err in here
    return false;
  }
});

/**
 * Setup the notes for the user. 
 * @param {Object[]} notes - The note list.
 * @return {boolean} True if data was saved without any 
 * problems false otherwise.
 */
const setNotesData = Async((userId, notes) => {

  function randomString(length) {
      const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var result = '';
      for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
      return result;
  }

  try {
    if(!notes || !notes.length)
      return true;

    const notesWidgetId = '4262cc79-d192-4435-91bd-5fda9b6f7c08';

    const data = [];
    for(var index in notes) {
      data.push({
        id: randomString(6),
        color: notes[index].color,
        content: notes[index].content
      });
    }
    
    Await (updateWidgetEnabled(userId, notesWidgetId, true));
    Await (updateWidgetData(
        userId, 
        notesWidgetId, 
        { notes: data }));

    return true;
  } catch(err) {
    // Log the err in here
    return false;
  }
});

const handler = Async((event) => {

  // Check the received key in here to authenticate the request.
  
  if (!event.queryStringParameters.id) {
    return Promise.resolve({
      statusCode: 400,
      body: JSON.stringify({ message: 'The id query param must be set to a valid user id' }),
    });
  }

  let userId = event.queryStringParameters.id;

  //////////////  Migrate User Profile Data  ///////////////
  const userProfile = Await (tfacMgr.fetchUserProfile(userId));
  Await (setUserProfile(userProfile));

  /////////////////  Migrate User Widgets  ///////////////////

  // Bookmarks
  const bookmarks = Await (tfacMgr.fetchBookmarks(userId));
  Await (setBookmarksData(userProfile.id, bookmarks));

  // Notes
  const notes = Await (tfacMgr.fetchNotes(userId));
  Await (setNotesData(userProfile.id, notes));

  return Promise.resolve({
    statusCode: 200,
    body: JSON.stringify({ message: 'Migration successful.' }),
  });
});

const serverlessHandler = (event, context, callback) => {
  handler(event)
    .then( response => callback(null, response) );
}

module.exports = {
  handler: handler,
  serverlessHandler: serverlessHandler,
}

