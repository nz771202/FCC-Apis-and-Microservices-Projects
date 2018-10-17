'use strict';

exports.create = create;

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');

const UrlCounter = mongoose.model('UrlCounter', new mongoose.Schema({
	count: {type: Number, default: 1}
}));

const ShortenedUrl = mongoose.model('ShortenedUrl', new mongoose.Schema({
	url: {type: String, required: true},
	index: {type: Number, required: true}
}));

function create()
{
	const router = express.Router();

	router.use(bodyParser.urlencoded({extended: false}));

	router.use((req, res, next) => {
		if (req.body && req.body.url) {
			validateUrl(req.body.url, (err) => {
				if (err) {
					res.json({error: "invalid URL"});
				}
				next(err);
			});
		}
		else next();
	});

	router.post('/new', addUrl);
	router.get('/:index', visitUrl);

	return router;
}

function validateUrl(url, callback)
{
	// remove trailing slash
	if (url.match(/\/$/i)) {
		url = url.slice(0, -1);
	}
	const protocolMatch = url.match(/^https?:\/\/(.*)/i);
	if (!protocolMatch) {
		return callback('invalid URL');
	}
	const hostMatch = protocolMatch[1].match(/^([a-z0-9\-_]+\.)+[a-z0-9\-_]+/i);
	if (!hostMatch) {
		return callback('invalid URL');
	}
	dns.lookup(hostMatch[0], callback);
}

function addUrl(req, res)
{
	// url should already be validated
	const url = req.body.url;

	ShortenedUrl.findOne({url: url}, (err, storedUrl) => {
		if (err) {
			res.json(err);
		} else if (storedUrl) {
			res.json({"original_url": url, "short_url": storedUrl.index});
		} else {
			getNextIndex((err, index) => {
				if (err) {
					res.json(err);
				} else {
					new ShortenedUrl({url, index}).save((err, doc) => {
						if (err) {
							res.json(err);
						} else {
							res.json({"original_url": url, "short_url": index});
						}
					});
				}
			});
		}
	});
}

function getNextIndex(callback)
{
	UrlCounter.findOneAndUpdate({}, {$inc: {count: 1}}, (err, data) => {
		if (err) {
			callback(err);
		} else if (data) {
			callback(null, data.count);
		} else {
			new UrlCounter().save((err, doc) => {
				callback(err, doc.count);
			});
		}
	});
}

function visitUrl(req, res)
{
	const index = parseInt(req.params.index);
	if (!index || isNaN(index)) {
		res.json({error: "Invalid index"});
		return;
	}
  ShortenedUrl.findOne({index}, (err, data) => {
    if (err) {
      res.json(err);
    } else if (data) {
      res.redirect(data.url);
    } else {
      res.json({error: "No URL stored for number " + index});
    }
  });
}
