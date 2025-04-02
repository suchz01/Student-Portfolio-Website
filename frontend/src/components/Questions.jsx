import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

function Questions() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [promptResponses, setPromptResponses] = useState([]);

  const geminiApiKey = import.meta.env.VITE_GEMINI_KEY; 
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const getResponseForGivenPrompt = async () => {
    setIsLoading(true);
    setError(null);
    setPromptResponses([]);

    const skills = inputValue.split(",").map((skill) => skill.trim()); 

    try {
      for (const skill of skills) {
        
        const prompt = `Generate 5 multiple choice questions on ${skill} along with the answer key in the end.`;

        // Make an API call to the generative AI model
        // Updated model name from gemini-pro to gemini-1.5-pro-001
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });
        
        try {
          const result = await model.generateContent(prompt);
          const response = result.response;
          const text = await response.text();
          const questionsList = text.split("\n").filter((q) => q.trim() !== ""); 
          setPromptResponses((prevResponses) => [
            ...prevResponses,
            { skill, questions: questionsList },
          ]);
        } catch (modelError) {
          console.error(`Error generating content for ${skill}:`, modelError);
          // Try fallback to another model if available
          try {
            console.log("Attempting fallback to alternative model...");
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            const fallbackResult = await fallbackModel.generateContent(prompt);
            const fallbackResponse = fallbackResult.response;
            const fallbackText = await fallbackResponse.text();
            const fallbackQuestionsList = fallbackText.split("\n").filter((q) => q.trim() !== "");
            
            setPromptResponses((prevResponses) => [
              ...prevResponses,
              { skill, questions: fallbackQuestionsList },
            ]);
          } catch (fallbackError) {
            console.error("Fallback model also failed:", fallbackError);
            setPromptResponses((prevResponses) => [
              ...prevResponses,
              { 
                skill, 
                questions: ["Failed to generate questions for this skill. API error: " + modelError.message] 
              },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Something went wrong:", error);
      setError("Failed to fetch questions: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 max-w-4xl bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-6">
        Generate Multiple Choice Questions
      </h2>

      <div className="flex items-center mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter skills (e.g., Java, Python, SQL)"
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={getResponseForGivenPrompt}
          className="ml-4 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none"
          disabled={isLoading}
        >
          {isLoading ? "Generating..." : "Get Questions"}
        </button>
      </div>

      {isLoading && (
        <div className="text-center mt-4">
          <div className="spinner-border text-green-500" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-3">{error}</p>}

      <div className="mt-6">
        {promptResponses.map((responseObj, index) => (
          <div key={index} className="mb-6">
            <h3 className="text-2xl font-semibold text-green-600">
              Questions for {responseObj.skill}
            </h3>
            <ul className="list-disc pl-6 mt-2">
              {responseObj.questions.map((question, idx) => (
                <li key={idx} className="text-gray-700">{question}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Questions;
