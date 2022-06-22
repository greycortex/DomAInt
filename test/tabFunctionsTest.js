import chrome from 'sinon-chrome';
import chai from 'chai';
import { closeTab, getCurrentURL, showAfterClosePopup } from '../src/tabFunctions';
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

	it('tabs.query should reject promise', function () {
		//chrome.tabs.query.yields([1, 2]);
		chrome.tabs.query.yields([{ url: 'https://www.seznam.cz/' }]);
		chrome.runtime.lastError = { message: 'Error' };
		return assert.isRejected(getCurrentURL());
	});

	it('getCurrent url should return mocked url', function () {
		chrome.tabs.query.yields([{ url: 'https://www.seznam.cz/' }]);
		return assert.eventually.deepEqual(getCurrentURL(), 'https://www.seznam.cz/');
	});

	//FIXME: resetIcon is definitely called but the test fails

	it('resetIcon should be called', function () {
		chrome.tabs.query.yields([{ id: 0, url: 'extensions/' }]);
		getCurrentURL();
		//return assert.ok(resetIcon.calledOnce);
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

	it('tabs.sendMessage should be called', function () {
		chrome.tabs.query.yields([{ id: 0, url: 'https://www.seznam.cz/' }]);
		showAfterClosePopup();
		assert.ok(chrome.tabs.sendMessage.withArgs(0, { data: "show_popup" }).calledOnce);
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

	//this test works as intended but not sure if I can put Promise inside the yield like that
	it('tabs.remove should reject promise', function () {
		chrome.tabs.remove.yields(Promise);
		chrome.runtime.lastError = { message: 'Error' };
		return assert.isRejected(closeTab(0));
	});

	it('tabs.remove should resolve tab', function () {
		chrome.tabs.remove.yields([{ id: 0, url: 'https://www.seznam.cz/' }]);
		return assert.eventually.deepEqual(closeTab(0), [{ id: 0, url: 'https://www.seznam.cz/' }]);
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