import { useEffect, useState } from "react";
import { danishTime } from "../lib/dates";

/** The station clock in the header, on Danish time. It ticks every second. */
export function StationClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { hour, minute, second } = danishTime(now);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="clock" role="img" aria-label={`Stationsur: klokken er ${pad2(hour)}:${pad2(minute)}`}>
      <div className="clock-hand hour" style={{ transform: `rotate(${(hour % 12) * 30 + minute * 0.5}deg)` }} />
      <div className="clock-hand minute" style={{ transform: `rotate(${minute * 6 + second * 0.1}deg)` }} />
      <div className="clock-hand second" style={{ transform: `rotate(${second * 6}deg)` }} />
      <div className="clock-pin" />
    </div>
  );
}
