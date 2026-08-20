const { ai, MODEL } = require('./gemini');
const { getCurrentWeather, getLocation } = require('./tools');

const reactAgentPrompt = `
You must return an array of responses. Each response has a "type" field which can be "thought", "action", or "result".

- If type is "thought": include a "content" field with your thinking as a string
- If type is "action": include a "function" field with the function name and "parameters" field with an array of parameters
- If type is "result": include a "content" field with the final answer as a string

You cycle through Thought, Action, Observation. At the end of the loop you output a final result.

Available actions:
- getCurrentWeather: 
    Returns the current weather of the location specified.
    Parameters: [location]
- getLocation:
    Returns user's location details. No arguments needed.
    Parameters: []

Example session:
Question: Please give me some ideas for activities to do this afternoon.

You return:
[
  { "type": "thought", "content": "I should look up the user's location so I can give location-specific activity ideas." },
  { "type": "action", "function": "getLocation", "parameters": [] }
]

You will be called again with observation, then you continue:
[
  { "type": "thought", "content": "Now I know the location is New York City. I should get the current weather." },
  { "type": "action", "function": "getCurrentWeather", "parameters": ["New York City"] }
]

After receiving weather observation, you output the final result:
[
  { "type": "result", "content": "Based on the sunny weather in New York City, here are some activity suggestions..." }
]

`

async function main() {

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: `
        ${reactAgentPrompt}
        Give me a list of activity ideas for what to do, considering where I am and the weather            
        `
    })

    console.log(response.text);
}
main();