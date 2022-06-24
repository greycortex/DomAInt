import chrome from 'sinon-chrome';
import chai from 'chai';
import { closeTab, getCurrentURL, showAfterClosePopup, resetIcon } from '../src/tabFunctions';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const assert = chai.assert;

//chrome.action = chrome.browserAction;

describe('getCurrentURL tests', function () {

	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});

	it('tabs.query should be called', function () {
		assert.ok(chrome.tabs.query.notCalled);
		getCurrentURL();
		return assert.ok(chrome.tabs.query.calledOnce);
	});

	it('getCurrent url should return mocked url', async () => {
		chrome.tabs.query.resolves([{ url: 'https://www.seznam.cz/' }]);
		const tabURL = await getCurrentURL();
		return assert.equal(tabURL, 'https://www.seznam.cz/')

	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});
});

describe('showAfterClosePopup tests', function () {

	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});

	it('tabs.query should be called', function () {
		assert.ok(chrome.tabs.query.notCalled);
		showAfterClosePopup();
		return assert.ok(chrome.tabs.query.calledOnce);

	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});


});
/*
this function is currently not used, will be added, refactored
describe('getCurrentTab tests', function () {

	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});

	it('tabs.query should be called', function () {
		assert.ok(chrome.tabs.query.notCalled);
		getCurrentTab();
		return assert.ok(chrome.tabs.query.calledOnce);
	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});
});
*/

describe('closeTab tests', function () {

	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});
});

//change icon definitely needs to be refactored before testing

describe('changeIcon tests', function () {
	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});


	it('', function () {

	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});
});

// since browserAction was replaced with action
// and sinon-chrome is not being updated since 2021
// this test might not work
describe('resetIcon tests', function () {
	before(function () {
		global.chrome = chrome;
	});

	beforeEach(function () {
		chrome.flush();
	});


	it('', function () {

	});

	after(function () {
		chrome.flush();
		delete global.chrome;
	});
});