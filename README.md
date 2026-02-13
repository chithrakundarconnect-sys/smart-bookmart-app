# 🔖 Smart Bookmark App

A simple bookmark manager built using **Next.js (App Router)**, **Supabase (Auth, Database, Realtime)**, and **Tailwind CSS**.

---

## 🚀 Features

- Google OAuth login (no email/password authentication)
- Add bookmarks (Title + URL)
- Bookmarks are private to each user
- Real-time updates across multiple tabs
- Delete your own bookmarks
- Modern responsive UI
- Deployed on Vercel

---

## 🛠 Tech Stack

- Next.js (App Router)
- Supabase (Authentication, PostgreSQL, Realtime)
- Tailwind CSS
- Vercel (Deployment)

---

## 🔐 Security

Row Level Security (RLS) is enabled in Supabase.

Policies ensure:
- Users can only view their own bookmarks
- Users can only insert bookmarks with their own `user_id`
- Users can only delete their own bookmarks

Example condition used in policies:

auth.uid() = user_id

---

## ⚠️ Problems Faced & How I Solved Them

### 1️⃣ Delete Not Working (RLS Issue)

**Problem:**  
Clicking the delete button did not remove bookmarks.

**Cause:**  
The DELETE policy in Supabase was not correctly configured.

**Solution:**  
Updated the DELETE policy to allow deletion only when:

auth.uid() = user_id

After fixing the RLS condition, delete started working correctly.

---

### 2️⃣ Realtime Not Updating Across Tabs

**Problem:**  
When opening two tabs, adding a bookmark in one tab did not update the other tab automatically.

**Cause:**  
Realtime was not enabled properly and subscription was missing.

**Solution:**  
- Enabled Realtime for the `bookmarks` table.
- Added Supabase `postgres_changes` subscription.
- Refetched bookmarks on database change events.

Now the bookmark list updates instantly across tabs.

---

### 3️⃣ Insert Not Showing in Table

**Problem:**  
After improving UI, new bookmarks were not appearing in Supabase.

**Cause:**  
State refresh logic was missing after insert.

**Solution:**  
- Ensured `fetchBookmarks()` runs after insert.
- Verified user session before inserting.
- Added proper loading handling.

---

## 📚 What I Learned

- How Supabase Authentication works with Google OAuth
- How Row Level Security (RLS) protects user data
- How to implement real-time database updates
- How to debug policy and database issues
- How to manage state properly in React

---

## 🌍 Deployment

The application is deployed on Vercel.

Live URL: (Add your Vercel link here)

GitHub Repository: (Add your GitHub repo link here)
