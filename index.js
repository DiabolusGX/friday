import { IgApiClient } from "instagram-private-api";
import axios from "axios";

var reminded = false;
const ig = new IgApiClient();
const { username, password } = process.env;

const photo =
	"https://cdn.discordapp.com/attachments/737967878719930439/1003416502151692440/Pancho-Friday-Hai.jpeg";
const video =
	"https://cdn.discordapp.com/attachments/737967878719930439/1003416302574121040/friday-hai-360p.mp4";

/**
 * post function just login -> posts the photo on instagram -> logout
 * and log the uploaded post URL.
 */
const post = async () => {
	const imgResp = await axios.get(photo, { responseType: "arraybuffer" });
	const imageBuffer = Buffer.from(imgResp.data, "utf-8");

	const videoResp = await axios.get(video, { responseType: "arraybuffer" });
	const videoBuffer = Buffer.from(videoResp.data, "utf-8");

	ig.state.generateDevice(username);
	await ig.simulate.preLoginFlow();
	await ig.account.login(username, password);
	// process.nextTick(async () => await ig.simulate.postLoginFlow());

	/***** IMAGE *****/
	// const { media } = await ig.publish.photo({
	// 	file: imageBuffer,
	// 	caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
	// });

	/***** VIDEO *****/
	const { media } = await ig.publish.video({
		video: videoBuffer,
		coverImage: imageBuffer,
		caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
	});

	/***** IGTV VIDEO (WIP) *****/
	// const { media } = await ig.publish.igtvVideo({
	// 	video: videoBuffer,
	// 	coverFrame: imageBuffer,
	// 	title: "pancho friday hai",
	// 	caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
	// });

	console.log(
		`[${new Date().toISOString}] Posted - https://instagram.com/p/${
			media.upload_id
		}`
	);
	return;
};

// check every 10 min if it's friday yet
// and if bot has already posted reminder on this friday.
setInterval(() => {
	const d = new Date();
	const day = d.getDay();

	if (day == 6 && !reminded) {
		post();
		reminded = true;
	}

	if (day != 6) {
		reminded = false;
	}
}, 600000);
