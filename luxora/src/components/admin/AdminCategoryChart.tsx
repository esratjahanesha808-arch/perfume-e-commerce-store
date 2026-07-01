"use client";



import { Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatPrice } from "@/lib/utils";



type CategorySlice = {

  name: string;

  value: number;

  percent: number;

};



interface AdminCategoryChartProps {

  data: CategorySlice[];

  total: number;

}



const COLORS = ["#a97636", "#c8a96b", "#8a6d3b", "#6b5344", "#473826"];



function CategoryTooltip({

  active,

  payload,

}: {

  active?: boolean;

  payload?: { payload: CategorySlice }[];

}) {

  if (!active || !payload?.[0]) return null;

  const item = payload[0].payload;

  return (

    <div className="admin-chart-tooltip">

      <p className="admin-chart-tooltip-label">{item.name}</p>

      <p>

        {formatPrice(item.value)} ({item.percent}%)

      </p>

    </div>

  );

}



function DonutCenterLabel({
  viewBox,
  total,
}: {
  viewBox?: unknown;
  total: number;
}) {
  const box = viewBox as { cx?: number; cy?: number } | undefined;
  const cx = box?.cx;
  const cy = box?.cy;

  if (cx == null || cy == null) return null;



  return (

    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">

      <tspan

        x={cx}

        dy="-0.55em"

        className="admin-donut-center-label"

        fill="#473826"

        fontSize={11}

        fontWeight={700}

      >

        Total Sales

      </tspan>

      <tspan

        x={cx}

        dy="1.35em"

        className="admin-donut-center-value"

        fill="#362c1d"

        fontSize={16}

        fontWeight={600}

      >

        {formatPrice(total)}

      </tspan>

    </text>

  );

}



export function AdminCategoryChart({ data, total }: AdminCategoryChartProps) {

  return (

    <section className="admin-card admin-category-chart">

      <div className="admin-card-header">

        <div>

          <h2 className="admin-card-title">Sales by Category</h2>

          <p className="admin-card-subtitle">Revenue distribution</p>

        </div>

      </div>



      {data.length === 0 ? (

        <p className="admin-empty-chart">No category sales in this period.</p>

      ) : (

        <>

          <div className="admin-donut-wrap">

            <ResponsiveContainer width="100%" height={220}>

              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>

                <Pie

                  data={data}

                  dataKey="value"

                  nameKey="name"

                  cx="50%"

                  cy="50%"

                  innerRadius={62}

                  outerRadius={88}

                  paddingAngle={2}

                  stroke="none"

                >

                  {data.map((_, index) => (

                    <Cell key={index} fill={COLORS[index % COLORS.length]} />

                  ))}

                  <Label
                    content={(props) => (
                      <DonutCenterLabel viewBox={props.viewBox} total={total} />
                    )}
                  />

                </Pie>

                <Tooltip content={<CategoryTooltip />} />

              </PieChart>

            </ResponsiveContainer>

          </div>



          <ul className="admin-category-legend">

            {data.map((item, index) => (

              <li key={item.name}>

                <span

                  className="admin-category-legend-dot"

                  style={{ background: COLORS[index % COLORS.length] }}

                  aria-hidden="true"

                />

                <span className="admin-category-legend-name">{item.name}</span>

                <span className="admin-category-legend-pct">{item.percent}%</span>

              </li>

            ))}

          </ul>

        </>

      )}

    </section>

  );

}

