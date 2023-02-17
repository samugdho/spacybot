const path = require('path');
const JQ = require('json-query');



// TODO: Get Axios
// import {fetch} from 'node-fetch';
// get data
const PATH_RAW_DATA = './server/data/raw';
const CWD = process.cwd();

const data = {
	planets : require(path.resolve(CWD, PATH_RAW_DATA, 'planets.json')),
	planets_ss : require(path.resolve(CWD, PATH_RAW_DATA, 'planets.ss.json')),
	satellites : require(path.resolve(CWD, PATH_RAW_DATA, 'satellites.json')),
};

const OBVIOUSLY = "Obviously, I know this... but I can't tell you now!";
const NOPROGRAMMING = "Um, I am not programmed to handle this question yet."

async function pint_ask(nlp_response) {
	let r = nlp_response;
	r.answer = NOPROGRAMMING;
	console.log(nlp_response);
	if (r.intent == "info.planet") {
		r.answer = OBVIOUSLY;
		let planet = r.entities[0].sourceText;
		let res = JQ(`planets_ss[name=${planet}]`, { data: data });
		if (res.value != null) {
			let description = res.value.description;
			let image_url = res.value.image;
			r.answer = `![${planet} Image](${image_url})\n\n${description}`;
		} else {
			let wikidata = await wiki_find(planet);
			if(wikidata && wikidata.search.length  > 0){
				let first = wikidata.search[0];
				r.answer = first.snippet;
			}
		}
	}
	return r;
}
async function wiki_find(celestial_body) {
	let url = "https://en.wikipedia.org/w/api.php"
	let params = {
		"action": "query",
		"format": "json",
		"list": "search",
		"srsearch": celestial_body,
	};
	try {
		// const response = await fetch(url, {
		// 	method: "GET", 

		// });
		// let wikidata = await response.json();
		// return wikidata;
	} catch (error) {
		console.log(error);
	}
	return false;
}
const kepler_distance = (body1, body2) => {
	// * Link: https://www.indiastudychannel.com/experts/29629-How-do-scientists-measure-distance-between-two-planets
	// Returns distance or 0 = unable to calculate

}
module.exports = {
	ask : pint_ask
}

