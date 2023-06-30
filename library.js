/**
 * You can run these tests by executing `npx mocha test/plugins-installed.js`
 * from the NodeBB root folder. The regular test runner will also run these
 * tests.
 *
 * Keep in mind tests do not activate all plugins, so if you are testing
 * hook listeners, socket.io, or mounted routes, you will need to add your
 * plugin to `config.json`, e.g.
 *
 * {
 *     "test_plugins": [
 *         "nodebb-plugin-posters"
 *     ]
 * }
 */

"use strict";

const _ = require('lodash');
const nconf = require.main.require('nconf');
const winston = require.main.require('winston');

const db = require.main.require('./src/database');
const api = require.main.require('./src/api');
const Topics = require.main.require('./src/topics');
const posts = require.main.require('./src/posts');
const User = require.main.require('./src/user');
const Groups = require.main.require('./src/groups');
const Notifications = require.main.require('./src/notifications');
const Privileges = require.main.require('./src/privileges');
const plugins = require.main.require('./src/plugins');
const Meta = require.main.require('./src/meta');
const slugify = require.main.require('./src/slugify');
const batch = require.main.require('./src/batch');
const utils = require.main.require('./src/utils');
const SocketPlugins = require.main.require('./src/socket.io/plugins');


const meta = require.main.require('./src/meta');

const routeHelpers = require.main.require('./src/routes/helpers');

const Plugin = {};

Plugin.filterTopicsGet = async (hookData) => {
	
	// get the posters of the topics
	const keys = hookData.topics.map(t => `tid:${t.tid}:posters`);

	//console.log(keys);

	const posters = await db.getSortedSetsMembers(keys);

	//console.log(posters);
	// get the uniq uids 
	const uniqUids = _.uniq(_.flatten(posters));
	// load the data for the uniq uids
	const userData = await User.getUsersFields(uniqUids, ['username', 'userslug', 'picture']);

	//console.log(userData);
	const uidToUserData = _.zipObject(uniqUids, userData);
	// set the 'posters' field on each topic
	hookData.topics.forEach((t, index) => {
		const posterUids = posters[index].reverse().slice(0, 4); 
		t.posters = posterUids.map(uid => uidToUserData[uid]);
	});

	console.log(hookData);
	return hookData;
};
module.exports = Plugin;
