const { ai, MODEL } = require('./gemini');
const { getCurrentWeather, getLocation } = require('./tools');

const reactAgentPrompt = `
You are a helpful assistant that can look up user's location and check the weather. Use the available tools to answer questions about outdoor
activities and weather-related queries.
`

const tools = [
    {
        functionDeclarations: [
            {
                name: "getCurrentWeather",
                description: "Returns the current weather of the location specified",
                parameters: {
                    type: "object",
                    properties: {
                        location: {
                            type: "string",
                            description: "City name or location"
                        }
                    },
                    required: ["location"]
                }
            },
            {
                name: "getLocation",
                description: "Returns the user's current location details. No parameters needed.",
                parameters: {
                    type: "object",
                    properties: {}
                }
            }
        ]
    }
];

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
    // If content is already an array of parts, use it directly
    if (Array.isArray(content)) {
        return {
            role,
            parts: content
        };
    }

    // If it's a function response object with name and response
    if (role === 'function' && content.name && content.response !== undefined) {
        // force responseData data to be an object
        const responseData = (typeof content.response === 'object' && content.response !== null && !Array.isArray(content.response))
            ? content.response
            : { result: content.response };

        return {
            role: 'function',
            parts: [{
                functionResponse: {
                    name: content.name,
                    response: responseData
                }
            }]
        };
    }

    // Otherwise, wrap text content in a parts array
    return {
        role,
        parts: [{ text: content }]
    };
};

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
                tools: tools
            }
        })

        // Display any text response
        if (response.text) {
            console.log("Thinking:", response.text)
        }

        // Check if the AI is requesting to call any functions
        const functionCalls = response.functionCalls;

        // Extract out any other content the AI has sent back
        const modelContent = response.candidates?.[0]?.content;

        // dispatch the function calls
        if (functionCalls && functionCalls.length > 0) {
            console.log("Calling functions");

            if (modelContent) {
                // why there is no need to use createMessage here?
                // because modelContent already fits the critiera for Gemini chat history message
                messages.push(modelContent);
            }

            // functionCalls is an array of function call requests from Gemini
            for (const call of functionCalls) {

                let observation = null;

                // handle cases when Gemini will store the function name as "generic:function_name"
                const functionName = call.name.split(':').pop();

                if (functionName === "getLocation") {
                    observation = await getLocation();
                } else if (functionName === "getCurrentWeather") {
                    observation = await getCurrentWeather(call.args.location);
                } else {
                    observation = "Unknown function call " + functionName;
                }

                console.log("Calling", functionName)
                console.log("\nObservation: " + JSON.stringify(observation));

                messages.push(createMessage('function', {
                    name: call.name,
                    response: observation
                }))

            }
        } else {

            // No function calls - add response to the messages history and contiune
            if (modelContent) {
                messages.push(modelContent);
            }

            // if there is a response.text then it will be the final answer
            if (response.text) {
                return response.text
            }
        }

    }

    return "The agent has reached the maximum number of iterations without a final result"
}

main();