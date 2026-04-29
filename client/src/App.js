import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    setResult("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("📤 Sending file to backend...");

      const res = await fetch("https://legallens-1-70n5.onrender.com/upload", {
        method : "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("📥 FULL RESPONSE:", data);

      // ❗ backend error handling
      if (!res.ok) {
        alert(data.error || "Server error occurred");
        setLoading(false);
        return;
      }

      if (data.result) {
        setResult(data.result);
      } else {
        alert("No result received from AI");
      }

    } catch (err) {
      console.error("❌ FRONTEND ERROR:", err);
      alert("Upload failed. Check backend/server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>AI Legal Analyzer</h1>

      {/* File input */}
      <input
        type="file"
        accept=".txt"
        onChange={(e) => {
          console.log("📁 File selected:", e.target.files[0]);
          setFile(e.target.files[0]);
        }}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {/* Output */}
      {result && (
        <div style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
          <h2>Analysis Result</h2>
          <div style={{ background: "#f4f4f4", padding: 15 }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
