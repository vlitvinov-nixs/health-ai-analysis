import { Biomarker } from '../../api/types';

interface BiomarkerChartProps {
  biomarkers: Biomarker[];
}

export function BiomarkerChart({ biomarkers }: BiomarkerChartProps) {
  if (biomarkers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No biomarkers to display
      </div>
    );
  }

  // Get top 8 biomarkers for chart
  const chartData = biomarkers.slice(0, 8);
  const maxValue = Math.max(...chartData.map((b) => b.value)) * 1.2;
  const chartHeight = 300;
  const chartWidth = chartData.length * 60 + 40;
  const barWidth = 40;
  const barSpacing = 20;

  return (
    <div className="overflow-x-auto pb-4">
      <svg width={chartWidth} height={chartHeight} className="mx-auto">
        {/* Y-axis */}
        <line x1="40" y1="20" x2="40" y2={chartHeight - 30} stroke="#ddd" strokeWidth="1" />
        {/* X-axis */}
        <line
          x1="40"
          y1={chartHeight - 30}
          x2={chartWidth}
          y2={chartHeight - 30}
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Grid lines and Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - 30 - ratio * (chartHeight - 50);
          const value = Math.round((ratio * maxValue) * 100) / 100;
          return (
            <g key={ratio}>
              <line
                x1="35"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth="1"
              />
              <text
                x="25"
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* Bars and labels */}
        {chartData.map((biomarker, index) => {
          const x = 40 + index * (barWidth + barSpacing) + barSpacing / 2;
          const barHeight = ((biomarker.value / maxValue) * (chartHeight - 50));
          const y = chartHeight - 30 - barHeight;

          // Color by status
          let color = '#10b981'; // green for normal
          if (biomarker.status === 'high') color = '#ef4444'; // red
          if (biomarker.status === 'low') color = '#f59e0b'; // yellow

          return (
            <g key={biomarker.id}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity="0.8"
              />
              <text
                x={x + barWidth / 2}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#666"
                className="select-none"
              >
                {biomarker.name.substring(0, 8)}
              </text>
              <title>{`${biomarker.name}: ${biomarker.value} ${biomarker.unit}`}</title>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex gap-6 justify-center mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Low</span>
        </div>
      </div>
    </div>
  );
}
