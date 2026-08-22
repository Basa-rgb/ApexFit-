import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { getBlogById } from "../../../api/blog.api";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";

// Public blog article page.
const BlogDetails = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBlogById(id)
      .then((response) => setBlog(response.data?.blog || null))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load this post."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;
  if (error || !blog) return <div className="min-h-screen pt-24"><EmptyState message={error || "Blog post not found."} /></div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <article className="mx-auto max-w-3xl">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-black">
          <ArrowLeft size={17} /> All posts
        </Link>

        <header className="mt-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{blog.category}</span>
            <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><UserRound size={13} /> {blog.author}</span>
          </div>
          <h1 className="mt-4 text-4xl font-bold text-slate-900">{blog.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">{blog.excerpt}</p>
        </header>

        <img src={blog.image} alt={blog.title} className="mt-8 max-h-96 w-full rounded-3xl object-cover shadow-lg shadow-red-500/20" />

        <div className="mt-8 space-y-5">
          {String(blog.content)
            .split("\n")
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, index) => (
              <p key={index} className="leading-8 text-slate-700">{paragraph}</p>
            ))}
        </div>

        {(blog.tags || []).length > 0 && (
          <footer className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
            {blog.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-600">#{tag}</span>
            ))}
          </footer>
        )}
      </article>
    </main>
  );
};

export default BlogDetails;
