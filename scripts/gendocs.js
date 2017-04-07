#!/usr/bin/env node

const Gitdown = require('gitdown'),
	{readdirSync} = require('fs'),
	{resolve, join} = require('path');

const sourceFolder = './bootstrap/_docs/';
const targetFolder = './bootstrap/docs/';

const filesToProcess = readdirSync(sourceFolder).map(file => {
	return {
		src: resolve(join(sourceFolder, file)),
		dest: resolve(join(targetFolder, file))
	};
});


filesToProcess.forEach(({src, dest}) => {
	console.log(`${src} -> ${dest}`);
	const gitdown = Gitdown.readFile(src);
	gitdown.writeFile(dest);

});