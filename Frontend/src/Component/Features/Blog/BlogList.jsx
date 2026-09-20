import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { getAllBlogs } from "../../../api/blog.api";
import EmptyState from "../../Common/EmptyState";
import Loader from "../../Common/Loader";

// Public blog list — every published article from the database.
const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    getAllBlogs()
      .then((response) => setBlogs(response.data?.blogs || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load blog posts."))
      .finally(() => setLoading(false));
  }, []);

  const published = useMemo(() => blogs.filter((blog) => blog.status === "Published"), [blogs]);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(published.map((blog) => blog.category)))],
    [published],
  );
  const visible = category === "All" ? published : published.filter((blog) => blog.category === category);
  const sorted = [...visible].sort((a, b) => Number(b.featured) - Number(a.featured));

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader /></div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto max-w-2xl text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-red-500"><Newspaper size={17} /> ApexFit Journal</p>
          <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Training &amp; Nutrition Blog</h1>
          <p className="mt-4 text-slate-600">Expert advice on workouts, nutrition, and staying motivated.</p>
        </header>

        {!error && categories.length > 1 && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {categories.map((item) => (
              <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? "border-black bg-black text-white" : "border-slate-300 bg-white text-slate-600 hover:border-black"}`}>
                {item}
              </button>
            ))}
          </div>
        )}

        {error && <EmptyState message={error} />}
        {!error && !sorted.length && <EmptyState message="No published posts yet — check back soon." />}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((blog) => (
            <article key={blog._id} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-red-500/15 transition hover:-translate-y-1 hover:shadow-xl">
              <Link to={`/blogs/${blog._id}`} className="block">
                <div className="relative h-52 overflow-hidden">
                  <img src={blog.image} alt={blog.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {blog.featured && <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">Featured</span>}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">{blog.category}</span>
                    <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-red-600">{blog.title}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{blog.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-red-600">Read more <ArrowRight size={15} /></span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};

export default BlogList;
