"use client";
import { useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestoreDb } from "@/lib/firebase";

export default function FirestoreDebugPage() {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runTest() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const testRef = doc(firestoreDb, "customers", "testDoc");
      await setDoc(testRef, { ok: true, ts: Date.now() }, { merge: true });
      const snap = await getDoc(testRef);
      setResult(JSON.stringify({ exists: snap.exists(), data: snap.data() }, null, 2));
    } catch (e: any) {
      setError(`${e?.code || 'unknown'}: ${e?.message || 'error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Firestore Debug</h1>
      <p className="text-sm text-gray-600">This writes/reads the document customers/testDoc.</p>
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Running..." : "Run Firestore Test"}
      </button>
      {result && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">{result}</pre>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}


