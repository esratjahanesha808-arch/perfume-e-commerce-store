import { Metadata } from "next";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getDashboardOverview } from "@/services/dashboard.service";

import { DashboardWelcomeHeader } from "@/components/dashboard/DashboardPageHeader";

import { DashboardStatCards } from "@/components/dashboard/DashboardStatCards";

import { DashboardRecentOrders } from "@/components/dashboard/DashboardRecentOrders";

import { DashboardLoyaltyCard } from "@/components/dashboard/DashboardLoyaltyCard";

import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";

import { DashboardPromoBanner } from "@/components/dashboard/DashboardPromoBanner";

import { DashboardRecommendations } from "@/components/dashboard/DashboardRecommendations";

import "@/components/dashboard/dashboard-promo.css";



export const metadata: Metadata = {

  title: "My Dashboard — Luxora",

};



export const dynamic = "force-dynamic";



export default async function DashboardHomePage() {

  const session = await auth();

  if (!session?.user?.id) redirect("/login");



  const data = await getDashboardOverview(session.user.id);



  return (

    <div className="dashboard-home">

      <div className="dashboard-home-upper">

        <div className="dashboard-home-block">

          <DashboardWelcomeHeader

            name={data.user.name}

            tierName={data.loyalty.tier.name}

            loyaltyPoints={data.stats.loyaltyPoints}

          />



          <DashboardStatCards

            totalOrders={data.stats.totalOrders}

            loyaltyPoints={data.stats.loyaltyPoints}

            wishlistCount={data.stats.wishlistCount}

            totalSpent={data.stats.totalSpent}

          />

        </div>



        <div className="dashboard-home-grid dashboard-home-grid--middle">

          <DashboardRecentOrders orders={data.recentOrders} />

          <DashboardLoyaltyCard

            tierName={data.loyalty.tier.name}

            points={data.loyalty.current}

            target={data.loyalty.target}

            progressPercent={data.loyalty.progressPercent}

            pointsToNext={data.loyalty.pointsToNext}

            nextTierName={data.loyalty.tier.nextTierName}

          />

        </div>

      </div>



      <div className="dashboard-home-lower">

        <div className="dashboard-home-grid dashboard-home-grid--split">

          <DashboardRecommendations products={data.recommendations} />

          <DashboardQuickActions />

        </div>



        <div className="dashboard-promo-row">

          <DashboardPromoBanner />

        </div>

      </div>

    </div>

  );

}


