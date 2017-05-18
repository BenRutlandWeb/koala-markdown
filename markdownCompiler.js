/*
 * Markdown compiler extension for Koala
 * 
 * Copyright 2017 Ben Rutland
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require('fs'),
    path = require('path'),
    FileManager = global.getFileManager(),
    Compiler = require(FileManager.appScriptsDir + '/Compiler.js');

function mdCompiler(config) {
    Compiler.call(this, config);
}
require('util').inherits(mdCompiler, Compiler);
module.exports = mdCompiler;

/**
 * compile file
 * @param  {Object} file    compile file object
 * @param  {Object} emitter  compile event emitter
 */
mdCompiler.prototype.compile = function(file, emitter) {
	var markdown = require('markdown-it')(),
		htmlMinify = require('html-minifier').minify;
		self = this,
		filePath = file.src,
		output = file.output,
		settings = file.settings || {};

	var triggerError = function (message) {
		emitter.emit('fail');
		emitter.emit('always');
		self.throwError(message, filePath);
	};

	fs.readFile(filePath, 'utf8', function (readError, code) {
        if (readError) {
        	triggerError(readError.message);
			return false;
        }

		var html;
		try {
			html = markdown.render(code);
			
        	if(settings.minifyHTML) {
        		html = htmlMinify(html, {
					removeComments: true,
					removeCommentsFromCDATA: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
					removeEmptyElements: true
				});
        	}			
			
    	} catch (e) {
			triggerError(e.message);
			return false;
		}

		fs.writeFile(output, html, 'utf8', function (writeError) {
			if (writeError) {
				triggerError(writeError.message);
			} else {
				emitter.emit('done');
				emitter.emit('always');
			}
		});
	});
}