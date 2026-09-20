import React, { useEffect, useState } from "react";
import MembershipCard from "./MembershipCard";
import { getAllMembershipPlans } from "../../../api/membership.api";
import Loader from "../../Common/Loader";
import EmptyState from "../../Common/EmptyState";

const Membership = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembershipPlans = async () => {
      try {
        const [response] = await Promise.all([
          getAllMembershipPlans(),
          new Promise((resolve)=>setTimeout(resolve,3000))
        ])

        console.log("Membership response:", response.data);

        if (response.data.success) {
          setMemberships(response.data.plans);
        }
      } catch (error) {
        console.error("Error fetching membership plans:", error);

        setError(
          error.response?.data?.message || "Failed to load membership plans",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipPlans();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
      
          
          <Loader />
      
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4 text-center">
        <EmptyState message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
            Membership Plans
          </p>

          <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
            Choose the plan that fits your fitness goals
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Get gym access, expert guidance, and the support you need to build a
            stronger, healthier routine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {memberships.length > 0 ? memberships.map((membership) => (
            <MembershipCard key={membership._id} membership={membership} />
          )) : <div className="md:col-span-3"><EmptyState message="No membership plans are available yet." /></div>}
        </div>
      </div>
    </div>
  );
};

export default Membership;
