import { MarketInsightsDashboard } from '@/features/insights/components/market-insights-dashboard';
import { MarketInsightsHero } from '@/features/insights/components/market-insights-hero';

/**
 * Public market insights page body.
 */
export const MarketInsightsPageContent = () => (
  <>
    <MarketInsightsHero />
    <MarketInsightsDashboard />
  </>
);
