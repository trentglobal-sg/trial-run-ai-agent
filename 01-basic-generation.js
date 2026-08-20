const { ai, MODEL} = require('./gemini');

async function main() {
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: "Give me a list of activity ideas for what to do, considering where I am and the weather"
    })

    console.log(response.text);
}
main();