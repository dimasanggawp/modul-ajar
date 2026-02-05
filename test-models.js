const API_KEY = "AIzaSyAwTVQAK6US4fUl-jlmBgXpuHfk3dF0cXc";

async function test() {
    console.log("Testing gemini-flash-latest via REST...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Response: ${text.slice(0, 200)}...`);
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
