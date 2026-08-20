const { ai, MODEL} = require('./gemini');
const { getCurrentWeather, getLocation} = require('./tools');

async function main() {

    const location = await getLocation();
    const weather = await getCurrentWeather();

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: `Give me a list of activity ideas for what to do, considering where I am and the weather
            Location: ${location}, Current Weather: ${JSON.stringify(weather)}
        `
    })

    console.log(response.text);
}
main();