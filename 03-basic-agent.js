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

const schema = {
    type: "array",
    items: {
        type: "object",
        properties: {
            type: {
                type: "string",
                enum: ["thought", "action", "result"]
            },
            content: { type: "string" },
            function: { type: "string" },
            parameters: {
                type: "array",
                items: { type: "string" }
            }
        },
        required: ["type"]
    }
}

async function main() {
    startAgent("Suggest me a list of outdoor activities to do today")

}

/**
 * 
 * @param {*} role enum("user", "model", "function")
 * @param {*} content 
 * @returns 
 */
function createMessage(role, content) {
    return {
        role,
        parts: [
            {
                text: content
            }
        ]
    }
}

async function startAgent(query) {
    const messages = [
        createMessage("user", query)
    ]

    const response = await agentLoop(messages);
    console.log(response);
}

/**
 * 
 * @param {[]} messages Chat history
 */
async function agentLoop(messages, maxIterations = 10) {
    for (let iterations = 0; iterations < maxIterations; iterations++) {
        console.log(`--- Iterations: ${iterations} -----`);

        const response = await ai.models.generateContent({
            model: MODEL,
            contents: messages,
            config: {
                systemInstruction: reactAgentPrompt,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        })

        const responseArray = JSON.parse(response.text);
        for (const r of responseArray) {

            console.log(r);

            if (r.type === "result") {
                return r.content;
            }

            if (r.type === "action") {
                let observation = null;

                if (r.function === "getLocation") {
                    observation = await getLocation();
                } else if (r.function === "getCurrentWeather") {
                    observation = await getCurrentWeather(r.parameters[0]);
                } else {
                    observation = "Unknown function call " + r.function;
                }

                console.log("\nObservation: " + JSON.stringify(observation));
                // todo: add observation into the context
                messages.push(createMessage("model", response.text));
                messages.push(createMessage("user", `Observation: ${JSON.stringify(observation)}`));
            }
        }
    }
    return "The agent has reached the maximum number of iterations without a final result"
}

main();