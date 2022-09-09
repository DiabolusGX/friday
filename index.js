require("dotenv").config();
const { IgApiClient } = require("instagram-private-api");
const axios = require("axios");

let reminded = false;
let dailyStory = 0;
const ig = new IgApiClient();
const { ig_username, ig_password } = process.env;

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

	ig.state.generateDevice(ig_username);
	// await ig.simulate.preLoginFlow();
	await ig.account.login(ig_username, ig_password);
	// process.nextTick(async () => await ig.simulate.postLoginFlow());

	switch (action) {
		case "story":
			console.log(`[${new Date().toISOString()}] posting story.`);
			try {
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
					`[${new Date().toISOString()}] Image story - https://instagram.com/stories/${ig_username}/${
						s1.media.pk
					}`
				);
				console.log(
					`[${new Date().toISOString()}] Video story - https://instagram.com/stories/${ig_username}/${
						s2.media.pk
					}`
				);
			} catch (err) {
				dailyStory = 0;
			}
			break;

		case "post":
			console.log(`[${new Date().toISOString()}] posting video on feed.`);
			try {
				/***** VIDEO *****/
				const { media } = await ig.publish.video({
					video: videoBuffer,
					coverImage: imageBuffer,
					caption:
						"pancho friday hai aaj \n\n\n #friday #fun #reminder",
				});
				console.log(
					`[${new Date().toISOString()}] Video post - https://instagram.com/p/${
						media.code
					}`
				);
			} catch (err) {
				reminded = false;
			}
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

// check every 30 min if it's friday yet
// and if bot has already posted reminder on this friday.
setInterval(() => {
	const d = new Date();
	const day = d.getDay();
	console.info(
		`[${new Date().toISOString()}] [interval] Started interval, day = ${day}.`
	);

	// video scheduler
	if (day == 5 && !reminded) {
		post("post");
		reminded = true;
		console.info(
			`[${new Date().toISOString()}] [interval] Published video post.`
		);
	}
	if (day != 5 && reminded == true) {
		console.info(
			`[${new Date().toISOString()}] [interval] Reseted reminder.`
		);
		reminded = false;
	}

	// story scheduler
	if (dailyStory != day) {
		// 2 min timeout
		// instagram rate limit on login on Friday
		// login required for both post & story on same time on Friday
		setTimeout(() => {
			post("story");
		}, 2 * 60 * 1000);
		dailyStory = day;
		console.info(
			`[${new Date().toISOString()}] [interval] Published stories.`
		);
	}

	console.info(`[${new Date().toISOString()}] Interval ended.`);
	console.info(`--------------------------------------------`);
}, 30 * 60 * 1000); // 30 min.
