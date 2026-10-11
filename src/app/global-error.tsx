"use client";

/**
 * একদম শেষ ভরসা — root layout নিজেই ভেঙে গেলে এটা দেখায়।
 * এখানে globals.css বা font থাকে না, তাই সাধারণ inline style।
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="bn">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#0f172a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>কিছু একটা সমস্যা হয়েছে</h1>
          <p style={{ color: '#94a3b8', marginTop: 12 }}>পেজটি আবার লোড করে দেখুন।</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: '12px 28px',
              borderRadius: 999,
              border: 0,
              background: '#6366f1',
              color: '#fff',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </body>
    </html>
  );
}
