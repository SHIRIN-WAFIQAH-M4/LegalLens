import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a document");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

<<<<<<< HEAD
      const res = await fetch("https://legallens-1-70n5.onrender.com/upload", {
        method : "POST",
=======
    try {
      const res = await fetch("https://legallens-1-70n5.onrender.com/upload", {
        method: "POST",
>>>>>>> 7290700 (Update UI and fix backend document handling)
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Server error");
      }

      const text = data.result || "";

      const summary = extract("Summary", text);
      const keyPoints = extractList("Key Points", text);
      const risks = extractList("Risks", text);
      const documentText = extractDocument(text);

      setResult({
        summary,
        keyPoints,
        risks,
        documentText,
      });
    } catch (err) {
      console.error("Upload error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const extract = (title, text) => {
    const regex = new RegExp(
      `${title}:\\s*([\\s\\S]*?)(?=\\n(?:Key Points|Risks|Document):|$)`,
      "i"
    );

    const match = text.match(regex);
    return match ? match[1].trim() : "Not available";
  };

  const extractList = (title, text) => {
    const regex = new RegExp(
      `${title}:\\s*([\\s\\S]*?)(?=\\n(?:Summary|Key Points|Risks|Document):|$)`,
      "i"
    );

    const match = text.match(regex);

    if (!match) return [];

    return match[1]
      .split("\n")
      .map((item) =>
        item
          .replace(/^\d+\.\s*/, "")
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  };

  const extractDocument = (text) => {
    const match = text.match(/Document:\s*([\s\S]*)$/i);
    return match ? match[1].trim() : "Document not available";
  };

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header">
        <div className="logoBox">
          <div className="logo">⚖</div>
          <div>
            <h2>LegalLens</h2>
            <p>LEGAL AI</p>
          </div>
        </div>

        <div className="tag">
          🔒 Private analysis · nothing stored
        </div>
      </header>

      {/* HERO */}
      <section className="heroSection">
        <div className="heroLeft">
          <div className="badge">
            ✨ AI-powered contract review
          </div>

          <h1>
            Read the fine print <br />
            <span>before you sign it.</span>
          </h1>

          <p className="subtext">
            Upload contracts, leases, NDAs, and legal documents.
            Get AI-powered summaries and risk insights instantly.
          </p>
        </div>

        <div className="heroRight">
          <div className="featureCard">
            <h3>📄 Summary</h3>
            <p>Simple explanation of your document.</p>
          </div>

          <div className="featureCard">
            <h3>🛡 Risk Detection</h3>
            <p>Highlights risky clauses.</p>
          </div>

          <div className="featureCard">
            <h3>⚖ Key Points</h3>
            <p>Important obligations explained.</p>
          </div>
        </div>
      </section>

      {/* UPLOAD */}
      <div className="uploadContainer">
        <div className="uploadHeader">
          <h3>Your Document</h3>
        </div>

        <div className="uploadArea">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button onClick={handleUpload}>
            {loading ? "Analyzing..." : "Analyze Document"}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {result && (
        <div className="results">

          <div className="card">
            <h3>📄 Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="card">
            <h3>📌 Key Points</h3>

            {result.keyPoints.length ? (
              <ul>
                {result.keyPoints.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No key points found</p>
            )}
          </div>

          <div className="card danger">
            <h3>⚠ Risks & Warnings</h3>

            {result.risks.length ? (
              result.risks.map((risk, index) => (
                <div className="riskCard" key={index}>
                  {risk}
                </div>
              ))
            ) : (
              <p>No risks detected</p>
            )}
          </div>

          <div className="card">
            <h3>📄 Original Document</h3>

            <pre
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "inherit",
                margin: 0,
              }}
            >
              {result.documentText}
            </pre>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
