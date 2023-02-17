const fs = require('fs');
const date = require('date-and-time');

function logt(...args){
	let now = new Date();
	let df = date.format(now, 'YYYY/MM/DD HH:mm:ss');
	switch (args.length) {
		case 0:
			console.log(`\n=[${df}]=`);
			break;
		case 1:
			console.log(`\n[\x1b[33m${df}\x1b[0m] ${args[0]}`);
			break;
		default:
			console.log(`\n===[\x1b[33m${df}\x1b[0m]===`);
			args.forEach(str => {
				console.log(`  ${str}`);
			});
			break;
	}
}

function generate(){
	
	let PATH_TO_RAW = './../raw/';

	logt('Generating Corpus...');
	//
	const json_filenames = {
		planets : 'planets.json',
		satellites : 'satellites.json',
		planets_ss : 'planets.ss.json',
		qna : 'corpus.qna.json'
	};
	let log_list = [];
	let raw = {};
	for (const key in json_filenames) {
		let jpath = `${PATH_TO_RAW}${json_filenames[key]}`
		raw[key] = require(jpath);
		log_list.push(jpath);
	}
	//
	logt('JSON data loaded', ...log_list);
	let corpus = {
		"name": "Corpus",
		"locale": "en-US",
		"contextData": {}, 
		"entities" : {
			"celestial_body" : {
				"options" : {}
			}
		},
		"data" : [],
	};

	let opt = corpus.entities.celestial_body.options;
	let all_list = [raw.planets, raw.satellites, raw.planets_ss];
	all_list.forEach(list => {	
		list.forEach(entry => {
			let name = entry.name.toLowerCase();
			opt[name] = [entry.name];
		});
	});
	logt('Entities filled');
	try {
		const intents = fs.readFileSync(PATH_TO_RAW + 'intents.md', {encoding : 'utf-8'});
		logt('Intents data loaded');
		let line_list = intents.split('\n');
		let d = corpus.data;
		
		line_list.forEach((line, i) => {
			let tline = line.trim();
			// skip empty line
			if(tline == '') return;
			let p = tline.slice(2);
			let last = d[d.length - 1];;
			//// console.log(`processing:${line}`);
			switch (tline[0]) {
				case '#':
					d.push({
						intent : p,
						utterances : [],
						answers : [],
					});
					break;
				case '-':
					last.utterances.push(p);
					break;
				case '>':
					last.answers.push(p);
					break;
				default:
					throw `BAD LINE @ ${i}: ${line}`;
			}
		});
		logt('Intents filled');
	} catch (err) {
		throw err;
	}
	return corpus;
}
if(require.main === module){
	const process = require('process');
	
	const path = require('path');

	const argv = require('minimist')(process.argv.slice(2));

	let out_path = argv.p || argv.path || './';

	
	if(typeof(out_path) == 'string' && fs.existsSync(out_path)){
		let filename = argv.o || argv.out;
		if(typeof(filename) != 'string') filename = "corpus.json";
		let out_string = JSON.stringify(generate(), null, 2);
		let full_path = path.join(out_path, filename);
		fs.writeFile(full_path, out_string, err => {
			if(err){
				console.error(err);
				throw "Failed to write file: " + filename;
			}
		});
		logt(`Write to ${full_path}`);
	}else{
		throw "Path is not valid: " + out_path;
	}
}else{
	module.exports = {
		generate : generate,
	}
}
