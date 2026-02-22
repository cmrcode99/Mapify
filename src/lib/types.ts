export interface Building {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  address: string | null;
}

export interface Checkin {
  id: string;
  user_id: string;
  building_id: string;
  room_number: string;
  checked_in_at: string;
  checked_out_at: string | null;
}

export interface ActiveCheckinData {
  building_id: string;
  building_name: string;
  building_code: string;
  latitude: number;
  longitude: number;
  active_count: number;
  rooms: { room: string; count: number }[];
  address: string | null;
}

export interface MyActiveCheckin {
  checkin_id: string;
  building_id: string;
  building_name: string;
  room_number: string;
  checked_in_at: string;
}

export interface BuildingTrend {
  day_of_week: number;
  hour_of_day: number;
  avg_count: number;
}

export interface CampusTrend {
  building_id: string;
  building_name: string;
  building_code: string;
  total_checkins: number;
  peak_hour: number | null;
  busiest_day: number | null;
}
