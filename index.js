import { IgApiClient } from "instagram-private-api";
import axios from "axios";

var reminded = false;
var dailyStory = 0;
const ig = new IgApiClient();
const { username, password } = process.env;

const daily =
	"https://cdn.discordapp.com/attachments/737967878719930439/1003568484283863110/6ojlo7.jpeg";
const photo =
	"https://cdn.discordapp.com/attachments/737967878719930439/1003416502151692440/Pancho-Friday-Hai.jpeg";
const video =
	"https://cdn.discordapp.com/attachments/737967878719930439/1003416302574121040/friday-hai-360p.mp4";

/**
 * post function just login -> perform action -> logout
 * and log the uploaded post URL.
 */
const post = async (action) => {
	const imgResp = await axios.get(photo, { responseType: "arraybuffer" });
	const imageBuffer = Buffer.from(imgResp.data, "utf-8");

	const dailyResp = await axios.get(daily, { responseType: "arraybuffer" });
	const dailyBuffer = Buffer.from(dailyResp.data, "utf-8");

	const videoResp = await axios.get(video, { responseType: "arraybuffer" });
	const videoBuffer = Buffer.from(videoResp.data, "utf-8");

	ig.state.generateDevice(username);
	await ig.simulate.preLoginFlow();
	await ig.account.login(username, password);
	// process.nextTick(async () => await ig.simulate.postLoginFlow());

	switch (action) {
		case "story":
			console.log(`[${new Date().toISOString()}] posting story.`);
			/***** PHOTO STORY *****/
			const s1 = await ig.publish.story({
				file: dailyBuffer,
			});
			/***** VIDEO STORY *****/
			const s2 = await ig.publish.story({
				video: videoBuffer,
				coverImage: dailyBuffer,
			});
			console.log(
				`[${new Date().toISOString()}] Image story - https://instagram.com/stories/${username}/${
					s1.media.pk
				}`
			);
			console.log(
				`[${new Date().toISOString()}] Video story - https://instagram.com/stories/${username}/${
					s2.media.pk
				}`
			);
			break;

		case "post":
			console.log(`[${new Date().toISOString()}] posting video on feed.`);
			/***** VIDEO *****/
			const { media } = await ig.publish.video({
				video: videoBuffer,
				coverImage: imageBuffer,
				caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
			});
			console.log(
				`[${new Date().toISOString()}] Video post - https://instagram.com/p/${
					media.code
				}`
			);
			break;

		default:
			break;
	}

	/***** IGTV VIDEO (WIP) *****/
	// const { media } = await ig.publish.igtvVideo({
	// 	video: videoBuffer,
	// 	coverFrame: imageBuffer,
	// 	title: "pancho friday hai",
	// 	caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
	// });

	/***** IMAGE *****/
	// const { media } = await ig.publish.photo({
	// 	file: imageBuffer,
	// 	caption: "pancho friday hai aaj \n\n\n #friday #fun #reminder",
	// });
};

// check every 10 min if it's friday yet
// and if bot has already posted reminder on this friday.
setInterval(() => {
	const d = new Date();
	const day = d.getDay();

	// video scheduler
	if (day == 6 && !reminded) {
		post("post");
		reminded = true;
	}
	if (day != 6) {
		reminded = false;
	}

	// story scheduler
	if (dailyStory != day) {
		post("story");
		dailyStory = day;
	}
}, 600000);
