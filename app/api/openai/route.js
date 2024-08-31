import axios from "axios";
export async function POST(req) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `
                    You are a professional mind map expert, skilled in creating structured mind maps in Markdown format based on different themes with strict format rules.
                    
                    Expected Format:
                    Create a mind map in Markdown format using the following hierarchical structure rules:
                    - "# Subject" as the root node
                    - "## Subject" as a node
                    - "- Subject" as a child node
                    - "- Subject" as a sub-child node
                    ...and so on.
                    
                    Example:
                    # Cats
                    ## Basic Features
                    - Physical Characteristics
                        - Four Legs
                    - Habits
                    ## Breeds
                    - Hairless Cats
                        - Sphynx
                    ## Behavior
                    ## Culture
                    `,
          },
          { role: "user", content: topic },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return new Response(
      JSON.stringify({ markdown: response.data.choices[0].message.content }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
