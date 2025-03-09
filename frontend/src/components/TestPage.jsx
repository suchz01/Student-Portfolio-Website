import React, { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Target, Loader, AlertCircle, CheckCircle2, Book, Send, Code, ChevronRight } from 'lucide-react';

function TestPage({ profile }) {
  const [untestedSkills, setUntestedSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  if (!profile) profile = JSON.parse(localStorage.getItem("profile"));
  const profileId = profile?.id || "";

  useEffect(() => {
    const fetchUntestedSkills = async () => {
      try {
        const response = await fetch(`http://localhost:8080/profile/${profileId}`);
        if (response.ok) {
          const data = await response.json();
          setUntestedSkills(data.skills.filter(skill => !data.testedSkills.some(tested => tested.skill === skill)));
        } else {
          console.error("Failed to fetch untested skills");
        }
      } catch (error) {
        console.error("Error fetching untested skills:", error);
        setError("Error fetching untested skills.");
      }
    };

    if (profileId) {
      fetchUntestedSkills();
    }
  }, [profileId]);

  const geminiApiKey = import.meta.env.VITE_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  const handleSkillChange = (skill) => {
    setSelectedSkill(skill);
    setQuestions([]);
    setAnswers({});
    setScore(null);
  };

  const fetchQuestions = async () => {
    if (!selectedSkill) {
      setError("Please select a skill.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setAnswers({});
    setScore(null);

    try {
      const prompt = `Generate 5 intermediate level multiple choice questions on ${selectedSkill} as a JSON object. Each question should have a 'question', 'options', and 'answer'. Respond only with JSON without any extra whitespace.`;

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const text = await result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid JSON format in response");
      }

      const data = JSON.parse(jsonMatch[0]);

      if (!data || !data.questions) {
        throw new Error("Invalid data structure received from Gemini API");
      }

      setQuestions(data.questions);
      setRetryCount(0);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to fetch questions. Please try again later.");
      if (retryCount < maxRetries) {
        setRetryCount(retryCount + 1);
        setTimeout(fetchQuestions, 1000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: selectedOption,
    }));
  };

  const calculateScore = async () => {
    if (!questions.length) return;

    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);

    try {
      const response = await fetch(`http://localhost:8080/profile/skills/tested`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          testedSkill: {
            skill: selectedSkill,
            dateTested: new Date(),
            score: correctCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update tested skill in the database");
      }
    } catch (error) {
      console.error("Error updating tested skill:", error);
    }
  };

  if (!profileId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20">
          <p className="text-white">Error: Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1a2a] pt-16">
      <div className="container mx-auto p-6 space-y-6 max-w-5xl">
        <div className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
          transition-all duration-500 
          hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
          hover:border-white/30">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Target className="text-[#45f15c]" size={28} />
            Skill Assessment
          </h2>

          <div className="space-y-6">
            {!selectedSkill ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Book className="text-[#45f15c]" size={20} />
                    Select a skill to test:
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {untestedSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleSkillChange(skill)}
                      className="group bg-white/5 border border-white/10 rounded-xl p-6
                        hover:bg-white/10 hover:border-[#45f15c] transition-all duration-300
                        transform hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Code className="text-[#45f15c]" size={24} />
                          <span className="text-lg font-medium text-white">{skill}</span>
                        </div>
                        <ChevronRight 
                          className="text-white/50 group-hover:text-[#45f15c] transform 
                            group-hover:translate-x-1 transition-all duration-300" 
                          size={20} 
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="text-[#45f15c]" size={24} />
                    <span className="text-xl font-medium text-white">{selectedSkill}</span>
                  </div>
                  <button
                    onClick={() => handleSkillChange("")}
                    className="text-white/70 hover:text-white px-3 py-2 rounded-lg
                      hover:bg-white/10 transition-all duration-300 text-sm"
                  >
                    Change Skill
                  </button>
                </div>
                <button
                  onClick={fetchQuestions}
                  disabled={isLoading}
                  className="w-full p-4 bg-[#45f15c] text-black font-semibold rounded-xl
                    hover:bg-[#3ad150] transition-all duration-300 disabled:opacity-50
                    disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      Start Test
                    </>
                  )}
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                <p className="text-red-400 flex items-center gap-2">
                  <AlertCircle size={20} />
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>

        {questions.length > 0 && score === null && (
          <div className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
            transition-all duration-500 
            hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
            hover:border-white/30">
            <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
              <Target className="text-[#45f15c]" size={24} />
              Questions for {selectedSkill}
            </h3>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20 
                  transition-all duration-300">
                  <p className="text-lg font-medium text-white mb-4">
                    {index + 1}. {question.question}
                  </p>
                  <div className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-3 text-white cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          className="w-4 h-4 text-[#45f15c] focus:ring-[#45f15c] focus:ring-offset-0"
                        />
                        <span className="hover:text-[#45f15c] transition-colors duration-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculateScore}
              className="w-full mt-6 p-4 bg-[#45f15c] text-black font-semibold rounded-xl
                hover:bg-[#3ad150] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Submit Answers
            </button>
          </div>
        )}

        {score !== null && (
          <div className="bg-[#29253b] backdrop-blur-lg rounded-md shadow-lg p-8 border border-white/20 
            transition-all duration-500 
            hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] 
            hover:border-white/30">
            <div className="text-center">
              <CheckCircle2 className="text-[#45f15c] mx-auto mb-4" size={48} />
              <p className="text-2xl font-bold text-white">
                Your Score: {score} / {questions.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestPage;