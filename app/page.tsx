"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let channel: any

    const init = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setUser(data.user)
        fetchBookmarks(data.user.id)

        // ✅ Realtime subscription
        channel = supabase
          .channel("realtime-bookmarks")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "bookmarks",
              filter: `user_id=eq.${data.user.id}`,
            },
            () => {
              fetchBookmarks(data.user.id)
            }
          )
          .subscribe()
      }
    }

    init()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (data) setBookmarks(data)
  }

  const addBookmark = async () => {
    if (!title || !url || !user) return

    setLoading(true)

    await supabase.from("bookmarks").insert([
      {
        user_id: user.id,
        title,
        url,
      },
    ])

    setTitle("")
    setUrl("")
    setLoading(false)

    // 🔥 Manual refresh fallback
    fetchBookmarks(user.id)
  }

  const deleteBookmark = async (id: string) => {
    if (!user) return

    await supabase.from("bookmarks").delete().eq("id", id)

    // 🔥 Manual refresh fallback
    fetchBookmarks(user.id)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  // 🔐 LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl text-center text-white shadow-2xl">
          <h1 className="text-3xl font-bold mb-3">🔖 Smart Bookmark</h1>
          <p className="mb-6 text-gray-200">
            Your personal link manager
          </p>

          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
            className="bg-white text-black px-6 py-3 rounded-lg shadow-lg hover:scale-105 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  // 🔓 MAIN APP
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-600 to-purple-700 p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 text-white">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">🔖 Smart Bookmark</h1>
            <p className="text-sm text-gray-200">
              Logged in as {user.email}
            </p>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition shadow-lg"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <input
            placeholder="Bookmark Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="p-3 rounded-lg bg-white/20 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
          />

          <button
            onClick={addBookmark}
            disabled={loading}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition shadow-lg hover:shadow-cyan-400/40 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Bookmark"}
          </button>
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 && (
          <div className="bg-white/20 p-6 rounded-xl text-center">
            <p className="text-lg font-medium">
              No bookmarks yet 🚀
            </p>
            <p className="text-gray-200 text-sm mt-2">
              Add your first link above to get started.
            </p>
          </div>
        )}

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="bg-white/20 p-4 rounded-xl flex justify-between items-center hover:scale-[1.02] transition shadow-md"
            >
              <div>
                <p className="font-semibold text-lg">{b.title}</p>
                <a
                  href={b.url}
                  target="_blank"
                  className="text-cyan-300 hover:underline text-sm break-all"
                >
                  {b.url}
                </a>
              </div>

              <button
                onClick={() => deleteBookmark(b.id)}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}