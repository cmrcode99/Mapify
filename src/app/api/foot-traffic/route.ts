import { NextRequest, NextResponse } from "next/server";

const BESTTIME_LIVE_URL = "https://besttime.app/api/v1/forecasts/live";
const BESTTIME_FORECAST_URL = "https://besttime.app/api/v1/forecasts";

export async function GET(request: NextRequest) {
  const apiKey = process.env.BESTTIME_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const venueName = request.nextUrl.searchParams.get("venue_name");
  const venueAddress = request.nextUrl.searchParams.get("venue_address");

  if (!venueName || !venueAddress) {
    return NextResponse.json({ available: false }, { status: 200 });
  }

  const fullAddress = `${venueAddress}, Champaign, IL`;

  try {
    // Try live endpoint first
    const liveParams = new URLSearchParams({
      api_key_private: apiKey,
      venue_name: venueName,
      venue_address: fullAddress,
    });

    const liveRes = await fetch(`${BESTTIME_LIVE_URL}?${liveParams}`, {
      method: "POST",
      next: { revalidate: 900 },
    });
    const liveData = await liveRes.json();

    const hasLive =
      liveData.analysis?.venue_live_busyness_available === true &&
      liveData.analysis?.venue_live_busyness != null;

    const hasForecastFromLive =
      liveData.analysis?.venue_forecast_busyness_available === true &&
      liveData.analysis?.venue_forecasted_busyness != null;

    if (hasLive || hasForecastFromLive) {
      return NextResponse.json({
        available: true,
        live_busyness: hasLive ? liveData.analysis.venue_live_busyness : null,
        forecasted_busyness: hasForecastFromLive ? liveData.analysis.venue_forecasted_busyness : null,
        venue_open: liveData.venue_info?.venue_open ?? null,
        venue_name_matched: liveData.venue_info?.venue_name ?? null,
      });
    }

    // Fall back to full forecast endpoint to get hourly data
    const forecastParams = new URLSearchParams({
      api_key_private: apiKey,
      venue_name: venueName,
      venue_address: fullAddress,
    });

    const forecastRes = await fetch(`${BESTTIME_FORECAST_URL}?${forecastParams}`, {
      method: "POST",
      next: { revalidate: 3600 },
    });
    const forecastData = await forecastRes.json();

    if (forecastData.status !== "OK" || !Array.isArray(forecastData.analysis)) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    // Find today's forecast (day_int: 0=Mon, 6=Sun)
    const now = new Date();
    const jsDow = now.getDay(); // 0=Sun, 1=Mon...
    const bestTimeDow = jsDow === 0 ? 6 : jsDow - 1; // convert to 0=Mon, 6=Sun
    const currentHour = now.getHours();

    const todayForecast = forecastData.analysis.find(
      (d: { day_info: { day_int: number } }) => d.day_info.day_int === bestTimeDow
    );

    if (!todayForecast) {
      return NextResponse.json({ available: false }, { status: 200 });
    }

    // Get current hour busyness from hour_analysis
    let currentBusyness: number | null = null;
    let peakBusyness: number | null = null;

    if (Array.isArray(todayForecast.hour_analysis)) {
      const hourEntry = todayForecast.hour_analysis.find(
        (h: { hour: number }) => h.hour === currentHour
      );
      if (hourEntry) {
        currentBusyness = hourEntry.intensity_nr ?? null;
        // intensity_nr is 0-5, normalize to 0-100
        if (currentBusyness !== null) {
          currentBusyness = Math.round((currentBusyness / 5) * 100);
        }
      }
    }

    peakBusyness = todayForecast.day_info?.day_max ?? null;

    const isOpen = todayForecast.day_info?.venue_open_close_v2?.open_24h === true
      || (todayForecast.day_info?.venue_open_close_v2?.["24h"]?.length ?? 0) > 0;

    const hoursText = todayForecast.day_info?.venue_open_close_v2?.["12h"]?.[0] ?? null;

    return NextResponse.json({
      available: true,
      live_busyness: null,
      forecasted_busyness: currentBusyness,
      peak_busyness: peakBusyness,
      venue_open: isOpen ? "Open" : "Closed",
      hours_text: hoursText,
      venue_name_matched: forecastData.venue_info?.venue_name ?? null,
      day_mean: todayForecast.day_info?.day_mean ?? null,
    });
  } catch {
    return NextResponse.json({ available: false }, { status: 200 });
  }
}
