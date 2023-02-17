const { NlpManager } = require('node-nlp');
const pint = require('./process-intent.js');
const fs = require('fs');
const path = require('path');



const NEWLINE = '\n';
const PATH_PROCESSED_DATA = "./server/data/processed";
const PATH_GENERATE_JS = "./server/data/js";
let manager;

const DEV_MODE = typeof process.env.NODE_ENV == "string" && process.env.NODE_ENV.startsWith('dev');

const DEBUG = true;
const log = (...args) => { if (DEBUG) console.log(...args); }
const loga = (...args) => {
	let extra = 4;
	let pad = "=";
	let extra2, a, str;
	if (DEBUG) {

		let lengths = args.map(s => s.length);
		let max_length = Math.max(...lengths) + (extra * 2);
		let linePad = "".padStart(max_length, pad);
		console.log(NEWLINE + linePad);
		args.forEach(line => {
			extra2 = max_length - line.length;
			a = Math.floor(extra2 / 2);
			if (a * 2 < extra2) a++;
			str = line.padStart(line.length + a, pad);
			str = str.padEnd(max_length, pad);
			console.log(str)
		});
		console.log(linePad + NEWLINE);
	}
}


//
let model_file_name = "model.nlp";
let corpus_file_name = "corpus.json";
//

function ai_setup() {
	loga("Setting up AI");
	manager = new NlpManager({
		languages: ['en'],
		forceNER: true,
		modelFileName: model_file_name,
	});
	// load from model or train
	if (!DEV_MODE && fs.existsSync(path.join(PATH_PROCESSED_DATA, model_file_name))) {
		let cwd = process.cwd();
		process.chdir(PATH_PROCESSED_DATA)
		//
		manager.load(model_file_name);
		loga("Model Loaded");
		//
		process.chdir(cwd);
	} else {
		ai_train();
	}

}

// Train and save the model.
async function ai_train() {
	if (DEV_MODE) {
		// regenerate corpus
		let cwd = process.cwd();
		process.chdir(PATH_GENERATE_JS);
		require('child_process').execSync(
			'node generate.corpus.js -p ../processed',
			{ stdio: 'inherit' }
		);
		process.chdir(cwd);
	}
	// change directory to data
	let cwd = process.cwd();
	process.chdir(PATH_PROCESSED_DATA);
	// load and add the corpus
	manager.addCorpus(corpus_file_name);
	loga(
		"Loaded Corpus",
		"Start Training"
	);
	await manager.train();
	loga("Training Complete");
	// save model
	manager.save(model_file_name);
	// return cwd
	process.chdir(cwd);
};
async function ai_ask(msg) {
	let res = await manager.process('en', msg);
	// handle open intent
	if (res.answer == null) {
		await pint.ask(res);
	}
	return res;
}
async function ai_getEntities(msg) {
	return await manager.extractEntities('en', msg);
}
module.exports = {
	setup : ai_setup,
  ask : ai_ask,
  getEntities : ai_getEntities,
	train : ai_train,
};
